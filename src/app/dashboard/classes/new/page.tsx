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

export default function NewClassTemplatePage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [type, setType] = useState("PARKOUR")

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        formData.set('type', type) // Manually set the Select value
        console.log("Submitting New Template:", Object.fromEntries(formData))

        const result = await createClassTemplate(formData)
        console.log("Create Result:", result)

        if (result.success) {
            toast({ title: "Success", description: "Class template created" })
            router.push("/dashboard/classes")
            router.refresh()
        } else {
            console.error("Submission Error:", result.error)
            toast({ title: "Error", description: result.error || "Unknown error", variant: "destructive" })
            // Optional: alert to make sure user sees it
            // alert("Error: " + result.error) 
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display">New Class Template</h1>
                <p className="text-muted-foreground">Define a type of class that can be scheduled.</p>
            </div>

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
                                    <SelectItem value="PARKOUR">Parkour</SelectItem>
                                    <SelectItem value="TRICKING">Tricking</SelectItem>
                                    <SelectItem value="KIDS">Kids General</SelectItem>
                                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
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
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input type="number" name="capacity" defaultValue="12" min="1" required />
                        </div>
                        <div>
                            <Label htmlFor="price">Base Price</Label>
                            <Input type="number" name="price" defaultValue="50" min="0" step="0.01" required />
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
        </div>
    )
}
