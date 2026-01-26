'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AgeGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    minAge: z.coerce.number().min(0, "Min age must be 0+"),
    maxAge: z.coerce.number().min(0, "Max age must be 0+"),
})

export async function getAgeGroups() {
    return await (db as any).ageGroup.findMany({
        orderBy: { minAge: 'asc' }
    })
}

export async function createAgeGroup(formData: FormData) {
    try {
        const rawData = {
            name: formData.get('name'),
            minAge: formData.get('minAge'),
            maxAge: formData.get('maxAge'),
        }

        const validated = AgeGroupSchema.parse(rawData)

        await (db as any).ageGroup.create({
            data: validated
        })

        revalidatePath('/dashboard/settings/age-groups')
        return { success: true }
    } catch (error) {
        console.error("Create Age Group Error:", error)
        return { success: false, error: (error as Error).message }
    }
}

export async function deleteAgeGroup(id: string) {
    try {
        await (db as any).ageGroup.delete({ where: { id } })
        revalidatePath('/dashboard/settings/age-groups')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete' }
    }
}
