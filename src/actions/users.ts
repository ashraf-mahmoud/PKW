'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const StudentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    studentCode: z.string().optional(),
    level: z.coerce.number().min(1).default(1),
    dob: z.coerce.date(),
    medicalInfo: z.string().optional(),
    waiverSigned: z.boolean().default(false),
    waiverFile: z.string().optional(),
})

const UserFamilySchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    role: z.string().default("PARENT"),

    // Profile
    phone: z.string().optional(),
    phone2: z.string().optional(), // Parent 2 Contact
    marketingSource: z.string().optional(),
    trialDate: z.coerce.date().optional(),

    students: z.array(StudentSchema).optional()
})

export async function createUserWithFamily(data: any) {
    try {
        const validated = UserFamilySchema.parse(data)

        const existingUser = await db.user.findUnique({ where: { email: validated.email } })
        if (existingUser) return { success: false, error: "Email already exists" }

        // Create User + Profile + Students in transaction
        // Password? allow setting or default? user requested "add users". 
        // For now set a default password or empty hash (cant login until reset).
        // Let's set a default "Welcome123!" for manual admin creation if needed.
        const hashedPassword = await bcrypt.hash("Welcome123!", 10)

        // Clean dates
        const studentsData = validated.students?.map(s => ({
            name: s.name,
            studentCode: s.studentCode,
            level: s.level,
            dob: s.dob,
            medicalInfo: s.medicalInfo,
            waiverSigned: s.waiverSigned,
            waiverFile: s.waiverFile
        })) || []

        await db.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: validated.name,
                    email: validated.email,
                    passwordHash: hashedPassword,
                    role: validated.role,
                    profile: {
                        create: {
                            phone: validated.phone,
                            phone2: validated.phone2,
                            marketingSource: validated.marketingSource,
                            trialDate: validated.trialDate,
                        }
                    },
                    students: {
                        create: studentsData
                    }
                }
            })
        })

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Create User Error:", error)
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message }
        return { success: false, error: "Failed to create user" }
    }
}

export async function updateUserWithFamily(userId: string, data: any) {
    try {
        const validated = UserFamilySchema.parse(data)

        // Simple update for Parent
        await db.user.update({
            where: { id: userId },
            data: {
                name: validated.name,
                email: validated.email,
                role: validated.role,
                profile: {
                    upsert: {
                        create: {
                            phone: validated.phone,
                            phone2: validated.phone2,
                            marketingSource: validated.marketingSource,
                            trialDate: validated.trialDate,
                        },
                        update: {
                            phone: validated.phone,
                            phone2: validated.phone2,
                            marketingSource: validated.marketingSource,
                            trialDate: validated.trialDate,
                        }
                    }
                }
            }
        })

        // Students sync is trickier. 
        // Strategy: 
        // 1. If student has ID -> Update
        // 2. If no ID -> Create
        // 3. User might have deleted students from UI -> We need to handle deletions if we really want full sync, 
        //    but often "Add/Edit" just upserts.

        // For MVP, we iterate incoming students:
        if (validated.students) {
            for (const s of validated.students) {
                if (s.id) {
                    await db.student.update({
                        where: { id: s.id },
                        data: {
                            name: s.name,
                            studentCode: s.studentCode,
                            level: s.level,
                            dob: s.dob,
                            medicalInfo: s.medicalInfo,
                            waiverSigned: s.waiverSigned,
                            waiverFile: s.waiverFile
                        }
                    })
                } else {
                    await db.student.create({
                        data: {
                            parentId: userId,
                            name: s.name,
                            studentCode: s.studentCode,
                            level: s.level,
                            dob: s.dob,
                            medicalInfo: s.medicalInfo,
                            waiverSigned: s.waiverSigned,
                            waiverFile: s.waiverFile
                        }
                    })
                }
            }
        }

        // Note: This logic doesn't delete removed students. 
        // If user deleted a row in UI, it won't be deleted here unless we track IDs explicitly.
        // Assuming Add/Edit logic for now.

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Update User Error:", error)
        return { success: false, error: "Failed to update user" }
    }
}

export async function getUsersAdmin() {
    return await db.user.findMany({
        include: {
            profile: true,
            students: true,
            _count: { select: { students: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getUserWithFamily(id: string) {
    return await db.user.findUnique({
        where: { id },
        include: {
            profile: true,
            students: true
        }
    })
}
