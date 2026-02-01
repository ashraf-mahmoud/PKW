'use server'

import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function exportUsersCSV() {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    const users = await db.user.findMany({
        include: {
            profile: true,
            students: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const headers = [
        "Parent Name",
        "Parent Email",
        "Phone 1",
        "Phone 2",
        "Marketing Source",
        "Trial Date",
        "Student Name",
        "Student Code",
        "Level",
        "DOB",
        "Medical Info"
    ]

    const rows: string[][] = []

    users.forEach(user => {
        if (user.students.length === 0) {
            rows.push([
                user.name || "",
                user.email || "",
                user.profile?.phone || "",
                user.profile?.phone2 || "",
                user.profile?.marketingSource || "",
                user.profile?.trialDate ? user.profile.trialDate.toISOString().split('T')[0] : "",
                "No students",
                "-",
                "-",
                "-",
                "-"
            ])
        } else {
            user.students.forEach(student => {
                rows.push([
                    user.name || "",
                    user.email || "",
                    user.profile?.phone || "",
                    user.profile?.phone2 || "",
                    user.profile?.marketingSource || "",
                    user.profile?.trialDate ? user.profile.trialDate.toISOString().split('T')[0] : "",
                    student.name,
                    student.studentCode || "",
                    student.level?.toString() || "",
                    student.dob ? student.dob.toISOString().split('T')[0] : "",
                    student.medicalInfo || ""
                ])
            })
        }
    })

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => {
            // Escape double quotes and wrap in double quotes if contains comma
            const stringVal = String(val).replace(/"/g, '""')
            return stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"')
                ? `"${stringVal}"`
                : stringVal
        }).join(","))
    ].join("\n")

    return csvContent
}
