'use client'

import { deleteClassTemplate } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DeleteTemplateButton({ templateId, templateName }: { templateId: string, templateName: string }) {
    const { toast } = useToast()
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${templateName}"?\n\nThis will DELETE ALL SCHEDULED CLASSES associated with it.`)) {
            return
        }

        const res = await deleteClassTemplate(templateId)

        if (res.success) {
            toast({ title: "Template Deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
