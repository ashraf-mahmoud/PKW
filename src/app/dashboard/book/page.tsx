
import React from 'react'
import { getBookableSessions } from '@/actions/booking'
import { getPackages } from '@/actions/packages'
import BookingList from './booking-list'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export default async function BookPage() {
    const session = await auth()
    if (!session?.user) return <div>Please login</div>

    const [classes, packages] = await Promise.all([
        getBookableSessions(),
        getPackages()
    ])

    // Fetch user's students with their active packages
    const students = await db.student.findMany({
        where: { parentId: session.user.id },
        include: {
            studentPackages: {
                where: { active: true },
                include: { package: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Book a Class</h2>
            </div>

            <BookingList classes={classes} students={students} packages={packages} />
        </div>
    )
}
