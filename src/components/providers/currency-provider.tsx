'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCurrency, setCurrency as updateCurrencyAction } from '@/actions/settings'

type CurrencyContextType = {
    currency: string
    setCurrency: (code: string) => Promise<void>
    isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'USD',
    setCurrency: async () => { },
    isLoading: true
})

export const useCurrency = () => useContext(CurrencyContext)

export function CurrencyProvider({ children, initialCurrency = 'USD' }: { children: React.ReactNode, initialCurrency?: string }) {
    const [currency, setCurrencyState] = useState(initialCurrency)
    const [isLoading, setIsLoading] = useState(true)

    // Optimistic update wrapper
    const setCurrency = async (code: string) => {
        const old = currency
        setCurrencyState(code)

        try {
            await updateCurrencyAction(code)
        } catch (error) {
            console.error("Failed to update currency", error)
            setCurrencyState(old)
        }
    }

    // Hydrate from server on mount if needed, though we prefer passing initial state
    useEffect(() => {
        setIsLoading(false)
    }, [])

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    )
}
