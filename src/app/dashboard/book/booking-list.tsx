import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isSameMonth, endOfMonth } from 'date-fns'
import { bookClass, getRecurringSessions } from '@/actions/booking'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react'

export default function BookingList({
    classes,
    students,
    packages = []
}: {
    classes: any[],
    students: any[],
    packages?: any[]
}) {
    const { toast } = useToast()
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [selectedStudent, setSelectedStudent] = useState<string>('')
    const [selectedPackage, setSelectedPackage] = useState<string>('trial')
    const [recurringSessions, setRecurringSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isFetchingRecur, setIsFetchingRecur] = useState(false)
    const [extendExpiry, setExtendExpiry] = useState(false)

    const handleBookClick = (cls: any) => {
        setSelectedClass(cls)
        setSelectedPackage('trial')
        setExtendExpiry(false)
        if (students.length === 1) setSelectedStudent(students[0].id)
    }

    // Effect to fetch recurring sessions when package changes
    useEffect(() => {
        if (!selectedClass || selectedPackage === 'trial' || selectedPackage === 'all') {
            setRecurringSessions([])
            return
        }

        const pkg = packages.find(p => p.id === selectedPackage)
        if (!pkg) return

        async function fetchRecur() {
            setIsFetchingRecur(true)
            const sessions = await getRecurringSessions(selectedClass.id, pkg.creditCount)
            setRecurringSessions(sessions)
            setIsFetchingRecur(false)
        }
        fetchRecur()
    }, [selectedClass, selectedPackage, packages])

    const pkg = packages.find(p => p.id === selectedPackage)
    const creditCount = pkg?.creditCount || 1
    const unutilizedCount = creditCount - recurringSessions.length
    const hasShortfall = unutilizedCount > 0 && selectedPackage !== 'trial'

    // Check if any recurring session falls outside current month
    const monthEndsSoon = recurringSessions.some(s => !isSameMonth(new Date(), new Date(s.startTime)))

    const curStudent = students.find(s => s.id === selectedStudent)
    const studentCredits = curStudent?.studentPackages?.reduce((sum: number, p: any) => sum + p.remainingCredits, 0) || 0
    const needsCredit = selectedPackage === 'trial' && studentCredits === 0

    const confirmBooking = async () => {
        if (!selectedStudent || !selectedClass) return

        setLoading(true)
        const sessionIds = selectedPackage === 'trial'
            ? selectedClass.id
            : recurringSessions.map(s => s.id)

        const res = await bookClass(sessionIds, selectedStudent, {
            packageId: selectedPackage === 'trial' ? undefined : selectedPackage,
            extendExpiry
        })
        setLoading(false)

        if (res.success) {
            toast({ title: "Booking Confirmed!", description: `${sessionIds.length} session(s) booked successfully.` })
            setSelectedClass(null)
            setSelectedStudent('')
            setSelectedPackage('trial')
        } else {
            toast({ title: "Booking Failed", description: res.error, variant: "destructive" })
        }
    }

    if (classes.length === 0) {
        return <div className="text-muted-foreground text-center p-12 bg-muted/20 rounded-xl border border-dashed">No upcoming classes available.</div>
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map(cls => (
                    <Card key={cls.id} className="flex flex-col border-none shadow-md bg-card/50 backdrop-blur-sm group hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">{cls.template.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{cls.template.type}</Badge>
                                <Badge variant="outline" className="text-[10px] opacity-70">Level {cls.template.levelMin}-{cls.template.levelMax}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3 text-sm pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-semibold text-foreground bg-muted/50 px-2 py-1 rounded">{format(new Date(cls.startTime), 'EEE, MMM d')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-semibold">{format(new Date(cls.startTime), 'h:mm a')} - {format(new Date(cls.endTime), 'h:mm a')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Location:</span>
                                <span className="font-medium text-primary/80">{cls.location.name}</span>
                            </div>
                            <div className="pt-2 border-t flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Availability</span>
                                <span className={`text-sm font-bold ${cls._count.bookings >= ((cls.schedule?.capacity) ?? cls.template.capacity) ? "text-destructive" : "text-green-500"}`}>
                                    {((cls.schedule?.capacity) ?? cls.template.capacity) - cls._count.bookings} spots left
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button
                                className="w-full rounded-lg h-10 font-bold tracking-tight shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
                                onClick={() => handleBookClick(cls)}
                                disabled={cls._count.bookings >= ((cls.schedule?.capacity) ?? cls.template.capacity)}
                            >
                                {cls._count.bookings >= ((cls.schedule?.capacity) ?? cls.template.capacity) ? "Class Full" : "Book session"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedClass} onOpenChange={(o) => {
                if (!o) {
                    setSelectedClass(null)
                    setSelectedPackage('trial')
                }
            }}>
                <DialogContent className="max-w-md bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-display">Confirm Registration</DialogTitle>
                        <DialogDescription className="text-base">
                            Booking <strong>{selectedClass?.template.name}</strong> at {selectedClass?.location.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Student Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70">1. Select Student</label>
                            {students.length > 0 ? (
                                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                    <SelectTrigger className="h-11 bg-muted/30 border-none shadow-inner">
                                        <SelectValue placeholder="Who is attending?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} (Lvl {s.level})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-xs flex items-center gap-2 border border-destructive/20">
                                    <AlertCircle size={14} />
                                    <span>No students found in your account.</span>
                                </div>
                            )}
                        </div>

                        {selectedStudent && (
                            <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
                                <span className="text-xs font-bold text-primary/70 uppercase">Available Credits</span>
                                <Badge variant="outline" className={`font-bold ${studentCredits > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {studentCredits} Credits
                                </Badge>
                            </div>
                        )}

                        {/* Package Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/70">2. Select Package</label>
                            <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                                <SelectTrigger className="h-11 bg-muted/30 border-none shadow-inner">
                                    <SelectValue placeholder="Select booking type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="trial">Single / Use Available Credit</SelectItem>
                                    {packages.map(p => (
                                        <SelectItem key={p.id} value={p.id}>Buy New: {p.name} ({p.creditCount} Credits)</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {needsCredit && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[11px] flex items-start gap-2 border border-red-100 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    <span>You don't have enough credits for a single session. Please select a package to purchase before booking.</span>
                                </div>
                            )}
                        </div>

                        {/* Recurring Preview */}
                        {selectedPackage !== 'trial' && (
                            <div className="p-4 bg-muted/40 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        Sessions Preview
                                    </span>
                                    {isFetchingRecur && <span className="text-[10px] animate-pulse">Finding sessions...</span>}
                                </div>

                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin">
                                    {recurringSessions.map((s, idx) => (
                                        <div key={s.id} className="flex items-center justify-between text-xs bg-card p-2 rounded-lg border border-border/50">
                                            <span className="font-medium">{format(new Date(s.startTime), 'EEEE, MMM d')}</span>
                                            <span className="text-muted-foreground">{format(new Date(s.startTime), 'h:mm a')}</span>
                                        </div>
                                    ))}

                                    {!isFetchingRecur && recurringSessions.length === 0 && (
                                        <div className="text-[10px] text-destructive italic">No recurring sessions found for this slot.</div>
                                    )}
                                </div>

                                {/* Shortfall / Conflict Warning */}
                                {hasShortfall && !isFetchingRecur && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg space-y-2">
                                        <div className="flex gap-2 text-[11px] text-amber-600 font-medium leading-tight">
                                            <AlertCircle size={14} className="shrink-0" />
                                            <div>
                                                Month ends soon. Only {recurringSessions.length} out of {creditCount} credits could be auto-assigned.
                                                <span className="font-bold block mt-1 underline">Balance: {unutilizedCount} credits remaining.</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <Button
                                                size="sm"
                                                variant={extendExpiry ? "default" : "outline"}
                                                className={`text-[10px] h-7 px-2 ${extendExpiry ? 'bg-amber-600 hover:bg-amber-700 border-none' : 'border-amber-200 text-amber-700'}`}
                                                onClick={() => setExtendExpiry(!extendExpiry)}
                                            >
                                                {extendExpiry ? <CheckCircle2 size={12} className="mr-1" /> : null}
                                                Extend Expiry to Next Month
                                            </Button>
                                        </div>
                                        <p className="text-[9px] text-amber-600/70 italic">
                                            * Unutilized credits can be used to book different classes later.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between items-center gap-4">
                        <div className="text-xs text-muted-foreground">
                            {selectedPackage !== 'trial' ? `Total Credits: ${creditCount}` : "Single Booking"}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" className="h-10 px-6" onClick={() => setSelectedClass(null)}>Cancel</Button>
                            <Button
                                className="h-10 px-8 font-bold min-w-[120px]"
                                onClick={confirmBooking}
                                disabled={loading || !selectedStudent || (selectedPackage !== 'trial' && recurringSessions.length === 0) || needsCredit}
                            >
                                {loading ? "Processing..." : "Confirm Booking"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
