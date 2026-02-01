'use client'

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CreditCard, DollarSign } from "lucide-react"
import { createPayment, updatePayment } from "@/actions/payments"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { differenceInYears, format } from 'date-fns'
import FileUpload from '@/components/ui/file-upload'
import { useCurrency } from "@/components/providers/currency-provider"

interface PaymentDialogProps {
    user: any
    packages: any[]
    payment?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function PaymentDialog({ user, packages, payment, open: externalOpen, onOpenChange: externalOnOpenChange }: PaymentDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    // Controlled vs Uncontrolled logic
    const isOpen = externalOpen !== undefined ? externalOpen : internalIsOpen
    const setIsOpen = (newOpen: boolean) => {
        if (externalOnOpenChange) {
            externalOnOpenChange(newOpen)
        } else {
            setInternalIsOpen(newOpen)
        }
    }
    const [selectedStudentId, setSelectedStudentId] = useState<string>(payment?.studentId || '')
    const [selectedPackageId, setSelectedPackageId] = useState<string>(payment?.packageId || '')
    const [invoiceUrl, setInvoiceUrl] = useState<string>(payment?.invoiceUrl || '')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const { currency } = useCurrency()

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

    const students = user.students || []

    // Auto-select first student if not editing
    React.useEffect(() => {
        if (!payment && students.length > 0 && !selectedStudentId) {
            setSelectedStudentId(students[0].id)
        }
    }, [students, selectedStudentId, payment])

    const selectedStudent = useMemo(() =>
        students.find((s: any) => s.id === selectedStudentId) || (payment?.student),
        [students, selectedStudentId, payment])

    const selectedPackage = useMemo(() =>
        packages.find(p => p.id === selectedPackageId),
        [packages, selectedPackageId])

    const packagePrice = useMemo(() => {
        if (!selectedPackage || !selectedStudent) return null

        const age = differenceInYears(new Date(), new Date(selectedStudent.dob))
        const priceEntry = selectedPackage.prices.find((p: any) =>
            age >= p.ageGroup.minAge && age <= p.ageGroup.maxAge
        )

        return priceEntry ? priceEntry.price : null
    }, [selectedPackage, selectedStudent])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            studentId: selectedStudentId,
            packageId: selectedPackageId,
            amount: formData.get('amount'),
            method: formData.get('method'),
            reference: formData.get('reference'),
            invoiceUrl: invoiceUrl,
            expiryDate: formData.get('expiryDate'),
            status: formData.get('status') || undefined
        }

        const res = payment
            ? await updatePayment(payment.id, data)
            : await createPayment(data)

        setLoading(false)
        if (res.success) {
            toast({
                title: payment ? "Payment Updated" : "Payment Recorded",
                description: payment ? "Changes saved successfully." : "Package assigned successfully."
            })
            setIsOpen(false)
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const defaultExpiry = payment?.studentPackage?.expiryDate
        ? format(new Date(payment.studentPackage.expiryDate), 'yyyy-MM-dd')
        : format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {payment ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <CreditCard className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        Add Payment / Invoice
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{payment ? 'Edit Payment' : 'Add Payment & Assign Package'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId} required disabled={!!payment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                ))}
                                {payment && !students.find((s: any) => s.id === payment.studentId) && (
                                    <SelectItem value={payment.studentId}>{payment.student.name}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Package</Label>
                        <Select value={selectedPackageId} onValueChange={setSelectedPackageId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Package" />
                            </SelectTrigger>
                            <SelectContent>
                                {packages.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({p.creditCount} credits)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedPackage && selectedStudent && (
                        <div className="p-3 bg-muted rounded-lg text-sm">
                            <div className="flex justify-between">
                                <span>Calculated Price ({differenceInYears(new Date(), new Date(selectedStudent.dob))}yo):</span>
                                <span className="font-bold">
                                    {packagePrice !== null ? `${symbol}${Number(packagePrice)}` : "No price found for this age"}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount ({symbol})</Label>
                            <Input
                                name="amount"
                                type="number"
                                step="0.01"
                                defaultValue={payment ? Number(payment.amount) : (packagePrice ? Number(packagePrice) : '')}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input
                                name="expiryDate"
                                type="date"
                                defaultValue={defaultExpiry}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <Select name="status" defaultValue={payment?.status || "COMPLETED"}>
                                <SelectTrigger className={payment?.status === 'PENDING' ? "text-destructive font-bold" : ""}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPLETED">Completed / Paid</SelectItem>
                                    <SelectItem value="PENDING">Pending / Outstanding</SelectItem>
                                    {payment?.status === 'CANCELLED' && <SelectItem value="CANCELLED">Cancelled</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select name="method" defaultValue={(payment?.method === 'OUTSTANDING' ? 'transfer' : payment?.method) || "transfer"}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="card">Card / Gateway</SelectItem>
                                    <SelectItem value="OUTSTANDING" disabled={!payment || payment.status !== 'PENDING'}>Outstanding / Debt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference / Note</Label>
                        <Input name="reference" placeholder="e.g. Receipt #1234" defaultValue={payment?.reference || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label>Invoice # / File Upload</Label>
                        <FileUpload
                            value={invoiceUrl ? [invoiceUrl] : []}
                            onChange={(urls) => setInvoiceUrl(urls[0] || "")}
                            label="Upload Invoice"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Processing..." : (payment ? "Save Changes" : "Confirm Payment")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    )
}
