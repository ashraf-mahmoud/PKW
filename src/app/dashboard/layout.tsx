import { auth } from '@/auth'
import Link from 'next/link'
import { LayoutDashboard, Calendar, Users, Settings, LogOut, MapPin } from "lucide-react"

const dashboardLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/classes", label: "Classes", icon: Calendar },
    { href: "/dashboard/locations", label: "Locations", icon: MapPin },
    { href: "/dashboard/coaches", label: "Coaches", icon: Users },
]

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 bg-card border-r border-border p-8 flex flex-col">
                <div className="font-display font-bold text-2xl mb-8 text-primary">PKW Admin</div>

                <div className="mb-8 pb-8 border-b border-border">
                    <div className="font-semibold">{user?.name || 'User'}</div>
                    <div className="text-sm text-muted-foreground">{user?.role || 'Guest'}</div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {dashboardLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/dashboard/bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                        <Calendar className="h-5 w-5" />
                        Bookings
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <>
                            <Link href="/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                                <Users className="h-5 w-5" />
                                Users
                            </Link>
                            <Link href="/dashboard/settings/age-groups" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground">
                                <Settings className="h-5 w-5" />
                                Age Groups
                            </Link>
                        </>
                    )}
                </nav>

                <div className="mt-auto">
                    <Link href="/" className="px-4 py-3 rounded-lg text-sm transition-colors text-foreground/80 hover:bg-accent hover:text-accent-foreground block">
                        Back Home
                    </Link>
                </div>
            </aside>

            <main className="flex-1 p-8 bg-background">
                {children}
            </main>
        </div>
    )
}
