import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnCoach = req.nextUrl.pathname.startsWith('/coach')

    if (isOnDashboard || isOnAdmin || isOnCoach) {
        if (isLoggedIn) return NextResponse.next()
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }
    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
