'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, MapPin, Search, ArrowRight, Package as PackageIcon } from "lucide-react"
import { getLocations, getUpcomingSessions, getCoaches } from "@/actions/classes"
import { getClassTypes } from "@/actions/class-types"
import { getAgeGroups } from "@/actions/age-groups"
import { moveBooking } from "@/actions/admin-booking"
import { getStudentPackages } from "@/actions/student-package"
import { getStudent } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { format, differenceInYears } from 'date-fns'
import TimetableFilters from "@/components/booking/timetable-filters"
import WeeklyCalendar from "@/components/booking/weekly-calendar"
import { Badge } from '../ui/badge'

interface MoveBookingDialogProps {
    booking: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export default function MoveBookingDialog({ booking, isOpen, onOpenChange }: MoveBookingDialogProps) {
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [coaches, setCoaches] = useState<any[]>([])
    const [ageGroups, setAgeGroups] = useState<any[]>([])
    const [types, setTypes] = useState<any[]>([])

    const [filters, setFilters] = useState<any>({
        locationId: 'all',
        type: 'all',
        coachId: 'all',
        level: 'all',
        ageGroupId: 'all',
        age: undefined
    })
    const [weekOffset, setWeekOffset] = useState(0)

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [studentPackages, setStudentPackages] = useState<any[]>([])
    const [fullStudent, setFullStudent] = useState<any>(null)
    const { toast } = useToast()
    const router = useRouter()

    // Initialize data and filters
    useEffect(() => {
        if (isOpen && booking) {
            loadInitialData()
        }
    }, [isOpen, booking])

    // Load sessions whenever filters or week change
    useEffect(() => {
        if (isOpen && booking) {
            fetchSessions()
        }
    }, [filters, weekOffset, isOpen, booking])

    async function loadInitialData() {
        try {
            const [locs, coas, groups, typList] = await Promise.all([
                getLocations(),
                getCoaches(),
                getAgeGroups(),
                getClassTypes()
            ])
            setLocations(locs)
            setCoaches(coas)
            setAgeGroups(groups)
            setTypes(typList)

            // Fetch student packages
            const pkgs = await getStudentPackages(booking.student.id)
            setStudentPackages(pkgs)

            // Initial smart filters
            let student = booking.student
            if (!student.dob) {
                const full = await getStudent(student.id)
                if (full) {
                    setFullStudent(full)
                    student = full
                }
            }
            applySmartFilters(student, groups)
        } catch (error) {
            console.error("Failed to load initial data:", error)
        }
    }

    function applySmartFilters(student: any, groups: any[]) {
        const age = differenceInYears(new Date(), new Date(student.dob))
        const matchingGroup = groups.find((g: any) => age >= g.minAge && age <= g.maxAge)

        setFilters({
            locationId: booking.classSession.locationId,
            level: student.level.toString(),
            ageGroupId: matchingGroup?.id || 'all',
            age: age,
            type: 'all',
            coachId: 'all'
        })
    }

    async function fetchSessions() {
        setFetching(true)
        try {
            // Convert string level to number if needed
            const apiFilters = { ...filters }
            if (apiFilters.level && apiFilters.level !== 'all') {
                apiFilters.level = parseInt(apiFilters.level)
            } else if (apiFilters.level === 'all') {
                delete apiFilters.level
            }

            const data = await getUpcomingSessions(apiFilters)
            // Filter out current session
            setSessions(data.filter((s: any) => s.id !== booking.classSessionId))
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch available classes", variant: "destructive" })
        } finally {
            setFetching(false)
        }
    }

    const [showExpiryConfirm, setShowExpiryConfirm] = useState(false)

    async function handleMove(forceExpiry = false) {
        if (!selectedSession) {
            return toast({ title: "Selection Missing", description: "Please select a new class session from the calendar.", variant: "destructive" })
        }

        setLoading(true)
        const res = await moveBooking(booking.id, selectedSession.id, forceExpiry)
        setLoading(false)

        if (res.success) {
            toast({ title: "Booking Moved", description: "Student successfully moved to the new class." })
            onOpenChange(false)
            router.refresh()
        } else {
            if (res.error === "EXPIRY_WARNING") {
                setShowExpiryConfirm(true)
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        }
    }

    if (!booking || !booking.student) return null

    // Safety check for DOB - we already updated getStudentFutureBookings but extra safety is good
    const dob = booking.student.dob ? new Date(booking.student.dob) : new Date()
    const studentAge = booking.student.dob ? differenceInYears(new Date(), dob) : 0

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl">Move Class Session</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                        Moving <span className="text-foreground font-bold">{booking.student.name}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium border uppercase tracking-wider">
                            Age {studentAge} • Level {booking.student.level}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Active Packages Strip */}
                    <div className="flex gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10 overflow-x-auto scrollbar-none">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary mr-2 sticky left-0 bg-primary/5 pr-2">
                            <PackageIcon size={14} />
                            <span className="whitespace-nowrap">Packages</span>
                        </div>
                        {studentPackages.length > 0 ? (
                            studentPackages.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2 whitespace-nowrap bg-background border rounded-lg px-2.5 py-1 shadow-sm">
                                    <span className="text-xs font-semibold">{p.package.name}</span>
                                    <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-none">{p.remainingCredits} Credits Left</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-muted-foreground italic py-1">No active packages found for this student.</div>
                        )}
                    </div>
                    {/* Current Context Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/40 rounded-xl border border-dashed flex flex-col justify-center">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Current Session</Label>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-background rounded-lg border shadow-sm">
                                    <Calendar size={18} className="text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{booking.classSession.template.name}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <MapPin size={10} /> {booking.classSession.location.name}
                                    </div>
                                    <div className="text-xs font-medium mt-1">
                                        {format(new Date(booking.classSession.startTime), 'EEEE, MMM d, h:mm a')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border flex flex-col justify-center transition-all ${selectedSession ? 'bg-primary/5 border-primary' : 'bg-muted/20 border-border'}`}>
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground mb-2">New Selection</Label>
                            {selectedSession ? (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary rounded-lg shadow-md text-primary-foreground">
                                        <Search size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-primary">{selectedSession.template.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MapPin size={10} /> {selectedSession.location.name}
                                        </div>
                                        <div className="text-xs font-bold mt-1 text-primary">
                                            {format(new Date(selectedSession.startTime), 'EEEE, MMM d, h:mm a')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-muted-foreground py-2 italic text-sm">
                                    <ArrowRight size={18} />
                                    Select an upcoming session from the timetable below
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Available Timetable</h3>
                            {fetching && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Loader2 size={12} className="animate-spin" /> Loading sessions...
                                </div>
                            )}
                        </div>
                        <TimetableFilters
                            locations={locations}
                            coaches={coaches}
                            ageGroups={ageGroups}
                            types={types}
                            currentFilters={filters}
                            onFilterChange={setFilters}
                            onReset={() => applySmartFilters(fullStudent || booking.student, ageGroups)}
                        />
                    </div>

                    {/* Timetable Section */}
                    <div className="relative min-h-[400px]">
                        <WeeklyCalendar
                            sessions={sessions}
                            weekOffset={weekOffset}
                            onWeekChange={setWeekOffset}
                            onSessionClick={(s) => setSelectedSession(s)}
                            selectedSessionId={selectedSession?.id}
                        />
                        {fetching && sessions.length === 0 && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-xl">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 size={32} className="animate-spin text-primary" />
                                    <p className="text-sm font-medium">Searching for classes...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Admin Note */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-2">
                        <div className="mt-0.5 p-1 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-100 uppercase text-[8px] font-black">Admin</div>
                        <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed italic">
                            Administrator override is enabled. You can move the student to any class session even if it doesn't match their level/age exactly or if the capacity is reached.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
                    {showExpiryConfirm ? (
                        <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm">
                                <Label className="sr-only">Warning</Label>
                                <div className="p-1 px-1.5 bg-amber-100 rounded border border-amber-300 font-bold uppercase text-[10px] shrink-0 mt-0.5">Warning</div>
                                <div className="flex-1">
                                    <p className="font-bold">Package Expiry Conflict</p>
                                    <p className="text-xs opacity-90 mt-1">This class is in a different month than the booking's original package validity. This violates the standard expiry policy.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setShowExpiryConfirm(false)}>Cancel Move</Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleMove(true)}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Overwrite Warning"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                onClick={() => handleMove(false)}
                                disabled={loading || !selectedSession}
                                className="min-w-[140px] shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Confirm Move"
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
