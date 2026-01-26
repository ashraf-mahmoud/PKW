'use client'

import { createAgeGroup, deleteAgeGroup, getAgeGroups } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Plus } from "lucide-react"
import { useState, useEffect } from "react"

export default function AgeGroupsPage() {
    const { toast } = useToast()
    const [groups, setGroups] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    async function loadGroups() {
        // We call the server action directly
        // In a real app we might pass initial data via props, but this is fine for now
        const data = await getAgeGroups()
        setGroups(data)
        setIsLoading(false)
    }

    useEffect(() => {
        loadGroups()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const res = await createAgeGroup(formData)

        if (res.success) {
            toast({ title: "Group Added" })
            loadGroups()
            // Reset form
            e.currentTarget.reset()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this group?")) return
        const res = await deleteAgeGroup(id)
        if (res.success) {
            loadGroups()
        } else {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-display">Age Groups</h1>
                <p className="text-muted-foreground">Define age groups for filtering (e.g. "3-4", "Adults").</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="md:col-span-1">
                    <div className="bg-card p-6 rounded-xl border shadow-sm">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <Plus size={16} /> Add Group
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Label (e.g. "Kids")</Label>
                                <Input name="name" placeholder="Kids" required />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Min Age</Label>
                                    <Input name="minAge" type="number" placeholder="5" required />
                                </div>
                                <div>
                                    <Label>Max Age</Label>
                                    <Input name="maxAge" type="number" placeholder="8" required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Group</Button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="font-bold">Existing Groups</h2>
                    {isLoading ? <p>Loading...</p> : (
                        groups.length === 0 ? <p className="text-muted-foreground">No groups defined.</p> :
                            <div className="grid gap-3">
                                {groups.map(g => (
                                    <div key={g.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                        <div>
                                            <p className="font-bold">{g.name}</p>
                                            <p className="text-sm text-muted-foreground">{g.minAge} - {g.maxAge} years old</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)} className="text-destructive">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                    )}
                </div>
            </div>
        </div>
    )
}
