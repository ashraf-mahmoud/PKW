'use client'

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Clock, MapPin, CheckCircle2, XCircle, Activity } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UserHistory({ students }: { students: any[] }) {
    if (!students || students.length === 0) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold font-display">Student Activity History</h3>
            </div>

            <Tabs defaultValue={students[0].id} className="w-full">
                <TabsList className="bg-muted/50 p-1 mb-6">
                    {students.map(student => (
                        <TabsTrigger key={student.id} value={student.id} className="px-6">
                            {student.name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {students.map(student => (
                    <TabsContent key={student.id} value={student.id} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* Bookings History */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Class Attendance
                                </h4>
                                <Badge variant="outline" className="text-[10px] opacity-70">
                                    {student.bookings?.length || 0} Total Sessions
                                </Badge>
                            </div>

                            <div className="grid gap-3">
                                {student.bookings?.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm italic">
                                        No booking history found for this student.
                                    </div>
                                ) : (
                                    student.bookings.map((booking: any) => (
                                        <div
                                            key={booking.id}
                                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${booking.status === 'CANCELLED' ? 'bg-muted/30 border-muted opacity-80' : 'bg-card'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg ${booking.status === 'CANCELLED' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {booking.classSession?.template?.name || "Unknown Class"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {booking.classSession?.startTime ? format(new Date(booking.classSession.startTime), 'MMM d, h:mm a') : '-'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {booking.classSession?.location?.name || "TBA"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end md:self-center">
                                                {booking.status === 'CONFIRMED' ? (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 shadow-none gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground gap-1">
                                                        <XCircle className="w-3 h-3" /> {booking.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="space-y-4">
                            <h4 className="font-bold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                                <CreditCard className="w-3.5 h-3.5" />
                                Payment History
                            </h4>

                            <div className="grid gap-3">
                                {student.payments?.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm italic">
                                        No payment records found for this student.
                                    </div>
                                ) : (
                                    student.payments.map((payment: any) => (
                                        <div key={payment.id} className="p-4 rounded-xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 p-2 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                                                    <CreditCard className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {payment.package?.name || "Package Purchase"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                                                        <span>{format(new Date(payment.date), 'MMM d, yyyy')}</span>
                                                        <span className="capitalize">{payment.method}</span>
                                                        {payment.reference && (
                                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                                #{payment.reference}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 self-end md:self-center">
                                                <div className="text-right">
                                                    <div className="font-bold text-sm text-primary">
                                                        RM {Number(payment.amount).toFixed(2)}
                                                    </div>
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-green-600 border-green-200">
                                                        {payment.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Credit History (Ledger) */}
                        <div className="space-y-4">
                            <h4 className="font-bold flex items-center gap-2 text-muted-foreground uppercase text-xs tracking-wider">
                                <Activity className="w-3.5 h-3.5" />
                                Credit History
                            </h4>

                            <div className="grid gap-3">
                                {!student.creditLedger || student.creditLedger.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm italic">
                                        No credit history found for this student.
                                    </div>
                                ) : (
                                    student.creditLedger.map((ledger: any) => (
                                        <div key={ledger.id} className="p-4 rounded-xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg ${ledger.type === 'DEBIT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">
                                                        {ledger.type === 'DEBIT' ? (
                                                            ledger.booking?.classSession?.template?.name ? (
                                                                `Booking: ${ledger.booking.classSession.template.name}`
                                                            ) : (
                                                                ledger.reason || "Credit Deduction"
                                                            )
                                                        ) : (
                                                            ledger.reason === "BOOKING_CANCELLED" ? "Booking Refund" : "Credit Added"
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex flex-col md:flex-row md:items-center gap-x-3 mt-1">
                                                        <span>{format(new Date(ledger.createdAt), 'MMM d, yyyy HH:mm')}</span>
                                                        {ledger.booking?.classSession && (
                                                            <span className="flex items-center gap-1 font-medium text-primary">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(new Date(ledger.booking.classSession.startTime), 'EEE, MMM d @ h:mm a')}
                                                            </span>
                                                        )}
                                                        {ledger.packagePurchase?.package && (
                                                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                                                Package: {ledger.packagePurchase.package.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 self-end md:self-center">
                                                <div className={`font-bold text-lg ${ledger.type === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {ledger.type === 'DEBIT' ? '-' : '+'}{ledger.amount} Credit
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
