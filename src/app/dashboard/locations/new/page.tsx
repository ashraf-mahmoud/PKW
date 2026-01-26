import LocationForm from "@/components/admin/location-form"

export default function NewLocationPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display mb-2">Add Location</h1>
                <p className="text-muted-foreground">Add a new facility or meeting point.</p>
            </div>
            <LocationForm />
        </div>
    )
}
