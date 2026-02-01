import { getUsersAdmin } from "@/actions/users"
import { getPackages } from "@/actions/packages"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import UsersTable from "@/components/admin/users-table"
import ExportUsersButton from "@/components/admin/export-users-button"
import ImportUsersButton from "@/components/admin/import-users-button"

export default async function UsersPage() {
    const [users, packages] = await Promise.all([
        getUsersAdmin(),
        getPackages()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Families & Users</h1>
                    <p className="text-muted-foreground">Manage parents, guardians, and students.</p>
                </div>
                <div className="flex items-center gap-2">
                    <ImportUsersButton />
                    <ExportUsersButton />
                    <Button asChild>
                        <Link href="/dashboard/users/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Family
                        </Link>
                    </Button>
                </div>
            </div>

            <UsersTable users={users} packages={packages} />
        </div>
    )
}
