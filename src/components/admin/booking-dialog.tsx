'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Loader2, Package as PackageIcon, Info, AlertCircle, XCircle, MoveHorizontal, Trash2 } from "lucide-react"
import { bookClass, getBatchRecurringSessionsUntilMonthEnd, getMultiRecurringSessions, getRecurringSessions, getRecurringSessionsUntilMonthEnd, getStudentFutureBookings, modifyBooking } from "@/actions/booking"
import { cancelBooking, deleteBooking, deleteGroupBookings } from "@/actions/admin-booking"
import { getStudentPackages } from "@/actions/student-package"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { format, differenceInYears } from 'date-fns'
import WeeklyCalendar from '../booking/weekly-calendar'
import TimetableFilters from '../booking/timetable-filters'
import { getLocations, getCoaches, getUpcomingSessions } from "@/actions/classes"
import { getClassTypes } from "@/actions/class-types"
import { getAgeGroups } from "@/actions/age-groups"
import { getPackages } from "@/actions/packages"
import { useCurrency } from "@/components/providers/currency-provider"
import { getStudent } from "@/actions/users"
import { Badge } from '../ui/badge'
import MoveBookingDialog from './move-booking-dialog'

interface BookingDialogProps {
    user: any
    student?: any
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    initialStudentId?: string
    initialLocationId?: string
    futureBookings?: any[]
    triggerButton?: {
        text?: string
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
        className?: string
    }
}

export default function BookingDialog({
    user,
    student: initialStudent,
    isOpen: controlledOpen,
    onOpenChange: setControlledOpen,
    initialStudentId,
    initialLocationId,
    futureBookings: initialFutureBookings,
    triggerButton
}: BookingDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen

    const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || initialStudent?.id || '')
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [studentPackages, setStudentPackages] = useState<any[]>([])
    const [allStudentPackages, setAllStudentPackages] = useState<any[]>([])
    const [futureBookings, setFutureBookings] = useState<any[]>((initialFutureBookings || []).filter((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING'))
    const [showModifyConfirm, setShowModifyConfirm] = useState(false)
    const [showCreditWarning, setShowCreditWarning] = useState(false)
    const [showExpiryWarning, setShowExpiryWarning] = useState(false)
    const [pendingOutstanding, setPendingOutstanding] = useState(false)
    const [selectedPackageId, setSelectedPackageId] = useState<string>('')
    const [allPackages, setAllPackages] = useState<any[]>([])
    const [fullStudent, setFullStudent] = useState<any>(null)

    // Enrollment Mode State
    const [enrollmentMode, setEnrollmentMode] = useState<'recurring' | 'manual' | 'mixed'>('recurring')
    const [selectedSessions, setSelectedSessions] = useState<any[]>([]) // Manual selections
    const [recurringSessions, setRecurringSessions] = useState<any[]>([]) // Base sessions for recurrence
    const [resolvedSessions, setResolvedSessions] = useState<any[]>([]) // The full list of calculated sessions
    const [excludedSessionIds, setExcludedSessionIds] = useState<string[]>([])
    const { toast } = useToast()
    const router = useRouter()

    // Individual action states
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
    const [bookingToMove, setBookingToMove] = useState<any>(null)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<any>(null)
    const { currency } = useCurrency()

    // Helper (need to centralize this eventually)
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

    // Timetable States
    const [filters, setFilters] = useState<any>({
        locationId: initialLocationId || 'all',
        type: 'all',
        coachId: 'all',
        level: 'all',
        ageGroupId: 'all'
    })
    const [weekOffset, setWeekOffset] = useState(0)
    const [locations, setLocations] = useState<any[]>([])
    const [coaches, setCoaches] = useState<any[]>([])
    const [ageGroups, setAgeGroups] = useState<any[]>([])
    const [types, setTypes] = useState<any[]>([])
    const fetchInProgress = React.useRef(false)

    const students = user.students || []
    const currentStudent = fullStudent || students.find((s: any) => s.id === selectedStudentId) || initialStudent
    const hasFutureBookings = futureBookings.length > 0
    // isModifyMode determines if we show the "Current Schedule" list and if default action is Modify
    const isModifyMode = hasFutureBookings
    const totalCredits = studentPackages.reduce((sum, p) => sum + p.remainingCredits, 0)
    const needsOverride = totalCredits === 0 && selectedPackageId === 'trial' && !isModifyMode

    const getDisplayPrice = () => {
        let price = selectedSession?.template?.price || 0
        if (selectedPackageId && selectedPackageId !== 'trial') {
            const pkg = allPackages.find(p => p.id === selectedPackageId)
            if (pkg && currentStudent?.dob) {
                const age = differenceInYears(new Date(), new Date(currentStudent.dob))
                const agePrice = pkg.prices.find((p: any) =>
                    p.ageGroup.minAge <= age && p.ageGroup.maxAge >= age
                )
                if (agePrice) {
                    price = Number(agePrice.price)
                }
            }
        }
        return price
    }

    const currentPrice = getDisplayPrice()

    useEffect(() => {
        if (initialStudentId) {
            setSelectedStudentId(initialStudentId)
        }
    }, [initialStudentId])

    useEffect(() => {
        if (initialFutureBookings) {
            setFutureBookings(initialFutureBookings)
        }
    }, [initialFutureBookings])

    // Keep mode in sync with bookings for internal updates

    useEffect(() => {
        if (isOpen) {
            loadInitialData().then((loadedPackages) => {
                if (currentStudent) {
                    Promise.all([
                        fetchStudentPackages(currentStudent.id, loadedPackages),
                        fetchStudentFutureBookings(currentStudent.id)
                    ])
                }
            })

            // Ensure selection starts empty on open
            setSelectedSessions([])
            setExcludedSessionIds([])
            setRecurringSessions([])
        }
    }, [isOpen])

    useEffect(() => {
        if (selectedStudentId) {
            const s = students.find((st: any) => st.id === selectedStudentId) || initialStudent
            if (s) {
                // If we have minimal student data (no dob), fetch the full record
                if (!s.dob) {
                    getStudent(s.id).then(full => {
                        if (full) {
                            setFullStudent(full)
                            if (ageGroups.length > 0) applySmartFilters(full, ageGroups)
                        }
                    })
                } else {
                    setFullStudent(null) // Reset full student if we have dob in the basic list
                    if (ageGroups.length > 0) applySmartFilters(s, ageGroups)
                }

                fetchStudentPackages(s.id)
                fetchStudentFutureBookings(s.id)
            }
        }
    }, [selectedStudentId, ageGroups.length])

    useEffect(() => {
        if (isOpen) {
            fetchSessions()
        }
    }, [filters, weekOffset, isOpen])

    // Derived: Calculate all sessions to be booked based on mode
    useEffect(() => {
        const updateResolved = async () => {
            if (!currentStudent || !selectedPackageId) return

            const pkg = allStudentPackages.find(p => p.id === selectedPackageId) ||
                allStudentPackages.find(p => p.packageId === selectedPackageId) ||
                allPackages.find(p => p.id === selectedPackageId)

            const totalCredits = pkg?.remainingCredits || pkg?.creditCount || pkg?.package?.creditCount || 1

            let baseList: any[] = []

            // 1. Process Recurring (End of Month)
            if (recurringSessions.length > 0) {
                const chains = await getBatchRecurringSessionsUntilMonthEnd(recurringSessions.map(s => s.id))
                // Since it returns a flat sorted list, we can just use it
                baseList = chains
            }

            // 2. Process Manual
            selectedSessions.forEach(s => {
                if (!baseList.find(x => x.id === s.id)) baseList.push(s)
            })

            // 3. Apply Exclusions
            let filtered = baseList.filter(s => !excludedSessionIds.includes(s.id))

            // 4. Sort by time
            filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

            // 5. Cap by total credits
            setResolvedSessions(filtered.slice(0, totalCredits))
        }
        updateResolved()
    }, [enrollmentMode, selectedSessions, recurringSessions, excludedSessionIds, selectedPackageId, currentStudent, allStudentPackages])

    async function loadInitialData() {
        const [locs, coas, groups, pkgs, typList] = await Promise.all([
            getLocations(),
            getCoaches(),
            getAgeGroups(),
            getPackages(),
            getClassTypes()
        ])
        setLocations(locs)
        setCoaches(coas)
        setAgeGroups(groups)
        setAllPackages(pkgs)
        setTypes(typList)

        // applySmartFilters will handle the initial student sync via useEffect
        return pkgs
    }

    async function fetchStudentPackages(sId: string, availablePackages?: any[]) {
        try {
            const pkgs = await getStudentPackages(sId, true)
            setAllStudentPackages(pkgs)
            const active = pkgs.filter((p: any) => p.remainingCredits > 0)
            setStudentPackages(active)

            if (active.length > 0) {
                // Find most suitable package (most credits or just first one)
                const bestPkg = active.sort((a: any, b: any) => b.remainingCredits - a.remainingCredits)[0]
                setSelectedPackageId(bestPkg.id)
            } else {
                // If ample packages available, pick first one, otherwise trial
                const packagesToChoose = availablePackages || allPackages
                if (packagesToChoose && packagesToChoose.length > 0) {
                    setSelectedPackageId(packagesToChoose[0].id)
                } else {
                    setSelectedPackageId('trial')
                }
            }
        } catch (error) {
            console.error("Failed to fetch packages", error)
        }
    }

    async function fetchStudentFutureBookings(sId: string) {
        try {
            const data = await getStudentFutureBookings(sId)
            setFutureBookings(data)

            // If no initial location, infer from existing bookings
            if (!initialLocationId && data.length > 0) {
                const locCounts: Record<string, number> = {}
                data.forEach((b: any) => {
                    const locId = b.classSession?.locationId
                    if (locId) locCounts[locId] = (locCounts[locId] || 0) + 1
                })
                const mostFrequentLoc = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0][0]
                if (mostFrequentLoc) {
                    setFilters((prev: any) => ({ ...prev, locationId: mostFrequentLoc }))
                }
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error)
        }
    }

    function applySmartFilters(student: any, ageGroups: any[]) {
        if (!student) return
        let age = NaN
        try {
            age = differenceInYears(new Date(), new Date(student.dob))
        } catch (e) { }

        const matchingGroup = !isNaN(age) ? ageGroups.find(g => age >= g.minAge && age <= g.maxAge) : null

        const newFilters: any = {
            locationId: initialLocationId || filters.locationId || 'all',
            type: 'all',
            coachId: 'all',
            level: student.level?.toString() || 'all',
            ageGroupId: matchingGroup?.id || 'all'
        }

        setFilters(newFilters)
    }

    async function fetchSessions() {
        if (fetchInProgress.current) return
        fetchInProgress.current = true
        setFetching(true)
        try {
            const data = await getUpcomingSessions({ ...filters, week: weekOffset })
            setSessions(data)
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch classes", variant: "destructive" })
        } finally {
            setFetching(false)
            fetchInProgress.current = false
        }
    }

    const toggleSessionSelection = (session: any) => {
        // If already resolved (highlighted), try to remove it
        const isResolved = resolvedSessions.some(s => s.id === session.id)

        if (isResolved) {
            // Remove from manual if there
            if (selectedSessions.find(s => s.id === session.id)) {
                setSelectedSessions(selectedSessions.filter(s => s.id !== session.id))
            }
            // Remove from recurring chain base if there
            else if (recurringSessions.find(s => s.id === session.id)) {
                setRecurringSessions(recurringSessions.filter(s => s.id !== session.id))
            }
            // Otherwise it's an instance of a recurring chain, add to exclusions
            else {
                setExcludedSessionIds([...excludedSessionIds, session.id])
            }

            if (selectedSession?.id === session.id) {
                setSelectedSession(null)
            }
            return
        }

        // Addition logic
        const pkg = allStudentPackages.find(p => p.id === selectedPackageId) ||
            allStudentPackages.find(p => p.packageId === selectedPackageId) ||
            allPackages.find(p => p.id === selectedPackageId)

        const totalCredits = pkg?.remainingCredits || pkg?.creditCount || pkg?.package?.creditCount || 1

        if (resolvedSessions.length >= totalCredits) {
            toast({
                title: "Credit Limit Reached",
                description: "You have selected all classes, unselect classes to pick new ones.",
                variant: "destructive"
            })
            return
        }

        // Check for duplicate enrollment (if student is already booked)
        const isAlreadyBooked = futureBookings.some(b => b.classSessionId === session.id && b.status === "CONFIRMED")
        if (isAlreadyBooked) {
            toast({
                title: "Already Enrolled",
                description: "This student is already registered for this class session.",
                variant: "destructive"
            })
            return
        }

        setSelectedSession(session)

        if (enrollmentMode === 'recurring') {
            setRecurringSessions([...recurringSessions, session])
            // If it was excluded before, remove from exclusions
            if (excludedSessionIds.includes(session.id)) {
                setExcludedSessionIds(excludedSessionIds.filter(id => id !== session.id))
            }
        } else {
            setSelectedSessions([...selectedSessions, session])
            // If it was excluded before, remove from exclusions
            if (excludedSessionIds.includes(session.id)) {
                setExcludedSessionIds(excludedSessionIds.filter(id => id !== session.id))
            }
        }
    }

    async function handleBook(allowOutstanding = false, forceExpiry = false, forceSingle = false) {
        if (!selectedStudentId || resolvedSessions.length === 0) {
            if (forceSingle && selectedSession) {
                // Fallback for single book
            } else {
                return toast({ title: "Selection Missing", description: "Please select your class session(s).", variant: "destructive" })
            }
        }

        setLoading(true)
        setPendingOutstanding(allowOutstanding)

        let sessionIds = resolvedSessions.map(s => s.id)
        if (forceSingle && selectedSession) sessionIds = [selectedSession.id]

        const shouldModify = isModifyMode && !forceSingle

        const res = shouldModify
            ? await modifyBooking(sessionIds, selectedStudentId, {
                forceByAdmin: true,
                packageId: selectedPackageId === 'trial' ? undefined : selectedPackageId,
                allowOutstanding,
                forceExpiry
            })
            : await bookClass(sessionIds, selectedStudentId, {
                forceByAdmin: true,
                packageId: selectedPackageId === 'trial' ? undefined : selectedPackageId,
                allowOutstanding,
                forceExpiry
            })

        setLoading(false)

        if (res.success) {
            toast({
                title: isModifyMode ? "Enrollment Updated" : "Registration Successful",
                description: `Successfully booked ${sessionIds.length} class(es).`,
            })

            // Reset state
            setSelectedSessions([])
            setRecurringSessions([])
            setResolvedSessions([])
            setExcludedSessionIds([])
            setSelectedSession(null)

            setIsOpen(false)
            setShowCreditWarning(false)
            setShowExpiryWarning(false)

            router.refresh()
            fetchSessions()
            if (selectedStudentId) fetchStudentPackages(selectedStudentId)
        } else {
            if (res.error === "INSUFFICIENT_CREDITS") {
                setShowCreditWarning(true)
            } else if (res.error === "EXPIRY_WARNING") {
                setShowExpiryWarning(true)
            } else {
                toast({ title: "Operation Failed", description: res.error, variant: "destructive" })
            }
        }
    }

    const confirmCancel = async () => {
        if (!bookingToCancel) return

        setLoading(true)
        const res = await cancelBooking(bookingToCancel.id)
        setLoading(false)
        setIsCancelDialogOpen(false)

        if (res.success) {
            toast({ title: "Booking Cancelled", description: "The booking has been successfully cancelled." })
            if (currentStudent) {
                fetchStudentFutureBookings(currentStudent.id)
                fetchStudentPackages(currentStudent.id)
            }
            router.refresh()
            // Refresh sessions to show updated spots
            fetchSessions()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const handleMoveClose = (open: boolean) => {
        setIsMoveDialogOpen(open)
        if (!open && currentStudent) {
            fetchStudentFutureBookings(currentStudent.id)
            fetchStudentPackages(currentStudent.id)
            router.refresh()
        }
    }


    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {controlledOpen === undefined && (
                    <DialogTrigger asChild>
                        <Button
                            variant={triggerButton?.variant || "outline"}
                            size="sm"
                            className={`gap-2 ${triggerButton?.className || ""}`}
                        >
                            <Calendar className="h-4 w-4" />
                            {triggerButton?.text || (isModifyMode ? "Modify Enrollment" : "Book Class")}
                        </Button>
                    </DialogTrigger>
                )}
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-display">
                            {isModifyMode ? 'Modify Enrollment' : 'New Enrollment'}: {currentStudent?.name || user.name}
                            <div className="flex items-center gap-2 ml-auto pr-8">
                                <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold ${totalCredits > 0 ? 'bg-primary/5 text-primary border-primary/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {totalCredits} Credits Available
                                </Badge>
                                {isModifyMode && (
                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                        <AlertCircle className="h-3 w-3 mr-1" /> Active Schedule
                                    </Badge>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Left Panel: Context & Packages */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Student Context Section */}
                                <div className="bg-muted/30 p-4 rounded-2xl space-y-3 border border-primary/5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">Student Meta</Label>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold h-5 uppercase">Lvl {currentStudent?.level}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 space-y-1">
                                            <div className="text-xs font-bold text-foreground">
                                                {currentStudent?.dob ? `${differenceInYears(new Date(), new Date(currentStudent.dob))} Years Old` : 'Age Unknown'}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-medium">
                                                DOB: {currentStudent?.dob ? format(new Date(currentStudent.dob), 'MMM d, yyyy') : 'Not Set'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credit Breakdown */}
                                    <div className="pt-3 mt-1 border-t border-primary/10 grid grid-cols-2 gap-y-3 gap-x-2">
                                        <div>
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total Credits</div>
                                            <div className="text-sm font-black text-foreground">
                                                {allStudentPackages.reduce((sum, p) => sum + (p.package?.creditCount || 0), 0)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Used Credits</div>
                                            <div className="text-sm font-black text-foreground">
                                                {allStudentPackages.reduce((sum, p) => sum + (p.package?.creditCount || 0), 0) - totalCredits}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Credit Expiry</div>
                                            <div className={`text-xs font-bold ${studentPackages.length > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                                {studentPackages.length > 0
                                                    ? format(new Date(studentPackages.sort((a, b) => new Date(a.validUntil || a.expiryDate).getTime() - new Date(b.validUntil || b.expiryDate).getTime())[0]?.validUntil || new Date()), 'MMM d, yyyy')
                                                    : 'No Active Packages'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {totalCredits === 0 && selectedPackageId === 'trial' && !isModifyMode && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex gap-2 text-xs text-amber-700 font-bold leading-tight">
                                            <AlertCircle size={16} className="shrink-0" />
                                            <span>No Credits Available</span>
                                        </div>
                                        <p className="text-[10px] text-amber-600/80 leading-relaxed">
                                            Booking will create an <strong>outstanding payment</strong> of <strong>{symbol}{currentPrice}</strong>.
                                        </p>
                                    </div>
                                )}

                                {/* Unpurchased Package Details */}
                                {selectedPackageId !== 'trial' && !studentPackages.some(p => p.id === selectedPackageId || p.packageId === selectedPackageId) && (
                                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-primary">New Package Purchase</Label>
                                            <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-bold h-5 capitalize">{allPackages.find(p => p.id === selectedPackageId)?.type.toLowerCase().replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <div className="text-sm font-bold truncate max-w-[120px]">
                                                    {allPackages.find(p => p.id === selectedPackageId)?.name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-medium">
                                                    Total: {allPackages.find(p => p.id === selectedPackageId)?.creditCount} Credits
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground font-medium mb-0.5 leading-none">Amount Due</div>
                                                <div className="text-xl font-black text-primary leading-none">{symbol}{currentPrice}</div>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground italic leading-tight pt-1 border-t border-primary/10">
                                            A "COMPLETED" payment and "ACTIVE" package will be recorded.
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Student</Label>
                                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                            <SelectTrigger className="h-10 bg-muted/30 border-primary/10">
                                                <SelectValue placeholder="Select Student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id} className="font-medium">{s.name} (Lvl {s.level})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available Packages</Label>
                                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${totalCredits > 0 ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600'}`}>
                                                {totalCredits} Credits Available
                                            </span>
                                        </div>
                                        <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                                            <SelectTrigger className="h-12 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Already Purchased Packages */}
                                                {studentPackages.length > 0 && (
                                                    <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase bg-muted/30">Purchased</div>
                                                )}
                                                {studentPackages.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id} className="flex flex-col items-start py-2">
                                                        <div className="font-bold">{p.package.name}</div>
                                                        <div className="text-[10px] text-primary">{p.remainingCredits} credits left</div>
                                                    </SelectItem>
                                                ))}

                                                {/* Available Packages (New Purchase) */}
                                                {(() => {
                                                    const age = currentStudent?.dob ? differenceInYears(new Date(), new Date(currentStudent.dob)) : null
                                                    // Strict filtering: If no DOB, hide all age-restricted packages
                                                    if (age === null) {
                                                        return (
                                                            <div className="p-4 text-center text-xs text-muted-foreground bg-muted/30 rounded-lg border border-dashed my-2">
                                                                Set Student DOB to view packages.
                                                            </div>
                                                        )
                                                    }

                                                    const validPkgs = allPackages.filter(pkg => {
                                                        // Hide if student already has an active instance of this package to avoid confusion
                                                        if (studentPackages.some(sp => sp.packageId === pkg.id)) return false

                                                        // Check if package has a price for this age (strict)
                                                        return pkg.prices.some((p: any) => p.ageGroup.minAge <= age && p.ageGroup.maxAge >= age)
                                                    })

                                                    if (validPkgs.length === 0) return null

                                                    return (
                                                        <>
                                                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase bg-muted/30">Available Packages</div>
                                                            {validPkgs.map((pkg: any) => (
                                                                <SelectItem key={pkg.id} value={pkg.id} className="flex flex-col items-start py-2">
                                                                    <div className="font-bold">{pkg.name}</div>
                                                                    <div className="text-[10px] text-amber-600 font-medium">0 credits left</div>
                                                                    <div className="text-[9px] text-muted-foreground">{pkg.creditCount} Credits • {pkg.type}</div>
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    )
                                                })()}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Package Info Cards - Hide when modifying to reduce clutter */}
                                {!isModifyMode && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
                                            <PackageIcon size={12} className="text-primary" />
                                            Active Packages
                                        </h4>
                                        <div className="space-y-2">
                                            {studentPackages.length === 0 ? (
                                                <div className="p-6 bg-muted/20 rounded-2xl text-xs text-muted-foreground italic border border-dashed text-center">
                                                    No active packages found.
                                                </div>
                                            ) : (
                                                studentPackages.map((p: any) => (
                                                    <div key={p.id} className={`p-3 rounded-xl border transition-all ${selectedPackageId === p.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border'}`}>
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-bold text-sm block">{p.package.name}</span>
                                                            <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none font-bold whitespace-nowrap">{p.remainingCredits} / {p.package.creditCount} Left</Badge>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={10} />
                                                                Exp: {p.expiryDate ? format(new Date(p.expiryDate), 'MMM d, yyyy') : 'No expiry'}
                                                            </div>
                                                            <Badge variant="outline" className="text-[9px] h-3 bg-muted/50 py-0 font-normal uppercase tracking-tighter opacity-70 mb-[1px]">{p.package.type}</Badge>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {futureBookings.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center justify-between px-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                Active Schedule ({futureBookings.length})
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 text-[9px] uppercase p-0 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                disabled={loading}
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to DELETE the entire current schedule? This will remove all future and today's confirmed bookings and cannot be undone.")) {
                                                        setLoading(true)
                                                        const res = await deleteGroupBookings(selectedStudentId)
                                                        setLoading(false)
                                                        if (res.success) {
                                                            toast({ title: "Schedule Deleted", description: "All relevant bookings have been removed." })
                                                            fetchStudentFutureBookings(selectedStudentId)
                                                            fetchStudentPackages(selectedStudentId)
                                                            fetchSessions()
                                                            router.refresh()
                                                        } else {
                                                            toast({ title: "Error", description: res.error, variant: "destructive" })
                                                        }
                                                    }
                                                }}
                                            >
                                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete Entire Schedule"}
                                            </Button>
                                        </h4>
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                            {futureBookings.map((b) => {
                                                const isToday = new Date(b.classSession?.startTime).toDateString() === new Date().toDateString();
                                                const isPast = new Date(b.classSession?.startTime) < new Date();

                                                return (
                                                    <div key={b.id} className={`group/item p-3 ${isToday ? 'bg-amber-100/50 border-amber-300' : 'bg-amber-50/50 border-amber-100'} dark:bg-amber-900/10 rounded-xl border transition-colors`}>
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="truncate font-bold text-xs text-amber-950 dark:text-amber-200">{b.classSession?.template?.name || 'Class'}</div>
                                                                    {isToday && (
                                                                        <Badge className={`text-[8px] h-3 px-1 border-none ${isPast ? 'bg-amber-200 text-amber-700' : 'bg-primary text-primary-foreground'}`}>
                                                                            {isPast ? 'Happened' : 'Today'}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-amber-700/70 dark:text-amber-400 mt-0.5">
                                                                    {b.classSession?.startTime ? format(new Date(b.classSession.startTime), 'EEE, MMM d @ h:mm a') : '-'}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 shrink-0">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-amber-600 hover:bg-amber-200 hover:text-amber-800"
                                                                    title="Move Class Session"
                                                                    onClick={() => {
                                                                        const booking = b.student ? b : { ...b, student: currentStudent }
                                                                        setBookingToMove(booking)
                                                                        setIsMoveDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <MoveHorizontal size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-red-400 hover:bg-red-100 hover:text-red-600"
                                                                    title="Cancel Session"
                                                                    onClick={() => {
                                                                        const booking = b.student ? b : { ...b, student: currentStudent }
                                                                        setBookingToCancel(booking)
                                                                        setIsCancelDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <XCircle size={14} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 pt-6 border-t">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center justify-between px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Search size={12} />
                                            New Selection ({resolvedSessions.length})
                                        </div>
                                        {resolvedSessions.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-5 text-[9px] uppercase p-0 px-2"
                                                onClick={() => {
                                                    setSelectedSessions([])
                                                    setRecurringSessions([])
                                                    setResolvedSessions([])
                                                    setExcludedSessionIds([])
                                                }}
                                            >Clear Selection</Button>
                                        )}
                                    </h4>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                                        {resolvedSessions.length === 0 ? (
                                            <p className="text-[10px] text-muted-foreground italic text-center py-4 bg-muted/20 rounded-xl border border-dashed">
                                                No classes selected yet.
                                            </p>
                                        ) : (
                                            resolvedSessions.map((s, idx) => (
                                                <div key={`${s.id}-${idx}`} className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="min-w-0">
                                                            <div className="truncate font-bold text-xs text-primary">{s.template?.name || 'Class'}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                {s.startTime ? format(new Date(s.startTime), 'EEE, MMM d @ h:mm a') : '-'}
                                                            </div>
                                                        </div>
                                                        {idx === 0 && (
                                                            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none text-[8px] h-4">Starts On</Badge>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-400 hover:bg-red-100 hover:text-red-600 ml-auto shrink-0"
                                                        onClick={() => {
                                                            if (selectedSessions.find(x => x.id === s.id)) {
                                                                setSelectedSessions(selectedSessions.filter(x => x.id !== s.id))
                                                            } else {
                                                                setExcludedSessionIds([...excludedSessionIds, s.id])
                                                            }
                                                        }}
                                                    >
                                                        <XCircle size={14} />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic text-center px-2">
                                        {isModifyMode
                                            ? "These classes will replace your current schedule."
                                            : "Final selection for this enrollment."}
                                    </p>
                                </div>
                            </div>

                            {/* Right Panel: Timetable */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="bg-card/50 p-4 rounded-xl border border-primary/5 space-y-4">
                                    <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg w-fit">
                                        <Button
                                            variant={enrollmentMode === 'recurring' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setEnrollmentMode('recurring')
                                                setResolvedSessions([])
                                            }}
                                            className="h-8 text-[10px] font-bold uppercase tracking-wider px-4"
                                        >Recurring</Button>
                                        <Button
                                            variant={enrollmentMode === 'manual' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setEnrollmentMode('manual')
                                                setResolvedSessions([])
                                            }}
                                            className="h-8 text-[10px] font-bold uppercase tracking-wider px-4"
                                        >Manual Select</Button>
                                        <Button
                                            variant={enrollmentMode === 'mixed' ? 'secondary' : 'ghost'}
                                            size="sm"
                                            onClick={() => {
                                                setEnrollmentMode('mixed')
                                            }}
                                            className="h-8 text-[10px] font-bold uppercase tracking-wider px-4"
                                        >Mixed Mode</Button>
                                    </div>

                                    <TimetableFilters
                                        locations={locations}
                                        coaches={coaches}
                                        ageGroups={ageGroups}
                                        types={types}
                                        currentFilters={filters}
                                        onFilterChange={setFilters}
                                        onReset={() => currentStudent && applySmartFilters(currentStudent, ageGroups)}
                                    />
                                </div>

                                <div className="relative min-h-[450px]">
                                    {fetching && (
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                <span className="text-sm font-bold tracking-tight">Refreshing timetable...</span>
                                            </div>
                                        </div>
                                    )}
                                    <WeeklyCalendar
                                        sessions={sessions}
                                        weekOffset={weekOffset}
                                        selectedSessionId={selectedSession?.id}
                                        selectedSessionIds={resolvedSessions.map(s => s.id)}
                                        onSessionClick={toggleSessionSelection}
                                        onWeekChange={setWeekOffset}
                                    />
                                </div>

                                {resolvedSessions.length > 0 && (
                                    <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/20 flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-lg shadow-primary/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                                                <Search size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-primary/60 mb-0.5">Selection Preview</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{resolvedSessions.length} Classes Selected</span>
                                                    <Badge variant="outline" className="text-xs bg-background border-primary/20">
                                                        Mode: {enrollmentMode.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="lg"
                                            onClick={() => isModifyMode ? setShowModifyConfirm(true) : handleBook()}
                                            disabled={loading}
                                            className={`px-8 font-bold shadow-xl transition-all ${needsOverride ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200/20' : 'shadow-primary/20'}`}
                                        >
                                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                            {isModifyMode ? 'Replace Entire Enrollment' : needsOverride ? 'Book & Override' : 'Confirm Registration'}
                                        </Button>
                                    </div>
                                )}

                                {showModifyConfirm && (
                                    <div className="p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-red-200/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl shadow-inner">
                                                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-red-900 dark:text-red-200">Are you absolutely sure?</p>
                                                <p className="text-xs text-red-700 dark:text-red-400 font-medium opacity-80">This will <span className="underline font-bold">DELETE</span> all {futureBookings.length} future bookings and replace them with the new selection.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" size="sm" onClick={() => setShowModifyConfirm(false)} className="text-red-900 dark:text-red-200 h-10 px-4 font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">Cancel</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleBook()} disabled={loading} className="h-10 px-6 font-bold shadow-lg shadow-red-500/20">
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm & Replace All"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {resolvedSessions.length === 0 && !isModifyMode && (
                                    <div className="p-12 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground/30 gap-4 bg-muted/5">
                                        <div className="p-6 bg-muted/20 rounded-full">
                                            <Search size={48} className="opacity-40" />
                                        </div>
                                        <p className="text-lg font-bold tracking-tight">Select class slot(s) from the timetable to enroll</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t bg-muted/20 flex justify-end gap-3 flex-wrap">
                        <Button variant="outline" onClick={() => setIsOpen(false)} className="px-8 border-primary/10 hover:bg-primary/5 transition-colors">Close</Button>

                        {isModifyMode ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => handleBook(false, false, true)}
                                    disabled={loading || !selectedSession}
                                    className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Calendar className="mr-2 h-4 w-4" /> Book Single Class</>}
                                </Button>
                                <Button
                                    onClick={() => handleBook()}
                                    disabled={loading || resolvedSessions.length === 0}
                                    className="flex-1 sm:flex-none min-w-[140px] shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <MoveHorizontal className="mr-2 h-4 w-4" />
                                            Replace Enrollment
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    onClick={() => handleBook(false, false, true)}
                                    disabled={loading || !selectedSession}
                                    className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary min-w-[140px]"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Calendar className="mr-2 h-4 w-4" /> Book Single Class</>}
                                </Button>
                                <Button
                                    onClick={() => handleBook()}
                                    disabled={loading || resolvedSessions.length === 0}
                                    className="flex-1 sm:flex-none min-w-[140px] shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Confirm Booking
                                        </>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Nested Individual Move Dialog */}
            < MoveBookingDialog
                booking={bookingToMove}
                isOpen={isMoveDialogOpen}
                onOpenChange={handleMoveClose}
            />

            {/* Nested Individual Cancel Confirmation */}
            < Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen} >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Cancel Class Session
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to cancel the booking for <strong className="text-foreground">{bookingToCancel?.student?.name || currentStudent?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    {bookingToCancel && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200 mt-2">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 shrink-0 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-red-900 text-sm">{bookingToCancel.classSession?.template?.name}</h4>
                                    <p className="text-xs text-red-700/80 font-medium mt-0.5">
                                        {bookingToCancel.classSession?.startTime && format(new Date(bookingToCancel.classSession.startTime), 'EEEE, MMM d @ h:mm a')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-[10px] text-red-600/70 mt-3 pt-3 border-t border-red-200/50 italic">
                                This action cannot be undone. Any associated credits will be refunded.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="mt-6 gap-2 sm:justify-between flex-col sm:flex-row">
                        <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)} className="sm:order-1">
                            Keep Booking
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmCancel}
                            className="font-bold px-6 sm:order-2 shadow-lg shadow-red-500/20"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* No Credit Warning Dialog */}
            < Dialog open={showCreditWarning} onOpenChange={setShowCreditWarning} >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            Insufficient Credits
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-base">
                            The student <strong className="text-foreground">{currentStudent?.name}</strong> does not have enough credits in an eligible package for {selectedSession && format(new Date(selectedSession.startTime), 'MMMM yyyy')}.
                            <br /><br />
                            Would you like to book this as an <strong>outstanding payment</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-2">
                        <p className="text-xs text-amber-800 leading-relaxed font-medium text-center">
                            An outstanding payment record will be created:<br />
                            <span className="text-lg font-black block mt-1">{symbol}{currentPrice}</span>
                        </p>
                    </div>
                    <DialogFooter className="mt-6 gap-2 sm:justify-between flex-col sm:flex-row">
                        <Button variant="ghost" onClick={() => setShowCreditWarning(false)} className="sm:order-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleBook(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 sm:order-2"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Book with Outstanding
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Expiry Warning Dialog */}
            < Dialog open={showExpiryWarning} onOpenChange={setShowExpiryWarning} >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <AlertCircle className="h-5 w-5" />
                            Package Expiry Conflict
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-base">
                            This class is in a different month than the booking's original package validity. This violates the standard expiry policy.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mt-2">
                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                            Proceeding will override the month-lock and force credit deduction.
                        </p>
                    </div>
                    <DialogFooter className="mt-6 gap-2 sm:justify-between flex-col sm:flex-row">
                        <Button variant="ghost" onClick={() => setShowExpiryWarning(false)} className="sm:order-1">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowExpiryWarning(false)
                                handleBook(pendingOutstanding, true)
                            }}
                            className="font-bold px-6 sm:order-2"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Overwrite Warning
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}
