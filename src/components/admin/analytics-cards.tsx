'use client'

import { useState } from "react"
import { getActiveStudents } from "@/actions/analytics"
import { Card, CardContent } from "@/components/ui/card"
import {
    Users,
    DollarSign,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/providers/currency-provider"

interface AnalyticsCardsProps {
    stats: {
        totalStudents: number
        newStudents: number
        activeStudents: number
        totalRevenue: number
        totalOutstanding: number
        growth: {
            revenue: number
            students: number
        }
    }
}

export default function AnalyticsCards({ stats }: AnalyticsCardsProps) {
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [activeList, setActiveList] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const { currency } = useCurrency()

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    })

    const fetchActiveDetails = async () => {
        setIsLoading(true)
        setIsDetailOpen(true)
        try {
            const list = await getActiveStudents()
            setActiveList(list)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const cards = [
        {
            title: "Total Students",
            value: stats.totalStudents,
            subValue: `+${stats.newStudents} this period`,
            icon: Users,
            trend: stats.growth.students,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            action: null
        },
        {
            title: "Active Members",
            value: stats.activeStudents,
            subValue: "With active packages",
            icon: Users,
            trend: null,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            action: fetchActiveDetails
        },
        {
            title: "Revenue",
            value: currencyFormatter.format(stats.totalRevenue),
            subValue: "Completed payments",
            icon: DollarSign,
            trend: stats.growth.revenue,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            action: null
        },
        {
            title: "Outstanding",
            value: currencyFormatter.format(stats.totalOutstanding),
            subValue: "Pending payments",
            icon: AlertCircle,
            trend: null,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            action: null
        }
    ]

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <Card
                        key={i}
                        onClick={card.action || undefined}
                        className={`overflow-hidden border-primary/5 bg-card/50 backdrop-blur-sm relative group transition-all duration-300 ${card.action ? 'cursor-pointer hover:border-primary/40 hover:scale-[1.02]' : 'hover:border-primary/20'}`}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <card.icon size={48} className={card.color} />
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold font-display">{card.value}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        {card.subValue}
                                    </div>
                                </div>

                                {card.trend !== null && (
                                    <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${card.trend >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {card.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {Math.abs(Math.round(card.trend))}%
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display flex items-center gap-2">
                            <Users className="text-purple-500" />
                            Active Members ({stats.activeStudents})
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="py-12 flex justify-center items-center text-muted-foreground">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
                            Loading member list...
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="space-y-3 py-2">
                                {activeList.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-muted-foreground/10">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg">{student.name}</span>
                                            <span className="text-sm text-muted-foreground">Code: {student.studentCode || 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end max-w-[250px]">
                                            {student.studentPackages?.map((pkg: any) => (
                                                <Badge key={pkg.id} variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                                    {pkg.package.name} ({pkg.remainingCredits} cr)
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {activeList.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No active members found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
