'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"

export type AuditAction =
    | "BOOKING_CREATE"
    | "BOOKING_MOVE"
    | "BOOKING_CANCEL"
    | "BOOKING_MODIFY"
    | "BOOKING_DELETE"
    | "PAYMENT_ADD"
    | "PAYMENT_UPDATE"
    | "PAYMENT_DELETE"
    | "STUDENT_PACKAGE_CREATE"
    | "USER_CREATE"
    | "USER_UPDATE"
    | "USER_DELETE"
    | "STUDENT_CREATE"
    | "STUDENT_UPDATE"
    | "STUDENT_DELETE"
    | "TEMPLATE_CREATE"
    | "TEMPLATE_UPDATE"
    | "TEMPLATE_DELETE"
    | "SCHEDULE_CREATE"
    | "SCHEDULE_UPDATE"
    | "SCHEDULE_DELETE"
    | "SESSION_DELETE"
    | "ATTENDANCE_MARK"
    | "WAIVER_SIGN"
    | "USER_IMPORT"

export async function recordAudit({
    action,
    entityType,
    entityId,
    studentId,
    studentName,
    details
}: {
    action: AuditAction,
    entityType: string,
    entityId: string,
    studentId?: string,
    studentName?: string,
    details?: any
}) {
    const session = await auth()
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'COACH')) {
        return // Silent fail for non-staff if called accidentally
    }

    let finalStudentName = studentName;

    // If we have an ID but no name snapshot, try to fetch it
    if (studentId && !finalStudentName) {
        try {
            const student = await db.student.findUnique({
                where: { id: studentId },
                select: { name: true }
            });
            if (student) finalStudentName = student.name;
        } catch (e) {
            console.error("Failed to fetch student name for audit:", e);
        }
    }

    try {
        await db.auditLog.create({
            data: {
                adminId: session.user.id,
                action,
                entityType,
                entityId,
                studentId,
                studentName: finalStudentName,
                details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
            }
        })
    } catch (error) {
        console.error("Failed to record audit log:", error)
    }
}

export async function getStaffMembers() {
    const session = await auth()
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'COACH')) {
        throw new Error("Not authorized")
    }

    return await db.user.findMany({
        where: {
            role: { in: ['ADMIN', 'COACH'] }
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        },
        orderBy: { name: 'asc' }
    })
}

export async function getAuditLogs(params?: {
    adminId?: string,
    startDate?: string,
    endDate?: string,
    action?: string,
    sortBy?: 'createdAt' | 'action',
    sortOrder?: 'asc' | 'desc'
}) {
    const session = await auth()
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'COACH')) {
        throw new Error("Not authorized")
    }

    const where: any = {}

    if (params?.adminId && params.adminId !== 'all') {
        where.adminId = params.adminId
    }

    if (params?.action && params.action !== 'all') {
        where.action = params.action
    }

    if (params?.startDate || params?.endDate) {
        where.createdAt = {}
        if (params.startDate) {
            const start = new Date(params.startDate)
            start.setHours(0, 0, 0, 0)
            where.createdAt.gte = start
        }
        if (params.endDate) {
            const end = new Date(params.endDate)
            end.setHours(23, 59, 59, 999)
            where.createdAt.lte = end
        }
    }

    const orderBy: any = {}
    if (params?.sortBy) {
        orderBy[params.sortBy] = params.sortOrder || 'desc'
    } else {
        orderBy.createdAt = 'desc'
    }

    return await db.auditLog.findMany({
        where,
        include: {
            admin: {
                select: { name: true, email: true }
            },
            student: {
                select: { name: true }
            }
        },
        orderBy,
        take: 300 // Increased limit for filtered views
    })
}
