import { redirect } from "next/navigation"

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    redirect(`/dashboard/classes/${id}/edit`)
}
