
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function list() {
    const users = await db.user.findMany({
        select: { email: true, role: true, name: true }
    });
    console.log("DATABASE USERS:");
    console.log(JSON.stringify(users, null, 2));
}

list()
    .catch(console.error)
    .finally(() => db.$disconnect());
