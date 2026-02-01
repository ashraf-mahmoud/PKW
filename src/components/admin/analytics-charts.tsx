'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useCurrency } from "@/components/providers/currency-provider"

interface AnalyticsChartsProps {
    dailyData: any[]
}

export default function AnalyticsCharts({ dailyData }: AnalyticsChartsProps) {
    if (dailyData.length === 0) return null

    const { currency } = useCurrency()

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    })

    const maxRevenue = Math.max(...dailyData.map(d => d.revenue), 1)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-primary/5 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-display">Revenue Trend</CardTitle>
                        <p className="text-sm text-muted-foreground">Historical earnings for this period</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4 flex items-end gap-1 sm:gap-2">
                        {dailyData.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                <div
                                    className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-all duration-300 relative"
                                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: '2px' }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                        {day.date}: {currencyFormatter.format(day.revenue)}
                                    </div>
                                </div>
                                <div className="text-[8px] text-muted-foreground mt-2 rotate-45 sm:rotate-0 origin-left">
                                    {dailyData.length > 10 ? (i % 3 === 0 ? day.date : '') : day.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/5 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
                    <p className="text-sm text-muted-foreground">Snapshot of recent performance</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {dailyData.slice(-7).reverse().map((day, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 hover:bg-muted/40 transition-all group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold tracking-tight">{day.date}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                            <Users size={10} />
                                            <span>{day.students} New Students</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                        +{currencyFormatter.format(day.revenue)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Daily Revenue</span>
                                </div>
                            </div>
                        ))}
                        {dailyData.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No data for this period.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
