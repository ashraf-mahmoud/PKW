'use client'

import { Button } from "@/components/ui/button"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface FileUploadProps {
    value: string[]
    onChange: (value: string[]) => void
    accept?: string
    label?: string
}

export default function FileUpload({ value, onChange, accept = "*", label = "Upload File" }: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const { toast } = useToast()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error("Upload failed")

            const data = await res.json()
            onChange([...value, data.url])
            toast({ title: "File Uploaded" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload file", variant: "destructive" })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeFile = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {value.map((url) => (
                    <div key={url} className="relative group w-[180px] p-4 rounded-lg border bg-muted flex flex-col items-center justify-center gap-2">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button type="button" onClick={() => removeFile(url)} variant="destructive" size="icon" className="h-5 w-5 rounded-full">
                                <X size={12} />
                            </Button>
                        </div>

                        {isImage(url) ? (
                            <div className="w-full h-20 relative rounded overflow-hidden">
                                <img src={url} alt="Upload" className="object-cover w-full h-full" />
                            </div>
                        ) : (
                            <FileText size={32} className="text-muted-foreground" />
                        )}

                        <Link
                            href={url}
                            target="_blank"
                            className="text-[10px] text-primary hover:underline max-w-full truncate text-center"
                        >
                            View File
                        </Link>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? "Uploading..." : label}
                </Button>
                <input
                    type="file"
                    accept={accept}
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                />
            </div>
        </div>
    )
}
