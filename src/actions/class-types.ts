'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClassTypeSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
})

export async function getClassTypes() {
    return await db.classType.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { templates: true }
            }
        }
    })
}

export async function createClassType(formData: FormData) {
    const name = formData.get('name') as string

    try {
        const validated = ClassTypeSchema.parse({ name })

        await db.classType.create({
            data: { name: validated.name }
        })

        revalidatePath('/dashboard/classes/types')
        return { success: true }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message }
        }
        return { success: false, error: "Failed to create class type. It might already exist." }
    }
}

export async function deleteClassType(id: string) {
    try {
        // Check if attached to templates
        const count = await db.classTemplate.count({
            where: { typeId: id }
        })

        if (count > 0) {
            return { success: false, error: `Cannot delete. This type is used by ${count} class templates.` }
        }

        await db.classType.delete({
            where: { id }
        })

        revalidatePath('/dashboard/classes/types')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete class type." }
    }
}

// Migration function to seed initial types and link templates
export async function migrateClassTypes() {
    try {
        // 1. Get all templates with old string types
        const templates = await db.classTemplate.findMany({
            where: {
                typeId: null,
                typeOld: { not: null }
            }
        })

        if (templates.length === 0) return { success: true, message: "No templates need migration." }

        // 2. Extract unique types
        const uniqueTypes = Array.from(new Set(templates.map(t => t.typeOld as string)))

        // 3. Create ClassTypes and map
        const typeMap: Record<string, string> = {}

        for (const typeName of uniqueTypes) {
            const existing = await db.classType.findUnique({ where: { name: typeName } })
            if (existing) {
                typeMap[typeName] = existing.id
            } else {
                const created = await db.classType.create({ data: { name: typeName } })
                typeMap[typeName] = created.id
            }
        }

        // 4. Update templates
        for (const template of templates) {
            if (template.typeOld && typeMap[template.typeOld]) {
                await db.classTemplate.update({
                    where: { id: template.id },
                    data: { typeId: typeMap[template.typeOld] }
                })
            }
        }

        revalidatePath('/dashboard/classes')
        return { success: true, count: templates.length }
    } catch (error) {
        console.error("Migration error:", error)
        return { success: false, error: "Migration failed." }
    }
}
