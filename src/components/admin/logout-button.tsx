'use client'

import React, { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
    className?: string
    children?: React.ReactNode
    variant?: 'sidebar' | 'header' | 'mobile'
}

export default function LogoutButton({ className, children, variant = 'header' }: LogoutButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        setLoading(true)
        try {
            const { logout } = await import('@/actions/auth')
            await logout()
        } catch (error) {
            console.error("Logout failed:", error)
            setLoading(false)
            setOpen(false)
        }
    }

    // Common trigger logic
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setOpen(true)
    }

    if (variant === 'sidebar') {
        return (
            <>
                <button
                    onClick={handleClick}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-red-500 hover:text-destructive",
                        className
                    )}
                >
                    <LogOut className="h-5 w-5" />
                    Log Out
                </button>

                <LogoutConfirmDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} loading={loading} />
            </>
        )
    }

    if (variant === 'mobile') {
        return (
            <>
                <button
                    onClick={handleClick}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 h-11 px-8 rounded-md border border-destructive text-destructive font-medium hover:bg-destructive/10 transition-colors",
                        className
                    )}
                >
                    Log Out
                </button>
                <LogoutConfirmDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} loading={loading} />
            </>
        )
    }

    // Default: Header dropdown item style or custom child
    return (
        <>
            <div
                onClick={handleClick}
                className={cn("cursor-pointer w-full", className)}
            >
                {children || "Log Out"}
            </div>
            <LogoutConfirmDialog open={open} onOpenChange={setOpen} onConfirm={handleLogout} loading={loading} />
        </>
    )
}

function LogoutConfirmDialog({ open, onOpenChange, onConfirm, loading }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    loading: boolean
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="z-[100]">
                <AlertDialogHeader>
                    <AlertDialogTitle>Log Out</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to log out?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Log Out
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
