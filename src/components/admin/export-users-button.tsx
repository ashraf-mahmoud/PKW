'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { exportUsersCSV } from "@/actions/export-users"
import { useToast } from "@/hooks/use-toast"

export default function ExportUsersButton() {
    const [isExporting, setIsExporting] = useState(false)
    const { toast } = useToast()

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const csvData = await exportUsersCSV()

            // Create a blob and a download link
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')

            const now = new Date().toISOString().split('T')[0]
            link.setAttribute('href', url)
            link.setAttribute('download', `pkw_users_export_${now}.csv`)
            link.style.visibility = 'hidden'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                title: "Export Successful",
                description: "User data has been downloaded.",
            })
        } catch (error) {
            console.error("Export Error:", error)
            toast({
                title: "Export Failed",
                description: "An error occurred while generating the CSV file.",
                variant: "destructive"
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            Export CSV
        </Button>
    )
}
