'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Search, XCircle, MoreVertical, Calendar, User, MapPin, MoveHorizontal, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cancelBooking, deleteBooking, deleteGroupBookings } from '@/actions/admin-booking'
import { getStudentFutureBookings } from '@/actions/booking'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import MoveBookingDialog from './move-booking-dialog'
import BookingDialog from './booking-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Loader2 } from 'lucide-react'

export default function BookingsTable({ bookings, packages }: { bookings: any[], packages: any[] }) {
    const { toast } = useToast()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [bookingToCancel, setBookingToCancel] = useState<any>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [bookingToDelete, setBookingToDelete] = useState<any>(null)
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
    const [bookingToMove, setBookingToMove] = useState<any>(null)

    const [isGroupDeleteDialogOpen, setIsGroupDeleteDialogOpen] = useState(false)
    const [studentToGroupDelete, setStudentToGroupDelete] = useState<any>(null)

    const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false)
    const [studentToModify, setStudentToModify] = useState<any>(null)

    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())

    const [loading, setLoading] = useState(false)

    const filteredBookings = bookings.filter(booking => {
        const studentName = booking.student.name.toLowerCase()
        const parentName = booking.student.parent?.name?.toLowerCase() || ''
        const className = booking.classSession.template.name.toLowerCase()
        const search = searchTerm.toLowerCase()
        return studentName.includes(search) || parentName.includes(search) || className.includes(search)
    })

    const groupedBookings = React.useMemo(() => {
        const groups: Record<string, { student: any, bookings: any[] }> = {}
        filteredBookings.forEach(booking => {
            const studentId = booking.student.id
            if (!groups[studentId]) {
                groups[studentId] = {
                    student: booking.student,
                    bookings: []
                }
            }
            groups[studentId].bookings.push(booking)
        })
        return Object.values(groups).sort((a, b) => a.student.name.localeCompare(b.student.name))
    }, [filteredBookings])

    const handleCancelClick = (booking: any) => {
        setBookingToCancel(booking)
        setIsCancelDialogOpen(true)
    }

    const handleDeleteClick = (booking: any) => {
        setBookingToDelete(booking)
        setIsDeleteDialogOpen(true)
    }

    const confirmCancel = async () => {
        if (!bookingToCancel) return

        setLoading(true)
        const res = await cancelBooking(bookingToCancel.id)
        setLoading(false)
        setIsCancelDialogOpen(false)

        if (res.success) {
            toast({ title: "Booking Cancelled", description: "The booking has been successfully cancelled." })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const confirmDelete = async () => {
        if (!bookingToDelete) return

        setLoading(true)
        const res = await deleteBooking(bookingToDelete.id)
        setLoading(false)
        setIsDeleteDialogOpen(false)

        if (res.success) {
            toast({ title: "Booking Deleted", description: "The booking record has been permanently removed and credits refunded." })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const confirmGroupDelete = async () => {
        if (!studentToGroupDelete) return
        setLoading(true)
        const res = await deleteGroupBookings(studentToGroupDelete.id)
        setLoading(false)
        setIsGroupDeleteDialogOpen(false)
        if (res.success) {
            toast({ title: "Group Deleted", description: "All future bookings for this student have been removed and credits refunded." })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const handleModifyClick = (student: any) => {
        setStudentToModify(student)
        setIsModifyDialogOpen(true)
    }

    const toggleStudent = (studentId: string) => {
        const newExpanded = new Set(expandedStudents)
        if (newExpanded.has(studentId)) {
            newExpanded.delete(studentId)
        } else {
            newExpanded.add(studentId)
        }
        setExpandedStudents(newExpanded)
    }

    const expandAll = () => {
        setExpandedStudents(new Set(groupedBookings.map(g => g.student.id)))
    }

    const collapseAll = () => {
        setExpandedStudents(new Set())
    }

    return (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden text-foreground">
            <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/50">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-bold" size={18} />
                    <Input
                        placeholder="Search student, parent or class..."
                        className="pl-10 h-10 bg-background border-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={expandAll}
                        className="h-9 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <ChevronsUpDown className="mr-2 h-4 w-4" />
                        Expand All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={collapseAll}
                        className="h-9 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <ChevronsDownUp className="mr-2 h-4 w-4" />
                        Collapse All
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[300px]">Student & Parent</TableHead>
                        <TableHead>Class & Session</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Booked At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupedBookings.map((group) => {
                        const isExpanded = expandedStudents.has(group.student.id)
                        return (
                            <React.Fragment key={group.student.id}>
                                {/* Student Header Row */}
                                <TableRow
                                    className="bg-muted/30 hover:bg-muted/40 border-l-4 border-l-primary cursor-pointer transition-colors"
                                    onClick={() => toggleStudent(group.student.id)}
                                >
                                    <TableCell colSpan={5}>
                                        <div className="flex items-center gap-3">
                                            <div className="text-muted-foreground">
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                                {group.student.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-base">{group.student.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Parent: {group.student.parent?.name || 'Unknown'} • {group.bookings.length} enrollment(s)
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs font-semibold"
                                                onClick={() => handleModifyClick(group.student)}
                                            >
                                                <Calendar className="mr-1 h-3.5 w-3.5" />
                                                Modify Enrollment
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setStudentToGroupDelete(group.student)
                                                            setIsGroupDeleteDialogOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 size={14} className="mr-2" />
                                                        Delete All Future
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Individual Booking Rows */}
                                {isExpanded && group.bookings.map((booking: any) => (
                                    <TableRow key={booking.id} className="group/row animate-in fade-in slide-in-from-top-1 duration-200">
                                        <TableCell className="pl-12 py-2">
                                            {/* Empty or subtle indicator */}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm line-clamp-1">
                                                    {booking.classSession.template.name}
                                                </span>
                                                <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
                                                    <Calendar size={10} />
                                                    {format(new Date(booking.classSession.startTime), 'EEE, MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin size={10} />
                                                <span className="text-[11px]">{booking.classSession.location.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge
                                                variant={
                                                    booking.status === 'CONFIRMED' ? 'default' :
                                                        booking.status === 'CANCELLED' ? 'destructive' :
                                                            'outline'
                                                }
                                                className="text-[9px] uppercase font-bold px-1.5 h-4"
                                            >
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-[11px] py-2">
                                            {format(new Date(booking.bookedAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right py-2">
                                            <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                                            <MoreVertical size={14} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Session Action</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setBookingToMove(booking)
                                                                setIsMoveDialogOpen(true)
                                                            }}
                                                            disabled={booking.status === 'CANCELLED'}
                                                        >
                                                            <MoveHorizontal size={14} className="mr-2" />
                                                            Move Class Session
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleCancelClick(booking)}
                                                            disabled={booking.status === 'CANCELLED'}
                                                        >
                                                            <XCircle size={14} className="mr-2" />
                                                            Cancel Session
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteClick(booking)}
                                                        >
                                                            <Trash2 size={14} className="mr-2" />
                                                            Delete Session
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        )
                    })}
                    {groupedBookings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No bookings found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <MoveBookingDialog
                booking={bookingToMove}
                isOpen={isMoveDialogOpen}
                onOpenChange={setIsMoveDialogOpen}
            />

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Session?</DialogTitle>
                        <DialogDescription>
                            This will cancel the booking for <strong>{bookingToCancel?.student.name}</strong> in <strong>{bookingToCancel?.classSession.template.name}</strong>.
                            One credit will be refunded to the student's active package.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Go Back</Button>
                        <Button
                            onClick={confirmCancel}
                            variant="destructive"
                            disabled={loading}
                        >
                            {loading ? "Cancelling..." : "Yes, Cancel Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive font-display">Delete Session Permanently?</DialogTitle>
                        <DialogDescription>
                            This will <strong>PERMANENTLY DELETE</strong> the session for <strong>{bookingToDelete?.student.name}</strong>.
                            If it was a confirmed session, one credit will be refunded.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Keep Record</Button>
                        <Button
                            onClick={confirmDelete}
                            variant="destructive"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Deleting..." : "Permanently Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isGroupDeleteDialogOpen} onOpenChange={setIsGroupDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive font-display">Delete All Future Bookings?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete ALL upcoming classes for <strong>{studentToGroupDelete?.name}</strong>.
                            All relevant credits will be refunded to their active package.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGroupDeleteDialogOpen(false)}>Keep Bookings</Button>
                        <Button
                            onClick={confirmGroupDelete}
                            variant="destructive"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Deleting All..." : "Delete All Future"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {studentToModify && (
                <BookingDialog
                    user={{ students: [studentToModify] }}
                    onOpenChange={setIsModifyDialogOpen}
                    isOpen={isModifyDialogOpen}
                    initialStudentId={studentToModify.id}
                />
            )}
        </div>
    )
}
