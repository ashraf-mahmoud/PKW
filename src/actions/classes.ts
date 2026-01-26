'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClassTemplateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.enum(["PARKOUR", "TRICKING", "KIDS", "WORKSHOP"]),
    levelMin: z.coerce.number().min(1).max(6),
    levelMax: z.coerce.number().min(1).max(6),
    ageMin: z.coerce.number().min(3),
    ageMax: z.coerce.number().max(99),
    capacity: z.coerce.number().min(1),
    price: z.coerce.number().min(0),
    durationMin: z.coerce.number().min(30),
})

export async function createClassTemplate(formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type'),
        levelMin: formData.get('levelMin'),
        levelMax: formData.get('levelMax'),
        ageMin: formData.get('ageMin'),
        ageMax: formData.get('ageMax'),
        capacity: formData.get('capacity'),
        price: formData.get('price'),
        durationMin: formData.get('durationMin'),
    }

    console.log("Creating template with data:", rawData)

    try {
        const validatedData = ClassTemplateSchema.parse(rawData)
        console.log("Validated data:", validatedData)

        await db.classTemplate.create({
            data: validatedData,
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
            }
        }
    })
}

export async function updateClassTemplate(id: string, formData: FormData) {
    const rawData = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type'),
        levelMin: formData.get('levelMin'),
        levelMax: formData.get('levelMax'),
        ageMin: formData.get('ageMin'),
        ageMax: formData.get('ageMax'),
        capacity: formData.get('capacity'),
        price: formData.get('price'),
        durationMin: formData.get('durationMin'),
    }

    console.log("Updating template with data:", rawData)

    try {
        const validatedData = ClassTemplateSchema.parse(rawData)
        console.log("Validated data:", validatedData)

        await db.classTemplate.update({
            where: { id },
            data: validatedData,
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
        include: { location: true, coaches: true }
    })
}

export async function createClassSchedule(data: {
    templateId: string,
    locationId: string,
    dayOfWeek: number,
    startTime: string, // "14:00"
    coachIds?: string[]
}) {
    try {
        const [hours, minutes] = data.startTime.split(':').map(Number)
        // Store startTime as a Date object on 1970-01-01 (or just use date part to store time)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)

        // 1. Create the Schedule Rule
        const schedule = await (db as any).classSchedule.create({
            data: {
                templateId: data.templateId,
                locationId: data.locationId,
                dayOfWeek: data.dayOfWeek,
                startTime: date,
                coaches: data.coachIds && data.coachIds.length > 0
                    ? { connect: data.coachIds.map(id => ({ id })) }
                    : undefined
            }
        })

        // 2. Generate Sessions for the next year
        await syncScheduleSessions(schedule.id)

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
    coachIds?: string[]
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

        // 2. Delete FUTURE sessions
        await db.classSession.deleteMany({
            where: {
                scheduleId: id,
                startTime: { gte: new Date() }
            }
        })

        // 3. Regenerate FUTURE sessions
        await syncScheduleSessions(id)

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
    const start = new Date()
    const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 Year

    // Find next occurrence of DayOfWeek
    // schedule.dayOfWeek is 0-6

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === schedule.dayOfWeek) {
            // Found a match
            const sessionStart = new Date(d)
            const time = new Date(schedule.startTime)
            sessionStart.setHours(time.getHours(), time.getMinutes(), 0, 0)

            const sessionEnd = new Date(sessionStart.getTime() + schedule.template.durationMin * 60000)

            // Check if session already exists for this schedule/time (avoid duplicates if running sync again)
            // Ideally we'd do a check here, but for now we rely on the fact we delete future ones on update

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

    await db.$transaction(
        sessionsToCreate.map(sessionData =>
            db.classSession.create({ data: sessionData })
        )
    )
}



export async function getUpcomingSessions(filters?: {
    locationId?: string
    type?: string
    level?: number
    age?: number
    ageGroupId?: string
    coachId?: string
}) {
    const where: any = {
        startTime: {
            gte: new Date()
        }
    }

    if (filters?.locationId && filters.locationId !== "all") where.locationId = filters.locationId

    if (filters?.coachId && filters.coachId !== "all") {
        where.coaches = {
            some: { id: filters.coachId }
        }
    }

    // Build template filters separately
    const templateFilters: any = {}

    if (filters?.type && filters.type !== "all") templateFilters.type = filters.type

    if (filters?.level) {
        templateFilters.levelMin = { lte: filters.level }
        templateFilters.levelMax = { gte: filters.level }
    }

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
            template: true,
            location: true,
            coaches: true,
            _count: {
                select: { bookings: true }
            }
        },
        orderBy: {
            startTime: 'asc'
        }
    })

    // In-memory filter for Age
    if (filters?.ageGroupId) {
        // Fetch group details (we have to do this since we can't join easily on a dynamic range)
        // Note: Using ANY to bypass stale client types
        const group = await (db as any).ageGroup.findUnique({ where: { id: filters.ageGroupId } })

        if (group) {
            return sessions.filter(session => {
                const sMin = (session.template as any).ageMin ?? 0
                const sMax = (session.template as any).ageMax ?? 99

                // Check for overlap: (StartA <= EndB) and (EndA >= StartB)
                // Session Range: [sMin, sMax]
                // Group Range: [group.minAge, group.maxAge]
                return sMin <= group.maxAge && sMax >= group.minAge
            })
        }
    }

    // Legacy single age filter (fallback)
    if (filters?.age) {
        return sessions.filter(session => {
            const min = (session.template as any).ageMin ?? 0
            const max = (session.template as any).ageMax ?? 99
            return min <= filters.age! && max >= filters.age!
        })
    }

    return sessions
}

export async function getClassSessions(templateId: string) {
    return await db.classSession.findMany({
        where: {
            templateId,
            startTime: { gte: new Date() }
        },
        include: {
            location: true,
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' }
    })
}

export async function deleteClassSession(sessionId: string) {
    try {
        await db.classSession.delete({
            where: { id: sessionId }
        })
        revalidatePath('/dashboard/classes')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete session' }
    }
}
