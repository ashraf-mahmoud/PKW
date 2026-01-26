'use client'

import { createCoach, updateCoach } from "@/actions/coaches"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function CoachForm({ coach }: { coach?: any }) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)

        let result
        if (coach) {
            result = await updateCoach(coach.id, formData)
        } else {
            result = await createCoach(formData)
        }

        if (result.success) {
            toast({ title: "Success", description: `Coach ${coach ? 'updated' : 'created'}` })
            router.push("/dashboard/coaches")
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 bg-card p-8 rounded-xl border shadow-sm max-w-lg">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input name="name" id="name" placeholder="Coach name" defaultValue={coach?.name} required />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" name="email" id="email" placeholder="coach@example.com" defaultValue={coach?.email} required />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (coach ? "Save Changes" : "Create Coach")}
                </Button>
            </div>
        </form>
    )
}
