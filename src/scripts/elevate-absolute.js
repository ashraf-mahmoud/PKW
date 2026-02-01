
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const db = new PrismaClient();

async function run() {
    const userId = 'cmkvh2n2u0001qocjjtb4u6fu';
    const user = await db.user.findUnique({ where: { id: userId } });

    if (user) {
        await db.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });
        console.log(`SUCCESS: Elevated user with ID: ${userId} (Email: ${user.email}) to ADMIN in prisma/dev.db`);
    } else {
        console.log(`User with ID ${userId} STILL NOT FOUND in prisma/dev.db.`);
        const all = await db.user.findMany({ select: { email: true, id: true, role: true } });
        console.log("Total users:", all.length);
        const target = all.find(u => u.email === 'pkwarriors@gmail.com');
        if (target) {
            console.log("Found pkwarriors@gmail.com by email filter:", target);
        }
    }
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
