'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function getStudentPackages(studentId: string, includeDepleted = false) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Not authorized")
    }

    const whereClause: any = {
        studentId,
        active: true
    }

    if (!includeDepleted) {
        whereClause.remainingCredits = { gt: 0 }
    }

    return await db.studentPackage.findMany({
        where: whereClause,
        include: {
            package: true
        },
        orderBy: {
            startDate: 'desc'
        }
    })
}

export async function adjustStudentCredits(
    studentPackageId: string,
    amount: number, // positive to add, negative to remove
    reason: string
) {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Not authorized")
    }

    return await db.$transaction(async (tx) => {
        const pkg = await tx.studentPackage.findUnique({
            where: { id: studentPackageId }
        })

        if (!pkg) throw new Error("Package not found")

        const updatedPkg = await tx.studentPackage.update({
            where: { id: studentPackageId },
            data: {
                remainingCredits: { increment: amount },
                status: (pkg.remainingCredits + amount) <= 0 ? "DEPLETED" : "ACTIVE"
            }
        })

        await tx.creditLedger.create({
            data: {
                studentId: pkg.studentId,
                packagePurchaseId: pkg.id,
                type: amount > 0 ? "CREDIT" : "DEBIT",
                amount: Math.abs(amount),
                reason: `ADMIN_ADJUSTMENT: ${reason}`
            }
        })

        return { success: true, package: updatedPkg }
    })
}
