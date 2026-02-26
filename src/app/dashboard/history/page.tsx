'use client'

import React, { useState, useEffect } from 'react'
import { getAuditLogs, getStaffMembers } from "@/actions/audit"
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, User, Calendar, Activity, Info, ChevronUp, ChevronDown, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/components/providers/currency-provider"

export default function HistoryPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [staff, setStaff] = useState<any[]>([])

    // Filter State
    const [adminId, setAdminId] = useState('all')
    const [action, setAction] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Sort State
    const [sortBy, setSortBy] = useState<'createdAt' | 'action'>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const { currency } = useCurrency()

    useEffect(() => {
        fetchStaff()
    }, [])

    useEffect(() => {
        fetchLogs()
    }, [adminId, action, startDate, endDate, sortBy, sortOrder])

    async function fetchStaff() {
        try {
            const data = await getStaffMembers()
            setStaff(data)
        } catch (e) {
            console.error("Failed to fetch staff", e)
        }
    }

    async function fetchLogs() {
        setLoading(true)
        try {
            const data = await getAuditLogs({
                adminId,
                action,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                sortBy,
                sortOrder
            })
            setLogs(data)
        } catch (error) {
            console.error("Failed to fetch logs", error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSort = (field: 'createdAt' | 'action') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    const clearFilters = () => {
        setAdminId('all')
        setAction('all')
        setStartDate('')
        setEndDate('')
    }

    const getSymbol = (code: string) => {
        switch (code) {
            case 'USD': return '$'
            case 'EUR': return '€'
            case 'GBP': return '£'
            case 'SGD': return 'S$'
            case 'MYR': default: return 'RM'
        }
    }
    const symbol = getSymbol(currency)

    const getActionInfo = (action: string) => {
        switch (action) {
            case 'BOOKING_CREATE':
                return { label: 'Created Booking', color: 'bg-green-100 text-green-800 border-green-200' }
            case 'BOOKING_CANCEL':
                return { label: 'Cancelled Booking', color: 'bg-destructive/10 text-destructive border-destructive/20' }
            case 'BOOKING_MOVE':
                return { label: 'Moved Booking', color: 'bg-blue-100 text-blue-800 border-blue-200' }
            case 'BOOKING_MODIFY':
                return { label: 'Modified Booking', color: 'bg-purple-100 text-purple-800 border-purple-200' }
            case 'PAYMENT_ADD':
                return { label: 'Payment Added', color: 'bg-amber-100 text-amber-800 border-amber-200' }
            case 'PAYMENT_UPDATE':
                return { label: 'Payment Updated', color: 'bg-orange-100 text-orange-800 border-orange-200' }
            case 'PAYMENT_DELETE':
                return { label: 'Payment Deleted', color: 'bg-red-100 text-red-800 border-red-200' }
            case 'USER_CREATE':
                return { label: 'Family Created', color: 'bg-sky-100 text-sky-800 border-sky-200' }
            case 'USER_UPDATE':
                return { label: 'Family Updated', color: 'bg-slate-100 text-slate-800 border-slate-200' }
            case 'STUDENT_CREATE':
                return { label: 'Student Added', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
            case 'STUDENT_DELETE':
                return { label: 'Student Removed', color: 'bg-red-100 text-red-800 border-red-200' }
            case 'USER_DELETE':
                return { label: 'Family Removed', color: 'bg-rose-100 text-rose-800 border-rose-200' }
            case 'ATTENDANCE_MARK':
                return { label: 'Marked Attendance', color: 'bg-teal-100 text-teal-800 border-teal-200' }
            default:
                return { label: action.replace(/_/g, ' '), color: 'bg-muted text-muted-foreground border-transparent' }
        }
    }

    const formatDetails = (details: string | null) => {
        if (!details) return null
        try {
            const parsed = JSON.parse(details)

            // Handle primitives or null that are technically valid JSON
            if (typeof parsed !== 'object' || parsed === null) {
                return String(parsed)
            }

            // Handle Array
            if (Array.isArray(parsed)) {
                return (
                    <div className="text-xs text-muted-foreground break-all">
                        {JSON.stringify(parsed)}
                    </div>
                )
            }

            // Check if this is a payment log to format amount
            const isPayment = parsed.amount !== undefined && parsed.amount !== null

            return (
                <div className="flex flex-col gap-1 items-end">
                    {isPayment && (
                        <span className="font-bold text-sm">
                            {symbol}{Number(parsed.amount).toFixed(2)}
                        </span>
                    )}
                    {parsed.package && (
                        <span className="text-xs text-muted-foreground">{parsed.package}</span>
                    )}
                    {parsed.summary && !isPayment && (
                        <span className="text-xs font-medium">{parsed.summary}</span>
                    )}

                    {/* Other details in small tag style */}
                    <div className="flex flex-wrap gap-1 justify-end mt-1">
                        {Object.entries(parsed).map(([key, value]: [string, any]) => {
                            if (key === 'amount' || key === 'package' || key === 'summary') return null
                            // Skip complex objects/arrays in tags to keep it clean, or stringify them
                            const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

                            return (
                                <span key={key} className="inline-flex items-center gap-1 bg-muted/50 px-1 rounded text-[9px]">
                                    <span className="opacity-50">{key}:</span>
                                    <span>{displayValue}</span>
                                </span>
                            )
                        })}
                    </div>
                </div>
            )
        } catch (e) {
            return (
                <span className="text-xs text-muted-foreground">{details}</span>
            )
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Audit History</h1>
                    <p className="text-muted-foreground">Track administrative actions and system changes.</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                    <History className="h-6 w-6 text-primary" />
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="border-primary/10 shadow-sm bg-muted/20">
                <CardContent className="pt-6 pb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                <User className="h-3 w-3" /> Coach / Admin
                            </label>
                            <Select value={adminId} onValueChange={setAdminId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {staff.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" /> Start Date
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                <Calendar className="h-3 w-3" /> End Date
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                                <Filter className="h-3 w-3" /> Action Type
                            </label>
                            <Select value={action} onValueChange={setAction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="BOOKING_CREATE">Booking Created</SelectItem>
                                    <SelectItem value="BOOKING_CANCEL">Booking Cancelled</SelectItem>
                                    <SelectItem value="PAYMENT_ADD">Payment Added</SelectItem>
                                    <SelectItem value="PAYMENT_DELETE">Payment Deleted</SelectItem>
                                    <SelectItem value="STUDENT_CREATE">Student Added</SelectItem>
                                    <SelectItem value="STUDENT_UPDATE">Student Updated</SelectItem>
                                    <SelectItem value="USER_UPDATE">Family Updated</SelectItem>
                                    <SelectItem value="ATTENDANCE_MARK">Attendance Marked</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(adminId !== 'all' || action !== 'all' || startDate || endDate) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-10 px-3 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4 mr-2" /> Reset
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Admin</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:text-foreground transition-colors group"
                                        onClick={() => toggleSort('action')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Action
                                            {sortBy === 'action' ? (
                                                sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead>Target Student</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:text-foreground transition-colors group"
                                        onClick={() => toggleSort('createdAt')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            {sortBy === 'createdAt' ? (
                                                sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                                            ) : (
                                                <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                            <Activity className="h-8 w-8 mx-auto mb-4 animate-spin opacity-20" />
                                            Loading history...
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                                            <div className="flex flex-col items-center">
                                                <History className="h-10 w-10 opacity-10 mb-4" />
                                                <p className="font-medium text-lg text-foreground/50">No matching logs</p>
                                                <p className="text-sm">Try adjusting your filters or clearing them.</p>
                                                <Button
                                                    variant="link"
                                                    onClick={clearFilters}
                                                    className="mt-2"
                                                >
                                                    Clear all filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{log.admin?.name || 'System'}</span>
                                                    <span className="text-[10px] text-muted-foreground">{log.admin?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const info = getActionInfo(log.action)
                                                    let detailSummary = ""
                                                    try {
                                                        const details = log.details ? JSON.parse(log.details) : null
                                                        if (details?.summary) detailSummary = ` (${details.summary})`
                                                    } catch (e) { }

                                                    return (
                                                        <div className="flex flex-col gap-1 items-start">
                                                            <Badge className={info.color}>
                                                                {info.label}
                                                            </Badge>
                                                            {detailSummary && (
                                                                <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                                                                    {detailSummary}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {(log.student || log.studentName) ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-3.5 w-3.5 text-primary" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{log.studentName || log.student?.name}</span>
                                                            {log.studentId && (
                                                                <span className="text-[10px] text-muted-foreground font-mono">ID: {log.studentId.substring(0, 8)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-[10px] italic">No Target Student</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">
                                                    {log.entityType}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{format(new Date(log.createdAt), 'MMM d, yyyy')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{format(new Date(log.createdAt), 'HH:mm')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    {log.details ? formatDetails(log.details) : '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
