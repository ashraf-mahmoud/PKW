'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users, MapPin, BarChart, User } from "lucide-react"
import { startOfWeek, addDays, format, addWeeks, subWeeks, isSameDay, isPast, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import { getWhatsAppLink } from "@/lib/constants"

export default function WeeklyCalendar({
    sessions,
    weekOffset,
    onSessionClick,
    selectedSessionId,
    selectedSessionIds = [],
    onWeekChange
}: {
    sessions: any[],
    weekOffset: number,
    onSessionClick?: (session: any) => void,
    selectedSessionId?: string,
    selectedSessionIds?: string[],
    onWeekChange?: (offset: number) => void
}) {
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
        if (onWeekChange) {
            onWeekChange(weekOffset + offset)
            return
        }
        const newOffset = weekOffset + offset
        router.push(`/book-trial?week=${newOffset}`)
    }

    return (
        <div className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(-1)}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </Button>

                <div className="text-center">
                    <h2 className="font-bold text-sm md:text-base">
                        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                    </h2>
                    {weekOffset === 0 && (
                        <p className="text-[10px] text-primary font-medium uppercase tracking-wider">Current Week</p>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek(1)}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4">
                {weekDays.map((day, dayIndex) => {
                    const daySessions = sessionsByDay[dayIndex]
                    const isToday = isSameDay(day, today)
                    const isPastDay = isPast(day) && !isToday

                    return (
                        <div
                            key={dayIndex}
                            className={`bg-card border rounded-xl overflow-hidden shadow-sm ${isToday ? 'ring-2 ring-primary ring-inset' : ''
                                } ${isPastDay ? 'opacity-50' : ''}`}
                        >
                            {/* Day Header */}
                            <div className={`p-2 text-center border-b ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                                }`}>
                                <div className="font-bold text-[10px] uppercase opacity-80">
                                    {format(day, 'EEE')}
                                </div>
                                <div className="text-base font-bold">
                                    {format(day, 'd')}
                                </div>
                            </div>

                            {/* Sessions */}
                            <div className="p-1 space-y-1 min-h-[150px]">
                                {daySessions.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground text-[10px]">
                                        -
                                    </div>
                                ) : (
                                    daySessions.map((session) => {
                                        const sessionTime = new Date(session.startTime)
                                        const isPastSession = isPast(sessionTime)
                                        const bookingCount = session._count?.bookings || 0
                                        const capacity = session.schedule?.capacity ?? session.template?.capacity ?? 15
                                        const spotsLeft = Math.max(0, capacity - bookingCount)
                                        const isSelected = selectedSessionId === session.id || selectedSessionIds.includes(session.id)

                                        return (
                                            <button
                                                key={session.id}
                                                disabled={isPastSession && !onSessionClick}
                                                onClick={() => {
                                                    if (onSessionClick) {
                                                        onSessionClick(session)
                                                    } else if (!isPastSession) {
                                                        router.push('/login')
                                                    }
                                                }}
                                                className={`w-full text-left p-2 rounded-lg border text-[10px] transition-all ${isPastSession && !onSessionClick
                                                    ? 'bg-muted/50 cursor-not-allowed text-muted-foreground'
                                                    : isSelected
                                                        ? 'ring-1 z-10'
                                                        : 'bg-background hover:bg-accent hover:border-black/10 cursor-pointer border-transparent'
                                                    }`}
                                                style={{
                                                    borderTopColor: isSelected ? session.template.color : 'transparent',
                                                    borderRightColor: isSelected ? session.template.color : 'transparent',
                                                    borderBottomColor: isSelected ? session.template.color : 'transparent',
                                                    borderLeftColor: session.template.color || '#3b82f6',
                                                    borderLeftWidth: '3px',
                                                    borderLeftStyle: 'solid',
                                                    boxShadow: isSelected ? `0 0 0 2px ${session.template.color}44` : 'none',
                                                    backgroundColor: isSelected ? `${session.template.color}15` : undefined,
                                                }}
                                            >
                                                <div className="font-bold mb-0.5" style={{ color: session.template.color }}>
                                                    {session.template.type?.name || "Class"}
                                                </div>

                                                <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground leading-tight mb-0.5">
                                                    <BarChart size={8} />
                                                    <span>Level {session.schedule?.levelMin ?? session.template.levelMin ?? 1}-{session.schedule?.levelMax ?? session.template.levelMax ?? 6}</span>
                                                </div>

                                                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1">
                                                    <User size={8} />
                                                    <span>
                                                        {(() => {
                                                            const sMin = session.schedule?.ageMin ?? session.template.ageMin ?? 5
                                                            const noMax = session.schedule?.hasNoMaxAge ?? session.template.hasNoMaxAge ?? false
                                                            const sMax = session.schedule?.ageMax ?? session.template.ageMax ?? 17

                                                            if (noMax) return `Age ${sMin}+`
                                                            return `Age ${sMin}-${sMax}`
                                                        })()}
                                                    </span>
                                                </div>

                                                <div className="font-bold mb-0.5 text-xs">
                                                    {format(sessionTime, 'h:mm a')}
                                                </div>

                                                <div className="flex items-center gap-1 text-[9px] mb-1">
                                                    <MapPin size={8} style={{ color: session.location.color || 'currentColor' }} />
                                                    <span
                                                        className="truncate font-semibold"
                                                        style={{ color: session.location.color || 'inherit' }}
                                                    >
                                                        {session.location.name}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-1 text-[9px] font-bold ${spotsLeft <= 3 ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                    <Users size={8} />
                                                    {spotsLeft} spots
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
        </div>
    )
}
