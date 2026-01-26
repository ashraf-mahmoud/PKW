import { getCoach } from "@/actions/coaches"
import CoachForm from "@/components/admin/coach-form"
import { notFound } from "next/navigation"

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const coach = await getCoach(id)

    if (!coach) return notFound()

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-display mb-2">Edit Coach</h1>
            <p className="text-muted-foreground mb-8">Update details for {coach.name}.</p>

            <CoachForm coach={coach} />
        </div>
    )
}
