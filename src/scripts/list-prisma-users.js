
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const db = new PrismaClient();

async function run() {
    const all = await db.user.findMany({ select: { name: true, email: true, id: true, role: true } });
    console.log("USERS IN prisma/dev.db:");
    console.log(JSON.stringify(all, null, 2));
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
