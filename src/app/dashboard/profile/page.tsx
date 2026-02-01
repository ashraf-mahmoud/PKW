
import React from 'react'
import { auth } from '@/auth'
import { getUserWithFamily } from '@/actions/users'
import ProfileForm from '@/components/profile-form'

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user) return <div>Please login</div>

    const user = await getUserWithFamily(session.user.id!)

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Parent & Family Profile</h2>
                    <p className="text-muted-foreground">Manage your personal details and student information.</p>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <h3 className="text-amber-800 font-bold mb-1">Session Debug Information</h3>
                <p className="text-amber-700 text-sm">Logged in as: <strong>{session.user.email}</strong></p>
                <p className="text-amber-700 text-sm">User ID: <code className="bg-amber-100 px-1 rounded">{session.user.id}</code></p>
                <p className="text-amber-700 text-sm">Session Role: <span className="uppercase font-bold">{session.user.role}</span></p>
                <p className="text-xs text-amber-600 mt-2 italic">If this role is not ADMIN, please log out and log back in to refresh your permissions.</p>
            </div>

            <ProfileForm user={user} />
        </div>
    )
}
