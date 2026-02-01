import { getPayments } from "@/actions/payments"
import { getPackages } from "@/actions/packages"
import PaymentsTable from "@/components/admin/payments-table"

import CurrencySelector from "@/components/admin/currency-selector"

export default async function PaymentsPage() {
    const [payments, packages] = await Promise.all([
        getPayments(),
        getPackages()
    ])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display">Payments & Invoices</h1>
                    <p className="text-muted-foreground">Monitor all financial transactions and assigned packages.</p>
                </div>
                <CurrencySelector />
            </div>

            <PaymentsTable initialPayments={payments} packages={packages} />
        </div>
    )
}
