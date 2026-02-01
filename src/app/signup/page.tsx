

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { signUp } from '@/actions/auth'
import Link from 'next/link'
import { AlertCircle, MessageCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [phone2, setPhone2] = useState('')

    // Parent Waiver
    const [waiverSigned, setWaiverSigned] = useState(false)

    // Optional Student
    const [addStudent, setAddStudent] = useState(false)
    const [studentName, setStudentName] = useState('')
    const [studentDob, setStudentDob] = useState('')
    const [studentMedicalInfo, setStudentMedicalInfo] = useState('')
    const [studentWaiverSigned, setStudentWaiverSigned] = useState(false)

    // Health Warning State
    const [showHealthWarning, setShowHealthWarning] = useState(false)
    const [hasMedicalCondition, setHasMedicalCondition] = useState<boolean | null>(null)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleMedicalConditionChange = (val: boolean) => {
        setHasMedicalCondition(val)
        if (val) {
            setShowHealthWarning(true)
        } else {
            setStudentMedicalInfo('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!waiverSigned) {
            setError("You must sign the waiver to proceed.")
            return
        }

        if (addStudent && !studentWaiverSigned) {
            setError("You must sign the student waiver to proceed.")
            return
        }

        if (addStudent && hasMedicalCondition && !studentMedicalInfo) {
            setError("Please description the medical condition.")
            return
        }

        setLoading(true)

        const res = await signUp({
            name,
            email,
            password,
            phone,
            phone2,
            waiverSigned,
            studentName: addStudent ? studentName : undefined,
            studentDob: addStudent ? studentDob : undefined,
            studentMedicalInfo: addStudent ? studentMedicalInfo : undefined,
            studentWaiverSigned: addStudent ? studentWaiverSigned : undefined,
            role: "PARENT"
        })

        if (res.success) {
            router.push('/login?signedUp=true')
        } else {
            setError(res.error || "Signup failed")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
            <div className="w-full max-w-lg p-8 space-y-8 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Join Parkour Academy</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                value={name} onChange={e => setName(e.target.value)} required
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact (1)</label>
                                <Input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+60..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contact (2)</label>
                                <Input value={phone2} onChange={e => setPhone2(e.target.value)} required placeholder="+60..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-start space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="waiver"
                                checked={waiverSigned}
                                onChange={e => setWaiverSigned(e.target.checked)}
                                className="mt-1 rounded border-gray-300"
                                required
                            />
                            <label htmlFor="waiver" className="text-xs text-muted-foreground">
                                I acknowledge and agree to the <span className="underline text-primary">Terms of Service and Liability Waiver</span> for myself.
                            </label>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="addStudent"
                                    checked={addStudent}
                                    onChange={e => setAddStudent(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="addStudent" className="text-sm font-medium">I want to add a child now</label>
                            </div>
                        </div>

                        {addStudent && (
                            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Child Name</label>
                                    <Input
                                        value={studentName} onChange={e => setStudentName(e.target.value)}
                                        required={addStudent}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date of Birth</label>
                                    <Input
                                        type="date" value={studentDob} onChange={e => setStudentDob(e.target.value)}
                                        required={addStudent}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium block">Does the child have any medical or health concerns?</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors w-full">
                                            <input
                                                type="radio"
                                                name="hasMedical"
                                                checked={hasMedicalCondition === false}
                                                onChange={() => handleMedicalConditionChange(false)}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">No</span>
                                        </label>
                                        <label className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors w-full">
                                            <input
                                                type="radio"
                                                name="hasMedical"
                                                checked={hasMedicalCondition === true}
                                                onChange={() => handleMedicalConditionChange(true)}
                                                className="text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm">Yes</span>
                                        </label>
                                    </div>
                                </div>

                                {hasMedicalCondition && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-sm font-medium">Please provide details:</label>
                                        <Textarea
                                            value={studentMedicalInfo}
                                            onChange={(e) => setStudentMedicalInfo(e.target.value)}
                                            placeholder="e.g. ADHD, Allergies, Previous Injuries..."
                                            className="h-24"
                                            required={hasMedicalCondition}
                                        />
                                    </div>
                                )}

                                <div className="flex items-start space-x-2">
                                    <input
                                        type="checkbox"
                                        id="studentWaiver"
                                        checked={studentWaiverSigned}
                                        onChange={e => setStudentWaiverSigned(e.target.checked)}
                                        className="mt-1 rounded border-gray-300"
                                        required={addStudent}
                                    />
                                    <label htmlFor="studentWaiver" className="text-xs text-muted-foreground">
                                        I am the legal guardian of this child and agree to the <span className="underline text-primary">Liability Waiver</span> on their behalf.
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    Already have an account? <Link href="/login" className="underline hover:text-primary">Sign In</Link>
                </div>

                <Dialog open={showHealthWarning} onOpenChange={setShowHealthWarning}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="h-5 w-5" />
                                Special Consideration Required
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-left space-y-3">
                                <p>
                                    For students with specific health concerns (such as ADHD, Autism, Down Syndrome, etc.), we require a consultation to ensure we can provide the best and safest environment.
                                </p>
                                <p>
                                    Please contact us directly on WhatsApp before booking group sessions:
                                </p>
                                <Button variant="whatsapp" className="w-full" asChild>
                                    <a href="https://wa.me/60104214215" target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Chat with Us (+60 10-421 4215)
                                    </a>
                                </Button>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowHealthWarning(false)}>
                                I Understand
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
