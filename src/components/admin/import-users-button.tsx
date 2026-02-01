'use client'

import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { importUsersCSV } from "@/actions/import-users"
import { useToast } from "@/hooks/use-toast"

export default function ImportUsersButton() {
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const result = await importUsersCSV(formData)
            if (result.success) {
                toast({
                    title: "Import Successful",
                    description: result.message,
                })
            } else {
                toast({
                    title: "Import Failed",
                    description: result.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Import Error:", error)
            toast({
                title: "Import Error",
                description: "An unexpected error occurred during import.",
                variant: "destructive"
            })
        } finally {
            setIsImporting(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />
            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="gap-2"
            >
                {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4" />
                )}
                Import CSV
            </Button>
        </>
    )
}
