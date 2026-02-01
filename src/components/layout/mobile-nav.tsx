'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet" // We need to verify if Sheet exists, if not we might use Dialog or implement simple drawer
import { dashboardLinks, adminLinks, parentLinks } from "@/config/dashboard-nav"
import LogoutButton from "@/components/admin/logout-button"

interface MobileNavProps {
    user: {
        name?: string | null
        role?: string | null
        email?: string | null
    }
}

export default function MobileNav({ user }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    return (
        <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
            <div className="font-display font-bold text-xl text-primary">PKW Admin</div>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-border">
                        <SheetTitle className="font-display font-bold text-2xl text-primary text-left">PKW Admin</SheetTitle>
                        <div className="mt-2 text-left">
                            <div className="font-semibold">{user?.name || 'User'}</div>
                            <div className="text-sm text-muted-foreground">{user?.role || 'Guest'}</div>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-auto py-6 px-4">
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/dashboard"
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${pathname === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'}`}
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Overview
                            </Link>

                            {user?.role === 'ADMIN' && (
                                <>
                                    <div className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">Manage</div>
                                    {dashboardLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    ))}
                                    {adminLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    ))}
                                </>
                            )}

                            {user?.role === 'PARENT' && (
                                <>
                                    <div className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">Menu</div>
                                    {parentLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'}`}
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    ))}
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="p-6 border-t border-border space-y-2">
                        <LogoutButton variant="sidebar" />
                        <Link href="/" className="px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground block flex items-center gap-3">
                            <span className="w-5" />
                            Back Home
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
