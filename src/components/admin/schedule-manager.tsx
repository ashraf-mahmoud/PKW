'use client'

import { createClassSchedule, deleteClassSchedule, updateClassSchedule } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Trash2, Plus, Clock, MapPin, Check, Edit2 } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

function MultiSelectCoaches({ coaches, selectedIds, onChange }: { coaches: any[], selectedIds: string[], onChange: (ids: string[]) => void }) {
    const toggleCoach = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(cid => cid !== id))
        } else {
            onChange([...selectedIds, id])
        }
    }

    return (
        <div className="border rounded-md p-2 space-y-2 max-h-32 overflow-y-auto bg-background">
            {coaches.map(coach => (
                <div
                    key={coach.id}
                    onClick={() => toggleCoach(coach.id)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs ${selectedIds.includes(coach.id) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                >
                    <div className={`w-3 h-3 rounded border flex items-center justify-center ${selectedIds.includes(coach.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {selectedIds.includes(coach.id) && <Check size={10} className="text-primary-foreground" />}
                    </div>
                    {coach.name}
                </div>
            ))}
        </div>
    )
}

export default function ScheduleManager({ schedules, templateId, locations, coaches }: { schedules: any[], templateId: string, locations: any[], coaches: any[] }) {
    const { toast } = useToast()
    const router = useRouter()

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form Data
    const [dayOfWeek, setDayOfWeek] = useState("1")
    const [time, setTime] = useState("17:00")
    const [locationId, setLocationId] = useState(locations[0]?.id || "")
    const [coachIds, setCoachIds] = useState<string[]>([])

    const DAYS = [
        { id: 1, label: 'Monday' },
        { id: 2, label: 'Tuesday' },
        { id: 3, label: 'Wednesday' },
        { id: 4, label: 'Thursday' },
        { id: 5, label: 'Friday' },
        { id: 6, label: 'Saturday' },
        { id: 0, label: 'Sunday' },
    ]

    function openCreate() {
        setEditingId(null)
        setDayOfWeek("1")
        setTime("17:00")
        setLocationId(locations[0]?.id || "")
        setCoachIds([])
        setIsFormOpen(true)
    }

    function openEdit(schedule: any) {
        setEditingId(schedule.id)
        setDayOfWeek(schedule.dayOfWeek.toString())
        setTime(format(new Date(schedule.startTime), 'HH:mm'))
        setLocationId(schedule.locationId)
        setCoachIds(schedule.coaches.map((c: any) => c.id))
        setIsFormOpen(true)
    }

    function closeForm() {
        setIsFormOpen(false)
        setEditingId(null)
    }

    async function handleSave() {
        if (!locationId) return toast({ title: "Select Location", variant: "destructive" })

        let res;

        if (editingId) {
            // Update
            res = await updateClassSchedule(editingId, {
                locationId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime: time,
                coachIds
            })
        } else {
            // Create
            res = await createClassSchedule({
                templateId,
                locationId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime: time,
                coachIds
            })
        }

        if (res.success) {
            toast({ title: editingId ? "Class Updated" : "Class Added", description: "Calendar synced." })
            closeForm()
            router.refresh()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this rule? ALL FUTURE sessions will be deleted.")) return
        const res = await deleteClassSchedule(id)
        if (res.success) {
            toast({ title: "Rule Deleted" })
            router.refresh()
        } else {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Weekly Schedule</h3>
                <Button size="sm" onClick={isFormOpen ? closeForm : openCreate} variant={isFormOpen ? "outline" : "default"}>
                    {isFormOpen ? "Cancel" : <><Plus size={16} className="mr-2" /> Add Class</>}
                </Button>
            </div>

            {isFormOpen && (
                <div className="bg-muted/30 border p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm">{editingId ? "Edit Class" : "New Class"}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Day</Label>
                            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Time</Label>
                            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label>Location</Label>
                        <Select value={locationId} onValueChange={setLocationId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="mb-2 block">Coaches</Label>
                        <MultiSelectCoaches coaches={coaches} selectedIds={coachIds} onChange={setCoachIds} />
                    </div>
                    <Button onClick={handleSave} className="w-full">{editingId ? "Save Changes" : "Add Class"}</Button>
                </div>
            )}

            <div className="space-y-3">
                {schedules.length === 0 && !isFormOpen && (
                    <p className="text-muted-foreground text-sm">No recurring schedules set.</p>
                )}
                {schedules.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-card border rounded-lg group">
                        <div>
                            <div className="font-bold flex items-center gap-2">
                                {DAYS.find(d => d.id === s.dayOfWeek)?.label}s at {format(new Date(s.startTime), 'h:mm a')}
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={10} /> {s.location.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                                <Edit2 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
