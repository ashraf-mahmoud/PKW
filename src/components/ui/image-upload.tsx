'use client'

import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
    value: string[]
    onChange: (value: string[]) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
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
            toast({ title: "Image Uploaded" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" })
        } finally {
            setIsUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[150px] rounded-lg overflow-hidden border bg-muted">
                        <div className="absolute top-2 right-2 z-10">
                            <Button type="button" onClick={() => removeImage(url)} variant="destructive" size="icon" className="h-6 w-6">
                                <X size={14} />
                            </Button>
                        </div>
                        <Image fill style={{ objectFit: 'cover' }} alt="Location Image" src={url} />
                    </div>
                ))}
            </div>
            <div>
                <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Image"}
                </Button>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                />
            </div>
        </div>
    )
}
