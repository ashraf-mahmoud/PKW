import { getClassTypes, migrateClassTypes } from "@/actions/class-types"
import ClassTypeManager from "@/components/admin/class-type-manager"

export default async function ClassTypesPage() {
    const types = await getClassTypes()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Class Types</h1>
                    <p className="text-muted-foreground">Manage the categories for your class templates (e.g., Parkour, Tricking).</p>
                </div>
            </div>

            <ClassTypeManager initialTypes={types} migrateAction={migrateClassTypes} />
        </div>
    )
}
