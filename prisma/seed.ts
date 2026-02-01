import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const coachPassword = await bcrypt.hash('coach123', 10)

    // 1. Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@parkourwarriors.com' },
        update: {},
        create: {
            email: 'admin@parkourwarriors.com',
            name: 'Super Admin',
            role: 'ADMIN',
            passwordHash: hashedPassword
        }
    })

    // 2. Coach
    const coach = await prisma.user.upsert({
        where: { email: 'coach@parkourwarriors.com' },
        update: {},
        create: {
            email: 'coach@parkourwarriors.com',
            name: 'Coach Mike',
            role: 'COACH',
            passwordHash: coachPassword
        }
    })

    // 3. Class Types
    const parkourType = await prisma.classType.upsert({
        where: { name: 'PARKOUR' },
        update: {},
        create: { name: 'PARKOUR' }
    })

    // 4. Class Templates
    const beginnerParkour = await prisma.classTemplate.create({
        data: {
            name: "Parkour Level 1",
            description: "Introduction to parkour movements.",
            type: { connect: { id: parkourType.id } },
            levelMin: 1,
            levelMax: 1,
            capacity: 10,
            price: 50.00
        }
    })

    // 4. Locations
    const loc1 = await prisma.location.upsert({
        where: { id: 'loc_bangsar' },
        update: {},
        create: {
            id: 'loc_bangsar',
            name: "Bangsar HQ",
            address: "123 Jalan Bangsar, Kuala Lumpur"
        }
    })

    const loc2 = await prisma.location.upsert({
        where: { id: 'loc_mk' },
        update: {},
        create: {
            id: 'loc_mk',
            name: "Mont Kiara",
            address: "1 Mont Kiara, Kuala Lumpur"
        }
    })

    console.log({ admin, coach, beginnerParkour, loc1, loc2 })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
