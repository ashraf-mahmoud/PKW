import { createClassTemplate } from "@/actions/classes"
import { getClassTypes } from "@/actions/class-types"
import NewClassForm from "./new-class-form"
import BackButton from "@/components/ui/back-button"

export default async function NewClassTemplatePage() {
    const types = await getClassTypes()

    return (
        <div className="max-w-2xl mx-auto">
            <BackButton href="/dashboard/classes" />
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display">New Class Template</h1>
                <p className="text-muted-foreground">Define a type of class that can be scheduled.</p>
            </div>

            <NewClassForm types={types} />
        </div>
    )
}
