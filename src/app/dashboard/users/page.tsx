import { getUsersAdmin } from "@/actions/users"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Users, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function UsersPage() {
    const users = await getUsersAdmin()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Families & Users</h1>
                    <p className="text-muted-foreground">Manage parents, guardians, and students.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/users/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Family
                    </Link>
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search Users..." className="pl-9" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3 text-center">Kids</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs">{user.profile?.phone || "-"}</div>
                                        {user.profile?.phone2 && <div className="text-xs text-muted-foreground">{user.profile.phone2}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(user as any)._count?.students > 0 ? (
                                            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 w-6 h-6 rounded-full text-xs">
                                                {(user as any)._count.students}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {user.profile?.marketingSource || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/users/${user.id}/edit`}>Edit</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
