'use client'

import { createClassSchedule, deleteClassSchedule, updateClassSchedule } from "@/actions/classes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function ScheduleManager({
    schedules,
    templateId,
    locations,
    coaches,
    templateColor,
    defaults
}: {
    schedules: any[],
    templateId: string,
    locations: any[],
    coaches: any[],
    templateColor?: string,
    defaults?: { ageMin: number, ageMax: number, levelMin: number, levelMax: number, hasNoMaxAge?: boolean }
}) {
    const { toast } = useToast()
    const router = useRouter()

    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form Data
    const [dayOfWeek, setDayOfWeek] = useState("1")
    const [time, setTime] = useState("17:00")
    const [capacity, setCapacity] = useState("")
    const [locationId, setLocationId] = useState(locations[0]?.id || "")

    const [coachIds, setCoachIds] = useState<string[]>([])


    const [endDate, setEndDate] = useState<string>("")
    const [startDate, setStartDate] = useState<string>("")
    const [recurrence, setRecurrence] = useState<"WEEKLY" | "DAILY">("WEEKLY")

    const [ageMin, setAgeMin] = useState("")
    const [ageMax, setAgeMax] = useState("")
    const [hasNoMaxAge, setHasNoMaxAge] = useState(false)
    const [levelMin, setLevelMin] = useState("")
    const [levelMax, setLevelMax] = useState("")

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
        setCapacity("")
        setLocationId(locations[0]?.id || "")
        setCoachIds([])

        setEndDate("")
        setStartDate("")
        setRecurrence("WEEKLY")

        setAgeMin("")
        setAgeMax("")
        setAgeMin("")
        setAgeMax("")
        setHasNoMaxAge(defaults?.hasNoMaxAge || false)
        setLevelMin("")
        setLevelMax("")

        setIsFormOpen(true)
    }

    function openEdit(schedule: any) {
        setEditingId(schedule.id)
        setDayOfWeek(schedule.dayOfWeek.toString())
        setTime(format(new Date(schedule.startTime), 'HH:mm'))
        setCapacity(schedule.capacity || "")
        setLocationId(schedule.locationId)
        setCoachIds(schedule.coaches.map((c: any) => c.id))
        setEndDate(schedule.endDate ? format(new Date(schedule.endDate), 'yyyy-MM-dd') : "")
        setStartDate(schedule.startDate ? format(new Date(schedule.startDate), 'yyyy-MM-dd') : "")
        setRecurrence(schedule.recurrence || "WEEKLY")

        setAgeMin(schedule.ageMin || "")
        setAgeMax(schedule.ageMax || "")
        setHasNoMaxAge(schedule.hasNoMaxAge || false)
        setLevelMin(schedule.levelMin || "")
        setLevelMax(schedule.levelMax || "")

        setIsFormOpen(true)
    }

    function closeForm() {
        setIsFormOpen(false)
        setEditingId(null)
    }

    async function handleSave() {
        if (!locationId) return toast({ title: "Select Location", variant: "destructive" })

        // Capacity is now optional override

        let res;

        if (editingId) {
            // Update
            res = await updateClassSchedule(editingId, {
                locationId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime: time,
                coachIds,
                capacity: capacity !== "" ? parseInt(capacity) : null,
                endDate: endDate ? new Date(endDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                recurrence,
                ageMin: ageMin ? parseInt(ageMin) : null,
                ageMax: ageMax ? parseInt(ageMax) : null,
                levelMin: levelMin ? parseInt(levelMin) : null,
                levelMax: levelMax ? parseInt(levelMax) : null
            })
        } else {
            // Create
            res = await createClassSchedule({
                templateId,
                locationId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime: time,
                coachIds,
                capacity: capacity !== "" ? parseInt(capacity) : null,
                endDate: endDate ? new Date(endDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                recurrence,
                ageMin: ageMin ? parseInt(ageMin) : null,
                ageMax: ageMax ? parseInt(ageMax) : null,
                levelMin: levelMin ? parseInt(levelMin) : null,
                levelMax: levelMax ? parseInt(levelMax) : null
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
                            <Label>Frequency</Label>
                            <Select value={recurrence} onValueChange={(v: "WEEKLY" | "DAILY") => setRecurrence(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                    <SelectItem value="DAILY">Daily (every day)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {recurrence === "WEEKLY" && (
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
                        )}
                        <div>
                            <Label>Time</Label>
                            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <Label>Capacity Override (Optional)</Label>
                            <Input
                                type="number"
                                placeholder="Leaves at default if empty"
                                onChange={e => setCapacity(e.target.value)}
                                value={capacity}
                                min="1"
                            />
                        </div>
                        <div className="col-span-1">
                            <Label>Start Date (Optional)</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Leave empty to start now</p>
                        </div>
                        <div className="col-span-1">
                            <Label>End Date (Optional)</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">Leave empty for continuous (1 year rolling)</p>
                        </div>

                        <div className="col-span-2 border-t pt-2 mt-2">
                            <p className="text-sm font-semibold mb-2">Overrides (Optional)</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Min Age</Label>
                                    <Input type="number" placeholder={defaults?.ageMin ? `Default: ${defaults.ageMin}` : "Default"} value={ageMin} onChange={e => setAgeMin(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Max Age</Label>
                                    <Input
                                        type="number"
                                        placeholder={defaults?.ageMax ? `Default: ${defaults.ageMax}` : "Default"}
                                        value={ageMax}
                                        onChange={e => setAgeMax(e.target.value)}
                                        disabled={hasNoMaxAge}
                                    />
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox id="noMaxAge" checked={hasNoMaxAge} onChange={(e) => setHasNoMaxAge(e.target.checked)} />
                                        <label
                                            htmlFor="noMaxAge"
                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            No Max Age
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <Label>Min Level</Label>
                                    <Input type="number" placeholder={defaults?.levelMin ? `Default: ${defaults.levelMin}` : "Default"} value={levelMin} onChange={e => setLevelMin(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Max Level</Label>
                                    <Input type="number" placeholder={defaults?.levelMax ? `Default: ${defaults.levelMax}` : "Default"} value={levelMax} onChange={e => setLevelMax(e.target.value)} />
                                </div>
                            </div>
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
                {[...schedules]
                    .sort((a, b) => {
                        const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek
                        const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek
                        if (dayA !== dayB) return dayA - dayB
                        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                    })
                    .map(s => (
                        <div
                            key={s.id}
                            className="flex items-center justify-between p-3 bg-card border rounded-lg group"
                            style={{ borderLeft: `4px solid ${templateColor || '#3b82f6'}` }}
                        >
                            <div>
                                <div className="font-bold flex items-center gap-2">
                                    {s.recurrence === 'DAILY'
                                        ? <span>Every Day</span>
                                        : <span>{DAYS.find(d => d.id === s.dayOfWeek)?.label}s</span>
                                    }
                                    at {format(new Date(s.startTime), 'h:mm a')}
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
                                    <span className="flex items-center gap-1"><MapPin size={10} /> {s.location.name}</span>
                                    {s.capacity && <span className="flex items-center gap-1 text-primary">Max: {s.capacity}</span>}
                                    {s.startDate && <span className="flex items-center gap-1 text-blue-600">Starts: {format(new Date(s.startDate), 'MMM d, yyyy')}</span>}
                                    {s.endDate && <span className="flex items-center gap-1 text-orange-600">Ends: {format(new Date(s.endDate), 'MMM d, yyyy')}</span>}
                                    {(s.ageMin || s.ageMax || s.hasNoMaxAge) && <span className="text-purple-600">Age Override: {s.ageMin || '?'} - {s.hasNoMaxAge ? 'No Max' : (s.ageMax || '?')}</span>}
                                    {(s.levelMin || s.levelMax) && <span className="text-purple-600">Level Override: {s.levelMin || '?'} - {s.levelMax || '?'}</span>}
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
