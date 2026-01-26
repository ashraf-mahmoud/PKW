'use client'

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function FilterBar({ locations }: { locations: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string) => {
        router.push(`/book-trial?${createQueryString(key, value)}`)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
                defaultValue={searchParams.get("location") || "all"}
                onValueChange={(val) => handleFilterChange("location", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                defaultValue={searchParams.get("type") || "all"}
                onValueChange={(val) => handleFilterChange("type", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Class Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PARKOUR">Parkour</SelectItem>
                    <SelectItem value="TRICKING">Tricking</SelectItem>
                    <SelectItem value="KIDS">Kids General</SelectItem>
                </SelectContent>
            </Select>

            <Select
                defaultValue={searchParams.get("level") || "all"}
                onValueChange={(val) => handleFilterChange("level", val)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Limit to Level" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1 (Beginner)</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5 (Advanced)</SelectItem>
                </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => router.push('/book-trial')}>
                Reset Filters
            </Button>
        </div>
    )
}
