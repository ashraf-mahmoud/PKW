'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const StudentSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    dob: z.coerce.date(),
    medicalInfo: z.string().optional(),
    // Parents can't edit studentCode or level directly here usually, but let's allow basic info
    // For now we trust parents to update names/dob/med
})

const ProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    phone2: z.string().optional(),
    students: z.array(StudentSchema).optional()
})

export async function updateMyProfile(data: any) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Not authorized" }

    try {
        const validated = ProfileSchema.parse(data)
        const userId = session.user.id

        // Transaction update
        await db.user.update({
            where: { id: userId },
            data: {
                name: validated.name,
                email: validated.email,
                profile: {
                    upsert: {
                        create: {
                            phone: validated.phone,
                            phone2: validated.phone2
                        },
                        update: {
                            phone: validated.phone,
                            phone2: validated.phone2
                        }
                    }
                }
            }
        })

        // Handle Students
        if (validated.students) {
            for (const s of validated.students) {
                if (s.id) {
                    // Update existing attached to this parent
                    await db.student.updateMany({ // use updateMany to ensure parentId check
                        where: { id: s.id, parentId: userId },
                        data: {
                            name: s.name,
                            dob: s.dob,
                            medicalInfo: s.medicalInfo
                        }
                    })
                } else {
                    // Create new
                    await db.student.create({
                        data: {
                            parentId: userId!,
                            name: s.name,
                            dob: s.dob,
                            medicalInfo: s.medicalInfo
                        }
                    })
                }
            }
        }

        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error("Profile Update Error:", error)
        return { success: false, error: "Failed to update profile" }
    }
}
