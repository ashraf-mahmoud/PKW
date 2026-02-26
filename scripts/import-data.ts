import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Reading exported data...')
    const inputPath = path.join(process.cwd(), 'prisma/data-export.json')
    const rawData = fs.readFileSync(inputPath, 'utf-8')
    const data = JSON.parse(rawData)

    console.log('Clearing existing Postgres data...')

    // Delete in reverse dependency order
    await prisma.auditLog.deleteMany()
    await prisma.creditLedger.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.waiver.deleteMany()
    await prisma.booking.deleteMany()

    // Before deleting StudentPackage, we must disconnect payments to avoid constraint issues during deletion if any remain
    await prisma.studentPackage.updateMany({ data: { paymentId: null } })
    await prisma.studentPackage.deleteMany()

    await prisma.packagePrice.deleteMany()
    await prisma.package.deleteMany()
    await prisma.classSession.deleteMany()
    await prisma.classSchedule.deleteMany()
    await prisma.classTemplate.deleteMany()
    await prisma.classType.deleteMany()
    await prisma.ageGroup.deleteMany()
    await prisma.locationImage.deleteMany()
    await prisma.location.deleteMany()
    await prisma.student.deleteMany()
    await prisma.userProfile.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.systemSettings.deleteMany()

    console.log('Database cleared. Starting import...')

    // Insert in dependency order
    if (data.systemSettings?.length) await prisma.systemSettings.createMany({ data: data.systemSettings })
    if (data.classType?.length) await prisma.classType.createMany({ data: data.classType })
    if (data.location?.length) await prisma.location.createMany({ data: data.location })
    if (data.locationImage?.length) await prisma.locationImage.createMany({ data: data.locationImage })
    if (data.ageGroup?.length) await prisma.ageGroup.createMany({ data: data.ageGroup })

    if (data.classTemplate?.length) await prisma.classTemplate.createMany({ data: data.classTemplate })
    if (data.user?.length) await prisma.user.createMany({ data: data.user })
    if (data.userProfile?.length) await prisma.userProfile.createMany({ data: data.userProfile })
    if (data.student?.length) await prisma.student.createMany({ data: data.student })
    if (data.account?.length) await prisma.account.createMany({ data: data.account })
    if (data.session?.length) await prisma.session.createMany({ data: data.session })
    if (data.verificationToken?.length) await prisma.verificationToken.createMany({ data: data.verificationToken })

    const scheduleData = data.classSchedule?.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        startDate: s.startDate ? new Date(s.startDate) : null,
        endDate: s.endDate ? new Date(s.endDate) : null,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
    }))
    if (scheduleData?.length) await prisma.classSchedule.createMany({ data: scheduleData })

    const sessionData = data.classSession?.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime)
    }))
    if (sessionData?.length) await prisma.classSession.createMany({ data: sessionData })

    if (data.package?.length) await prisma.package.createMany({ data: data.package })
    if (data.packagePrice?.length) await prisma.packagePrice.createMany({ data: data.packagePrice })

    // Insert StudentPackage WITHOUT paymentId to break circular dependency
    const studentPackageData = data.studentPackage?.map((s: any) => {
        const { paymentId, ...rest } = s;
        return {
            ...rest,
            startDate: new Date(s.startDate),
            expiryDate: s.expiryDate ? new Date(s.expiryDate) : null,
            activatedAt: s.activatedAt ? new Date(s.activatedAt) : null,
            validFrom: s.validFrom ? new Date(s.validFrom) : null,
            validUntil: s.validUntil ? new Date(s.validUntil) : null,
        }
    })
    if (studentPackageData?.length) await prisma.studentPackage.createMany({ data: studentPackageData })

    const bookingData = data.booking?.map((s: any) => ({
        ...s,
        bookedAt: new Date(s.bookedAt)
    }))
    if (bookingData?.length) await prisma.booking.createMany({ data: bookingData })

    const attendanceData = data.attendance?.map((s: any) => ({
        ...s,
        recordedAt: new Date(s.recordedAt)
    }))
    if (attendanceData?.length) await prisma.attendance.createMany({ data: attendanceData })

    const waiverData = data.waiver?.map((s: any) => ({
        ...s,
        signedAt: new Date(s.signedAt)
    }))
    if (waiverData?.length) await prisma.waiver.createMany({ data: waiverData })

    const paymentData = data.payment?.map((s: any) => ({
        ...s,
        date: new Date(s.date)
    }))
    if (paymentData?.length) await prisma.payment.createMany({ data: paymentData })

    const creditLedgerData = data.creditLedger?.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
    }))
    if (creditLedgerData?.length) await prisma.creditLedger.createMany({ data: creditLedgerData })

    const auditData = data.auditLog?.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
    }))
    if (auditData?.length) await prisma.auditLog.createMany({ data: auditData })

    // Restore StudentPackage.paymentId
    console.log('Restoring delayed relationships...')
    for (const sp of (data.studentPackage || [])) {
        if (sp.paymentId) {
            await prisma.studentPackage.update({
                where: { id: sp.id },
                data: { paymentId: sp.paymentId }
            })
        }
    }

    console.log('Successfully imported all data to Postgres!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
