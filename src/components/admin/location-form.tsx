'use client'

import ImageUpload from "@/components/ui/image-upload"
import { createLocation, updateLocation } from "@/actions/locations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LocationForm({ location }: { location?: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageUrls, setImageUrls] = useState<string[]>(location?.images?.map((img: any) => img.url) || [])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        formData.append('imageUrls', JSON.stringify(imageUrls))

        const result = location
            ? await updateLocation(location.id, formData)
            : await createLocation(formData)

        if (result.success) {
            toast({ title: location ? "Location Updated" : "Location Created" })
            router.push("/dashboard/locations")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 bg-card p-6 md:p-8 rounded-xl border shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Location Name *</Label>
                        <div className="flex gap-4">
                            <Input name="name" id="name" defaultValue={location?.name} placeholder="e.g. Downtown Gym" className="flex-1" required />
                            <div className="flex flex-col gap-1 items-center">
                                <Input
                                    type="color"
                                    name="color"
                                    id="color"
                                    defaultValue={location?.color || "#3b82f6"}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    title="Timeline Color"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address">Address *</Label>
                        <Textarea name="address" id="address" defaultValue={location?.address} placeholder="Full address" required />
                    </div>
                    <div>
                        <Label htmlFor="googleMapsUrl">Google Maps Link</Label>
                        <Input name="googleMapsUrl" id="googleMapsUrl" defaultValue={location?.googleMapsUrl} placeholder="https://maps.google.com/..." />
                    </div>
                    <div>
                        <Label htmlFor="directionVideoUrl">Direction Video URL</Label>
                        <Input name="directionVideoUrl" id="directionVideoUrl" defaultValue={location?.directionVideoUrl} placeholder="e.g. YouTube/Vimeo link" />
                        <p className="text-xs text-muted-foreground mt-1">Video showing how to find the entrance.</p>
                    </div>

                    <div>
                        <Label className="mb-2 block">Location Photos</Label>
                        <ImageUpload value={imageUrls} onChange={setImageUrls} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea name="description" id="description" defaultValue={location?.description} placeholder="General description of the facility..." className="min-h-[100px]" />
                    </div>
                    <div>
                        <Label htmlFor="attireInfo">Attire / What to Wear</Label>
                        <Textarea name="attireInfo" id="attireInfo" defaultValue={location?.attireInfo} placeholder="e.g. Comfortable sports clothes, clean sneakers..." />
                    </div>
                    <div>
                        <Label htmlFor="rules">Location Rules</Label>
                        <Textarea name="rules" id="rules" defaultValue={location?.rules} placeholder="e.g. No food in the gym, wait in lobby..." className="min-h-[100px]" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : location ? "Update Location" : "Create Location"}
                </Button>
            </div>
        </form>
    )
}
