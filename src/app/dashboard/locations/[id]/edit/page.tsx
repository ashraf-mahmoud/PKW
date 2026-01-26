import { getLocation } from "@/actions/locations"
import LocationForm from "@/components/admin/location-form"
import { notFound } from "next/navigation"

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const location = await getLocation(id)

    if (!location) return notFound()

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display mb-2">Edit Location</h1>
                <p className="text-muted-foreground">Update details for {location.name}.</p>
            </div>
            <LocationForm location={location} />
        </div>
    )
}
