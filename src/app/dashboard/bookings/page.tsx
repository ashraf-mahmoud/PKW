import { getAllBookings } from "@/actions/admin-booking"
import { getPackages } from "@/actions/packages"
import BookingsTable from "@/components/admin/bookings-table"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function BookingsPage() {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
        redirect('/login')
    }

    const [bookings, packages] = await Promise.all([
        getAllBookings(),
        getPackages()
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-display">Manage All Bookings</h1>
                <p className="text-muted-foreground">View and manage student class registrations across the academy.</p>
            </div>

            <BookingsTable bookings={bookings} packages={packages} />
        </div>
    )
}
