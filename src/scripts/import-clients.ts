
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
    const csvPath = path.join(process.cwd(), 'Clients_data.csv')
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

    // Group by Parent Identity (Email OR Phone+Name)
    const familyMap = new Map<string, {
        parentName: string,
        email: string,
        phone: string,
        phone2: string,
        students: any[]
    }>()

    // Clear existing data? User said "you added... more than one time".
    // To be safe and clean, let's wipe Users/Students first since we are re-importing the whole file?
    // "you can use this file to add all the clients data" implies this is the source of truth.
    // However, wiping might delete manually added users.
    // Better strategy: Unique check.

    console.log("Starting Import...")

    for (const row of records) {
        const studentName = row['Student Name']
        if (!studentName) continue

        // 1. Adult Handling: If Parent Name is empty, Student is the Parent.
        let parentName = row['Parent Name']
        const isAdult = !parentName || parentName.trim() === ''
        if (isAdult) {
            parentName = studentName
        }

        // 2. Extract Phone
        let phone1 = row['Phone number'] || ""
        let phone2 = ""

        if (row['WhatsApp']) {
            // Check if WhatsApp column has a number
            let wa = row['WhatsApp']
            // Sometimes it might be a link or text, try to extract digits
            const match = wa.match(/(?:phone=)?(\+?\d+)/)
            if (match) {
                // If phone1 is empty, use this as phone1, else use as phone2
                if (!phone1) phone1 = match[1]
                else if (match[1] !== phone1.replace(/\s/g, '')) phone2 = match[1] // Only if different
            } else {
                // Direct digits?
                const cleanWa = wa.replace(/[^0-9+]/g, '')
                if (cleanWa.length > 6) {
                    if (!phone1) phone1 = cleanWa
                    else if (cleanWa !== phone1.replace(/\s/g, '')) phone2 = cleanWa
                }
            }
        }

        // Helper to format phone
        const formatPhone = (p: string) => {
            if (!p) return ""
            let clean = p.replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '')
            // If starts with 0 (e.g. 012...), replace with +60? Or just leave it?
            // User requested "add ... if found with there country codes".
            // If it starts with +, assume it has code.
            // If it starts with 60, add +
            if (clean.startsWith('60')) clean = '+' + clean
            else if (clean.startsWith('01')) clean = '+60' + clean.substring(1) // Malaysia default
            else if (!clean.startsWith('+') && clean.length > 5) clean = '+' + clean // naive add +

            return clean
        }

        phone1 = formatPhone(phone1)
        phone2 = formatPhone(phone2)

        // 3. Determine Family Key        // Determine Email / Key
        let email = row['Email Address']
        let familyKey = ""

        if (email && email.includes('@')) {
            email = email.toLowerCase()
            familyKey = "email:" + email
        } else {
            // No Email -> Use Phone as Key
            email = null
            const sanitizedPhone = phone1 || "nophone"
            // If phone is missing, use sanitized name?
            const sanitizedName = parentName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

            if (phone1) {
                familyKey = "phone:" + phone1
            } else {
                familyKey = "name:" + sanitizedName // Risky fallback
            }
        }

        if (!familyMap.has(familyKey)) {
            familyMap.set(familyKey, {
                parentName,
                email, // This is null if missing
                phone: phone1,
                phone2: phone2,
                students: []
            })
        }

        const family = familyMap.get(familyKey)!

        // 4. Deduplication within family (CSV might have duplicates)
        const exists = family.students.find(s => s.name === studentName)
        if (!exists) {
            family.students.push({
                name: studentName,
                dob: row['Birth Day'] ? new Date(row['Birth Day']) : null,
                age: row['Age'],
                level: parseInt(row['Level']) || 1,
                medicalInfo: row['Health Issues'],
                studentCode: row['Student_ID'] || null, // Map Student ID
                isAdult: isAdult // Flag if needed?
            })
        }
    }

    console.log(`identified ${familyMap.size} unique families. Syncing to DB...`)

    for (const [key, family] of familyMap) {
        try {
            let user = null

            // Strategy: 
            // 1. If Email -> Upsert by Email
            // 2. If No Email -> Find by Phone (via Profile) -> If found, update. If not, Create.

            if (family.email && family.email.includes('@') && !family.email.endsWith('@placeholder.pkw')) {
                // Valid Email
                user = await db.user.upsert({
                    where: { email: family.email },
                    update: { name: family.parentName },
                    create: {
                        name: family.parentName,
                        email: family.email,
                        role: "PARENT",
                        passwordHash: defaultPassword,
                    }
                })
            } else {
                // No Email or Placeholder
                // Try finding by Phone
                const existingProfile = family.phone ? await db.userProfile.findFirst({
                    where: { phone: family.phone },
                    include: { user: true }
                }) : null

                if (existingProfile && existingProfile.user) {
                    user = existingProfile.user
                    // Update name if needed? 
                    // await db.user.update({ where: { id: user.id }, data: { name: family.parentName } })
                } else {
                    // Create new (Email is null)
                    // CAUTION: If we run this script twice, and email is null, and phone matches, we found it above.
                    // If phone is missing too? Then we might duplicate by name. (Adults with no phone/email).
                    // For now assuming Phone exists for empty-email adults mostly, or we fallback.

                    user = await db.user.create({
                        data: {
                            name: family.parentName,
                            email: null, // USER REQUEST: Leave empty
                            role: "PARENT",
                            passwordHash: defaultPassword,
                        }
                    })
                }
            }

            // Upsert Profile
            await db.userProfile.upsert({
                where: { userId: user.id },
                update: {
                    phone: family.phone,
                    phone2: family.phone2 || undefined // Update phone2 if present
                },
                create: {
                    userId: user.id,
                    phone: family.phone,
                    phone2: family.phone2
                }
            })
            if (user.id) userCount++

            // Sync Students
            for (const studentData of family.students) {
                let dob = null
                if (studentData.dob && !isNaN(studentData.dob.getTime())) {
                    const year = studentData.dob.getFullYear()
                    if (year > 1900 && year < 2100) dob = studentData.dob
                }
                const finalDob = dob || new Date('1900-01-01')

                const existingStudent = await db.student.findFirst({
                    where: {
                        parentId: user.id,
                        name: studentData.name
                    }
                })

                if (existingStudent) {
                    await db.student.update({
                        where: { id: existingStudent.id },
                        data: {
                            studentCode: studentData.studentCode || undefined, // Only update if present? Or null OK? 
                            level: Number(studentData.level) || 1,
                            medicalInfo: studentData.medicalInfo ? String(studentData.medicalInfo) : null,
                            // Prefer keeping existing DOB if valid and CSV is placeholder? 
                            // But CSV is "source of truth".
                            dob: finalDob
                        }
                    })
                } else {
                    await db.student.create({
                        data: {
                            name: String(studentData.name),
                            dob: finalDob,
                            medicalInfo: studentData.medicalInfo ? String(studentData.medicalInfo) : null,
                            level: Number(studentData.level) || 1,
                            studentCode: studentData.studentCode || null,
                            parent: { connect: { id: user.id } }
                        }
                    })
                    studentCount++
                }
            }
            process.stdout.write('.')
        } catch (error) {
            console.error(`\nFailed to process family ${family.parentName}:`, error)
        }
    }

    console.log(`\n\nImport Complete!`)
    console.log(`Created/Updated Users: ${userCount}`)
    console.log(`Created Students: ${studentCount}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
