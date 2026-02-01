
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    const users = await db.user.findMany({
        select: {
            email: true,
            role: true
        }
    })
    console.log("ALL USERS AND ROLES:")
    users.forEach(u => console.log(`- ${u.email}: [${u.role}]`))
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect())
