import { getClassTemplates, deleteClassTemplate } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trash2, Edit } from "lucide-react"
import DeleteTemplateButton from "@/components/admin/delete-template-button"

export default async function ClassesPage() {
    const templates = await getClassTemplates()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Class Templates</h1>
                    <p className="text-muted-foreground">Manage the types of classes available (e.g. Parkour Level 1).</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/classes/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <div key={template.id} className="bg-card rounded-xl p-6 border shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{template.name}</h3>
                                <div className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block mt-1">
                                    {template.type}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/classes/${template.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/classes/${template.id}/schedule`}>
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <DeleteTemplateButton templateId={template.id} templateName={template.name} />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Levels:</span>
                                <span className="font-medium text-foreground">{template.levelMin} - {template.levelMax}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ages:</span>
                                <span className="font-medium text-foreground">{template.ageMin} - {template.ageMax} yrs</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Capacity:</span>
                                <span className="font-medium text-foreground">{template.capacity} students</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="font-medium text-foreground">{template.durationMin} mins</span>
                            </div>
                        </div>

                        {template.sessions.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Upcoming Sessions</h4>
                                <ul className="space-y-2">
                                    {template.sessions.map((session: any) => (
                                        <li key={session.id} className="text-sm border rounded-md p-2 bg-muted/30">
                                            <div className="font-medium">{new Date(session.startTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                                            <div className="flex justify-between text-muted-foreground text-xs mt-1">
                                                <span>{new Date(session.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                                <span>{session.location.name}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground mb-4">No class templates found.</p>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/classes/new">Create your first class</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
