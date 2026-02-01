'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import React, { useState } from "react"
import PaymentDialog from "./payment-dialog"
import BookingDialog from "./booking-dialog"
import { deleteUser } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Trash2, Edit, Loader2 } from "lucide-react"

export default function UserActions({ user, student, packages }: { user: any, student?: any, packages: any[] }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await deleteUser(user.id)
            if (res.success) {
                toast({ title: "User Deleted", description: "The family and all associated records have been removed." })
                router.refresh()
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }

    return (
        <div className="flex justify-end gap-2 text-foreground/80">
            {user.students && user.students.length > 0 && (
                <>
                    <BookingDialog
                        user={user}
                        student={student}
                        initialStudentId={student?.id}
                        futureBookings={student?.bookings}
                        triggerButton={student?.bookings?.length > 0 ? {
                            text: "Modify Enrollment",
                            variant: "secondary",
                            className: "bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200 shadow-none border"
                        } : undefined}
                    />
                    <PaymentDialog user={user} packages={packages} />
                </>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={`/dashboard/users/${user.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" />
                            Edit Family
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive flex items-center gap-2 cursor-pointer"
                        onSelect={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Family
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{user.name}</strong> and all associated students, bookings, and records. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Delete Everything
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
