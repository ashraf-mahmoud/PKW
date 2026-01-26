import { getLocations, getUpcomingSessions } from "@/actions/classes"
import { getCoaches } from "@/actions/coaches"
import { getAgeGroups } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import Link from "next/link"
import { startOfWeek, addDays, format, addWeeks, subWeeks, isSameDay, isPast, parseISO } from "date-fns"
import WeeklyCalendar from "@/components/booking/weekly-calendar"
import TimetableFilters from "@/components/booking/timetable-filters"

export default async function BookTrialPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const weekOffset = resolvedParams.week ? parseInt(resolvedParams.week as string) : 0
    const locationId = resolvedParams.locationId as string
    const type = resolvedParams.type as string
    const coachId = resolvedParams.coachId as string
    const level = resolvedParams.level ? parseInt(resolvedParams.level as string) : undefined
    const age = resolvedParams.age ? parseInt(resolvedParams.age as string) : undefined

    const locations = await getLocations()
    const coaches = await getCoaches()
    const ageGroups = await getAgeGroups()

    // Get all sessions for calendar view with filters
    const allSessions = await getUpcomingSessions({
        locationId,
        type,
        coachId,
        level,
        age,
        ageGroupId: resolvedParams.ageGroupId as string
    })

    return (
        <div className="min-h-screen bg-background">
            <section className="bg-secondary py-12 md:py-20 text-center">
                <div className="container px-4 mx-auto">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
                        Class Timetable
                    </h1>
                    <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
                        View our weekly schedule and book your trial class.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 container mx-auto max-w-7xl">
                <TimetableFilters locations={locations} coaches={coaches} ageGroups={ageGroups} />
                <WeeklyCalendar sessions={allSessions} weekOffset={weekOffset} />
            </section>
        </div>
    )
}
