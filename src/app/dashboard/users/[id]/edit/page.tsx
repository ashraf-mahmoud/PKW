import { getUserWithFamily } from "@/actions/users"
import UserForm from "@/components/admin/user-form"
import { notFound } from "next/navigation"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUserWithFamily(id)

    if (!user) return notFound()

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display mb-2">Edit Family</h1>
                <p className="text-muted-foreground">Update details for {user.name} and kids.</p>
            </div>
            <UserForm user={user} />
        </div>
    )
}
