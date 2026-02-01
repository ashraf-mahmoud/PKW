import { LayoutDashboard, Calendar, Users, Settings, MapPin, Package, DollarSign, History as AuditHistory } from "lucide-react"

export const dashboardLinks = [
    { href: "/dashboard/classes", label: "Classes", icon: Calendar },
    { href: "/dashboard/bookings", label: "Bookings", icon: Package },
    { href: "/dashboard/locations", label: "Locations", icon: MapPin },
    { href: "/dashboard/coaches", label: "Coaches", icon: Users },
]

export const adminLinks = [
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/payments", label: "Payments", icon: DollarSign },
    { href: "/dashboard/settings/packages", label: "Packages", icon: Package },
    { href: "/dashboard/settings/age-groups", label: "Age Groups", icon: Settings },
    { href: "/dashboard/history", label: "History", icon: AuditHistory },
]

export const parentLinks = [
    { href: "/dashboard/book", label: "Book a Class", icon: Calendar },
    { href: "/dashboard/my-bookings", label: "My Bookings", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: Users },
    { href: "/dashboard/progress", label: "Progress", icon: Calendar },
]
