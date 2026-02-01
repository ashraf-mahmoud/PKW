const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const logs = await prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' }
    })

    console.log("Simulating Component Render:")
    logs.forEach(log => {
        console.log(`--- Action: ${log.action} ---`)
        const details = log.details

        if (!details) {
            console.log("Result: '-' (details is null)")
            return
        }

        try {
            const parsed = JSON.parse(details)
            // console.log("Parsed Object:", parsed)

            if (typeof parsed === 'object') {
                const runs = []

                // 1. Payment Amount
                const isPayment = parsed.amount !== undefined
                if (isPayment) {
                    runs.push(`[BOLD: $${Number(parsed.amount).toFixed(2)}]`)
                }

                // 2. Package
                if (parsed.package) {
                    runs.push(`[Text: ${parsed.package}]`)
                }

                // 3. Summary (only if not payment)
                if (parsed.summary && !isPayment) {
                    runs.push(`[Summary: ${parsed.summary}]`)
                }

                // 4. Other keys
                const otherKeys = Object.entries(parsed).map(([key, value]) => {
                    if (key === 'amount' || key === 'package' || key === 'summary') return null
                    return `[Tag: ${key}=${JSON.stringify(value)}]`
                }).filter(Boolean)

                if (otherKeys.length > 0) {
                    runs.push(...otherKeys)
                }

                if (runs.length === 0) {
                    console.log("Result: [EMPTY RENDER]")
                } else {
                    console.log("Result:", runs.join(" "))
                }
            } else {
                console.log("Result (Not Object):", details)
            }

        } catch (e) {
            console.log("Result (Parse Error):", details)
        }
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
