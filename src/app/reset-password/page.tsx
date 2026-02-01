'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirm) {
            alert("Passwords do not match")
            return
        }
        if (!email || !token) {
            alert("Invalid link")
            return
        }

        setStatus('loading')
        const res = await resetPassword(email, password, token)
        if (res.success) {
            setStatus('success')
        } else {
            setStatus('error')
        }
    }

    if (!email || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold">Invalid Link</h1>
                    <Link href="/forgot-password" className="text-primary underline">Try again</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <div className="text-green-600 font-medium">Password updated successfully!</div>
                        <Button asChild className="w-full">
                            <Link href="/login">Sign In Now</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && <div className="text-destructive text-center">Failed to reset password.</div>}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                                type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={status === 'loading'}>
                            {status === 'loading' ? "Updating..." : "Reset Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
