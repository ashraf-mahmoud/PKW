import UserForm from "@/components/admin/user-form"
import BackButton from "@/components/ui/back-button"

export default function NewUserPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <BackButton href="/dashboard/users" />
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display mb-2">Register Family</h1>
                <p className="text-muted-foreground">Add a new parent and their children to the system.</p>
            </div>
            <UserForm />
        </div>
    )
}
