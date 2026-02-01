'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { format, differenceInYears } from "date-fns"
import { recordAudit } from "./audit"
import { deductCredits, activatePackageIfNeeded, getEligiblePackages, refundCredits } from "@/lib/credit-logic"

export async function getBookableSessions() {
    const now = new Date()

    const sessions = await db.classSession.findMany({
        where: {
            startTime: { gte: now }
        },
        include: {
            template: true,
            location: true,
            schedule: true,
            _count: {
                select: { bookings: true }
            }
        },
        orderBy: { startTime: 'asc' },
        take: 50
    })

    return sessions
}

export async function getRecurringSessions(baseSessionId: string, count: number) {
    const baseSession = await db.classSession.findUnique({
        where: { id: baseSessionId },
        include: {
            template: true,
            location: true,
            _count: { select: { bookings: true } },
            schedule: true
        }
    })

    if (!baseSession) return []

    const dayOfWeek = baseSession.startTime.getDay()
    const hours = baseSession.startTime.getHours()
    const minutes = baseSession.startTime.getMinutes()

    // Find sessions with same template, location, day and time
    const futureSessions = await db.classSession.findMany({
        where: {
            templateId: baseSession.templateId,
            locationId: baseSession.locationId,
            startTime: { gt: baseSession.startTime },
        },
        include: {
            template: true,
            location: true,
            schedule: true,
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' }
    })

    const matches = futureSessions.filter(s =>
        s.startTime.getDay() === dayOfWeek &&
        s.startTime.getHours() === hours &&
        s.startTime.getMinutes() === minutes
    )

    return [baseSession, ...matches].slice(0, count)
}

export async function getRecurringSessionsUntilMonthEnd(baseSessionId: string) {
    const baseSession = await db.classSession.findUnique({
        where: { id: baseSessionId },
        include: {
            template: true,
            location: true,
            _count: { select: { bookings: true } },
            schedule: true
        }
    })

    if (!baseSession) return []

    const start = baseSession.startTime
    const endOfMonthDate = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59)

    const dayOfWeek = start.getDay()
    const hours = start.getHours()
    const minutes = start.getMinutes()

    const futureSessions = await db.classSession.findMany({
        where: {
            templateId: baseSession.templateId,
            locationId: baseSession.locationId,
            startTime: {
                gt: start,
                lte: endOfMonthDate
            },
        },
        include: {
            template: true,
            location: true,
            schedule: true,
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' }
    })

    const matches = futureSessions.filter(s =>
        s.startTime.getDay() === dayOfWeek &&
        s.startTime.getHours() === hours &&
        s.startTime.getMinutes() === minutes
    )

    return [baseSession, ...matches]
}

/**
 * Interleaves recurring sessions for multiple base sessions (e.g. Mon 7pm and Wed 7pm)
 * until the total credit count is reached.
 */
export async function getMultiRecurringSessions(baseSessionIds: string[], totalCredits: number) {
    if (baseSessionIds.length === 0) return []

    // For each base session, get its recurring chain
    // We assume the user wants an equal distribution or just sequential till count is hit
    // But usually it means: "book these 2 slots every week until credits are gone"

    const chains = await Promise.all(
        baseSessionIds.map(id => getRecurringSessions(id, totalCredits))
    )

    const result: any[] = []
    let chainIndex = 0
    let itemIndex = 0

    while (result.length < totalCredits) {
        const currentChain = chains[chainIndex]
        if (itemIndex < currentChain.length) {
            result.push(currentChain[itemIndex])
        }

        chainIndex++
        if (chainIndex >= chains.length) {
            chainIndex = 0
            itemIndex++
        }

        // Emergency break if no more sessions found in any chain
        if (itemIndex >= totalCredits && result.length < totalCredits) break
        // Logic check: if we've cycled through all chains and found nothing in this itemIndex row
        const hasMore = chains.some(c => itemIndex < c.length)
        if (!hasMore && chainIndex === 0) break
    }

    // Sort by start time to keep them logical
    return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}

export async function bookClass(
    sessionIds: string | string[],
    studentId: string,
    options?: {
        packageId?: string,
        forceByAdmin?: boolean,
        extendExpiry?: boolean,
        allowOutstanding?: boolean,
        forceExpiry?: boolean
    }
) {
    const session = await auth()
    if (!session || !session.user) return { success: false, error: "Not authorized" }

    const ids = Array.isArray(sessionIds) ? sessionIds : [sessionIds]
    const forceByAdmin = options?.forceByAdmin || false

    try {
        await db.$transaction(async (tx) => {
            const student = await tx.student.findUnique({ where: { id: studentId } })
            if (!student) throw new Error("Student not found")

            // REFINEMENT: Resolve/Create Outstanding Package ONCE for the entire transaction
            let targetPkgId = null
            if (options?.allowOutstanding && options.packageId && options.packageId !== 'trial') {
                // 1. Check if we already created a package for this transaction (failsafe)
                const existingPkg = await tx.studentPackage.findFirst({
                    where: {
                        studentId,
                        packageId: options.packageId,
                        status: "PENDING_ACTIVATION",
                        payment: {
                            method: 'OUTSTANDING',
                            status: 'PENDING'
                        }
                    },
                    orderBy: { startDate: 'desc' }
                })

                if (existingPkg) {
                    targetPkgId = existingPkg.id
                } else {
                    // 2. Find price and details
                    const pkg = await tx.package.findUnique({
                        where: { id: options.packageId },
                        include: { prices: { include: { ageGroup: true } } }
                    })

                    if (pkg) {
                        // Use first session for price calculation reference
                        const firstSessionId = Array.isArray(sessionIds) ? sessionIds[0] : sessionIds
                        const firstSession = await tx.classSession.findUnique({
                            where: { id: firstSessionId },
                            include: { template: true }
                        })

                        let price = (firstSession?.template as any)?.price || 0
                        if (student.dob) {
                            const age = differenceInYears(new Date(), new Date(student.dob))
                            const agePrice = pkg.prices.find((p: any) =>
                                p.ageGroup.minAge <= age && p.ageGroup.maxAge >= age
                            )
                            if (agePrice) price = Number(agePrice.price)
                        }

                        // 3. Create the Outstanding Payment
                        const payment = await tx.payment.create({
                            data: {
                                studentId,
                                packageId: pkg.id,
                                amount: price,
                                method: 'OUTSTANDING',
                                status: 'PENDING',
                                reference: `Admin forced booking - Pending payment for ${pkg.name}`,
                                date: new Date()
                            }
                        })

                        // 4. Create the Student Package
                        const now = new Date()
                        const expiry = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        expiry.setHours(23, 59, 59, 999)

                        const studentPkg = await tx.studentPackage.create({
                            data: {
                                studentId,
                                packageId: pkg.id,
                                remainingCredits: pkg.creditCount,
                                expiryDate: expiry,
                                paymentId: payment.id,
                                status: "PENDING_ACTIVATION"
                            }
                        })

                        // 5. Record credit addition in ledger
                        await tx.creditLedger.create({
                            data: {
                                studentId,
                                packagePurchaseId: studentPkg.id,
                                amount: pkg.creditCount,
                                type: "CREDIT",
                                reason: "PACKAGE_PURCHASE_OUTSTANDING"
                            }
                        })

                        targetPkgId = studentPkg.id
                    }
                }
            }

            for (const sId of ids) {
                const classSession = await tx.classSession.findUnique({
                    where: { id: sId },
                    include: {
                        template: true,
                        _count: {
                            select: {
                                bookings: {
                                    where: { status: { in: ['CONFIRMED', 'PENDING'] } }
                                }
                            }
                        },
                        schedule: true
                    }
                })

                if (!classSession) continue

                // Check for duplicate
                const existing = await tx.booking.findFirst({
                    where: {
                        studentId: studentId,
                        classSessionId: sId,
                        status: 'CONFIRMED'
                    }
                })

                if (existing) {
                    throw new Error(`Student is already booked in session on ${format(classSession.startTime, 'MMM d')}`)
                }

                // Check capacity if not forced
                if (!forceByAdmin) {
                    const capacity = classSession.schedule?.capacity || (classSession.template as any).capacity || 15
                    if (classSession._count.bookings >= capacity) {
                        throw new Error(`Class on ${format(classSession.startTime, 'MMM d')} is full`)
                    }
                }

                // Create Booking
                const booking = await tx.booking.create({
                    data: {
                        classSessionId: sId,
                        studentId: studentId,
                        status: 'CONFIRMED',
                        bookedAt: new Date(),
                        // @ts-ignore
                        creditsCharged: 1 // Default
                    }
                })

                // Handle Credits
                if (options?.allowOutstanding) {
                    // Now deduct 1 credit for THIS specific booking
                    if (targetPkgId) {
                        await deductCredits(tx, {
                            studentId,
                            amount: 1,
                            classDate: classSession.startTime,
                            bookingId: booking.id,
                            requestedPackageId: targetPkgId,
                            reason: "BOOKING_CREATED_OUTSTANDING",
                            forceExpiry: options?.forceExpiry
                        })

                        await tx.booking.update({
                            where: { id: booking.id },
                            // @ts-ignore
                            data: { packagePurchaseId: targetPkgId }
                        })
                    } else {
                        // Fallback: Just create a single outstanding payment for one class if no package
                        await tx.payment.create({
                            data: {
                                studentId,
                                amount: (classSession.template as any).price || 0,
                                method: 'OUTSTANDING',
                                status: 'PENDING',
                                reference: `Admin forced booking (Single Class)`,
                                date: new Date(),
                                // @ts-ignore
                                bookingId: booking.id
                            }
                        })
                    }
                } else {
                    // Try to deduct credits (standard flow)
                    try {
                        const deductions = await deductCredits(tx, {
                            studentId,
                            amount: 1,
                            classDate: classSession.startTime,
                            bookingId: booking.id,
                            requestedPackageId: options?.packageId,
                            reason: "BOOKING_CREATED",
                            forceExpiry: options?.forceExpiry
                        })

                        if (deductions.length > 0) {
                            await tx.booking.update({
                                where: { id: booking.id },
                                // @ts-ignore
                                data: { packagePurchaseId: deductions[0].packageId }
                            })
                        }
                    } catch (error: any) {
                        if (error.message === "EXPIRY_WARNING") {
                            throw new Error("EXPIRY_WARNING")
                        }
                        if (error.message.includes("Insufficient credits") && forceByAdmin) {
                            // Specific error for UI to catch and show dialog
                            throw new Error("INSUFFICIENT_CREDITS")
                        }
                        throw error
                    }
                }
            }
        })

        await recordAudit({
            action: "BOOKING_CREATE",
            entityType: "BOOKING",
            entityId: studentId, // Simplified for bulk
            studentId,
            details: { sessionCount: ids.length, packageId: options?.packageId }
        })

        revalidatePath('/dashboard/book')
        revalidatePath('/dashboard/bookings')
        return { success: true }

    } catch (error) {
        // Suppress expected warning log
        if ((error as Error).message === "EXPIRY_WARNING") {
            return { success: false, error: "EXPIRY_WARNING" }
        }
        console.error("Booking Error:", error)
        return { success: false, error: (error as Error).message || "Booking failed" }
    }
}

export async function getStudentFutureBookings(studentId: string) {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return await db.booking.findMany({
        where: {
            studentId,
            status: 'CONFIRMED',
            classSession: {
                startTime: { gte: startOfToday }
            }
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    dob: true,
                    level: true
                }
            },
            classSession: {
                include: {
                    template: true,
                    location: true
                }
            }
        },
        orderBy: {
            classSession: { startTime: 'asc' }
        }
    })
}

// Obsolete imports removed

export async function modifyBooking(
    newSessionIds: string | string[],
    studentId: string,
    options?: {
        packageId?: string,
        forceByAdmin?: boolean,
        allowOutstanding?: boolean,
        forceExpiry?: boolean
    }
) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        return { success: false, error: "Not authorized" }
    }

    try {
        const now = new Date()
        const ids = Array.isArray(newSessionIds) ? newSessionIds : [newSessionIds]

        await db.$transaction(async (tx) => {
            // Get future bookings inside transaction for consistency
            const oldBookings = await tx.booking.findMany({
                where: {
                    studentId,
                    status: 'CONFIRMED',
                    classSession: { startTime: { gte: now } }
                }
            })

            // 0. Reconcile credits: Refund all future bookings and re-deduct for new ones
            for (const b of oldBookings) {
                // Void any associated OUTSTANDING payments
                await tx.payment.updateMany({
                    where: {
                        // @ts-ignore
                        bookingId: b.id,
                        method: 'OUTSTANDING',
                        status: 'PENDING'
                    },
                    data: {
                        status: 'CANCELLED'
                    }
                })

                if ((b as any).packagePurchaseId) {
                    await refundCredits(tx, {
                        studentId,
                        packageId: (b as any).packagePurchaseId,
                        amount: (b as any).creditsCharged || 1,
                        bookingId: b.id,
                        reason: "BOOKING_MODIFY_REFUND"
                    })
                }
            }

            // 1. Delete future CONFIRMED bookings 
            await tx.booking.deleteMany({
                where: {
                    id: { in: oldBookings.map(b => b.id) }
                }
            })

            const student = await tx.student.findUnique({ where: { id: studentId } })

            // 2. Resolve/Create Outstanding Package ONCE for the entire transaction
            let targetPkgId = null
            if (options?.allowOutstanding && options.packageId && options.packageId !== 'trial') {
                const existingPkg = await tx.studentPackage.findFirst({
                    where: {
                        studentId,
                        packageId: options.packageId,
                        status: "PENDING_ACTIVATION",
                        payment: {
                            method: 'OUTSTANDING',
                            status: 'PENDING'
                        }
                    },
                    orderBy: { startDate: 'desc' }
                })

                if (existingPkg) {
                    targetPkgId = existingPkg.id
                } else {
                    const pkg = await tx.package.findUnique({
                        where: { id: options.packageId },
                        include: { prices: { include: { ageGroup: true } } }
                    })

                    if (pkg) {
                        const firstSessionId = ids[0]
                        const firstSession = await tx.classSession.findUnique({
                            where: { id: firstSessionId },
                            include: { template: true }
                        })

                        let price = (firstSession?.template as any)?.price || 0
                        if (student?.dob) {
                            const age = differenceInYears(new Date(), new Date(student.dob))
                            const agePrice = pkg.prices.find((p: any) =>
                                p.ageGroup.minAge <= age && p.ageGroup.maxAge >= age
                            )
                            if (agePrice) price = Number(agePrice.price)
                        }

                        const payment = await tx.payment.create({
                            data: {
                                studentId,
                                packageId: pkg.id,
                                amount: price,
                                method: 'OUTSTANDING',
                                status: 'PENDING',
                                reference: `Admin forced modification - Pending payment for ${pkg.name}`,
                                date: new Date()
                            }
                        })

                        const expiry = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        expiry.setHours(23, 59, 59, 999)

                        const studentPkg = await tx.studentPackage.create({
                            data: {
                                studentId,
                                packageId: pkg.id,
                                remainingCredits: pkg.creditCount,
                                expiryDate: expiry,
                                paymentId: payment.id,
                                status: "PENDING_ACTIVATION"
                            }
                        })

                        await tx.creditLedger.create({
                            data: {
                                studentId,
                                packagePurchaseId: studentPkg.id,
                                amount: pkg.creditCount,
                                type: "CREDIT",
                                reason: "PACKAGE_PURCHASE_OUTSTANDING"
                            }
                        })

                        targetPkgId = studentPkg.id
                    }
                }
            }

            // 3. Create new bookings and deduct credits
            for (const sId of ids) {
                const classSession = await tx.classSession.findUnique({
                    where: { id: sId },
                    include: { template: true }
                })

                if (!classSession) continue

                // Check for duplicate (if any other bookings exist outside the range we deleted)
                const existing = await tx.booking.findFirst({
                    where: {
                        studentId: studentId,
                        classSessionId: sId,
                        status: 'CONFIRMED'
                    }
                })
                if (existing) continue

                const booking = await tx.booking.create({
                    data: {
                        classSessionId: sId,
                        studentId: studentId,
                        status: 'CONFIRMED',
                        bookedAt: new Date(),
                        // @ts-ignore
                        creditsCharged: 1
                    }
                })

                if (options?.allowOutstanding) {
                    if (targetPkgId) {
                        await deductCredits(tx, {
                            studentId,
                            amount: 1,
                            classDate: classSession.startTime,
                            bookingId: booking.id,
                            requestedPackageId: targetPkgId,
                            reason: "BOOKING_MODIFY_OUTSTANDING",
                            forceExpiry: options?.forceExpiry
                        })

                        await tx.booking.update({
                            where: { id: booking.id },
                            // @ts-ignore
                            data: { packagePurchaseId: targetPkgId }
                        })
                    } else {
                        await tx.payment.create({
                            data: {
                                studentId,
                                amount: (classSession.template as any).price || 0,
                                method: 'OUTSTANDING',
                                status: 'PENDING',
                                reference: `Admin forced modification - No credits available`,
                                date: new Date(),
                                // @ts-ignore
                                bookingId: booking.id
                            }
                        })
                    }
                } else {
                    try {
                        await deductCredits(tx, {
                            studentId,
                            amount: 1,
                            classDate: classSession.startTime,
                            bookingId: booking.id,
                            requestedPackageId: options?.packageId,
                            reason: "BOOKING_MODIFY_DEDUCT",
                            forceExpiry: options?.forceExpiry
                        })
                    } catch (error: any) {
                        if (error.message === "EXPIRY_WARNING") {
                            throw new Error("EXPIRY_WARNING")
                        }
                        if (error.message.includes("Insufficient credits") && options?.forceByAdmin) {
                            throw new Error("INSUFFICIENT_CREDITS")
                        }
                        throw error
                    }
                }
            }
        })

        await recordAudit({
            action: "BOOKING_MODIFY",
            entityType: "BOOKING",
            entityId: studentId,
            studentId,
            details: { newSessionsCount: ids.length }
        })

        revalidatePath('/dashboard/users')
        revalidatePath('/dashboard/bookings')
        return { success: true }
    } catch (error) {
        // Suppress expected warning log
        if ((error as Error).message === "EXPIRY_WARNING") {
            return { success: false, error: "EXPIRY_WARNING" }
        }
        console.error("Modify Booking Error:", error)
        return { success: false, error: (error as Error).message || "Failed to modify bookings" }
    }
}
