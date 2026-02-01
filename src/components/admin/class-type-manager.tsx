'use client'

import { createClassType, deleteClassType } from "@/actions/class-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ClassTypeManager({ initialTypes, migrateAction }: { initialTypes: any[], migrateAction: any }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)

    async function onAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        setIsSubmitting(true)

        const formData = new FormData(form)
        const result = await createClassType(formData)

        if (result.success) {
            toast({ title: "Success", description: "Class type added" })
            form.reset()
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }
        setIsSubmitting(false)
    }

    async function onDelete(id: string) {
        if (!confirm("Are you sure? This will only work if no templates are using this type.")) return

        const result = await deleteClassType(id)
        if (result.success) {
            toast({ title: "Success", description: "Class type deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }
    }

    async function onMigrate() {
        setIsMigrating(true)
        const result = await migrateAction()
        if (result.success) {
            toast({ title: "Migration Complete", description: result.message || `Migrated ${result.count} templates.` })
            router.refresh()
        } else {
            toast({ title: "Migration Failed", description: result.error, variant: "destructive" })
        }
        setIsMigrating(false)
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <form onSubmit={onAdd} className="bg-card p-6 border rounded-xl shadow-sm space-y-4">
                    <h2 className="font-bold text-lg">Add New Type</h2>
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input name="name" id="name" placeholder="e.g. Workshop" required />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Class Type
                    </Button>
                </form>

                <div className="bg-muted/50 p-6 border rounded-xl space-y-4">
                    <h2 className="font-bold text-lg">Data Migration</h2>
                    <p className="text-sm text-muted-foreground">
                        Click below to automatically convert old hardcoded class types to the new dynamic system. Only needed once.
                    </p>
                    <Button
                        variant="outline"
                        onClick={onMigrate}
                        disabled={isMigrating}
                        className="w-full"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isMigrating ? 'animate-spin' : ''}`} />
                        {isMigrating ? "Migrating Data..." : "Run Migration"}
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-medium border-b text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Type Name</th>
                            <th className="px-6 py-3 text-center">Templates</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {initialTypes.map((t) => (
                            <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 font-medium">{t.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-muted px-2 py-1 rounded text-xs">
                                        {t._count.templates}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => onDelete(t.id)}
                                        disabled={t._count.templates > 0}
                                        title={t._count.templates > 0 ? "Cannot delete type in use" : "Delete Type"}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {initialTypes.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                    No custom class types defined.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
