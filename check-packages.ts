
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const packages = await prisma.package.findMany({
        include: {
            _count: {
                select: {
                    prices: true,
                    purchasedBy: true,
                    payments: true,
                }
            }
        }
    })

    console.log('Packages and their dependency counts:')
    packages.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id}):`)
        console.log(`  - Prices: ${p._count.prices}`)
        console.log(`  - PurchasedBy: ${p._count.purchasedBy}`)
        console.log(`  - Payments: ${p._count.payments}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
