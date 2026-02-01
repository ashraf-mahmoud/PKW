'use server'

import { db } from "@/lib/db"
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"

export async function getDashboardStats(startDate?: Date, endDate?: Date) {
    const start = startDate ? startOfDay(startDate) : startOfMonth(new Date())
    const end = endDate ? endOfDay(endDate) : endOfMonth(new Date())

    // 1. Total Students (All time)
    const totalStudents = await db.student.count()

    // 2. New Students in period
    const newStudents = await db.student.count({
        where: {
            createdAt: {
                gte: start,
                lte: end
            }
        }
    })

    // 3. Active Students (Students with active packages)
    const activeStudents = await db.student.count({
        where: {
            studentPackages: {
                some: {
                    active: true,
                    OR: [
                        { expiryDate: null },
                        { expiryDate: { gte: startOfDay(new Date()) } }
                    ]
                }
            }
        }
    })

    // 3. Revenue in period (Completed Payments)
    const payments = await db.payment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: 'COMPLETED'
        }
    })
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // 4. Outstanding in period (Pending Payments)
    const pendingPayments = await db.payment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: 'PENDING'
        }
    })
    const totalOutstanding = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // 5. Revenue by Method
    const revenueByMethod = payments.reduce((acc: Record<string, number>, p) => {
        acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
        return acc
    }, {})

    // 6. Growth Comparison (Previous Period)
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const prevStart = subDays(start, periodDays)
    const prevEnd = subDays(end, periodDays)

    const prevPayments = await db.payment.findMany({
        where: {
            date: {
                gte: prevStart,
                lte: prevEnd
            },
            status: 'COMPLETED'
        }
    })
    const prevRevenue = prevPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    const prevNewStudents = await db.student.count({
        where: {
            createdAt: {
                gte: prevStart,
                lte: prevEnd
            }
        }
    })

    // 7. Daily Trends
    // Create an array of days for the chart
    const dailyData = []
    let curr = new Date(start)
    while (curr <= end) {
        const dayStart = startOfDay(curr)
        const dayEnd = endOfDay(curr)

        const dayRevenue = payments
            .filter(p => p.date >= dayStart && p.date <= dayEnd)
            .reduce((sum, p) => sum + Number(p.amount), 0)

        const dayStudents = await db.student.count({
            where: {
                createdAt: {
                    gte: dayStart,
                    lte: dayEnd
                }
            }
        })

        dailyData.push({
            date: formatChartDate(curr),
            revenue: dayRevenue,
            students: dayStudents
        })
        curr.setDate(curr.getDate() + 1)
    }

    return {
        totalStudents,
        newStudents,
        activeStudents,
        totalRevenue,
        totalOutstanding,
        revenueByMethod,
        growth: {
            revenue: prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100,
            students: prevNewStudents === 0 ? 100 : ((newStudents - prevNewStudents) / prevNewStudents) * 100
        },
        dailyData
    }
}

export async function getActiveStudents() {
    const students = await db.student.findMany({
        where: {
            studentPackages: {
                some: {
                    active: true,
                    OR: [
                        { expiryDate: null },
                        { expiryDate: { gte: startOfDay(new Date()) } }
                    ]
                }
            }
        },
        include: {
            studentPackages: {
                where: {
                    active: true,
                    OR: [
                        { expiryDate: null },
                        { expiryDate: { gte: startOfDay(new Date()) } }
                    ]
                },
                include: {
                    package: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    return students
}

function formatChartDate(date: Date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
