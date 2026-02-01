
import { db } from '../lib/db';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    const email = 'ashrafmahmoud@pkwarriors.com';
    const password = 'Welcome123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await db.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
                passwordHash: hashedPassword
            },
            create: {
                email,
                name: 'Ashraf Mahmoud',
                role: 'ADMIN',
                passwordHash: hashedPassword
            }
        });

        console.log(`SUCCESS: Created/Updated user ${email} as ADMIN.`);
        console.log(`User ID: ${user.id}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error("Failed to create admin:", error);
    }
}

createAdmin().finally(() => db.$disconnect());
