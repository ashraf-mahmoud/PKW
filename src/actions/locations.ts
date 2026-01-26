'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const LocationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().min(1, "Address is required"),
    googleMapsUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    attireInfo: z.string().optional().or(z.literal('')),
    directionVideoUrl: z.string().url().optional().or(z.literal('')),
    rules: z.string().optional().or(z.literal('')),
    // Expecting array of image URLs
    // Since FormData can have multiple entries for same key, or stringified JSON
    imageUrls: z.string().optional() // We'll parse manual JSON string or handle array manually in function
})

export async function createLocation(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        address: formData.get('address'),
        googleMapsUrl: formData.get('googleMapsUrl'),
        description: formData.get('description'),
        attireInfo: formData.get('attireInfo'),
        directionVideoUrl: formData.get('directionVideoUrl'),
        rules: formData.get('rules'),
        imageUrls: formData.get('imageUrls') // JSON string of string[]
    }

    try {
        const validatedData = LocationSchema.parse(rawData)
        const imageUrls = validatedData.imageUrls ? JSON.parse(validatedData.imageUrls) : []

        // Clean up empty strings to null
        const dataToSave = {
            name: validatedData.name,
            address: validatedData.address,
            googleMapsUrl: validatedData.googleMapsUrl || null,
            description: validatedData.description || null,
            attireInfo: validatedData.attireInfo || null,
            directionVideoUrl: validatedData.directionVideoUrl || null,
            rules: validatedData.rules || null,
            images: {
                create: imageUrls.map((url: string) => ({ url }))
            }
        }

        await db.location.create({
            data: dataToSave,
        })

        revalidatePath('/dashboard/locations')
        revalidatePath('/book-trial')
        return { success: true }
    } catch (error) {
        console.error("Create location error:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues.map((e: any) => e.message).join(', ') }
        }
        return { success: false, error: 'Failed to create location' }
    }
}

export async function updateLocation(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        address: formData.get('address'),
        googleMapsUrl: formData.get('googleMapsUrl'),
        description: formData.get('description'),
        attireInfo: formData.get('attireInfo'),
        directionVideoUrl: formData.get('directionVideoUrl'),
        rules: formData.get('rules'),
        imageUrls: formData.get('imageUrls')
    }

    try {
        const validatedData = LocationSchema.parse(rawData)
        const imageUrls = validatedData.imageUrls ? JSON.parse(validatedData.imageUrls) : []

        const dataToSave = {
            name: validatedData.name,
            address: validatedData.address,
            googleMapsUrl: validatedData.googleMapsUrl || null,
            description: validatedData.description || null,
            attireInfo: validatedData.attireInfo || null,
            directionVideoUrl: validatedData.directionVideoUrl || null,
            rules: validatedData.rules || null,
        }

        // Explicitly update images: Delete all and recreate to sync
        await db.$transaction([
            db.locationImage.deleteMany({ where: { locationId: id } }),
            db.location.update({
                where: { id },
                data: {
                    ...dataToSave,
                    images: {
                        create: imageUrls.map((url: string) => ({ url }))
                    }
                }
            })
        ])

        revalidatePath('/dashboard/locations')
        revalidatePath('/book-trial')
        return { success: true }
    } catch (error) {
        console.error("Update location error:", error)
        return { success: false, error: 'Failed to update location' }
    }
}

export async function deleteLocation(id: string) {
    try {
        // Check if used? Cascade delete handles sessions? 
        // Schema says sessions location relation is mandatory. 
        // If we delete location, what happens to sessions?
        // In schema:   location Location @relation(fields: [locationId], references: [id]) (No Cascade)
        // So distinct delete might fail if sessions exist.

        // Ideally we prevent delete if sessions exist.
        const sessions = await db.classSession.count({ where: { locationId: id } })
        if (sessions > 0) {
            return { success: false, error: `Cannot delete location. ${sessions} sessions are scheduled here.` }
        }

        await db.location.delete({
            where: { id },
        })
        revalidatePath('/dashboard/locations')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete location' }
    }
}

export async function getLocationsAdmin() {
    return await db.location.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { sessions: true }
            }
        }
    })
}

export async function getLocation(id: string) {
    return await db.location.findUnique({
        where: { id },
        include: { images: true }
    })
}
