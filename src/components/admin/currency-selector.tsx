'use client'

import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCurrency } from '@/components/providers/currency-provider'

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

export default function CurrencySelector() {
    const { currency, setCurrency } = useCurrency()

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Currency:</span>
            <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                    {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                            <span className="font-mono font-bold mr-2 w-6 inline-block">{c.code}</span>
                            <span className="text-muted-foreground">({c.symbol})</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
