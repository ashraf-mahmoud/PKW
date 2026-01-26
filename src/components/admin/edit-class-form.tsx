'use client'

import { updateClassTemplate } from "@/actions/classes"
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

export default function EditClassForm({ template }: { template: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [type, setType] = useState(template.type)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        formData.set('type', type) // Manually set the Select value

        // Force update numeric fields to ensure they are sent
        // Sometimes defaultValue in controlled/uncontrolled mix causes issues if not touched
        // No, FormData gets them from the input elements. 
        // We will debug by logging what we are sending.

        console.log("Submitting form:", Object.fromEntries(formData))

        const result = await updateClassTemplate(template.id, formData)

        if (result.success) {
            toast({ title: "Success", description: "Class template updated" })
            router.push("/dashboard/classes")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-8 bg-card p-8 rounded-xl border shadow-sm">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Class Name</Label>
                    <Input name="name" id="name" defaultValue={template.name} required />
                </div>

                <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea name="description" id="description" defaultValue={template.description || ""} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PARKOUR">Parkour</SelectItem>
                                <SelectItem value="TRICKING">Tricking</SelectItem>
                                <SelectItem value="KIDS">Kids General</SelectItem>
                                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="durationMin">Duration (Minutes)</Label>
                        <Input type="number" name="durationMin" defaultValue={template.durationMin} min="30" step="15" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="ageMin">Min Age</Label>
                        <Input type="number" name="ageMin" defaultValue={template.ageMin} min="3" required />
                    </div>
                    <div>
                        <Label htmlFor="ageMax">Max Age</Label>
                        <Input type="number" name="ageMax" defaultValue={template.ageMax} min="3" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="levelMin">Min Level</Label>
                        <Input type="number" name="levelMin" defaultValue={template.levelMin} min="1" max="6" required />
                    </div>
                    <div>
                        <Label htmlFor="levelMax">Max Level</Label>
                        <Input type="number" name="levelMax" defaultValue={template.levelMax} min="1" max="6" required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input type="number" name="capacity" defaultValue={template.capacity} min="1" required />
                    </div>
                    <div>
                        <Label htmlFor="price">Base Price</Label>
                        <Input type="number" name="price" defaultValue={template.price} min="0" step="0.01" required />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
}
