'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { upsertAgeGroup, deleteAgeGroup } from "@/actions/age-groups"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

export default function AgeGroupList({ initialGroups }: { initialGroups: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const { toast } = useToast()
    const router = useRouter()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = {
            id: editing?.id,
            name: formData.get('name'),
            minAge: formData.get('minAge'),
            maxAge: formData.get('maxAge')
        }

        const res = await upsertAgeGroup(data)
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
        const res = await deleteAgeGroup(id)
        if (res.success) {
            toast({ title: "Deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const openEdit = (group: any) => {
        setEditing(group)
        setIsOpen(true)
    }

    const openNew = () => {
        setEditing(null)
        setIsOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Age Groups</h2>
                <Button onClick={openNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Age Group
                </Button>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Min Age</TableHead>
                            <TableHead>Max Age</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialGroups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell className="font-medium">{group.name}</TableCell>
                                <TableCell>{group.minAge} years</TableCell>
                                <TableCell>{group.maxAge} years</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="icon" variant="ghost" onClick={() => openEdit(group)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(group.id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialGroups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No age groups defined.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Age Group" : "New Age Group"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Group Name</Label>
                            <Input name="name" defaultValue={editing?.name} placeholder="e.g. Kids (5-8)" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Age</Label>
                                <Input type="number" name="minAge" defaultValue={editing?.minAge} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Age</Label>
                                <Input type="number" name="maxAge" defaultValue={editing?.maxAge} required />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
