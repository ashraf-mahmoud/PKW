'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { recordAudit } from "./audit"

export async function deleteUser(id: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    if (session.user.id === id) {
        return { success: false, error: "You cannot delete your own account" }
    }

    try {
        const user = await db.user.findUnique({
            where: { id },
            select: {
                name: true,
                email: true,
                students: {
                    select: { id: true, name: true }
                }
            }
        })

        if (!user) return { success: false, error: "User not found" }

        const students = user.students || []

        await db.user.delete({
            where: { id }
        })

        // Log parent deletion
        await recordAudit({
            action: "USER_DELETE",
            entityType: "USER",
            entityId: id,
            details: { name: user.name, email: user.email, studentCount: students.length }
        })

        // Log each student deletion specifically to snapshot their name
        for (const s of students) {
            await recordAudit({
                action: "STUDENT_DELETE",
                entityType: "STUDENT",
                entityId: s.id,
                studentId: s.id,
                studentName: s.name,
                details: { name: s.name, parentName: user.name }
            })
        }

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Delete User Error:", error)
        return { success: false, error: "Failed to delete user and associated records" }
    }
}

export async function bulkDeleteUsers(ids: string[]) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    // Filter out current user's ID
    const targetIds = ids.filter(id => id !== session.user?.id)
    if (targetIds.length === 0) return { success: true, count: 0 }

    try {
        const users = await db.user.findMany({
            where: { id: { in: targetIds } },
            select: {
                id: true,
                name: true,
                email: true,
                students: {
                    select: { id: true, name: true }
                }
            }
        })

        await db.$transaction(async (tx) => {
            // First delete students associated with these users
            // This ensures we hit our explicit student audit logging logic if needed,
            // though database cascade would handle the data removal.
            // For extra safety with SQLite and Prisma transactions:
            await tx.student.deleteMany({
                where: { parentId: { in: targetIds } }
            })

            await tx.user.deleteMany({
                where: { id: { in: targetIds } }
            })
        }, {
            maxWait: 10000,
            timeout: 60000 // (Applied timeout: 60s)
        })

        // Log deletions
        for (const user of users) {
            await recordAudit({
                action: "USER_DELETE",
                entityType: "USER",
                entityId: user.id,
                details: { name: user.name, email: user.email, studentCount: user.students.length }
            })

            for (const s of user.students) {
                await recordAudit({
                    action: "STUDENT_DELETE",
                    entityType: "STUDENT",
                    entityId: s.id,
                    studentId: s.id,
                    studentName: s.name,
                    details: { name: s.name, parentName: user.name }
                })
            }
        }

        revalidatePath('/dashboard/users')
        return { success: true, count: users.length }
    } catch (error) {
        console.error("Bulk Delete Users Error:", error)
        return { success: false, error: "Failed to delete selected users" }
    }
}


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

        const user = await db.$transaction(async (tx) => {
            const u = await tx.user.create({
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
            return u
        }, {
            maxWait: 10000,
            timeout: 60000 // (Applied timeout: 60s)
        })

        await recordAudit({
            action: "USER_CREATE",
            entityType: "USER",
            entityId: user.id,
            details: { name: user.name, email: user.email }
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

        // Fetch current state for comparison
        const currentUser = await db.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        })

        if (!currentUser) return { success: false, error: "User not found" }

        // Track Parent changes
        const parentChanges: string[] = []
        if (currentUser.name !== validated.name) parentChanges.push('name')
        if (currentUser.email !== validated.email) parentChanges.push('email')
        if (currentUser.role !== validated.role) parentChanges.push('role')
        if (currentUser.profile?.phone !== validated.phone) parentChanges.push('phone')
        if (currentUser.profile?.phone2 !== validated.phone2) parentChanges.push('phone2')
        if (currentUser.profile?.marketingSource !== validated.marketingSource) parentChanges.push('source')

        // Update Parent
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

        // Students sync
        if (validated.students) {
            for (const s of validated.students) {
                if (s.id) {
                    const oldStudent = await db.student.findUnique({ where: { id: s.id } })

                    // Track Student changes
                    const studentChanges: string[] = []
                    if (oldStudent) {
                        if (oldStudent.name !== s.name) studentChanges.push('name')
                        if (oldStudent.level !== s.level) studentChanges.push('level')
                        if (oldStudent.studentCode !== s.studentCode) studentChanges.push('code')
                        if (oldStudent.medicalInfo !== s.medicalInfo) studentChanges.push('medical')
                    }

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

                    // Record audit only if something changed
                    if (studentChanges.length > 0) {
                        await recordAudit({
                            action: "STUDENT_UPDATE",
                            entityType: "STUDENT",
                            entityId: s.id,
                            studentId: s.id,
                            details: {
                                name: s.name,
                                summary: `Updated ${studentChanges.join(', ')}`,
                                changes: studentChanges
                            }
                        })
                    }
                } else {
                    const newStudent = await db.student.create({
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

                    await recordAudit({
                        action: "STUDENT_CREATE",
                        entityType: "STUDENT",
                        entityId: newStudent.id,
                        studentId: newStudent.id,
                        details: {
                            name: s.name,
                            summary: `Added student ${s.name}`
                        }
                    })
                }
            }
        }

        // Record parent audit only if something changed
        if (parentChanges.length > 0) {
            await recordAudit({
                action: "USER_UPDATE",
                entityType: "USER",
                entityId: userId,
                details: {
                    name: validated.name,
                    email: validated.email,
                    summary: `Updated ${parentChanges.join(', ')}`,
                    changes: parentChanges
                }
            })
        }

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Update User Error:", error)
        return { success: false, error: "Failed to update user" }
    }
}

export async function getUsersAdmin() {
    const now = new Date()
    return await db.user.findMany({
        include: {
            profile: true,
            students: {
                include: {
                    bookings: {
                        where: {
                            status: 'CONFIRMED',
                            classSession: {
                                startTime: { gte: now }
                            }
                        },
                        include: {
                            classSession: {
                                include: {
                                    template: true,
                                    location: true
                                }
                            }
                        },
                        take: 10
                    }
                }
            },
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
            students: {
                include: {
                    bookings: {
                        include: {
                            classSession: {
                                include: {
                                    template: true,
                                    location: true
                                }
                            }
                        },
                        orderBy: {
                            classSession: {
                                startTime: 'desc'
                            }
                        }
                    },
                    payments: {
                        include: {
                            package: true
                        },
                        orderBy: {
                            date: 'desc'
                        }
                    },
                    studentPackages: {
                        include: {
                            package: true
                        }
                    }
                }
            }
        }
    })
}

export async function getStudent(id: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    return await db.student.findUnique({
        where: { id },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    })
}
