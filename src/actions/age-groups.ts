'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AgeGroupSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    minAge: z.coerce.number().min(0),
    maxAge: z.coerce.number().min(0)
})

export async function upsertAgeGroup(data: any) {
    try {
        const validated = AgeGroupSchema.parse(data)

        if (validated.id) {
            await db.ageGroup.update({
                where: { id: validated.id },
                data: {
                    name: validated.name,
                    minAge: validated.minAge,
                    maxAge: validated.maxAge
                }
            })
        } else {
            await db.ageGroup.create({
                data: {
                    name: validated.name,
                    minAge: validated.minAge,
                    maxAge: validated.maxAge
                }
            })
        }

        revalidatePath('/dashboard/settings/age-groups')
        return { success: true }
    } catch (error) {
        console.error("Age Group Error:", error)
        return { success: false, error: "Failed to save age group" }
    }
}

export async function deleteAgeGroup(id: string) {
    try {
        await db.ageGroup.delete({ where: { id } })
        revalidatePath('/dashboard/settings/age-groups')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete" }
    }
}

export async function getAgeGroups() {
    return await db.ageGroup.findMany({ orderBy: { minAge: 'asc' } })
}
