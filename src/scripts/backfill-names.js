
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function backfill() {
    console.log("Starting backfill of student names...");
    const logs = await db.auditLog.findMany({
        where: {
            studentName: null,
            studentId: { not: null }
        },
        include: {
            student: true
        }
    });

    console.log(`Found ${logs.length} logs to update.`);

    for (const log of logs) {
        if (log.student) {
            await db.auditLog.update({
                where: { id: log.id },
                data: { studentName: log.student.name }
            });
        }
    }
    console.log("Backfill completed.");
}

backfill()
    .catch(console.error)
    .finally(() => db.$disconnect());
