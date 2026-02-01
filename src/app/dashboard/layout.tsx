import { auth } from '@/auth'
import Link from 'next/link'
import { LayoutDashboard } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import LogoutButton from '@/components/admin/logout-button'
import { dashboardLinks, adminLinks, parentLinks } from "@/config/dashboard-nav"
import MobileNav from "@/components/layout/mobile-nav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex min-h-screen bg-background flex-col md:flex-row">
            {/* Mobile Navigation */}
            <MobileNav user={user as any} />

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-card border-r border-border p-8 flex-col fixed inset-y-0 left-0 z-30">
                <div className="font-display font-bold text-2xl mb-8 text-primary">PKW Admin</div>

                <div className="mb-8 pb-8 border-b border-border">
                    <div className="font-semibold">{user?.name || 'User'}</div>
                    <div className="text-sm text-muted-foreground">{user?.role || 'Guest'}</div>
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Link>

                    {user?.role === 'ADMIN' && (
                        <>
                            <div className="mt-4 mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">Manage</div>
                            {dashboardLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}
                            {adminLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
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
                                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                            ))}
                        </>
                    )}
                </nav>

                <div className="mt-auto space-y-2 pt-4 border-t border-border">
                    <LogoutButton variant="sidebar" />

                    <Link href="/" className="px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground block flex items-center gap-3">
                        <span className="w-5" /> {/* Spacer for alignment if using icon, or just text */}
                        Back Home
                    </Link>
                </div>
            </aside >

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 bg-background md:ml-64 w-full">
                {children}
            </main>
            <Toaster />
        </div >
    )
}
