import { getUserWithFamily } from "@/actions/users"
import UserForm from "@/components/admin/user-form"
import UserHistory from "@/components/admin/user-history"
import { notFound } from "next/navigation"
import BackButton from "@/components/ui/back-button"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithFamily(id)

    if (!user) return notFound()

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <BackButton href="/dashboard/users" />
                <div className="mb-6">
                    <h1 className="text-3xl font-bold font-display mb-2">Edit Family</h1>
                    <p className="text-muted-foreground">Update details for {user.name} and kids.</p>
                </div>
                <UserForm user={user} />
            </div>

            <div className="border-t pt-12">
                <UserHistory students={user.students} />
            </div>
        </div>
    )
}
