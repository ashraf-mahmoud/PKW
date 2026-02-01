
import React from 'react'
import { getAgeGroups } from "@/actions/age-groups"
import AgeGroupList from "@/components/admin/age-group-list"

export default async function AgeGroupsPage() {
    const groups = await getAgeGroups()

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Age Group Settings</h1>
                <p className="text-muted-foreground">Define age groups for class scheduling and package pricing.</p>
            </div>

            <AgeGroupList initialGroups={groups} />
        </div>
    )
}
