import { db } from "./db";
import { endOfMonth, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";

/**
 * Calculates the end of the calendar month for a given date.
 */
export function getEndOfMonth(date: Date): Date {
    return endOfMonth(date);
}


/**
 * Activates a package if it's currently pending.
 * Returns the updated package.
 */
export async function activatePackageIfNeeded(tx: any, studentPackageId: string, firstClassDate: Date) {
    const pkg = await tx.studentPackage.findUnique({
        where: { id: studentPackageId }
    });

    if (!pkg || pkg.status !== "PENDING_ACTIVATION") {
        return pkg;
    }

    const validFrom = firstClassDate;
    const validUntil = getEndOfMonth(validFrom);

    return await tx.studentPackage.update({
        where: { id: studentPackageId },
        data: {
            status: "ACTIVE",
            activatedAt: new Date(),
            validFrom,
            validUntil,
            expiryDate: validUntil // Sync old field for compatibility
        }
    });
}

/**
 * Finds eligible packages for a student for a specific class date.
 * Enforces month-lock: class must be in package month (if active) OR package must be pending.
 */
export async function getEligiblePackages(tx: any, studentId: string, classDate: Date, requestedPackageId?: string, ignoreExpiry: boolean = false) {
    const activePackages = await tx.studentPackage.findMany({
        where: {
            studentId,
            id: requestedPackageId, // Filter by specific ID if requested
            remainingCredits: { gt: 0 },
            status: { in: ["PENDING_ACTIVATION", "ACTIVE"] },
        },
        orderBy: {
            startDate: 'asc' // Oldest first
        }
    });

    const currentBookedMonth = classDate.getMonth();
    const currentBookedYear = classDate.getFullYear();

    const eligible = activePackages.filter((pkg: any) => {
        if (ignoreExpiry) return true;

        if (pkg.status === "PENDING_ACTIVATION") return true;

        if (pkg.validUntil) {
            const validMonth = new Date(pkg.validUntil).getMonth();
            const validYear = new Date(pkg.validUntil).getFullYear();
            const isMatch = validMonth === currentBookedMonth && validYear === currentBookedYear;
            if (!isMatch) {
                console.log(`[Credit Logic] Package ${pkg.id} disqualified: Month mismatch. Package Month: ${validMonth + 1}, Booking Month: ${currentBookedMonth + 1}`);
            }
            return isMatch;
        }

        return true;
    });

    console.log(`[Credit Logic] Student ${studentId} eligible packages: ${eligible.length}/${activePackages.length}`);
    return eligible;
}

/**
 * Deducts credits from a student's packages with ledger entries.
 * Automatically picks the oldest eligible packages.
 * Must be called within a transaction.
 */
export async function deductCredits(tx: any, {
    studentId,
    amount,
    classDate,
    bookingId,
    requestedPackageId,
    reason = "BOOKING_CREATED",
    forceExpiry = false
}: {
    studentId: string;
    amount: number;
    classDate: Date;
    bookingId?: string;
    requestedPackageId?: string;
    reason?: string;
    forceExpiry?: boolean;
}) {
    // 1. Try strict filtering first (unless forced)
    let eligiblePackages = await getEligiblePackages(tx, studentId, classDate, requestedPackageId, forceExpiry);

    let totalAvailable = eligiblePackages.reduce((sum: number, p: any) => sum + p.remainingCredits, 0);

    // 2. If insufficient strictly valid credits, check if we have ANY credits (ignoring expiry)
    if (totalAvailable < amount && !forceExpiry) {
        // Check if we would have enough if we ignored expiry
        const allPackages = await getEligiblePackages(tx, studentId, classDate, requestedPackageId, true);
        const allAvailable = allPackages.reduce((sum: number, p: any) => sum + p.remainingCredits, 0);

        if (allAvailable >= amount) {
            // We have credits, but they are expired/month-locked
            throw new Error("EXPIRY_WARNING");
        }
    }

    if (totalAvailable < amount) {
        console.error(`[Credit Logic] Insufficient credits for student ${studentId}. Requested: ${amount}, Available: ${totalAvailable}. Class Date: ${classDate.toISOString()}`);
        if (eligiblePackages.length === 0) {
            console.error(`[Credit Logic] No eligible packages found. (Check month-lock or status)`);
        }
        throw new Error("Insufficient credits in eligible packages for this month.");
    }

    let remainingToDeduct = amount;
    const deductions = [];

    for (const pkg of eligiblePackages) {
        if (remainingToDeduct <= 0) break;

        const toDeductFromThis = Math.min(pkg.remainingCredits, remainingToDeduct);

        // Activate if pending
        let currentPkg = pkg;
        if (pkg.status === "PENDING_ACTIVATION") {
            currentPkg = await activatePackageIfNeeded(tx, pkg.id, classDate);
        }

        // Update package
        await tx.studentPackage.update({
            where: { id: pkg.id },
            data: {
                remainingCredits: { decrement: toDeductFromThis },
                status: pkg.remainingCredits - toDeductFromThis <= 0 ? "DEPLETED" : "ACTIVE"
            }
        });

        // Create ledger entry
        await tx.creditLedger.create({
            data: {
                studentId,
                packagePurchaseId: pkg.id,
                bookingId,
                type: "DEBIT",
                amount: toDeductFromThis,
                reason
            }
        });

        deductions.push({ packageId: pkg.id, amount: toDeductFromThis });
        remainingToDeduct -= toDeductFromThis;
    }

    return deductions;
}

/**
 * Refunds credits back to a student's package.
 * Usually called for one specific booking.
 */
export async function refundCredits(tx: any, {
    studentId,
    packageId,
    amount,
    bookingId,
    reason = "BOOKING_CANCELLED"
}: {
    studentId: string;
    packageId: string;
    amount: number;
    bookingId?: string;
    reason?: string;
}) {
    const pkg = await tx.studentPackage.findUnique({
        where: { id: packageId },
        include: { payment: true }
    });

    if (!pkg) throw new Error("Package not found");

    // Check if confirming this refund is allowed
    // Rule: Generally cannot refund to an expired package
    // EXCEPTION: If it's an OUTSTANDING payment package, we MUST allow refunding (which effectively voids the usage)
    // so that the cleanup logic can run and potentially delete the whole debt.
    const isOutstanding = pkg.payment?.method === 'OUTSTANDING';

    // Check if package is still within its valid month for refund
    const now = new Date();
    if (!isOutstanding && pkg.validUntil && isAfter(now, pkg.validUntil)) {
        console.warn(`Attempted to refund to expired package ${packageId}. Record it in ledger but don't increment credits if policy strictly says no.`);
        // For now, let's allow it but maybe the business wants strict no-refunds to expired.
        // User said: "refund the credit back... only if the package is still within its valid month"
        return { success: false, error: "Package month expired" };
    }

    // Update package
    await tx.studentPackage.update({
        where: { id: packageId },
        data: {
            remainingCredits: { increment: amount },
            status: pkg.status === "DEPLETED" ? "ACTIVE" : pkg.status
        }
    });

    // Create ledger entry
    await tx.creditLedger.create({
        data: {
            studentId,
            packagePurchaseId: packageId,
            bookingId,
            type: "CREDIT",
            amount,
            reason
        }
    });

    return { success: true };
}
