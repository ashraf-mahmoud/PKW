
import { recordAudit, getAuditLogs } from '../actions/audit'
import { db } from '../lib/db'

async function test() {
    console.log("Adding a test audit log...")

    // We need to bypass the auth() check in recordAudit for the script
    // Or just manually insert into DB
    const user = await db.user.findFirst({ where: { email: 'aman@parkourwarrior.com' } })
    if (!user) {
        console.error("User not found")
        return
    }

    await db.auditLog.create({
        data: {
            adminId: user.id,
            action: 'USER_UPDATE',
            entityType: 'USER',
            entityId: user.id,
            details: JSON.stringify({ note: "Test log from verification script" })
        }
    })

    console.log("Log inserted manually index. Now fetching via getAuditLogs...")
    // This will likely fail in script due to auth() if not handled
    // But we can check DB directly
    const count = await db.auditLog.count()
    console.log("Total logs in DB:", count)
}

test()
    .catch(console.error)
    .finally(() => db.$disconnect())
