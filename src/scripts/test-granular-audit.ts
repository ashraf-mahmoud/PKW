
import { db } from '../lib/db'
import { updateUserWithFamily } from '../actions/users'

async function test() {
    console.log("Simulating a student update to trigger granular audit...")

    // Find a student
    const student = await db.student.findFirst({
        include: { parent: true }
    })

    if (!student || !student.parent) {
        console.error("No student/parent found for test")
        return
    }

    console.log(`Updating student: ${student.name} (Parent: ${student.parent.name})`)

    // Call updateUserWithFamily with modified level
    const result = await updateUserWithFamily(student.parentId, {
        name: student.parent.name,
        email: student.parent.email,
        role: student.parent.role,
        students: [
            {
                id: student.id,
                name: student.name,
                level: (student.level % 6) + 1, // Change level
                dob: student.dob,
                studentCode: student.studentCode
            }
        ]
    })

    console.log("Update result:", result)

    // Check recent logs
    const logs = await db.auditLog.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { student: true, admin: true }
    })

    console.log("Recent Logan entries:")
    logs.forEach(l => {
        console.log(`- Action: ${l.action}, Entity: ${l.entityType}, Student: ${l.student?.name || 'N/A'}, Details: ${l.details}`)
    })
}

test()
    .catch(console.error)
    .finally(() => db.$disconnect())
