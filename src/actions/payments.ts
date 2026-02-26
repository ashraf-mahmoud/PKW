'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { recordAudit } from "./audit"

const PaymentSchema = z.object({
    studentId: z.string().min(1),
    packageId: z.string().min(1),
    amount: z.coerce.number().min(0),
    method: z.string().min(1), // CASH, TRANSFER
    reference: z.string().optional().nullable(),
    invoiceUrl: z.string().optional().nullable(),
    expiryDate: z.coerce.date().optional().nullable(),
    status: z.string().optional()
})

export async function createPayment(data: any) {
    try {
        const validated = PaymentSchema.parse(data)

        const pkg = await db.package.findUnique({ where: { id: validated.packageId } })
        if (!pkg) return { success: false, error: "Package not found" }

        const payment = await db.$transaction(async (tx) => {
            // 1. Create Payment
            const p = await tx.payment.create({
                data: {
                    studentId: validated.studentId,
                    packageId: validated.packageId,
                    amount: validated.amount,
                    method: validated.method,
                    status: "COMPLETED",
                    reference: validated.reference,
                    invoiceUrl: validated.invoiceUrl
                }
            })

            // Use provided expiry OR calculate to end of current month
            let finalExpiry = validated.expiryDate

            if (!finalExpiry) {
                // Last day of current month
                const now = new Date()
                finalExpiry = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                // Set to end of day
                finalExpiry.setHours(23, 59, 59, 999)
            }

            const studentPackage = await tx.studentPackage.create({
                data: {
                    studentId: validated.studentId,
                    packageId: validated.packageId,
                    remainingCredits: pkg.creditCount,
                    expiryDate: finalExpiry,
                    paymentId: p.id,
                    // @ts-ignore
                    status: "PENDING_ACTIVATION"
                }
            })

            // 3. Record in CreditLedger
            // @ts-ignore
            await tx.creditLedger.create({
                data: {
                    studentId: validated.studentId,
                    packagePurchaseId: studentPackage.id,
                    amount: pkg.creditCount,
                    type: "CREDIT",
                    reason: "PACKAGE_PURCHASE"
                }
            })

            return p
        })

        await recordAudit({
            action: "PAYMENT_ADD",
            entityType: "PAYMENT",
            entityId: payment.id,
            studentId: validated.studentId,
            details: {
                amount: validated.amount,
                package: pkg.name,
                summary: `Added ${validated.amount} for ${pkg.name}`
            }
        })

        revalidatePath('/dashboard/users')
        revalidatePath('/dashboard/payments')
        return { success: true }
    } catch (error) {
        console.error("Payment Error:", error)
        return { success: false, error: "Failed to record payment" }
    }
}

export async function getPayments() {
    const payments = await db.payment.findMany({
        include: {
            student: {
                include: {
                    parent: true
                }
            },
            package: true,
            studentPackage: {
                include: {
                    bookings: {
                        include: {
                            classSession: {
                                include: {
                                    template: true,
                                    location: true
                                }
                            }
                        }
                    }
                }
            },
            booking: {
                include: {
                    classSession: {
                        include: {
                            template: true,
                            location: true
                        }
                    }
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    })

    return payments.map(p => ({
        ...p,
        amount: Number(p.amount)
    }))
}

export async function updatePayment(id: string, data: any) {
    try {
        const validated = PaymentSchema.parse(data)

        await db.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id },
                data: {
                    amount: validated.amount,
                    method: validated.method,
                    reference: validated.reference,
                    invoiceUrl: validated.invoiceUrl,
                    packageId: validated.packageId,
                    status: validated.status || undefined
                }
            })

            // Update linked studentPackage
            if (validated.expiryDate) {
                await tx.studentPackage.update({
                    where: { paymentId: id },
                    data: {
                        expiryDate: validated.expiryDate,
                        packageId: validated.packageId
                    }
                })
            }
        })

        await recordAudit({
            action: "PAYMENT_UPDATE",
            entityType: "PAYMENT",
            entityId: id,
            studentId: validated.studentId,
            details: {
                amount: validated.amount,
                summary: `Update amount to ${validated.amount}`
            }
        })

        revalidatePath('/dashboard/payments')
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Update Payment Error:", error)
        return { success: false, error: "Failed to update payment" }
    }
}

export async function deletePayment(id: string) {
    try {
        const payment = await db.payment.findUnique({
            where: { id },
            include: {
                studentPackage: true,
                booking: true
            }
        })

        if (!payment) return { success: false, error: "Payment not found" }

        await db.$transaction(async (tx) => {
            // Delete linked StudentPackage and cascade to bookings
            if (payment.studentPackage) {
                // 1. Delete associated bookings first
                const bookingCount = await tx.booking.count({
                    where: { packagePurchaseId: payment.studentPackage.id }
                })

                if (bookingCount > 0) {
                    // Record revocation of these bookings in ledger if needed? 
                    // Usually deletion is enough for "cleaning up" an erroneous payment.
                    await tx.booking.deleteMany({
                        where: { packagePurchaseId: payment.studentPackage.id }
                    })
                }

                // 2. Record credit revocation in ledger for remaining credits
                // @ts-ignore
                await tx.creditLedger.create({
                    data: {
                        studentId: payment.studentId,
                        packagePurchaseId: payment.studentPackage.id,
                        amount: payment.studentPackage.remainingCredits,
                        type: "DEBIT",
                        reason: "PAYMENT_DELETED"
                    }
                })

                await tx.studentPackage.delete({
                    where: { id: payment.studentPackage.id }
                })
            }

            // 3. Delete directly linked Booking (Single Class Outstanding)
            if (payment.bookingId) {
                await tx.booking.delete({
                    where: { id: payment.bookingId }
                })
            }

            // Delete Payment
            await tx.payment.delete({
                where: { id }
            })
        })

        await recordAudit({
            action: "PAYMENT_DELETE",
            entityType: "PAYMENT",
            entityId: id,
            studentId: payment.studentId,
            details: {
                amount: Number(payment.amount),
                summary: `Deleted payment of ${Number(payment.amount)}`
            }
        })

        revalidatePath('/dashboard/payments')
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error) {
        console.error("Delete Payment Error:", error)
        return { success: false, error: (error as Error).message || "Failed to delete payment" }
    }
}
