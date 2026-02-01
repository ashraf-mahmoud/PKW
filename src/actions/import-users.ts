'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { parse } from 'csv-parse/sync'
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { recordAudit } from "./audit"

export async function importUsersCSV(formData: FormData) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    const file = formData.get('file') as File
    if (!file) {
        return { success: false, error: "No file uploaded" }
    }

    try {
        const text = await file.text()
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
            relax_column_count: true
        })

        let importedCount = 0
        let updatedCount = 0
        let errorCount = 0

        // Group by email to create users with multiple students
        const families: Record<string, any> = {}

        records.forEach((record: any) => {
            const email = record['Email Address']?.toLowerCase() || ''
            const parentName = record['Parent Name'] || ''

            // If both email and parent name are empty, we might use student name as a key or skip
            // But usually we need an email for User.
            // If email is missing, we'll generate a placeholder if parentName exists, 
            // or use student name to at least keep track.
            // For now, let's require at least a name or email.
            if (!email && !parentName && !record['Student Name']) return

            const key = email || `no-email-${parentName || record['Student Name']}`

            if (!families[key]) {
                families[key] = {
                    email: email,
                    name: parentName || record['Student Name'] || "Unknown Parent",
                    phone: record['Phone number'] || '',
                    students: []
                }
            }

            if (record['Student Name']) {
                families[key].students.push({
                    name: record['Student Name'],
                    studentCode: record['Student_ID'] || null,
                    medicalInfo: record['Health Issues'] || null,
                    dob: parseDate(record['Birth Day']),
                    level: parseInt(record['Level']) || 1
                })
            }
        })

        const hashedPassword = await bcrypt.hash("Welcome123!", 10)

        for (const key in families) {
            const family = families[key]
            console.log(`Processing family: ${family.email || family.name}`)

            try {
                await db.$transaction(async (tx) => {
                    // 1. Find or Create User
                    let user = null
                    if (family.email) {
                        user = await tx.user.findUnique({
                            where: { email: family.email },
                            include: { profile: true }
                        })
                    }

                    if (user) {
                        try {
                            // Update existing user
                            user = await tx.user.update({
                                where: { id: user.id },
                                data: {
                                    name: family.name,
                                    profile: {
                                        upsert: {
                                            create: { phone: family.phone },
                                            update: { phone: family.phone }
                                        }
                                    }
                                }
                            })
                            updatedCount++
                        } catch (ue) {
                            console.error(`Failed to update user ${user.id}:`, ue)
                            throw ue
                        }
                    } else {
                        // Create new user
                        const finalEmail = family.email || `placeholder-${Math.random().toString(36).substring(7)}@example.com`

                        try {
                            user = await tx.user.create({
                                data: {
                                    name: family.name,
                                    email: finalEmail,
                                    passwordHash: hashedPassword,
                                    role: "PARENT",
                                    profile: {
                                        create: { phone: family.phone }
                                    }
                                }
                            })
                            importedCount++
                        } catch (ce) {
                            console.error(`Failed to create user with email ${finalEmail}:`, ce)
                            throw ce
                        }
                    }

                    // 2. Process Students
                    for (const studentData of family.students) {
                        try {
                            const existingStudent = studentData.studentCode
                                ? await tx.student.findFirst({ where: { studentCode: studentData.studentCode } })
                                : await tx.student.findFirst({ where: { name: studentData.name, parentId: user.id } })

                            if (existingStudent) {
                                await tx.student.update({
                                    where: { id: existingStudent.id },
                                    data: {
                                        name: studentData.name,
                                        medicalInfo: studentData.medicalInfo,
                                        dob: studentData.dob || undefined,
                                        level: studentData.level,
                                        parentId: user.id
                                    }
                                })
                            } else {
                                await tx.student.create({
                                    data: {
                                        parentId: user.id,
                                        name: studentData.name,
                                        studentCode: studentData.studentCode,
                                        medicalInfo: studentData.medicalInfo,
                                        dob: studentData.dob || new Date(),
                                        level: studentData.level
                                    }
                                })
                            }
                        } catch (se) {
                            console.error(`Failed to process student ${studentData.name}:`, se)
                            throw se
                        }
                    }
                })
            } catch (err) {
                console.error(`Error importing family ${family.email || family.name}:`, err)
                errorCount++
            }
        }

        await recordAudit({
            action: "USER_IMPORT",
            entityType: "USER",
            entityId: "SYSTEM",
            details: { imported: importedCount, updated: updatedCount, errors: errorCount }
        })

        revalidatePath('/dashboard/users')
        return {
            success: true,
            message: `Import complete. Created: ${importedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`
        }

    } catch (error: any) {
        console.error("CSV Import Critical Error:", error)
        return { success: false, error: `Failed to parse CSV file: ${error.message}` }
    }
}

function parseDate(dateStr: string) {
    if (!dateStr) return null
    // Handle MM/DD/YYYY
    const parts = dateStr.split('/')
    if (parts.length === 3) {
        const month = parseInt(parts[0].trim()) - 1
        const day = parseInt(parts[1].trim())
        const year = parseInt(parts[2].trim())
        const date = new Date(year, month, day)
        if (!isNaN(date.getTime())) return date
    }
    const d = new Date(dateStr.trim())
    return isNaN(d.getTime()) ? null : d
}
