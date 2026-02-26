'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { recordAudit } from "./audit"
import { startOfWeek, addWeeks, addDays } from "date-fns"

const ClassTemplateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    typeId: z.string().min(1, "Class type is required"),
    levelMin: z.coerce.number().min(1).max(6),
    levelMax: z.coerce.number().min(1).max(6),
    ageMin: z.coerce.number().min(3),
    ageMax: z.coerce.number().max(99).optional(),
    hasNoMaxAge: z.boolean().default(false),
    price: z.coerce.number().min(0),
    durationMin: z.coerce.number().min(30),
    capacity: z.coerce.number().min(1),
    color: z.string().default("#3b82f6"),
})

export async function createClassTemplate(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        typeId: formData.get('type'),
        levelMin: formData.get('levelMin'),
        levelMax: formData.get('levelMax'),
        ageMin: formData.get('ageMin'),
        ageMax: formData.get('ageMax'),
        hasNoMaxAge: formData.get('hasNoMaxAge') === 'on',
        price: formData.get('price'),
        durationMin: formData.get('durationMin'),
        capacity: formData.get('capacity'),
        color: formData.get('color') || '#3b82f6',
    }

    try {
        const validatedData = ClassTemplateSchema.parse(rawData)

        const template = await db.classTemplate.create({
            data: validatedData,
        })

        await recordAudit({
            action: "TEMPLATE_CREATE",
            entityType: "CLASS_TEMPLATE",
            entityId: template.id,
            details: { name: template.name }
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        console.error("Create template error:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues.map((e: any) => e.message).join(', ') }
        }
        return { success: false, error: (error as Error).message || 'Failed to create class template' }
    }
}

export async function deleteClassTemplate(id: string) {
    try {
        // Manually cascade delete since schema might not have it or we want to be safe
        // 1. Delete Sessions
        await db.classSession.deleteMany({
            where: { templateId: id }
        })

        // 2. Delete Schedules
        await (db as any).classSchedule.deleteMany({
            where: { templateId: id }
        })

        // 3. Delete Template
        await db.classTemplate.delete({
            where: { id },
        })

        await recordAudit({
            action: "TEMPLATE_DELETE",
            entityType: "CLASS_TEMPLATE",
            entityId: id
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete class template' }
    }
}

export async function getClassTemplates() {
    return await db.classTemplate.findMany({
        orderBy: { name: 'asc' },
        include: {
            sessions: {
                where: { startTime: { gte: new Date() } },
                orderBy: { startTime: 'asc' },
                take: 3,
                select: {
                    id: true,
                    startTime: true,
                    location: true
                }
            },
            type: true
        }
    })
}

export async function updateClassTemplate(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        typeId: formData.get('type'),
        levelMin: formData.get('levelMin'),
        levelMax: formData.get('levelMax'),
        ageMin: formData.get('ageMin'),
        ageMax: formData.get('ageMax'),
        hasNoMaxAge: formData.get('hasNoMaxAge') === 'on',
        price: formData.get('price'),
        durationMin: formData.get('durationMin'),
        capacity: formData.get('capacity'),
        color: formData.get('color') || '#3b82f6',
    }

    try {
        const validatedData = ClassTemplateSchema.parse(rawData)

        await db.classTemplate.update({
            where: { id },
            data: validatedData,
        })

        await recordAudit({
            action: "TEMPLATE_UPDATE",
            entityType: "CLASS_TEMPLATE",
            entityId: id,
            details: { name: validatedData.name }
        })

        revalidatePath('/dashboard/classes')
        revalidatePath(`/dashboard/classes/${id}/edit`)
        return { success: true }
    } catch (error) {
        console.error("Update template error:", error)
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues.map((e: any) => e.message).join(', ') }
        }
        return { success: false, error: (error as Error).message || 'Failed to create class template' }
    }
}

export async function getClassTemplate(id: string) {
    return await db.classTemplate.findUnique({
        where: { id }
    })
}

export async function getLocations() {
    return await db.location.findMany()
}

// Session Management

export async function getCoaches() {
    return await db.user.findMany({
        where: { role: 'COACH' }
    })
}

// Session Management

// We accept a simplified input for recurrence
// Update schema to accept array of coachIds
const RecurringScheduleSchema = z.object({
    templateId: z.string(),
    locationId: z.string(),
    coachIds: z.array(z.string()).optional(), // Changed from coachId
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    days: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        times: z.array(z.string())
    }))
})

// Schedule Management

export async function getClassSchedules(templateId: string) {
    return await (db as any).classSchedule.findMany({
        where: { templateId },
        include: { location: true, coaches: true },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
        ]
    })
}

export async function createClassSchedule(data: {
    templateId: string,
    locationId: string,
    dayOfWeek: number,
    startTime: string, // "14:00"
    coachIds?: string[],
    capacity?: number | null, // Optional

    endDate?: string | Date | null, // Optional
    startDate?: string | Date | null, // Optional
    recurrence?: "WEEKLY" | "DAILY", // Optional, default WEEKLY
    ageMin?: number | null,
    ageMax?: number | null,
    hasNoMaxAge?: boolean | null,
    levelMin?: number | null,
    levelMax?: number | null
}) {
    try {
        const [hours, minutes] = data.startTime.split(':').map(Number)
        // Store startTime as a Date object on 1970-01-01 (or just use date part to store time)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)

        console.log("Creating Schedule Rule with:", {
            day: data.dayOfWeek,
            time: data.startTime,
            capacity: data.capacity, // <--- This is the number you entered
            location: data.locationId
        })

        // 1. Create the Schedule Rule
        const schedule = await (db as any).classSchedule.create({
            data: {
                templateId: data.templateId,
                locationId: data.locationId,
                dayOfWeek: data.dayOfWeek,
                startTime: date,
                capacity: data.capacity,

                startDate: data.startDate ? new Date(data.startDate) : new Date(), // Default to now if not provided
                endDate: data.endDate ? new Date(data.endDate) : null,
                recurrence: data.recurrence || "WEEKLY",
                ageMin: data.ageMin,
                ageMax: data.ageMax,
                hasNoMaxAge: data.hasNoMaxAge,
                levelMin: data.levelMin,
                levelMax: data.levelMax,
                coaches: data.coachIds && data.coachIds.length > 0
                    ? { connect: data.coachIds.map(id => ({ id })) }
                    : undefined
            }
        })

        // 2. Generate Sessions for the next year
        await syncScheduleSessions(schedule.id)

        await recordAudit({
            action: "SCHEDULE_CREATE",
            entityType: "CLASS_SCHEDULE",
            entityId: schedule.id,
            details: { day: data.dayOfWeek, time: data.startTime }
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        console.error("Create Schedule Error:", error)
        return { success: false, error: 'Failed to create schedule' }
    }
}

export async function updateClassSchedule(id: string, data: {
    locationId: string,
    dayOfWeek: number,
    startTime: string,
    coachIds?: string[],

    capacity?: number | null,
    endDate?: string | Date | null,
    startDate?: string | Date | null,
    recurrence?: "WEEKLY" | "DAILY",
    ageMin?: number | null,
    ageMax?: number | null,
    hasNoMaxAge?: boolean | null,
    levelMin?: number | null,
    levelMax?: number | null
}) {
    try {
        const [hours, minutes] = data.startTime.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)

        // 1. Update Schedule Rule
        await (db as any).classSchedule.update({
            where: { id },
            data: {
                locationId: data.locationId,
                dayOfWeek: data.dayOfWeek,
                startTime: date,
                capacity: data.capacity,

                startDate: data.startDate ? new Date(data.startDate) : undefined, // Only update if provided
                endDate: data.endDate ? new Date(data.endDate) : null,
                recurrence: data.recurrence || "WEEKLY",
                ageMin: data.ageMin,
                ageMax: data.ageMax,
                hasNoMaxAge: data.hasNoMaxAge,
                levelMin: data.levelMin,
                levelMax: data.levelMax,
                coaches: { set: [] }
            }
        })

        if (data.coachIds && data.coachIds.length > 0) {
            await (db as any).classSchedule.update({
                where: { id },
                data: {
                    coaches: { connect: data.coachIds.map(cid => ({ id: cid })) }
                }
            })
        }

        // 2. Delete FUTURE sessions WITH NO BOOKINGS
        await db.classSession.deleteMany({
            where: {
                scheduleId: id,
                startTime: { gte: new Date() },
                bookings: { none: {} } // Avoid deleting sessions with students
            }
        })

        // 3. Regenerate FUTURE sessions
        await syncScheduleSessions(id)

        await recordAudit({
            action: "SCHEDULE_UPDATE",
            entityType: "CLASS_SCHEDULE",
            entityId: id,
            details: { day: data.dayOfWeek, time: data.startTime }
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        console.error("Update Schedule Error:", error)
        return { success: false, error: 'Failed to update' }
    }
}

export async function deleteClassSchedule(scheduleId: string) {
    try {
        // 1. Delete future sessions linked to this schedule
        await db.classSession.deleteMany({
            where: {
                scheduleId,
                startTime: { gte: new Date() }
            }
        })

        // 2. Delete the schedule rule
        await (db as any).classSchedule.delete({ where: { id: scheduleId } })

        await recordAudit({
            action: "SCHEDULE_DELETE",
            entityType: "CLASS_SCHEDULE",
            entityId: scheduleId
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete schedule' }
    }
}

// Helper to generate sessions for a schedule
async function syncScheduleSessions(scheduleId: string) {
    const schedule = await (db as any).classSchedule.findUnique({
        where: { id: scheduleId },
        include: { coaches: true, template: true }
    })

    if (!schedule) return

    const sessionsToCreate = []

    // Determine Start Date
    let start = new Date()
    if (schedule.startDate) {
        start = new Date(schedule.startDate)
        // If start date is in the past, maybe we should start from today? 
        // But for transparency, let's respect the start date. 
        // However, we probably don't want to back-fill sessions from years ago.
        // For now, let's say if start date is < today, we start from today, UNLESS we want to backfill.
        // The prompt says "running from the day the class weekly schedule created" (which is effectively today/start).
        // Let's use max(today, startDate) to avoid generating past sessions? 
        // Actually, sometimes people want to record past sessions. Let's stick to startDate if provided.
        // But wait, the loop calculates "next occurrence".
    }

    // Default End Date logic
    let end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000) // Default 1 Year from START


    if (schedule.endDate) {
        end = new Date(schedule.endDate)
        end.setHours(23, 59, 59, 999) // Include the end date fully
    }

    // Find next occurrence of DayOfWeek
    // schedule.dayOfWeek is 0-6

    // Find next occurrence
    // schedule.dayOfWeek is 0-6

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        let shouldCreate = false

        if (schedule.recurrence === 'DAILY') {
            shouldCreate = true
        } else {
            // WEEKLY default
            if (d.getDay() === schedule.dayOfWeek) {
                shouldCreate = true
            }
        }

        if (shouldCreate) {
            // Found a match
            const sessionStart = new Date(d)
            const time = new Date(schedule.startTime)
            sessionStart.setHours(time.getHours(), time.getMinutes(), 0, 0)

            const sessionEnd = new Date(sessionStart.getTime() + schedule.template.durationMin * 60000)

            // Check if session already exists for this schedule/time (avoid duplicates if running sync again)
            const existing = await db.classSession.findFirst({
                where: {
                    scheduleId: schedule.id,
                    startTime: sessionStart
                }
            })

            if (existing) {
                // Update existing session's metadata (location, coaches, etc.)
                await db.classSession.update({
                    where: { id: existing.id },
                    data: {
                        locationId: schedule.locationId,
                        endTime: sessionEnd,
                        coaches: schedule.coaches.length > 0
                            ? { set: schedule.coaches.map((c: any) => ({ id: c.id })) }
                            : { set: [] }
                    }
                })
            } else {
                sessionsToCreate.push({
                    scheduleId: schedule.id,
                    templateId: schedule.templateId,
                    locationId: schedule.locationId,
                    startTime: sessionStart,
                    endTime: sessionEnd,
                    coaches: schedule.coaches.length > 0
                        ? { connect: schedule.coaches.map((c: any) => ({ id: c.id })) }
                        : undefined
                })
            }
        }
    }

    if (sessionsToCreate.length > 0) {
        await db.$transaction(
            sessionsToCreate.map(sessionData =>
                db.classSession.create({ data: sessionData })
            )
        )
    }
}



export async function getUpcomingSessions(filters?: {
    locationId?: string
    type?: string
    level?: number
    age?: number
    ageGroupId?: string
    coachId?: string
    startDate?: Date
    endDate?: Date
    week?: number
}) {
    let queryStartDate = filters?.startDate || new Date()
    let queryEndDate = filters?.endDate

    if (filters?.week !== undefined && !filters.startDate) {
        const today = new Date()
        queryStartDate = startOfWeek(addWeeks(today, filters.week), { weekStartsOn: 1 })
        queryEndDate = addDays(queryStartDate, 7)
    }

    const where: any = {
        startTime: {
            gte: queryStartDate
        }
    }

    if (queryEndDate) {
        where.startTime.lte = queryEndDate
    }

    if (filters?.locationId && filters.locationId !== "all") where.locationId = filters.locationId

    if (filters?.coachId && filters.coachId !== "all") {
        where.coaches = {
            some: { id: filters.coachId }
        }
    }

    // Build template filters separately
    const templateFilters: any = {}

    if (filters?.type && filters.type !== "all") templateFilters.typeId = filters.type

    // Level is also filtered in-memory now to support overrides
    /*
    if (filters?.level && filters.level.toString() !== "all") {
        const levelNum = Number(filters.level)
        templateFilters.levelMin = { lte: levelNum }
        templateFilters.levelMax = { gte: levelNum }
    }
    */

    // Note: Filtering age in-memory below because Prisma Client is locked/out-of-sync
    // and missing ageMin/ageMax fields in the generated types for some environments.

    // Apply template filters if any exist (excluding age)
    if (Object.keys(templateFilters).length > 0) {
        where.template = {
            is: templateFilters
        }
    }

    const sessions = await db.classSession.findMany({
        where,
        select: {
            id: true,
            startTime: true,
            endTime: true,
            template: {
                include: { type: true }
            },
            location: true,
            coaches: true,
            schedule: {
                select: {
                    capacity: true,
                    ageMin: true,
                    ageMax: true,
                    hasNoMaxAge: true,
                    levelMin: true,
                    levelMax: true
                }
            },
            _count: {
                select: {
                    bookings: {
                        where: { status: { in: ['CONFIRMED', 'PENDING'] } }
                    }
                }
            }
        },
        orderBy: {
            startTime: 'asc'
        }
    })

    // In-memory filter for Age AND Level (handling overrides)
    // We prioritize Schedule (if present) > Template

    let filteredSessions = sessions

    if (filters?.ageGroupId) {
        // Fetch group details (we have to do this since we can't join easily on a dynamic range)
        // Note: Using ANY to bypass stale client types
        const group = await (db as any).ageGroup.findUnique({ where: { id: filters.ageGroupId } })

        if (group) {
            filteredSessions = filteredSessions.filter(session => {
                const sMin = (session.schedule as any)?.ageMin ?? (session.template as any).ageMin ?? 0
                const noMax = (session.schedule as any)?.hasNoMaxAge ?? (session.template as any).hasNoMaxAge ?? false
                const sMax = noMax ? 999 : ((session.schedule as any)?.ageMax ?? (session.template as any).ageMax ?? 99)

                // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
                // Session Range: [sMin, sMax]
                // Group Range: [group.minAge, group.maxAge]
                return sMin <= group.maxAge && sMax >= group.minAge
            })
        }
    }

    // Legacy single age filter (fallback)
    if (filters?.age) {
        filteredSessions = filteredSessions.filter(session => {
            const min = (session.schedule as any)?.ageMin ?? (session.template as any).ageMin ?? 0
            const noMax = (session.schedule as any)?.hasNoMaxAge ?? (session.template as any).hasNoMaxAge ?? false
            const max = noMax ? 999 : ((session.schedule as any)?.ageMax ?? (session.template as any).ageMax ?? 99)
            return min <= filters.age! && max >= filters.age!
        })
    }

    // Level Filter (In-Memory now)
    if (filters?.level && filters?.level.toString() !== "all") {
        const levelNum = Number(filters.level)
        filteredSessions = filteredSessions.filter(session => {
            const min = (session.schedule as any)?.levelMin ?? (session.template as any).levelMin ?? 1
            const max = (session.schedule as any)?.levelMax ?? (session.template as any).levelMax ?? 6
            return levelNum >= min && levelNum <= max
        })
    }

    return filteredSessions
}

export async function getClassSessions(templateId: string) {
    return await db.classSession.findMany({
        where: {
            templateId,
            startTime: { gte: new Date() }
        },
        include: {
            template: {
                include: { type: true }
            },
            location: true,
            _count: {
                select: {
                    bookings: {
                        where: { status: { in: ['CONFIRMED', 'PENDING'] } }
                    }
                }
            }
        },
        orderBy: { startTime: 'asc' }
    })
}

export async function deleteClassSession(sessionId: string) {
    try {
        await db.classSession.delete({
            where: { id: sessionId }
        })

        await recordAudit({
            action: "SESSION_DELETE",
            entityType: "CLASS_SESSION",
            entityId: sessionId
        })

        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete session' }
    }
}
