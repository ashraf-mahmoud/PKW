'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getCurrency() {
    try {
        const setting = await db.systemSettings.findUnique({
            where: { key: 'currency' }
        })
        // Default to USD if not set
        return setting?.value || 'USD'
    } catch (error) {
        console.error("Failed to fetch currency:", error)
        return 'USD'
    }
}

export async function setCurrency(currencyCode: string) {
    try {
        await db.systemSettings.upsert({
            where: { key: 'currency' },
            create: {
                key: 'currency',
                value: currencyCode
            },
            update: {
                value: currencyCode
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error("Failed to set currency:", error)
        return { success: false, error: "Failed to update currency" }
    }
}
