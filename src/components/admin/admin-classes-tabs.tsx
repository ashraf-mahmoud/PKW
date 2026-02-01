'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon, List, Users } from "lucide-react"
import WeeklyCalendar from "@/components/booking/weekly-calendar"
import TimetableFilters from "@/components/booking/timetable-filters"
import SessionStudentList from "./session-student-list"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { format } from 'date-fns'

interface AdminClassesTabsProps {
    templates: any[]
    allSessions: any[]
    locations: any[]
    coaches: any[]
    ageGroups: any[]
    types: any[]
    templateListContent: React.ReactNode // Pass the existing template list as a node
}

export default function AdminClassesTabs({
    templates,
    allSessions,
    locations,
    coaches,
    ageGroups,
    types,
    templateListContent
}: AdminClassesTabsProps) {
    const [selectedSession, setSelectedSession] = useState<any>(null)
    const [weekOffset, setWeekOffset] = useState(0)

    const handleSessionClick = (session: any) => {
        setSelectedSession(session)
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="timetable" className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Timetable
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {templateListContent}
                </TabsContent>

                <TabsContent value="timetable" className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold font-display flex items-center gap-2">
                                <CalendarIcon className="text-primary h-5 w-5" />
                                Weekly Timetable
                            </h2>
                            <p className="text-sm text-muted-foreground">Click on any class to view the list of booked students.</p>
                        </div>

                        <div className="space-y-6">
                            <TimetableFilters
                                locations={locations}
                                coaches={coaches}
                                ageGroups={ageGroups}
                                types={types}
                            // Admin might want extra filters or a different style, 
                            // but for now we reuse the existing one.
                            />

                            <WeeklyCalendar
                                sessions={allSessions}
                                weekOffset={weekOffset}
                                onSessionClick={handleSessionClick}
                                onWeekChange={setWeekOffset}
                                selectedSessionId={selectedSession?.id}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Student List Dialog */}
            <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
                <DialogContent className="max-w-lg bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-display">
                                    {selectedSession?.template?.name}
                                </DialogTitle>
                                <DialogDescription className="text-sm flex items-center gap-2 mt-1">
                                    <span className="font-semibold text-foreground">
                                        {selectedSession && format(new Date(selectedSession.startTime), 'EEEE, MMM d h:mm a')}
                                    </span>
                                    <span>•</span>
                                    <span>{selectedSession?.location?.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-2 text-foreground">
                        {selectedSession && (
                            <SessionStudentList
                                sessionId={selectedSession.id}
                                sessionDate={new Date(selectedSession.startTime)}
                                locationId={selectedSession.locationId}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
