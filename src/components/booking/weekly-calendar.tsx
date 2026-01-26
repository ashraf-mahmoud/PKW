'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, MapPin } from "lucide-react"
import { startOfWeek, addDays, format, addWeeks, subWeeks, isSameDay, isPast, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import { getWhatsAppLink } from "@/lib/constants"

export default function WeeklyCalendar({ sessions, weekOffset }: { sessions: any[], weekOffset: number }) {
    const router = useRouter()

    // Calculate current week
    const today = new Date()
    const currentWeekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 }) // Monday

    // Generate 7 days
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

    // Group sessions by day
    const sessionsByDay = weekDays.map(day => {
        return sessions.filter(session => {
            const date = new Date(session.startTime)
            return isSameDay(date, day)
        }).sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
    })

    const navigateWeek = (offset: number) => {
        const newOffset = weekOffset + offset
        router.push(`/book-trial?week=${newOffset}`)
    }

    return (
        <div className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(-1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Week
                </Button>

                <div className="text-center">
                    <h2 className="font-bold text-lg">
                        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                    </h2>
                    {weekOffset === 0 && (
                        <p className="text-xs text-primary font-medium">Current Week</p>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(1)}
                >
                    Next Week
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 md:gap-4">
                {weekDays.map((day, dayIndex) => {
                    const daySessions = sessionsByDay[dayIndex]
                    const isToday = isSameDay(day, today)
                    const isPastDay = isPast(day) && !isToday

                    return (
                        <div
                            key={dayIndex}
                            className={`bg-card border rounded-xl overflow-hidden ${isToday ? 'ring-2 ring-primary' : ''
                                } ${isPastDay ? 'opacity-50' : ''}`}
                        >
                            {/* Day Header */}
                            <div className={`p-3 text-center border-b ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                }`}>
                                <div className="font-bold text-sm">
                                    {format(day, 'EEE')}
                                </div>
                                <div className="text-lg font-bold">
                                    {format(day, 'd')}
                                </div>
                            </div>

                            {/* Sessions */}
                            <div className="p-2 space-y-2 min-h-[200px]">
                                {daySessions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-xs">
                                        No classes
                                    </div>
                                ) : (
                                    daySessions.map((session) => {
                                        const sessionTime = new Date(session.startTime)
                                        const isPastSession = isPast(sessionTime)
                                        const bookingCount = session._count?.bookings || 0
                                        const capacity = session.template.capacity
                                        const spotsLeft = capacity - bookingCount

                                        return (
                                            <button
                                                key={session.id}
                                                disabled={isPastSession}
                                                onClick={() => {
                                                    if (!isPastSession) {
                                                        const message = `Hi, I'd like to book the ${session.template.name} on ${format(sessionTime, 'MMM d')} at ${format(sessionTime, 'h:mm a')} at ${session.location.name}`
                                                        window.open(getWhatsAppLink(message), '_blank')
                                                    }
                                                }}
                                                className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${isPastSession
                                                    ? 'bg-muted/50 cursor-not-allowed text-muted-foreground'
                                                    : 'bg-background hover:bg-accent hover:border-primary cursor-pointer'
                                                    }`}
                                            >
                                                <div className="font-bold text-xs mb-1">
                                                    {format(sessionTime, 'h:mm a')}
                                                </div>
                                                <div className="font-medium text-xs leading-tight mb-1">
                                                    {session.template.name}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                                                    <MapPin size={10} />
                                                    {session.location.name}
                                                </div>
                                                <div className="flex flex-col gap-1 text-[10px] text-muted-foreground mb-2">
                                                    <div>
                                                        Age: {session.template.ageMin}-{session.template.ageMax} yrs
                                                    </div>
                                                    {session.coaches && session.coaches.length > 0 && (
                                                        <div className="text-primary truncate">
                                                            Coach: {session.coaches.map((c: any) => c.name.split(' ')[0]).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`flex items-center gap-1 text-[10px] font-medium ${spotsLeft <= 3 ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                    <Users size={10} />
                                                    {spotsLeft} spots left
                                                </div>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="bg-muted/30 p-4 rounded-xl">
                <h3 className="font-bold text-sm mb-2">Legend</h3>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-muted/50"></div>
                        <span>Past (not bookable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={12} className="text-green-600" />
                        <span>Available spots</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
