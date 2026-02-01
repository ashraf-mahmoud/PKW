'use client'

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function TimetableFilters({
    locations,
    coaches,
    ageGroups = [],
    types,
    onFilterChange,
    onReset,
    currentFilters
}: {
    locations: any[],
    coaches: any[],
    ageGroups?: any[],
    types: any[],
    onFilterChange?: (filters: any) => void,
    onReset?: () => void,
    currentFilters?: any
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const updateFilter = (key: string, value: string) => {
        if (onFilterChange && currentFilters) {
            const newFilters = { ...currentFilters }
            if (value && value !== 'all') {
                newFilters[key] = value
            } else {
                delete newFilters[key]
            }
            onFilterChange(newFilters)
            return
        }

        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const getValue = (key: string) => {
        if (currentFilters) return currentFilters[key] || "all"
        return searchParams.get(key) || "all"
    }

    return (
        <div className="bg-card p-4 rounded-xl border shadow-sm mb-6 flex flex-wrap gap-4 items-end">
            <div className="w-full sm:w-auto min-w-[150px]">
                <Label className="text-xs mb-1.5 block">Location</Label>
                <Select
                    value={getValue("locationId")}
                    onValueChange={(val) => updateFilter("locationId", val)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full sm:w-auto min-w-[150px]">
                <Label className="text-xs mb-1.5 block">Class Type</Label>
                <Select
                    value={getValue("type")}
                    onValueChange={(val) => updateFilter("type", val)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map((type) => (
                            <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-full sm:w-auto min-w-[150px]">
                <Label className="text-xs mb-1.5 block">Coach</Label>
                <Select
                    value={getValue("coachId")}
                    onValueChange={(val) => updateFilter("coachId", val)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Coaches" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Coaches</SelectItem>
                        {coaches.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-40">
                <Label className="text-xs mb-1.5 block">Age Group</Label>
                <Select
                    value={getValue("ageGroupId")}
                    onValueChange={(val) => updateFilter("ageGroupId", val)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Any Age" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Age</SelectItem>
                        {ageGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="w-40">
                <Label className="text-xs mb-1.5 block">Level</Label>
                <Select
                    value={getValue("level")}
                    onValueChange={(val) => updateFilter("level", val)}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Any Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Any Level</SelectItem>
                        <SelectItem value="1">Level 1 (Beginner)</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="4">Level 4 (Adv)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="ml-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (onReset) {
                            onReset()
                        } else if (onFilterChange) {
                            onFilterChange({})
                        } else {
                            router.push(pathname)
                        }
                    }}
                    className="text-muted-foreground h-9 font-bold"
                >
                    Reset
                </Button>
            </div>
        </div>
    )
}
