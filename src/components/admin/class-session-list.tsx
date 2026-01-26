'use client'

import { deleteClassSession } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Trash2, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ClassSessionList({ sessions, templateId }: { sessions: any[], templateId: string }) {
    const { toast } = useToast()
    const router = useRouter()

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to cancel this specific session?")) return

        const res = await deleteClassSession(id)
        if (res.success) {
            toast({ title: "Session Cancelled" })
            router.refresh()
        } else {
            toast({ title: "Error", description: "Could not cancel session", variant: "destructive" })
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center p-8 border rounded-xl bg-card">
                <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Upcoming Sessions ({sessions.length})</h3>
            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
                {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                        <div className="flex flex-col gap-1">
                            <div className="font-bold">
                                {format(new Date(session.startTime), 'EEE, MMM d, yyyy')}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                                <span>{format(new Date(session.startTime), 'h:mm a')}</span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {session.location.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={12} /> {session._count.bookings} booked
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDelete(session.id)}
                            disabled={session._count.bookings > 0}
                            title={session._count.bookings > 0 ? "Cannot cancel session with bookings" : "Cancel Session"}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
