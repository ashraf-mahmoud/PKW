'use client'

import React, { useState, useMemo } from 'react'
import { differenceInYears } from "date-fns"
import { Search, ChevronDown, ChevronUp, Filter, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import UserActions from "./user-actions"
import { bulkDeleteUsers } from "@/actions/users"
import { useToast } from "@/hooks/use-toast"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortField = 'id' | 'name' | 'age' | 'level' | 'parent' | 'active' | 'source'
type SortOrder = 'asc' | 'desc'

export default function UsersTable({ users, packages }: { users: any[], packages: any[] }) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    // Filters
    const [levelFilter, setLevelFilter] = useState<string[]>([])
    const [statusFilter, setStatusFilter] = useState<string>('all') // all, active, inactive

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(25)

    // Bulk Actions
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { toast } = useToast()

    const handleBulkDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await bulkDeleteUsers(selectedUserIds)
            if (result.success) {
                toast({
                    title: "Deletetion Successful",
                    description: `${result.count} users and their students have been removed.`,
                })
                setSelectedUserIds([])
            } else {
                toast({
                    title: "Deletion Failed",
                    description: result.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Bulk Delete Error:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleAllSelection = () => {
        if (selectedUserIds.length > 0) {
            setSelectedUserIds([])
        } else {
            setSelectedUserIds(users.map(u => u.id))
        }
    }

    const students = useMemo(() => {
        const allStudents: any[] = []
        users.forEach(user => {
            if (user.students.length === 0) {
                allStudents.push({
                    isNoStudentRow: true,
                    user
                })
            } else {
                user.students.forEach((student: any) => {
                    allStudents.push({
                        ...student,
                        user,
                        age: differenceInYears(new Date(), new Date(student.dob)),
                        isActive: (student.bookings?.length || 0) > 0
                    })
                })
            }
        })
        return allStudents
    }, [users])

    const filteredAndSortedStudents = useMemo(() => {
        let result = students.filter(item => {
            if (item.isNoStudentRow) {
                // For "No student" rows, just search user name/email
                const search = searchTerm.toLowerCase()
                return item.user.name.toLowerCase().includes(search) || item.user.email.toLowerCase().includes(search)
            }

            // Search
            const search = searchTerm.toLowerCase()
            const matchesSearch = item.name.toLowerCase().includes(search) ||
                item.user.name.toLowerCase().includes(search) ||
                item.user.email.toLowerCase().includes(search) ||
                (item.studentCode && item.studentCode.toLowerCase().includes(search))

            // Level Filter
            const matchesLevel = levelFilter.length === 0 || levelFilter.includes(item.level.toString())

            // Status Filter
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && item.isActive) ||
                (statusFilter === 'inactive' && !item.isActive)

            return matchesSearch && matchesLevel && matchesStatus
        })

        // Sort
        result.sort((a, b) => {
            let valA: any, valB: any

            // Handle no student rows at the bottom or top depending on sort
            if (a.isNoStudentRow && !b.isNoStudentRow) return 1
            if (!a.isNoStudentRow && b.isNoStudentRow) return -1
            if (a.isNoStudentRow && b.isNoStudentRow) return 0

            switch (sortField) {
                case 'id': valA = a.studentCode || ''; valB = b.studentCode || ''; break
                case 'name': valA = a.name; valB = b.name; break
                case 'age': valA = a.age; valB = b.age; break
                case 'level': valA = a.level; valB = b.level; break
                case 'parent': valA = a.user.name; valB = b.user.name; break
                case 'active': valA = a.isActive ? 1 : 0; valB = b.isActive ? 1 : 0; break
                case 'source': valA = a.user.profile?.marketingSource || ''; valB = b.user.profile?.marketingSource || ''; break
                default: valA = a.name; valB = b.name;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [students, searchTerm, sortField, sortOrder, levelFilter, statusFilter])

    // Reset pagination on search or filter
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, levelFilter, statusFilter, itemsPerPage])

    const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage)
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedStudents.slice(start, start + itemsPerPage)
    }, [filteredAndSortedStudents, currentPage, itemsPerPage])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null
        return sortOrder === 'asc' ? <ChevronUp className="inline ml-1 h-3 w-3" /> : <ChevronDown className="inline ml-1 h-3 w-3" />
    }

    const levels = ["1", "2", "3", "4", "5", "6"]

    const clearFilters = () => {
        setLevelFilter([])
        setStatusFilter('all')
        setSearchTerm('')
    }

    return (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students, codes, parents..."
                            className="pl-9 h-10 border-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {selectedUserIds.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-10 px-4"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                Delete ({selectedUserIds.length})
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-10 gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {(levelFilter.length > 0 || statusFilter !== 'all') && (
                                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            {(levelFilter.length > 0 ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Filter by Level</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {levels.map(lvl => (
                                    <DropdownMenuCheckboxItem
                                        key={lvl}
                                        checked={levelFilter.includes(lvl)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setLevelFilter([...levelFilter, lvl])
                                            else setLevelFilter(levelFilter.filter(l => l !== lvl))
                                        }}
                                    >
                                        Level {lvl}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuCheckboxItem
                                    checked={statusFilter === 'active'}
                                    onCheckedChange={() => setStatusFilter(statusFilter === 'all' ? 'active' : statusFilter === 'active' ? 'all' : 'active')}
                                >
                                    Active Students
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                    checked={statusFilter === 'inactive'}
                                    onCheckedChange={() => setStatusFilter(statusFilter === 'all' ? 'inactive' : statusFilter === 'inactive' ? 'all' : 'inactive')}
                                >
                                    Inactive Students
                                </DropdownMenuCheckboxItem>
                                {(levelFilter.length > 0 || statusFilter !== 'all') && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={clearFilters}
                                        >
                                            <X className="mr-2 h-3 w-3" />
                                            Clear Filters
                                        </Button>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(searchTerm || levelFilter.length > 0 || statusFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearFilters}
                                className="h-10 w-10 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>

                {(levelFilter.length > 0 || statusFilter !== 'all') && (
                    <div className="flex flex-wrap gap-2">
                        {levelFilter.map(lvl => (
                            <Badge key={lvl} variant="secondary" className="gap-1 px-3 py-1">
                                Level {lvl}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setLevelFilter(levelFilter.filter(l => l !== lvl))} />
                            </Badge>
                        ))}
                        {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="gap-1 px-3 py-1">
                                Status: {statusFilter === 'active' ? 'Active' : 'Inactive'}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium select-none">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <Checkbox
                                    checked={selectedUserIds.length === users.length && users.length > 0}
                                    onChange={toggleAllSelection}
                                />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('id')}>
                                ID <SortIcon field="id" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('name')}>
                                Student <SortIcon field="name" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('age')}>
                                Age <SortIcon field="age" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('level')}>
                                Level <SortIcon field="level" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('parent')}>
                                Parent / User <SortIcon field="parent" />
                            </th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('source')}>
                                Source <SortIcon field="source" />
                            </th>
                            <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('active')}>
                                Status <SortIcon field="active" />
                            </th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y bg-card">
                        {paginatedStudents.map((item) => {
                            if (item.isNoStudentRow) {
                                return (
                                    <tr
                                        key={item.user.id}
                                        className={`transition-colors group cursor-pointer ${selectedUserIds.includes(item.user.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                        onClick={() => router.push(`/dashboard/users/${item.user.id}/edit`)}
                                    >
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedUserIds.includes(item.user.id)}
                                                onChange={() => toggleUserSelection(item.user.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">-</td>
                                        <td className="px-4 py-3 text-muted-foreground italic">No students</td>
                                        <td className="px-4 py-3 text-muted-foreground">-</td>
                                        <td className="px-4 py-3 text-muted-foreground">-</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium group-hover:text-primary transition-colors">{item.user.name}</div>
                                            <div className="text-[10px] text-muted-foreground">{item.user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {item.user.profile?.phone || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-[10px]">
                                            {item.user.profile?.marketingSource || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground opacity-50">Inactive</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            <UserActions user={item.user} packages={packages} />
                                        </td>
                                    </tr>
                                )
                            }

                            return (
                                <tr
                                    key={item.id}
                                    className={`transition-colors group cursor-pointer ${selectedUserIds.includes(item.user.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                                    onClick={() => router.push(`/dashboard/users/${item.user.id}/edit`)}
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedUserIds.includes(item.user.id)}
                                            onChange={() => toggleUserSelection(item.user.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                                        {item.studentCode || "-"}
                                    </td>
                                    <td className="px-4 py-3 font-bold">
                                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {item.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.age}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                                            Level {item.level}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{item.user.name}</div>
                                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.user.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {item.user.profile?.phone || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-[10px]">
                                        {item.user.profile?.marketingSource || "-"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.isActive ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-bold hover:bg-green-100 shadow-none">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <UserActions user={item.user} student={item} packages={packages} />
                                    </td>
                                </tr>
                            )
                        })}
                        {paginatedStudents.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Search size={32} className="opacity-20" />
                                        <p className="font-medium">No results match your current search and filters.</p>
                                        <Button variant="link" size="sm" onClick={clearFilters}>Reset everything</Button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
                <div className="text-xs text-muted-foreground">
                    Showing <span className="font-medium">{Math.min(filteredAndSortedStudents.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium">{Math.min(filteredAndSortedStudents.length, currentPage * itemsPerPage)}</span> of <span className="font-medium">{filteredAndSortedStudents.length}</span> students
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="h-8 w-16 rounded border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {[10, 25, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-xs font-medium min-w-[3rem] text-center">
                            Page {currentPage} of {Math.max(1, totalPages)}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanetly delete <strong>{selectedUserIds.length}</strong> selected families and all their students and bookings. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleBulkDelete()
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

