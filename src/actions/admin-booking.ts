'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { recordAudit } from "./audit"
import { refundCredits, deductCredits } from "@/lib/credit-logic"

export async function getAllBookings() {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Not authorized")
    }

    const bookings = await db.booking.findMany({
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    dob: true,
                    level: true,
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
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
            bookedAt: 'desc'
        }
    })

    return bookings
}

// Old implementations removed in favor of @/lib/credit-logic.ts

export async function cancelBooking(bookingId: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        return { success: false, error: "Not authorized" }
    }

    try {
        const booking = await db.booking.findUnique({ where: { id: bookingId } })
        if (!booking) return { success: false, error: "Booking not found" }
        if (booking.status === 'CANCELLED') return { success: true }

        await db.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED'
                }
            })

            // 2. Void any associated OUTSTANDING payments
            await tx.payment.updateMany({
                where: {
                    // @ts-ignore
                    bookingId,
                    method: 'OUTSTANDING',
                    status: 'PENDING'
                },
                data: {
                    status: 'CANCELLED'
                }
            })

            // 3. Refund credit if it was funded by a package
            if ((booking as any).packagePurchaseId) {
                const refundRes = await refundCredits(tx, {
                    studentId: booking.studentId,
                    packageId: (booking as any).packagePurchaseId as string,
                    amount: (booking as any).creditsCharged || 1,
                    bookingId,
                    reason: "BOOKING_CANCELLED"
                })

                if (!refundRes.success) {
                    throw new Error(`Refund failed: ${refundRes.error}`)
                }

                // 4. Debt Cleanup: If this was an OUTSTANDING package and it's now "full" (all credits refunded)
                // we should consider deleting the pending payment/package entirely.
                const updatedPkg = await tx.studentPackage.findUnique({
                    where: { id: (booking as any).packagePurchaseId },
                    include: {
                        package: true,
                        payment: true
                    }
                })

                if (updatedPkg &&
                    updatedPkg.payment?.method === 'OUTSTANDING' &&
                    updatedPkg.payment?.status === 'PENDING' &&
                    updatedPkg.remainingCredits >= updatedPkg.package.creditCount
                ) {
                    // Check if there are ANY remaining active bookings for this package
                    const otherBookings = await tx.booking.count({
                        where: {
                            studentId: booking.studentId,
                            packagePurchaseId: updatedPkg.id,
                            status: { in: ['CONFIRMED', 'PENDING'] }
                        }
                    })

                    if (otherBookings === 0) {
                        // Delete the package and payment as it was never truly "used"
                        await tx.studentPackage.delete({ where: { id: updatedPkg.id as string } })
                        await tx.payment.delete({ where: { id: updatedPkg.paymentId as string } })
                    }
                }
            }
        })

        await recordAudit({
            action: "BOOKING_CANCEL",
            entityType: "BOOKING",
            entityId: bookingId,
            studentId: booking.studentId,
            details: {
                status: 'CANCELLED',
                packageId: (booking as any).packagePurchaseId || undefined
            }
        })

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard/book')
        return { success: true }
    } catch (error) {
        console.error("Cancel Booking Error:", error)
        return { success: false, error: "Failed to cancel booking" }
    }
}

export async function moveBooking(bookingId: string, newSessionId: string, forceExpiry: boolean = false) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        return { success: false, error: "Not authorized" }
    }

    try {
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            // @ts-ignore
            include: { packagePurchase: true }
        })
        if (!booking) return { success: false, error: "Booking not found" }

        const newSession = await db.classSession.findUnique({
            where: { id: newSessionId }
        })
        if (!newSession) return { success: false, error: "New session not found" }

        // Check if booking is active
        if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
            return { success: false, error: "Cannot move a cancelled or completed booking." }
        }

        // Enforce month lock if package funded
        const pkg = booking.packagePurchase as any
        if (pkg && pkg.validUntil && !forceExpiry) {
            const validMonth = new Date(pkg.validUntil).getMonth()
            const validYear = new Date(pkg.validUntil).getFullYear()
            const newMonth = new Date(newSession.startTime).getMonth()
            const newYear = new Date(newSession.startTime).getFullYear()

            if (validMonth !== newMonth || validYear !== newYear) {
                return { success: false, error: "EXPIRY_WARNING" }
            }
        }

        const existing = await db.booking.findFirst({
            where: {
                studentId: booking.studentId,
                classSessionId: newSessionId,
                status: 'CONFIRMED'
            }
        })

        if (existing) {
            return { success: false, error: "Student is already booked in this session" }
        }

        await db.booking.update({
            where: { id: bookingId },
            data: {
                classSessionId: newSessionId,
                status: 'CONFIRMED'
            }
        })

        await recordAudit({
            action: "BOOKING_MOVE",
            entityType: "BOOKING",
            entityId: bookingId,
            details: JSON.stringify({ newSessionId, previousSessionId: booking.classSessionId })
        })

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard/book')
        return { success: true }
    } catch (error) {
        console.error("Move Booking Error:", error)
        return { success: false, error: "Failed to move booking" }
    }
}

export async function deleteBooking(bookingId: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        return { success: false, error: "Not authorized" }
    }

    try {
        const booking = await db.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) return { success: false, error: "Booking not found" }

        await db.$transaction(async (tx) => {
            // 0. Void any associated OUTSTANDING payments
            await tx.payment.updateMany({
                where: {
                    // @ts-ignore
                    bookingId,
                    method: 'OUTSTANDING',
                    status: 'PENDING'
                },
                data: {
                    status: 'CANCELLED'
                }
            })

            // Refund credit if it was confirmed and funded by a package
            if (booking.status === 'CONFIRMED' && (booking as any).packagePurchaseId) {
                const refundRes = await refundCredits(tx, {
                    studentId: booking.studentId,
                    packageId: (booking as any).packagePurchaseId as string,
                    amount: (booking as any).creditsCharged || 1,
                    bookingId,
                    reason: "BOOKING_CANCELLED"
                })

                if (!refundRes.success) {
                    throw new Error(`Refund failed: ${refundRes.error}`)
                }

                // Debt Cleanup (similar to cancelBooking)
                const updatedPkg = await tx.studentPackage.findUnique({
                    where: { id: (booking as any).packagePurchaseId },
                    include: {
                        package: true,
                        payment: true
                    }
                })

                if (updatedPkg &&
                    updatedPkg.payment?.method === 'OUTSTANDING' &&
                    updatedPkg.payment?.status === 'PENDING' &&
                    updatedPkg.remainingCredits >= updatedPkg.package.creditCount
                ) {
                    const otherBookings = await tx.booking.count({
                        where: {
                            studentId: booking.studentId,
                            packagePurchaseId: updatedPkg.id,
                            status: { in: ['CONFIRMED', 'PENDING'] }
                        }
                    })

                    if (otherBookings === 0) {
                        await tx.studentPackage.delete({ where: { id: updatedPkg.id } })
                        await tx.payment.delete({ where: { id: updatedPkg.paymentId as string } })
                    }
                }
            }

            // Delete the booking AFTER processing refund and cleanup
            await tx.booking.delete({
                where: { id: bookingId }
            })
        })

        await recordAudit({
            action: "BOOKING_DELETE",
            entityType: "BOOKING",
            entityId: bookingId,
            studentId: booking.studentId,
            details: {
                packageId: (booking as any).packagePurchaseId || undefined,
                summary: `Delete booking for session ${booking.classSessionId}`
            }
        })
        revalidatePath('/dashboard/book')
        return { success: true }
    } catch (error) {
        console.error("Delete Booking Error:", error)
        return { success: false, error: "Failed to delete booking" }
    }
}

export async function deleteGroupBookings(studentId: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        return { success: false, error: "Not authorized" }
    }

    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const futureBookings = await db.booking.findMany({
            where: {
                studentId,
                status: 'CONFIRMED',
                classSession: {
                    startTime: { gte: startOfToday }
                }
            }
        })

        if (futureBookings.length === 0) return { success: true }

        await db.$transaction(async (tx) => {
            // Track distinct packages involved for final cleanup
            const packageIds = new Set<string>()

            for (const b of futureBookings) {
                if ((b as any).packagePurchaseId) {
                    const pId = (b as any).packagePurchaseId as string
                    packageIds.add(pId)

                    const refundRes = await refundCredits(tx, {
                        studentId,
                        packageId: pId,
                        amount: (b as any).creditsCharged || 1,
                        bookingId: b.id,
                        reason: "BOOKING_CANCELLED"
                    })

                    if (!refundRes.success) {
                        throw new Error(`Refund failed for booking ${b.id}: ${refundRes.error}`)
                    }
                }

                // Delete the booking AFTER processing refund
                await tx.booking.delete({ where: { id: b.id } })
            }

            // Batch cleanup for outstanding packages that are now empty
            for (const pId of packageIds) {
                const updatedPkg = await tx.studentPackage.findUnique({
                    where: { id: pId },
                    include: {
                        package: true,
                        payment: true
                    }
                })

                if (updatedPkg &&
                    updatedPkg.payment?.method === 'OUTSTANDING' &&
                    updatedPkg.payment?.status === 'PENDING' &&
                    updatedPkg.remainingCredits >= updatedPkg.package.creditCount
                ) {
                    const otherBookings = await tx.booking.count({
                        where: {
                            studentId,
                            packagePurchaseId: pId,
                            status: { in: ['CONFIRMED', 'PENDING'] }
                        }
                    })

                    if (otherBookings === 0) {
                        await tx.studentPackage.delete({ where: { id: pId } })
                        await tx.payment.delete({ where: { id: updatedPkg.paymentId as string } })
                    }
                }
            }
        })

        await recordAudit({
            action: "BOOKING_MODIFY", // Group delete is a form of intensive modification
            entityType: "BOOKING",
            entityId: studentId,
            studentId,
            details: { action: "GROUP_DELETE", deletedCount: futureBookings.length }
        })

        revalidatePath('/dashboard/bookings')
        revalidatePath('/dashboard/book')
        revalidatePath('/dashboard/users')
        revalidatePath('/dashboard/payments')
        return { success: true }
    } catch (error) {
        console.error("Delete Group Bookings Error:", error)
        return { success: false, error: "Failed to delete group bookings" }
    }
}

export async function getSessionBookings(sessionId: string) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Not authorized")
    }

    return await db.booking.findMany({
        where: {
            classSessionId: sessionId,
            status: 'CONFIRMED'
        },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    level: true,
                    dob: true,
                    parent: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
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
            student: {
                name: 'asc'
            }
        }
    })
}

