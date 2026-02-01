'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, CreditCard, AlertCircle } from "lucide-react"
import { deletePayment } from "@/actions/payments"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import PaymentDialog from "./payment-dialog"
import { format } from "date-fns"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PaymentRowActions({ payment, packages }: { payment: any, packages: any[] }) {
    const [deleting, setDeleting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    async function handleDelete() {
        setDeleting(true)
        const res = await deletePayment(payment.id)
        if (res.success) {
            toast({ title: "Payment and associated bookings deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
            setDeleting(false)
        }
    }

    const bookings = [
        ...(payment.studentPackage?.bookings || []),
        ...(payment.booking ? [payment.booking] : [])
    ].filter((b: any) => b.status !== 'CANCELLED')
    const bookingCount = bookings.length

    return (
        <div className="flex items-center gap-1 justify-end">
            <PaymentDialog payment={payment} packages={packages} user={{ students: [payment.student] }} />

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3" asChild>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>This will delete the payment record and the associated student package.</p>
                                {bookingCount > 0 && (
                                    <div className="space-y-2">
                                        <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-destructive font-bold text-sm">
                                            <AlertCircle className="h-4 w-4 inline mr-2 mb-0.5" />
                                            Warning: {bookingCount} class booking{bookingCount > 1 ? 's' : ''} will be permanently deleted:
                                        </div>
                                        <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1 py-1 text-foreground">
                                            {bookings.map((b: any) => (
                                                <div key={b.id} className="text-[10px] flex justify-between items-center p-2 bg-muted/30 rounded-md border border-border/50">
                                                    <div className="flex flex-col overflow-hidden mr-2">
                                                        <span className="font-bold truncate">{b.classSession?.template?.name}</span>
                                                        <span className="text-[9px] text-muted-foreground truncate">{b.classSession?.location?.name}</span>
                                                    </div>
                                                    <span className="text-muted-foreground whitespace-nowrap text-[9px] shrink-0">
                                                        {b.classSession?.startTime && format(new Date(b.classSession.startTime), 'MMM d, h:mm a')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <p className="font-medium text-muted-foreground italic text-xs">This action cannot be undone.</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
