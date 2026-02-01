
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
    const userId = 'cmkvh2n2u0001qocjjtb4u6fu';
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user) {
        await db.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });
        console.log(`Elevated user with ID: ${userId} (Email: ${user.email}) to ADMIN`);
    } else {
        console.log(`User with ID ${userId} NOT FOUND in database.`);
    }
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
