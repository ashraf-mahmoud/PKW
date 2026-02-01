'use client'

import React, { useState, useMemo } from 'react'
import { format, isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns"
import { Search, Filter, X, Calendar, DollarSign, User, Receipt, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import PaymentRowActions from "./payment-row-actions"
import PaymentDialog from "./payment-dialog"
import { useCurrency } from "@/components/providers/currency-provider"

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'lastMonth' | 'custom'

export default function PaymentsTable({ initialPayments, packages }: { initialPayments: any[], packages: any[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')
    const [methodFilter, setMethodFilter] = useState<string>('all')
    const [customRange, setCustomRange] = useState({ start: '', end: '' })
    const [selectedPayment, setSelectedPayment] = useState<any>(null)
    const { currency } = useCurrency()

    const getSymbol = (code: string) => {
        switch (code) {
            case 'USD': return '$'
            case 'EUR': return '€'
            case 'GBP': return '£'
            case 'SGD': return 'S$'
            case 'MYR': default: return 'RM '
        }
    }
    const symbol = getSymbol(currency)

    const methods = useMemo(() => {
        const unique = new Set(initialPayments.map(p => p.method))
        return Array.from(unique)
    }, [initialPayments])

    const filteredPayments = useMemo(() => {
        return initialPayments.filter(p => {
            const paymentDate = new Date(p.date)

            // Search
            const search = searchTerm.toLowerCase()
            const matchesSearch =
                p.student.name.toLowerCase().includes(search) ||
                (p.student.parent?.name && p.student.parent.name.toLowerCase().includes(search)) ||
                (p.reference && p.reference.toLowerCase().includes(search)) ||
                (p.package?.name && p.package.name.toLowerCase().includes(search))

            // Method Filter
            const matchesMethod = methodFilter === 'all' || p.method === methodFilter

            // Date Filter
            let matchesDate = true
            const now = new Date()

            switch (dateFilter) {
                case 'today':
                    matchesDate = isWithinInterval(paymentDate, { start: startOfDay(now), end: endOfDay(now) })
                    break
                case 'week':
                    matchesDate = isWithinInterval(paymentDate, { start: startOfWeek(now), end: endOfWeek(now) })
                    break
                case 'month':
                    matchesDate = isWithinInterval(paymentDate, { start: startOfMonth(now), end: endOfMonth(now) })
                    break
                case 'lastMonth':
                    const lastMonth = subMonths(now, 1)
                    matchesDate = isWithinInterval(paymentDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) })
                    break
                case 'custom':
                    if (customRange.start && customRange.end) {
                        matchesDate = isWithinInterval(paymentDate, {
                            start: startOfDay(new Date(customRange.start)),
                            end: endOfDay(new Date(customRange.end))
                        })
                    }
                    break
            }

            return matchesSearch && matchesMethod && matchesDate
        })
    }, [initialPayments, searchTerm, dateFilter, methodFilter, customRange])

    const stats = useMemo(() => {
        const total = filteredPayments.reduce((acc, p) => acc + Number(p.amount), 0)
        const count = filteredPayments.length
        const withInvoice = filteredPayments.filter(p => p.invoiceUrl).length
        return { total, count, withInvoice }
    }, [filteredPayments])

    const activeDateRangeText = useMemo(() => {
        const now = new Date()
        let start: Date | null = null
        let end: Date | null = null

        switch (dateFilter) {
            case 'today':
                start = startOfDay(now); end = endOfDay(now)
                break
            case 'week':
                start = startOfWeek(now); end = endOfWeek(now)
                break
            case 'month':
                start = startOfMonth(now); end = endOfMonth(now)
                break
            case 'lastMonth':
                const lm = subMonths(now, 1)
                start = startOfMonth(lm); end = endOfMonth(lm)
                break
            case 'custom':
                if (customRange.start && customRange.end) {
                    start = new Date(customRange.start); end = new Date(customRange.end)
                }
                break
        }

        if (start && end) {
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
        }
        return 'All Time Record'
    }, [dateFilter, customRange])

    const clearFilters = () => {
        setSearchTerm('')
        setDateFilter('all')
        setMethodFilter('all')
        setCustomRange({ start: '', end: '' })
    }

    return (
        <div className="space-y-6">
            {/* Stats Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-xl border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Filter Revenue</div>
                            <div className="text-2xl font-bold font-display text-primary leading-none mb-1">
                                {symbol} {stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded inline-block">
                                {activeDateRangeText}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Filtered Transactions</div>
                            <div className="text-2xl font-bold font-display leading-none mb-1">
                                {stats.count}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded inline-block">
                                {activeDateRangeText}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Invoices in Range</div>
                            <div className="text-2xl font-bold font-display leading-none mb-1">
                                {stats.withInvoice}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded inline-block">
                                {activeDateRangeText}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students, parents, references..."
                            className="pl-9 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 h-10 min-w-[140px]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {dateFilter === 'all' ? 'All Time' :
                                                dateFilter === 'today' ? 'Today' :
                                                    dateFilter === 'week' ? 'This Week' :
                                                        dateFilter === 'month' ? 'This Month' :
                                                            dateFilter === 'lastMonth' ? 'Last Month' : 'Custom'}
                                        </span>
                                    </div>
                                    {dateFilter !== 'all' && (
                                        <span className="text-xs text-muted-foreground ml-2 border-l pl-2 hidden sm:inline-block">
                                            {activeDateRangeText}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                                    <DropdownMenuRadioItem value="all">All Time</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="week">This Week</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="month">This Month</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="lastMonth">Last Month</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="custom">Custom Range</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2 h-10 min-w-[120px]">
                                    <Filter className="h-4 w-4" />
                                    {methodFilter === 'all' ? 'Method' : methodFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Payment Method</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={methodFilter} onValueChange={setMethodFilter}>
                                    <DropdownMenuRadioItem value="all">All Methods</DropdownMenuRadioItem>
                                    {methods.map(m => (
                                        <DropdownMenuRadioItem key={m} value={m} className="capitalize">{m}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(searchTerm || dateFilter !== 'all' || methodFilter !== 'all') && (
                            <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {dateFilter === 'custom' && (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-1 gap-2 items-center">
                            <Label className="text-xs font-bold uppercase shrink-0">Start</Label>
                            <Input
                                type="date"
                                className="h-8 text-xs"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                        <div className="flex flex-1 gap-2 items-center">
                            <Label className="text-xs font-bold uppercase shrink-0">End</Label>
                            <Input
                                type="date"
                                className="h-8 text-xs"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium select-none">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Student / Parent</th>
                                <th className="px-4 py-3">Package</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3">Invoice / Ref</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-xs sm:text-sm">
                            {filteredPayments.map((p: any) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedPayment(p)}
                                >
                                    <td className="px-4 py-3 text-muted-foreground font-medium">
                                        {format(new Date(p.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold group-hover:text-primary transition-colors">{p.student.name}</div>
                                        <div className="text-[10px] text-muted-foreground">via {p.student.parent?.name || "Self"}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-xs">{p.package?.name || "Custom/Manual"}</div>
                                        {p.package && <div className="text-[10px] text-muted-foreground italic">{p.package.creditCount} credits</div>}
                                    </td>

                                    <td className={`px-4 py-3 text-right font-black ${p.status === 'PENDING' ? 'text-destructive' : 'text-primary'}`}>
                                        {symbol} {Number(p.amount).toFixed(2)}
                                        {p.status === 'PENDING' && (
                                            <div className="text-[10px] font-bold uppercase tracking-tighter">Outstanding</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant="outline"
                                            className={`capitalize font-bold text-[10px] ${p.status === 'PENDING'
                                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                : 'bg-muted/50'
                                                }`}
                                        >
                                            {p.status === 'PENDING' ? 'Pending' : p.method}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {p.invoiceUrl ? (
                                            <div className="flex items-center gap-2 text-primary font-bold">
                                                <FileText size={14} />
                                                <span className="text-[10px] underline decoration-dotted">{p.invoiceUrl.split('/').pop()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-[10px]">No Invoice</span>
                                        )}
                                        {p.reference && (
                                            <div className="text-[10px] text-muted-foreground mt-0.5 opacity-70">
                                                Ref: {p.reference}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <PaymentRowActions payment={p} packages={packages} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayments.length === 0 && (
                    <div className="px-4 py-20 text-center flex flex-col items-center gap-2 bg-muted/10">
                        <div className="p-4 bg-muted rounded-full">
                            <Search size={32} className="text-muted-foreground opacity-20" />
                        </div>
                        <p className="font-bold text-muted-foreground">No payments found</p>
                        <p className="text-xs text-muted-foreground max-w-[200px]">Try adjusting your search criteria or date range.</p>
                        <Button variant="link" size="sm" onClick={clearFilters} className="mt-2">Clear all filters</Button>
                    </div>
                )}
            </div>

            {selectedPayment && (
                <PaymentDialog
                    key={selectedPayment.id} // Force re-render on new payment
                    user={selectedPayment.student.parent || { students: [selectedPayment.student] }} // Mock user/parent structure if missing
                    packages={packages}
                    payment={selectedPayment}
                    open={!!selectedPayment}
                    onOpenChange={(open) => !open && setSelectedPayment(null)}
                />
            )}
        </div>
    )
}
