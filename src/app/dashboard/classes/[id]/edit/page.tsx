import { getClassSessions, getClassTemplate, getClassSchedules, getLocations, getCoaches } from "@/actions/classes"
import { getClassTypes } from "@/actions/class-types"
import EditClassForm from "@/components/admin/edit-class-form"
import ClassSessionList from "@/components/admin/class-session-list"
import ScheduleManager from "@/components/admin/schedule-manager"
import { notFound } from "next/navigation"
import BackButton from "@/components/ui/back-button"

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const template = await getClassTemplate(id)

    if (!template) return notFound()

    const sessions = await getClassSessions(id)
    const schedules = await getClassSchedules(id)
    const locations = await getLocations()
    const coaches = await getCoaches()
    const types = await getClassTypes()

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <BackButton href="/dashboard/classes" />
            <div className="border-b pb-6">
                <h1 className="text-3xl font-bold font-display mb-2">Edit Class Template</h1>
                <p className="text-muted-foreground">Manage {template.name} details and schedule.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Edit Form */}
                <div className="md:col-span-2 space-y-8">
                    <EditClassForm template={template} types={types} />

                    {/* Session List (Read only / Delete specific) */}
                    <div className="bg-card border rounded-xl p-6">
                        <ClassSessionList sessions={sessions} templateId={id} />
                    </div>
                </div>

                {/* Sidebar: Schedule Manager */}
                <div className="md:col-span-1">
                    <div className="sticky top-8">
                        <ScheduleManager
                            schedules={schedules}
                            templateId={id}
                            locations={locations}
                            coaches={coaches}
                            templateColor={template.color}
                            defaults={{
                                ageMin: template.ageMin,
                                ageMax: template.ageMax,
                                hasNoMaxAge: (template as any).hasNoMaxAge,
                                levelMin: template.levelMin,
                                levelMax: template.levelMax
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
