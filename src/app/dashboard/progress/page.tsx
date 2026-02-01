
import React from 'react'
import { auth } from '@/auth'

export default async function ProgressPage() {
    const session = await auth()

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Student Progress</h2>
            <p className="text-muted-foreground">View skill progression and level updates.</p>
            <div className="p-4 border border-dashed rounded-lg bg-muted/50">
                Placeholder for progress charts
            </div>
        </div>
    )
}
