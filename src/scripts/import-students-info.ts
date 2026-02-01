
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { db } from '../lib/db'
import bcrypt from 'bcryptjs'

async function main() {
    const csvPath = path.join(process.cwd(), 'Copy of Students Info - Data.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')

    // Parse CSV
    const records: any[] = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    })

    console.log(`Found ${records.length} records. Processing...`)

    const defaultPassword = await bcrypt.hash("Welcome123!", 10)
    let userCount = 0
    let studentCount = 0

    // Group by Parent (Phone1 + Name)
    const familyMap = new Map<string, {
        parentName: string,
        email: string | null,
        phone1: string,
        phone2: string,
        students: any[]
    }>()

    /* Headers:
    Student_ID, Parent Name, Student Name, WhatsApp, Health Issues, Birth Day, Age, Level, 
    Email Address, Class, Payment, QRCode, Student ID Link, Comment, Link to Message, Phone number, message
    */

    for (const row of records) {
        const studentName = row['Student Name']
        if (!studentName) continue

        // 1. Parent Name Logic
        let parentName = row['Parent Name']
        const isAdult = !parentName || parentName.trim() === ''
        if (isAdult) {
            parentName = studentName
        }

        // 2. Phone Logic
        let phone1 = row['Phone number'] || "" // Contact Number (1)
        let phone2 = "" // Contact Number (2)

        // WhatsApp column -> Phone 2
        let wa = row['WhatsApp'] || ""
        if (wa) {
            const match = wa.match(/(?:phone=)?(\+?\d+)/)
            if (match) phone2 = match[1]
            else {
                const cleanWa = wa.replace(/[^0-9+]/g, '')
                if (cleanWa.length > 5) phone2 = cleanWa
            }
        }

        // Cleanup phones
        const cleanPhone = (p: string) => p.replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '')
        phone1 = cleanPhone(phone1)
        phone2 = cleanPhone(phone2)

        // "if there is no contact number (2) add (1) to it"
        // Wait, "add (1) to it" usually means copy it? "if there is no contact number (2) [use] (1)"?
        // Or literally concatenate? "add (1) to it". 
        // User said: "if the user has no parent name means he or her is the student ... remove the country code box and add the number from the file ... if there is no contact number (2) add (1) to it"
        // Likely means "populate contact number 2 with contact number 1".
        // But typically we leave optional phone empty.
        // Let's assume user wants Phone 2 to fallback to Phone 1 if empty? Or maybe "add (1) to [the contact number list]"?
        // Given "Contact Number (1) and (2)", if 2 is empty, maybe they want it filled?
        // I'll assume fallback: if (!phone2) phone2 = phone1;

        if (!phone2 && phone1) {
            // Actually, usually redundant. Maybe user meant "Use Phone 1 if Phone 2 is missing" for whatsapp usage?
            // "if there is no contact number (2) add (1) to it" -> ambiguous.
            // I'll copy phone1 to phone2 if phone2 is empty, as requested literally.
            phone2 = phone1
        }

        // However, if they are identical, maybe we don't need to store it twice if the UI handles it?
        // But the schema treats them separate. 
        if (phone1 === phone2 && phone1 !== "") {
            // Valid to have same number.
        }

        // 3. Grouping Key
        // "make sure to add students names that has same parent name and phone number under the same parent"
        // Key = ParentName + Phone1
        // (Email might be missing or shared?)
        let key = `${parentName}|${phone1}`.toLowerCase()

        // If phone1 is missing, maybe rely on Email?
        if (!phone1 && row['Email Address']) {
            key = `email:${row['Email Address']}`.toLowerCase()
        } else if (!phone1) {
            key = `name:${parentName}`.toLowerCase()
        }

        if (!familyMap.has(key)) {
            familyMap.set(key, {
                parentName,
                email: row['Email Address'] || null,
                phone1,
                phone2,
                students: []
            })
        }

        const family = familyMap.get(key)!

        // Add student
        family.students.push({
            name: studentName,
            dob: row['Birth Day'] ? new Date(row['Birth Day']) : null,
            level: parseInt(row['Level']) || 1,
            medicalInfo: row['Health Issues'],
            studentCode: row['Student_ID'] || null,
            isAdult: isAdult
        })
    }

    console.log(`Identified ${familyMap.size} unique families. Syncing to DB...`)

    for (const [key, family] of familyMap) {
        try {
            // Find or Create User
            // Try matching by Email first if valid
            let user = null

            if (family.email && family.email.includes('@')) {
                user = await db.user.findUnique({ where: { email: family.email } })
            }

            if (!user && family.phone1) {
                // Try finding profile by phone
                const profile = await db.userProfile.findFirst({ where: { phone: family.phone1 }, include: { user: true } })
                if (profile) user = profile.user
            }

            if (!user) {
                // Create
                user = await db.user.create({
                    data: {
                        name: family.parentName,
                        email: family.email, // might be null
                        role: "PARENT",
                        passwordHash: defaultPassword
                    }
                })
                userCount++
            }

            // Update Profile
            await db.userProfile.upsert({
                where: { userId: user.id },
                update: {
                    phone: family.phone1,
                    phone2: family.phone2
                },
                create: {
                    userId: user.id,
                    phone: family.phone1,
                    phone2: family.phone2
                }
            })

            // Sync Students
            for (const s of family.students) {
                let dob = s.dob
                if (!dob || isNaN(dob.getTime())) dob = new Date('1900-01-01')

                // Check duplicate student
                const existing = await db.student.findFirst({
                    where: {
                        parentId: user.id,
                        name: s.name
                    }
                })

                if (!existing) {
                    await db.student.create({
                        data: {
                            parentId: user.id,
                            name: s.name,
                            dob: dob,
                            studentCode: s.studentCode,
                            level: s.level,
                            medicalInfo: s.medicalInfo
                        }
                    })
                    studentCount++
                }
            }
            process.stdout.write('.')

        } catch (e) {
            console.error(`Error processing ${family.parentName}:`, e)
        }
    }

    console.log(`\nImport Complete!`)
    console.log(`New Users: ${userCount}`)
    console.log(`New Students: ${studentCount}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
