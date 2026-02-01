
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Force the DB path for the script
process.env.DATABASE_URL = "file:./prisma/dev.db";

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
        const all = await db.user.findMany({ select: { email: true, id: true } });
        console.log("Total users in this DB:", all.length);
        console.log("First 5 users:", JSON.stringify(all.slice(0, 5), null, 2));
    }
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
