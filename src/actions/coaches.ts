'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CoachSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
})

export async function getCoaches() {
    return await db.user.findMany({
        where: { role: 'COACH' },
        orderBy: { name: 'asc' }
    })
}

export async function getCoach(id: string) {
    return await db.user.findUnique({
        where: { id }
    })
}

export async function createCoach(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
    }

    console.log("Creating coach:", rawData)

    try {
        const validatedData = CoachSchema.parse(rawData)

        // Check if email exists
        const existing = await db.user.findUnique({ where: { email: validatedData.email } })
        if (existing) {
            return { success: false, error: 'Email already exists' }
        }

        await db.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                role: 'COACH',
            }
        })

        revalidatePath('/dashboard/coaches')
        return { success: true }
    } catch (error) {
        console.error("Create coach error:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues.map((e: any) => e.message).join(', ') }
        }
        return { success: false, error: 'Failed to create coach' }
    }
}

export async function updateCoach(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
    }

    try {
        await db.user.update({
            where: { id },
            data: {
                name: rawData.name as string,
                email: rawData.email as string,
            }
        })

        revalidatePath('/dashboard/coaches')
        return { success: true }
    } catch (error) {
        console.error("Update coach error:", error)
        return { success: false, error: 'Failed to update coach' }
    }
}

export async function deleteCoach(id: string) {
    try {
        // Check if coach has sessions
        // Check if coach has sessions
        const sessions = await db.classSession.count({
            where: {
                coaches: { some: { id } }
            }
        })
        if (sessions > 0) {
            return { success: false, error: `Cannot delete. Coach has ${sessions} sessions assigned.` }
        }

        await db.user.delete({ where: { id } })
        revalidatePath('/dashboard/coaches')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete coach' }
    }
}
