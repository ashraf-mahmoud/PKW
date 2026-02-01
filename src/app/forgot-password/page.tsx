'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPassword } from '@/actions/auth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const res = await forgotPassword(email)
        setMessage(res.message || "Request processed")
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl border border-border shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                placeholder="name@example.com"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-500/10 text-green-600 rounded-lg">
                            {message}
                        </div>
                        <p className="text-xs text-muted-foreground">Check your server console for the simulated link.</p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                )}

                {!message && (
                    <div className="text-center text-sm">
                        <Link href="/login" className="underline hover:text-primary">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
