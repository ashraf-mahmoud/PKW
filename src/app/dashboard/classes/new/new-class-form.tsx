'use client'

import { createClassTemplate } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function NewClassForm({ types }: { types: any[] }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [type, setType] = useState(types[0]?.id || "")

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        formData.set('type', type)

        const result = await createClassTemplate(formData)

        if (result.success) {
            toast({ title: "Success", description: "Class template created" })
            router.push("/dashboard/classes")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error || "Unknown error", variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 bg-card p-8 rounded-xl border shadow-sm">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Class Name</Label>
                    <Input name="name" id="name" placeholder="e.g. Parkour Level 1 (Kids)" required />
                </div>

                <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea name="description" id="description" placeholder="What will students learn?" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                                {types.length === 0 && (
                                    <SelectItem value="none" disabled>No types defined</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="durationMin">Duration (Minutes)</Label>
                        <Input type="number" name="durationMin" defaultValue="60" min="30" step="15" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="ageMin">Min Age</Label>
                        <Input type="number" name="ageMin" defaultValue="7" min="3" required />
                    </div>
                    <div>
                        <Label htmlFor="ageMax">Max Age</Label>
                        <Input type="number" name="ageMax" defaultValue="12" min="3" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="levelMin">Min Level</Label>
                        <Input type="number" name="levelMin" defaultValue="1" min="1" max="6" required />
                    </div>
                    <div>
                        <Label htmlFor="levelMax">Max Level</Label>
                        <Input type="number" name="levelMax" defaultValue="1" min="1" max="6" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Base Price</Label>
                        <Input type="number" name="price" defaultValue="50" min="0" step="0.01" required />
                    </div>
                    <div>
                        <Label htmlFor="capacity">Default Capacity</Label>
                        <Input type="number" name="capacity" defaultValue="15" min="1" required />
                    </div>
                </div>

                <div>
                    <Label htmlFor="color">Timeline Color</Label>
                    <div className="flex gap-4 items-center mt-2">
                        <Input
                            type="color"
                            name="color"
                            id="color"
                            defaultValue="#3b82f6"
                            className="w-20 h-10 p-1 cursor-pointer"
                        />
                        <span className="text-sm text-muted-foreground">Select a color to represent this class on the timetable.</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Template"}
                </Button>
            </div>
        </form>
    )
}
