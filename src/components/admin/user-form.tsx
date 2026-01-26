'use client'

import { createUserWithFamily, updateUserWithFamily } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Trash2, CalendarIcon } from "lucide-react"
import ImageUpload from "@/components/ui/image-upload"
import { format } from "date-fns"

// Full list of country codes (Top 50+ or common ones)
const COUNTRY_CODES = [
    { code: "+60", label: "Malaysia (+60)" },
    { code: "+1", label: "USA/Canada (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+65", label: "Singapore (+65)" },
    { code: "+61", label: "Australia (+61)" },
    { code: "+971", label: "UAE (+971)" },
    { code: "+86", label: "China (+86)" },
    { code: "+91", label: "India (+91)" },
    { code: "+62", label: "Indonesia (+62)" },
    { code: "+81", label: "Japan (+81)" },
    { code: "+82", label: "Korea (+82)" },
    { code: "+66", label: "Thailand (+66)" },
    { code: "+84", label: "Vietnam (+84)" },
    { code: "+33", label: "France (+33)" },
    { code: "+49", label: "Germany (+49)" },
    { code: "+39", label: "Italy (+39)" },
    { code: "+31", label: "Netherlands (+31)" },
    { code: "+7", label: "Russia (+7)" },
    { code: "+34", label: "Spain (+34)" },
    { code: "+41", label: "Switzerland (+41)" },
    { code: "+90", label: "Turkey (+90)" },
    // Add generic "Other" if needed or use extensive list later
]

export default function UserForm({ user }: { user?: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Parent State
    const [countryCode1, setCountryCode1] = useState(user?.profile?.phone?.split(' ')[0] || "+60")
    const [phone1, setPhone1] = useState(user?.profile?.phone?.split(' ')[1] || "")

    const [countryCode2, setCountryCode2] = useState(user?.profile?.phone2?.split(' ')[0] || "+60")
    const [phone2, setPhone2] = useState(user?.profile?.phone2?.split(' ')[1] || "")

    // Students State
    const [students, setStudents] = useState<any[]>(user?.students || [])

    const addStudent = () => {
        setStudents([...students, {
            name: "",
            studentCode: "",
            dob: "",
            level: 1,
            medicalInfo: "",
            waiverSigned: false,
            waiverFile: ""
        }])
    }

    const removeStudent = (index: number) => {
        const newStudents = [...students]
        newStudents.splice(index, 1)
        setStudents(newStudents)
    }

    const updateStudent = (index: number, field: string, value: any) => {
        const newStudents = [...students]
        newStudents[index] = { ...newStudents[index], [field]: value }
        setStudents(newStudents)
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            role: "PARENT",
            phone: `${countryCode1} ${phone1}`,
            phone2: phone2 ? `${countryCode2} ${phone2}` : "",
            marketingSource: formData.get('marketingSource'),
            trialDate: formData.get('trialDate'),
            students: students // Pass updated student objects
        }

        const result = user
            ? await updateUserWithFamily(user.id, data)
            : await createUserWithFamily(data)

        if (result.success) {
            toast({ title: user ? "User Updated" : "User Created" })
            router.push("/dashboard/users")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="bg-card p-6 md:p-8 rounded-xl border shadow-sm space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Parent / Guardian Details</h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="name">Parent Full Name *</Label>
                        <Input name="name" id="name" defaultValue={user?.name} required placeholder="e.g. John Doe" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input name="email" id="email" type="email" defaultValue={user?.email} required placeholder="e.g. john@example.com" />
                    </div>

                    {/* Phone 1 */}
                    <div>
                        <Label>Contact Number (1) *</Label>
                        <div className="flex gap-2">
                            <Select value={countryCode1} onValueChange={setCountryCode1}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                value={phone1}
                                onChange={e => setPhone1(e.target.value)}
                                placeholder="123456789"
                                required
                                className="flex-1"
                            />
                        </div>
                    </div>

                    {/* Phone 2 */}
                    <div>
                        <Label>Contact Number (2)</Label>
                        <div className="flex gap-2">
                            <Select value={countryCode2} onValueChange={setCountryCode2}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COUNTRY_CODES.map(c => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input
                                value={phone2}
                                onChange={e => setPhone2(e.target.value)}
                                placeholder="Optional"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="marketingSource">Where did you hear about us?</Label>
                        <Select name="marketingSource" defaultValue={user?.profile?.marketingSource || "Google"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Google">Google Search</SelectItem>
                                <SelectItem value="Instagram">Instagram / Facebook</SelectItem>
                                <SelectItem value="Friend">Friend Referral</SelectItem>
                                <SelectItem value="WalkIn">Walk In</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="trialDate">Date for Trial Class</Label>
                        <Input
                            type="date"
                            name="trialDate"
                            id="trialDate"
                            defaultValue={user?.profile?.trialDate ? format(new Date(user.profile.trialDate), 'yyyy-MM-dd') : ''}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Kids / Students</h3>
                    <Button type="button" onClick={addStudent} size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Kid
                    </Button>
                </div>

                {students.map((student, index) => (
                    <div key={index} className="bg-card p-6 rounded-xl border shadow-sm relative animate-in fade-in slide-in-from-top-4">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-destructive hover:bg-destructive/10"
                            onClick={() => removeStudent(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <Label>Kid {index + 1} Full Name</Label>
                                <Input
                                    value={student.name}
                                    onChange={e => updateStudent(index, 'name', e.target.value)}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label>Student ID (Optional)</Label>
                                    <Input
                                        value={student.studentCode || ''}
                                        onChange={e => updateStudent(index, 'studentCode', e.target.value)}
                                        placeholder="PK..."
                                    />
                                </div>
                                <div className="w-24">
                                    <Label>Level</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={student.level || 1}
                                        onChange={e => updateStudent(index, 'level', parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Date of Birth</Label>
                                <Input
                                    type="date"
                                    value={student.dob ? format(new Date(student.dob), 'yyyy-MM-dd') : ''}
                                    onChange={e => updateStudent(index, 'dob', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Health / Medical Concerns</Label>
                                <Textarea
                                    value={student.medicalInfo || ''}
                                    onChange={e => updateStudent(index, 'medicalInfo', e.target.value)}
                                    placeholder="Physical/mental concerns we should know about..."
                                />
                            </div>

                            <div className="md:col-span-2 border-t pt-4">
                                <Label className="block mb-2 font-semibold">Waiver Form</Label>
                                <div className="flex items-center gap-4 mb-4">
                                    <Checkbox
                                        id={`waiver-${index}`}
                                        checked={student.waiverSigned}
                                        onChange={(e) => updateStudent(index, 'waiverSigned', e.target.checked)}
                                    />
                                    <Label htmlFor={`waiver-${index}`} className="font-normal cursor-pointer">
                                        Waiver Signed?
                                    </Label>
                                </div>

                                <Label className="text-xs text-muted-foreground mb-2 block">Upload Waiver (PDF/Image)</Label>
                                <ImageUpload
                                    value={student.waiverFile ? [student.waiverFile] : []}
                                    onChange={(urls) => updateStudent(index, 'waiverFile', urls[0] || "")}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {students.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                        No kids added yet. Click "Add Kid" to register a student.
                        <br />
                        <span className="text-xs italic">(For adults, add yourself as a kid too!)</span>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : user ? "Update Family" : "Create Family"}
                </Button>
            </div>
        </form>
    )
}
