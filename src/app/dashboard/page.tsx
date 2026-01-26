import { auth } from '@/auth'

export default async function DashboardPage() {
    const session = await auth()

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 font-display">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>

            {/* Stats cards would go here */}
        </div>
    )
}
