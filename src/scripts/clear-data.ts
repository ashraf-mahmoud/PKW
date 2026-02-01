
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    console.log("⚠️  DELETING ALL USER DATA...")

    // Delete in order of dependencies to avoid foreign key errors (though onDelete: Cascade helps)

    console.log("Deleting Waivers...")
    await db.waiver.deleteMany({})

    console.log("Deleting Attendance...")
    await db.attendance.deleteMany({})

    console.log("Deleting Bookings...")
    await db.booking.deleteMany({})

    console.log("Deleting Students...")
    await db.student.deleteMany({})

    console.log("Deleting User Profiles...")
    await db.userProfile.deleteMany({})

    console.log("Deleting Sessions/Accounts...")
    await db.session.deleteMany({})
    await db.account.deleteMany({})

    console.log("Deleting Users...")
    await db.user.deleteMany({})

    console.log("✅  ALL DATA DELETED.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
