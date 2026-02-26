import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient | undefined
}

const getUrl = () => {
    const rawUrl = process.env.POSTGRES_PRISMA_URL || process.env.STORAGE_POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    let url = rawUrl

    if (url && url.includes('pooler') && !url.includes('pgbouncer=true')) {
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
    }

    if (process.env.NODE_ENV === "production" && url) {
        // Log sanitized URL for debugging without exposing credentials
        const sanitized = url.replace(/:[^:]+@/, ':****@')
        console.log(`[Runtime DB Connection]: ${sanitized}`)
    }

    return url
}

export const db = globalThis.prisma || new PrismaClient({
    datasourceUrl: getUrl(),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
})

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
