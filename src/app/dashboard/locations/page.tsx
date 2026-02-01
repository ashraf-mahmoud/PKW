import { getLocationsAdmin, deleteLocation } from "@/actions/locations"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trash2, Edit, MapPin } from "lucide-react"

export default async function LocationsPage() {
    const locations = await getLocationsAdmin()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Locations</h1>
                    <p className="text-muted-foreground">Manage gym facilities and event spots.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/locations/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Location
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((loc) => (
                    <div key={loc.id} className="bg-card rounded-xl p-6 border shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full border shadow-sm"
                                        style={{ backgroundColor: loc.color || "#3b82f6" }}
                                    />
                                    {loc.name}
                                </h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/dashboard/locations/${loc.id}/edit`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    {/* Delete Button (Simple form for now) */}
                                    <form action={async () => {
                                        'use server'
                                        await deleteLocation(loc.id)
                                    }}>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{loc.address}</p>
                            {loc.description && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{loc.description}</p>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
                            <span>{(loc as any)._count?.sessions || 0} Sessions Scheduled</span>
                            {loc.googleMapsUrl && (
                                <a href={loc.googleMapsUrl} target="_blank" className="text-primary hover:underline">View Map</a>
                            )}
                        </div>
                    </div>
                ))}

                {locations.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground mb-4">No locations found.</p>
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/locations/new">Add First Location</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
