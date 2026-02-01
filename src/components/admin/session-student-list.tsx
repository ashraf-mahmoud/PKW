import React, { useEffect, useState } from 'react'
import { getSessionBookings, cancelBooking } from '@/actions/admin-booking'
import { getStudentFutureBookings } from '@/actions/booking'
import {
    Loader2,
    User,
    Phone,
    Mail,
    Calendar as CalendarIcon,
    AlertCircle,
    MoreVertical,
    XCircle,
    MoveHorizontal,
    Edit,
    Trash2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import MoveBookingDialog from './move-booking-dialog'
import BookingDialog from './booking-dialog'

interface SessionStudentListProps {
    sessionId: string
    sessionDate: Date
    locationId?: string
}

export default function SessionStudentList({ sessionId, sessionDate, locationId }: SessionStudentListProps) {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    // Action States
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<any>(null)
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
    const [bookingToMove, setBookingToMove] = useState<any>(null)
    const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)
    const [studentToModify, setStudentToModify] = useState<any>(null)
    const [actionLoading, setActionLoading] = useState(false)

    async function fetchBookings() {
        try {
            setLoading(true)
            const data = await getSessionBookings(sessionId)
            setBookings(data || [])
            setError(null)
        } catch (err) {
            console.error("Error fetching bookings:", err)
            setError("Failed to load student list.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (sessionId) {
            fetchBookings()
        }
    }, [sessionId])

    const handleCancelClick = (booking: any) => {
        setBookingToCancel(booking)
        setIsCancelDialogOpen(true)
    }

    const confirmCancel = async () => {
        if (!bookingToCancel) return

        setActionLoading(true)
        const res = await cancelBooking(bookingToCancel.id)
        setActionLoading(false)
        setIsCancelDialogOpen(false)

        if (res.success) {
            toast({ title: "Booking Cancelled", description: "The booking has been successfully cancelled." })
            fetchBookings()
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const handleModifyClick = (booking: any) => {
        setStudentToModify(booking.student)
        setIsModifyDialogOpen(true)
    }

    // Refresh list when move or modify dialogs close successfully
    const handleMoveClose = (open: boolean) => {
        setIsMoveDialogOpen(open)
        if (!open) {
            fetchBookings()
            router.refresh()
        }
    }

    const handleModifyClose = (open: boolean) => {
        setIsModifyDialogOpen(open)
        if (!open) {
            fetchBookings()
            router.refresh()
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Loading student list...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm font-medium">{error}</p>
            </div>
        )
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 border border-dashed rounded-xl">
                <Users size={32} className="mx-auto text-muted-foreground mb-3 opacity-20" />
                <p className="text-muted-foreground font-medium">No students booked for this session.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Booked Students ({bookings.length})
                </div>
            </div>

            <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm hover:border-primary/30 transition-colors group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                    {booking.student.name[0]}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-foreground leading-none">{booking.student.name}</h4>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                        <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 bg-muted/50 border-none">
                                            Level {booking.student.level}
                                        </Badge>
                                        <span>•</span>
                                        <span>Parent: {booking.student.parent?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleModifyClick(booking)}>
                                        <Edit size={14} className="mr-2" />
                                        Modify Enrollment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        setBookingToMove(booking)
                                        setIsMoveDialogOpen(true)
                                    }}>
                                        <MoveHorizontal size={14} className="mr-2" />
                                        Move Class Session
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleCancelClick(booking)}
                                    >
                                        <XCircle size={14} className="mr-2" />
                                        Cancel Session
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-x-4 gap-y-2">
                            {booking.student.parent?.email && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {booking.student.parent.email}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dialogs */}
            <MoveBookingDialog
                booking={bookingToMove}
                isOpen={isMoveDialogOpen}
                onOpenChange={handleMoveClose}
            />

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Session?</DialogTitle>
                        <DialogDescription>
                            This will cancel the booking for <strong>{bookingToCancel?.student.name}</strong>.
                            One credit will be refunded to the student's active package.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Go Back</Button>
                        <Button
                            onClick={confirmCancel}
                            variant="destructive"
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Cancelling..." : "Yes, Cancel Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {studentToModify && (
                <BookingDialog
                    user={{ students: [studentToModify] }}
                    onOpenChange={handleModifyClose}
                    isOpen={isModifyDialogOpen}
                    initialStudentId={studentToModify.id}
                    initialLocationId={locationId}
                />
            )}
        </div>
    )
}


function Users({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
