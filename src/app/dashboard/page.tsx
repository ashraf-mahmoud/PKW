import { auth } from '@/auth'
import { getDashboardStats } from '@/actions/analytics'
import DashboardDateFilter from '@/components/admin/dashboard-date-filter'
import AnalyticsCards from '@/components/admin/analytics-cards'
import AnalyticsCharts from '@/components/admin/analytics-charts'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    const resolvedParams = await searchParams
    const range = resolvedParams.range as string || 'month'
    const fromStr = resolvedParams.from as string
    const toStr = resolvedParams.to as string

    let startDate = startOfMonth(new Date())
    let endDate = endOfMonth(new Date())

    if (range === 'today') {
        startDate = startOfDay(new Date())
        endDate = endOfDay(new Date())
    } else if (range === '7d') {
        startDate = subDays(new Date(), 7)
        endDate = endOfDay(new Date())
    } else if (range === '30d') {
        startDate = subDays(new Date(), 30)
        endDate = endOfDay(new Date())
    } else if (range === 'custom' && fromStr && toStr) {
        startDate = startOfDay(new Date(fromStr))
        endDate = endOfDay(new Date(toStr))
    }

    const stats = await getDashboardStats(startDate, endDate)

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-display tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, <span className="text-foreground font-semibold">{session?.user?.name}</span>.
                        Here's what's happening at your academy.
                    </p>
                </div>
                <DashboardDateFilter />
            </div>

            <AnalyticsCards stats={stats} />

            <div className="grid gap-6">
                <AnalyticsCharts dailyData={stats.dailyData} />
            </div>
        </div>
    )
}
