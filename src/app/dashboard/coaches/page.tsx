import { getCoaches, deleteCoach } from "@/actions/coaches"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trash2, Edit, User } from "lucide-react"

export default async function CoachesPage() {
    const coaches = await getCoaches()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Coaches</h1>
                    <p className="text-muted-foreground">Manage your coaching staff.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/coaches/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Coach
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coaches.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-xl">
                        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No coaches yet. Add your first coach.</p>
                    </div>
                ) : (
                    coaches.map((coach) => (
                        <div key={coach.id} className="bg-card rounded-xl p-6 border shadow-sm">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{coach.name}</h3>
                                    <p className="text-sm text-muted-foreground">{coach.email}</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/dashboard/coaches/${coach.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <form action={async () => {
                                    'use server'
                                    await deleteCoach(coach.id)
                                }}>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
