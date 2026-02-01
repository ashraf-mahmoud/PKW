
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function check() {
    const logs = await db.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            admin: { select: { name: true, role: true, email: true } },
            student: { select: { name: true } }
        }
    });

    console.log("RECENT AUDIT LOGS:");
    console.log(JSON.stringify(logs, null, 2));

    const admins = await db.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, role: true }
    });
    console.log("CURRENT ADMINS:");
    console.log(JSON.stringify(admins, null, 2));
}

check()
    .catch(console.error)
    .finally(() => db.$disconnect());
