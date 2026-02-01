
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
    const count = await db.auditLog.count()
    console.log("Total Audit Logs:", count)

    if (count > 0) {
        const logs = await db.auditLog.findMany({ take: 5, include: { admin: true } })
        console.log("Recent logs:", JSON.stringify(logs, null, 2))
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect())
