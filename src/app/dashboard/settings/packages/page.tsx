
import React from 'react'
import { getPackages } from "@/actions/packages"
import { getAgeGroups } from "@/actions/age-groups"
import PackageList from "@/components/admin/package-list"

export default async function PackagesPage() {
    const [packages, ageGroups] = await Promise.all([
        getPackages(),
        getAgeGroups()
    ])

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Package Settings</h1>
                <p className="text-muted-foreground">Manage class packages and set pricing for different age groups.</p>
            </div>

            <PackageList initialPackages={packages} ageGroups={ageGroups} />
        </div>
    )
}
