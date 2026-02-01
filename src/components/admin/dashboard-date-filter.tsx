'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Calendar as CalendarIcon,
    ChevronDown,
    History,
    CalendarRange,
    Clock,
    Search
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

const RANGES = [
    { label: 'Today', value: 'today', icon: Clock },
    { label: 'Last 7 Days', value: '7d', icon: CalendarIcon },
    { label: 'Last 30 Days', value: '30d', icon: History },
    { label: 'This Month', value: 'month', icon: CalendarRange },
    { label: 'Custom Range', value: 'custom', icon: CalendarIcon },
]

export default function DashboardDateFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentRange = searchParams.get('range') || 'month'
    const activeRange = RANGES.find(r => r.value === currentRange) || RANGES[3]

    const [fromDate, setFromDate] = useState(searchParams.get('from') || "")
    const [toDate, setToDate] = useState(searchParams.get('to') || "")

    const setRange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', value)
        if (value !== 'custom') {
            params.delete('from')
            params.delete('to')
        }
        router.push(`/dashboard?${params.toString()}`)
    }

    const applyCustomRange = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', 'custom')
        params.set('from', fromDate)
        params.set('to', toDate)
        router.push(`/dashboard?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline-block">Time Period:</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 px-4 gap-2 bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all font-semibold">
                            <activeRange.icon className="h-4 w-4 text-primary" />
                            {activeRange.label}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md">
                        {RANGES.map((range) => (
                            <DropdownMenuItem
                                key={range.value}
                                onClick={() => setRange(range.value)}
                                className="gap-2 cursor-pointer py-2.5"
                            >
                                <range.icon className={`h-4 w-4 ${currentRange === range.value ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={currentRange === range.value ? 'font-bold' : ''}>{range.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {currentRange === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-10 w-40 bg-card/50"
                    />
                    <span className="text-muted-foreground text-xs uppercase font-bold">to</span>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-10 w-40 bg-card/50"
                    />
                    <Button size="icon" onClick={applyCustomRange} className="shrink-0 h-10 w-10">
                        <Search size={16} />
                    </Button>
                </div>
            )}
        </div>
    )
}
