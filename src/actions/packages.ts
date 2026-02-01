'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const PackageSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    creditCount: z.coerce.number().min(0),
    validityDays: z.coerce.number().min(1).default(30),
    prices: z.record(z.string(), z.coerce.number().min(0)) // ageGroupId -> price
})

export async function upsertPackage(data: any) {
    try {
        const validated = PackageSchema.parse(data)

        // Prepare prices data
        // We delete existing prices for this package and recreate them (simplest way to handle updates)
        // Or upsert individually. Deleting and recreating is safer for "set exactly these prices".

        const priceCreates = Object.entries(validated.prices).map(([ageGroupId, price]) => ({
            ageGroupId,
            price
        }))

        if (validated.id) {
            // Update
            await db.$transaction(async (tx) => {
                // Update basic info
                await tx.package.update({
                    where: { id: validated.id },
                    data: {
                        name: validated.name,
                        type: validated.type,
                        creditCount: validated.creditCount,
                        validityDays: validated.validityDays
                    }
                })

                // Update prices
                // First delete all price entries for this package
                await tx.packagePrice.deleteMany({
                    where: { packageId: validated.id }
                })

                // Re-create
                for (const p of priceCreates) {
                    await tx.packagePrice.create({
                        data: {
                            packageId: validated.id!,
                            ageGroupId: p.ageGroupId,
                            price: p.price
                        }
                    })
                }
            })
        } else {
            // Create New
            await db.package.create({
                data: {
                    name: validated.name,
                    type: validated.type,
                    creditCount: validated.creditCount,
                    validityDays: validated.validityDays,
                    prices: {
                        create: priceCreates
                    }
                }
            })
        }

        revalidatePath('/dashboard/settings/packages')
        return { success: true }
    } catch (error) {
        console.error("Package Update Error:", error)
        return { success: false, error: "Failed to save package" }
    }
}

export async function deletePackage(id: string) {
    try {
        // Check if package is in use
        const inUse = await db.package.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        purchasedBy: true,
                        payments: true,
                    }
                }
            }
        })

        if (inUse?._count.purchasedBy && inUse._count.purchasedBy > 0) {
            return { success: false, error: "Cannot delete package: It has already been purchased by students." }
        }

        if (inUse?._count.payments && inUse._count.payments > 0) {
            return { success: false, error: "Cannot delete package: It has payment history associated with it." }
        }

        await db.$transaction(async (tx) => {
            // Delete related prices first
            await tx.packagePrice.deleteMany({
                where: { packageId: id }
            })

            // Then delete the package
            await tx.package.delete({
                where: { id }
            })
        })

        revalidatePath('/dashboard/settings/packages')
        return { success: true }
    } catch (error) {
        console.error("Delete Package Error:", error)
        return { success: false, error: "Failed to delete package" }
    }
}

export async function getPackages() {
    const packages = await db.package.findMany({
        include: {
            prices: {
                include: { ageGroup: true }
            }
        },
        orderBy: { creditCount: 'asc' }
    })

    return packages.map(pkg => ({
        ...pkg,
        prices: pkg.prices.map(p => ({
            ...p,
            // Convert Decimal to number for client serialization
            price: Number(p.price)
        }))
    }))
}
