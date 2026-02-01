
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
    const email = 'pkwarriors@gmail.com';
    // Case sensitive but exact
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
        // Try exact match with different case just in case
        user = await db.user.findFirst({ where: { email: { equals: email } } });
    }

    if (user) {
        await db.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });
        console.log(`Elevated ${user.email} (ID: ${user.id}) to ADMIN`);
    } else {
        console.log(`User ${email} NOT FOUND in database.`);
        const all = await db.user.findMany({ select: { email: true } });
        console.log("Existing emails:", all.map(u => u.email).filter(Boolean).join(', '));
    }
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
