
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Get a valid AgeGroup ID
    const ageGroup = await prisma.ageGroup.findFirst()
    if (!ageGroup) {
        console.error("No age groups found, cannot proceed with verification.")
        return
    }
    console.log(`Using AgeGroup: ${ageGroup.name} (${ageGroup.id})`)

    // Create a test package
    const pkg = await prisma.package.create({
        data: {
            name: "VERIFICATION_TEST_PKG",
            type: "TRIAL",
            creditCount: 1,
            validityDays: 1,
            prices: {
                create: [
                    { ageGroupId: ageGroup.id, price: 10.0 }
                ]
            }
        }
    })
    console.log(`Created test package: ${pkg.id}`)

    // Try to delete it using the action (simulated logic)
    const id = pkg.id

    const inUse = await prisma.package.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    purchasedBy: true,
                    payments: true,
                }
            }
        }
    })

    console.log(`Package in use count - PurchasedBy: ${inUse._count.purchasedBy}, Payments: ${inUse._count.payments}`)

    if (inUse._count.purchasedBy === 0 && inUse._count.payments === 0) {
        await prisma.$transaction(async (tx) => {
            await tx.packagePrice.deleteMany({ where: { packageId: id } })
            await tx.package.delete({ where: { id } })
        })
        console.log("Successfully deleted package and its prices.")
    } else {
        console.log("Failed: Package was considered in use.")
    }

    // Check if it's gone
    const deletedPkg = await prisma.package.findUnique({ where: { id } })
    if (!deletedPkg) {
        console.log("Verification Success: Package is gone from database.")
    } else {
        console.log("Verification Failed: Package still exists.")
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
