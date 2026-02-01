'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { updateMyProfile } from "@/actions/profile"

export default function ProfileForm({ user }: { user: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Parent State
    const [name, setName] = useState(user?.name || "")
    const [email, setEmail] = useState(user?.email || "")
    const [phone1, setPhone1] = useState(user?.profile?.phone || "")
    const [phone2, setPhone2] = useState(user?.profile?.phone2 || "")

    // Students State
    const [students, setStudents] = useState<any[]>(user?.students || [])

    const addStudent = () => {
        setStudents([...students, {
            name: "",
            dob: "",
            medicalInfo: ""
        }])
    }

    const removeStudent = (index: number) => {
        // Note: This only removes from UI state. 
        // Real deletion usually requires a separate delete action or more complex sync logic.
        // For MVP we just hide/remove from array. If ID exists, it won't be sent to update, so it remains unchanged in DB 
        // unless we handle deletion explicitly.
        // My updateMyProfile action only iterates "validated.students". It doesn't delete missing ones.
        // So removing here effectively does "nothing" to existing students in DB, but prevents adding new empty ones.
        // Users might be confused if they "delete" and it comes back.
        // Let's filter visually for now, but ideally we add 'deleted' flag.

        // For now: allow removing *new* unsaved students. 
        // Existing students? Maybe disallow removal or require admin contact?
        const s = students[index]
        if (s.id) {
            alert("To remove an existing student record, please contact support or an admin.")
            return
        }

        const newStudents = [...students]
        newStudents.splice(index, 1)
        setStudents(newStudents)
    }

    const updateStudent = (index: number, field: string, value: any) => {
        const newStudents = [...students]
        newStudents[index] = { ...newStudents[index], [field]: value }
        setStudents(newStudents)
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsSubmitting(true)

        const data = {
            name,
            email,
            phone: phone1,
            phone2,
            students
        }

        const result = await updateMyProfile(data)

        if (result.success) {
            toast({ title: "Profile Updated" })
            router.refresh()
            setIsSubmitting(false)
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-4xl">
            <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">My Details</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label>Parent Full Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Email Address</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Contact Number (1)</Label>
                        <Input value={phone1} onChange={e => setPhone1(e.target.value)} placeholder="+60..." required />
                    </div>
                    <div>
                        <Label>Contact Number (2)</Label>
                        <Input value={phone2} onChange={e => setPhone2(e.target.value)} placeholder="Optional" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">My Kids / Students</h3>
                    <Button type="button" onClick={addStudent} size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Kid
                    </Button>
                </div>

                {students.map((student, index) => (
                    <div key={index} className="bg-card p-6 rounded-xl border shadow-sm relative">
                        {!student.id && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
                                onClick={() => removeStudent(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Student Name</Label>
                                <Input
                                    value={student.name}
                                    onChange={e => updateStudent(index, 'name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <Label>Date of Birth</Label>
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {student.dob ? (() => {
                                            const age = new Date().getFullYear() - new Date(student.dob).getFullYear()
                                            const m = new Date().getMonth() - new Date(student.dob).getMonth()
                                            const finalAge = (m < 0 || (m === 0 && new Date().getDate() < new Date(student.dob).getDate())) ? age - 1 : age
                                            return finalAge >= 0 ? `${finalAge} years old` : 'Invlaid Date'
                                        })() : 'Age --'}
                                    </span>
                                </div>
                                <Input
                                    type="date"
                                    value={student.dob ? format(new Date(student.dob), 'yyyy-MM-dd') : ''}
                                    onChange={e => updateStudent(index, 'dob', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Medical Info / Allergies</Label>
                                <Textarea
                                    value={student.medicalInfo || ''}
                                    onChange={e => updateStudent(index, 'medicalInfo', e.target.value)}
                                    placeholder="None"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
}
