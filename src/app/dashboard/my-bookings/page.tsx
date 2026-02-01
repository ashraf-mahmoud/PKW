
import React from 'react'
import { auth } from '@/auth'

export default async function MyBookingsPage() {
    const session = await auth()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
            <p className="text-muted-foreground">Manage your upcoming class bookings here.</p>
            <div className="p-4 border border-dashed rounded-lg bg-muted/50">
                Placeholder for booking list
            </div>
        </div>
    )
}
