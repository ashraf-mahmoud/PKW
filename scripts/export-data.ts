import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Exporting data from local SQLite...')
    const data = {
        user: await prisma.user.findMany(),
        userProfile: await prisma.userProfile.findMany(),
        student: await prisma.student.findMany(),
        account: await prisma.account.findMany(),
        session: await prisma.session.findMany(),
        verificationToken: await prisma.verificationToken.findMany(),
        location: await prisma.location.findMany(),
        locationImage: await prisma.locationImage.findMany(),
        classType: await prisma.classType.findMany(),
        classTemplate: await prisma.classTemplate.findMany(),
        classSchedule: await prisma.classSchedule.findMany(),
        classSession: await prisma.classSession.findMany(),
        ageGroup: await prisma.ageGroup.findMany(),
        booking: await prisma.booking.findMany(),
        attendance: await prisma.attendance.findMany(),
        waiver: await prisma.waiver.findMany(),
        package: await prisma.package.findMany(),
        packagePrice: await prisma.packagePrice.findMany(),
        studentPackage: await prisma.studentPackage.findMany(),
        payment: await prisma.payment.findMany(),
        auditLog: await prisma.auditLog.findMany(),
        creditLedger: await prisma.creditLedger.findMany(),
        systemSettings: await prisma.systemSettings.findMany(),
    }

    const outputPath = path.join(process.cwd(), 'prisma/data-export.json')
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
    console.log('Successfully exported data to', outputPath)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
