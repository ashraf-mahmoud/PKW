
import { db } from '../lib/db';
import path from 'path';

async function check() {
    console.log("Runtime Info:");
    console.log("CWD:", process.cwd());
    console.log("DATABASE_URL:", process.env.DATABASE_URL);

    try {
        const userCount = await db.user.count();
        console.log("Total users in DB:", userCount);

        const currentUser = await db.user.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { email: true, id: true, role: true }
        });
        console.log("Most recent user:", JSON.stringify(currentUser, null, 2));
    } catch (e) {
        console.error("DB Error:", e);
    }
}

check().finally(() => db.$disconnect());
