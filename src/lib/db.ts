import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient | undefined
}

const getUrl = () => {
    let url = process.env.STORAGE_POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    if (url && url.includes('pooler.ap-southeast-1.aws.neon.tech') && !url.includes('pgbouncer=true')) {
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true'
    }
    return url
}

export const db = globalThis.prisma || new PrismaClient({
    datasourceUrl: getUrl()
})

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
