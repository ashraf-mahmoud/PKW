
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
    console.log("Starting account elevation...");
    const emails = ['aman@parkourwarrior.com', 'pkwarriors@gmail.com'];

    for (const email of emails) {
        const user = await db.user.findUnique({ where: { email } });
        if (user) {
            await db.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log(`Elevated ${email} to ADMIN`);
        } else {
            console.log(`User ${email} not found`);
        }
    }
}

run()
    .catch(console.error)
    .finally(() => db.$disconnect());
