
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Please provide an email address.')
        process.exit(1)
    }

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    })

    console.log(`User ${user.email} is now an ADMIN.`)
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
