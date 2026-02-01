import CoachForm from "@/components/admin/coach-form"
import BackButton from "@/components/ui/back-button"

export default function NewCoachPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <BackButton href="/dashboard/coaches" />
            <h1 className="text-3xl font-bold font-display mb-2">Add New Coach</h1>
            <p className="text-muted-foreground mb-8">Register a new coach.</p>

            <CoachForm />
        </div>
    )
}
