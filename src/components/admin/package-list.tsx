'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { upsertPackage, deletePackage } from "@/actions/packages"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { useCurrency } from "@/components/providers/currency-provider"

const PACKAGE_TYPES = [
    { value: "TRIAL", label: "Trial (Once)" },
    { value: "MONTHLY_4", label: "Monthly (4 Credits)" },
    { value: "MONTHLY_8", label: "Monthly (8 Credits)" },
    { value: "UNLIMITED", label: "Unlimited" },
    { value: "EXTRA", label: "Add-on / Extra" },
]

export default function PackageList({ initialPackages, ageGroups }: { initialPackages: any[], ageGroups: any[] }) {
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

    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const { toast } = useToast()
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Collect prices
        const prices: Record<string, number> = {}
        ageGroups.forEach(g => {
            const p = formData.get(`price_${g.id}`)
            if (p) prices[g.id] = Number(p)
        })

        const data = {
            id: editing?.id,
            name: formData.get('name'),
            type: formData.get('type'),
            creditCount: formData.get('creditCount'),
            validityDays: formData.get('validityDays'),
            prices
        }

        const res = await upsertPackage(data)
        if (res.success) {
            toast({ title: "Saved successfully" })
            setIsOpen(false)
            setEditing(null)
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure?")) return
        const res = await deletePackage(id)
        if (res.success) {
            toast({ title: "Deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const openEdit = (pkg: any) => {
        setEditing(pkg)
        setIsOpen(true)
    }

    const openNew = () => {
        setEditing({
            type: "MONTHLY_4",
            creditCount: 4,
            validityDays: 30
        })
        setIsOpen(true)
    }

    const getPriceForGroup = (pkg: any, groupId: string) => {
        return pkg?.prices?.find((p: any) => p.ageGroupId === groupId)?.price || ''
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Packages</h2>
                <Button onClick={openNew}>
                    <Plus className="mr-2 h-4 w-4" /> Create Package
                </Button>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Pricing Overview</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialPackages.map((pkg) => (
                            <TableRow key={pkg.id}>
                                <TableCell className="font-medium">{pkg.name}</TableCell>
                                <TableCell>{PACKAGE_TYPES.find(t => t.value === pkg.type)?.label || pkg.type}</TableCell>
                                <TableCell>{pkg.creditCount}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {pkg.prices.map((p: any) => (
                                        <div key={p.id}>
                                            {p.ageGroup?.name}: {symbol}{Number(p.price)}
                                        </div>
                                    ))}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="icon" variant="ghost" onClick={() => openEdit(pkg)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(pkg.id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing?.id ? "Edit Package" : "New Package"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Package Name</Label>
                                <Input name="name" defaultValue={editing?.name} placeholder="e.g. Kids Basic (4 Classes)" required />
                            </div>

                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Input
                                    name="type"
                                    defaultValue={editing?.type || "MONTHLY_4"}
                                    placeholder="e.g. MONTHLY_4, SUMMER_CAMP"
                                    required
                                    list="package-types"
                                />
                                <datalist id="package-types">
                                    {PACKAGE_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </datalist>
                            </div>

                            <div className="space-y-2">
                                <Label>Credits</Label>
                                <Input type="number" name="creditCount" defaultValue={editing?.creditCount} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Validity (Days)</Label>
                                <Input type="number" name="validityDays" defaultValue={editing?.validityDays} required />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Pricing per Age Group</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {ageGroups.map(group => (
                                    <div key={group.id} className="space-y-2 border p-3 rounded bg-muted/20">
                                        <Label className="text-xs uppercase text-muted-foreground">{group.name} Price ({symbol})</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            name={`price_${group.id}`}
                                            placeholder="0.00"
                                            defaultValue={getPriceForGroup(editing, group.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Package</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
