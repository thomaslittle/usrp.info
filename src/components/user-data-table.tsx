"use client"

import React, { useMemo, useState } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Icon } from "@iconify/react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox as FormCheckbox } from "@/components/ui/checkbox"
import { User, UserRole } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface UserDataTableProps {
    data: User[]
    currentUser: User | null
    onPromoteUser: (userId: string, newRole: UserRole) => void
    onDeleteUser: (userId: string) => void
    onEditUser: (userId: string, userData: Partial<User>) => void
}

interface EditUserFormData {
    username: string;
    gameCharacterName: string;
    rank: string;
    jobTitle: string;
    phoneNumber: string;
    callsign: string;
    assignment: string;
    activity: 'Active' | 'Moderate' | 'Inactive';
    status: 'Full-Time' | 'Part-Time' | 'On-Call';
    timezone: string;
    discordUsername: string;
    isFTO: boolean;
    isSoloCleared: boolean;
    isWaterRescue: boolean;
    isCoPilotCert: boolean;
    isAviationCert: boolean;
    isPsychNeuro: boolean;
    role: UserRole;
    linkedUserId?: string;
}

const roleColors: { [key in UserRole]: "default" | "green" | "blue" | "sky" } = {
    viewer: 'default',
    editor: 'blue',
    admin: 'sky',
    super_admin: 'green'
}

const getRankColor = (rank: string) => {
    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('chief') || lowerRank.includes('head')) {
        return 'text-yellow-400 font-bold';
    }
    if (lowerRank.includes('captain') || lowerRank.includes('lieutenant')) {
        return 'text-purple-400';
    }
    if (lowerRank.includes('attending') || lowerRank.includes('paramedic') || lowerRank.includes('sr. emt') || lowerRank.includes('specialist')) {
        return 'text-sky-400';
    }
    if (lowerRank.includes('doctor')) {
        return 'text-green-400';
    }
    if (lowerRank.includes('intern')) {
        return 'text-gray-400';
    }
    return 'text-white';
};

export function UserDataTable({
    data,
    currentUser,
    onPromoteUser,
    onDeleteUser,
    onEditUser,
}: UserDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [editingUser, setEditingUser] = React.useState<User | null>(null)
    const [editFormData, setEditFormData] = React.useState<EditUserFormData>({
        username: '',
        gameCharacterName: '',
        rank: '',
        jobTitle: '',
        phoneNumber: '',
        callsign: '',
        assignment: '',
        activity: 'Active',
        status: 'Full-Time',
        timezone: '',
        discordUsername: '',
        isFTO: false,
        isSoloCleared: false,
        isWaterRescue: false,
        isCoPilotCert: false,
        isAviationCert: false,
        isPsychNeuro: false,
        role: 'viewer',
        linkedUserId: '',
    })
    const [saveLoading, setSaveLoading] = React.useState(false)
    const [comboboxOpen, setComboboxOpen] = React.useState(false)

    // Update form data when editing user changes
    React.useEffect(() => {
        if (editingUser) {
            setEditFormData({
                username: editingUser.username || '',
                gameCharacterName: editingUser.gameCharacterName || '',
                rank: editingUser.rank || '',
                jobTitle: editingUser.jobTitle || '',
                phoneNumber: editingUser.phoneNumber || '',
                callsign: editingUser.callsign || '',
                assignment: editingUser.assignment || '',
                activity: editingUser.activity || 'Active',
                status: editingUser.status || 'Full-Time',
                timezone: editingUser.timezone || '',
                discordUsername: editingUser.discordUsername || '',
                isFTO: editingUser.isFTO || false,
                isSoloCleared: editingUser.isSoloCleared || false,
                isWaterRescue: editingUser.isWaterRescue || false,
                isCoPilotCert: editingUser.isCoPilotCert || false,
                isAviationCert: editingUser.isAviationCert || false,
                isPsychNeuro: editingUser.isPsychNeuro || false,
                role: editingUser.role || 'viewer',
                linkedUserId: editingUser.linkedUserId || '',
            });
        }
    }, [editingUser]);

    const canManageUser = (user: User) => {
        if (!currentUser) return false
        if (currentUser.role === 'super_admin') return true
        return false
    }

    const handleEditUser = (user: User) => {
        setEditingUser(user)
    }

    const handleSaveUser = async () => {
        if (!editingUser) return

        setSaveLoading(true)
        try {
            await onEditUser(editingUser.$id, { ...editFormData, linkedUserId: editFormData.linkedUserId || undefined })
            setEditingUser(null)
        } catch (error) {
            console.error('Error saving user:', error)
        } finally {
            setSaveLoading(false)
        }
    }

    const columns: ColumnDef<User>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "username",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 text-left"
                    >
                        User
                        <Icon
                            icon={column.getIsSorted() === "asc" ? "heroicons:chevron-up-16-solid" :
                                column.getIsSorted() === "desc" ? "heroicons:chevron-down-16-solid" :
                                    "heroicons:chevron-up-down-16-solid"}
                            className="ml-2 h-4 w-4"
                        />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center space-x-3">
                        <UserAvatar user={user} className="w-8 h-8" />
                        <div>
                            <div className="font-medium text-white">{user.username}</div>
                            <div className={`text-sm ${getRankColor(user.rank || 'Unknown')}`}>
                                {user.rank || 'Unknown Rank'}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as UserRole
                return (
                    <Badge colorVariant={roleColors[role]} variant="solid">
                        {role.replace('_', ' ').toUpperCase()}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "department",
            header: "Department",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <span className="text-sm text-gray-300">
                        {user.department || 'No Department'}
                    </span>
                )
            },
        },
        {
            accessorKey: "activity",
            header: "Activity",
            cell: ({ row }) => {
                const activity = row.getValue("activity") as string || 'Active'
                return (
                    <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${activity === 'Active' ? 'bg-green-400' : activity === 'Moderate' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                        <span className={`text-sm ${activity === 'Active' ? 'text-green-400' : activity === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {activity}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "certifications",
            header: "Certifications",
            cell: ({ row }) => {
                const user = row.original
                const certifications = []

                if (user.isFTO) certifications.push("FTO")
                if (user.isSoloCleared) certifications.push("Solo")
                if (user.isWaterRescue) certifications.push("Water")
                if (user.isCoPilotCert) certifications.push("Co-Pilot")
                if (user.isAviationCert) certifications.push("Aviation")
                if (user.isPsychNeuro) certifications.push("Psych/Neuro")

                return (
                    <div className="flex flex-wrap gap-1">
                        {certifications.length > 0 ? (
                            certifications.map((cert) => (
                                <Badge key={cert} variant="outline" className="text-xs bg-purple-500/20 border-purple-500/50 text-purple-300">
                                    {cert}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-gray-500">None</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "$createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Joined
                        <Icon
                            icon={column.getIsSorted() === "asc" ? "heroicons:chevron-up-16-solid" :
                                column.getIsSorted() === "desc" ? "heroicons:chevron-down-16-solid" :
                                    "heroicons:chevron-up-down-16-solid"}
                            className="ml-2 h-4 w-4"
                        />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.getValue("$createdAt"))
                return <span className="text-sm text-gray-300">{date.toLocaleDateString()}</span>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            size: 60,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Icon icon="heroicons:ellipsis-horizontal-16-solid" className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-gray-200">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(user.$id)}
                                className="text-gray-300 hover:bg-gray-700"
                            >
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {canManageUser(user) && (
                                <>
                                    <DropdownMenuItem
                                        onClick={() => handleEditUser(user)}
                                        className="text-blue-400 hover:bg-gray-700"
                                    >
                                        Edit User
                                    </DropdownMenuItem>
                                    {user.role !== 'super_admin' && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => onPromoteUser(user.$id, 'editor')}
                                                className="text-blue-400 hover:bg-gray-700"
                                            >
                                                Make Editor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onPromoteUser(user.$id, 'admin')}
                                                className="text-sky-400 hover:bg-gray-700"
                                            >
                                                Make Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onPromoteUser(user.$id, 'viewer')}
                                                className="text-gray-400 hover:bg-gray-700"
                                            >
                                                Make Viewer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-gray-700" />
                                        </>
                                    )}
                                    {user.$id !== currentUser?.$id && (
                                        <DropdownMenuItem
                                            onClick={() => onDeleteUser(user.$id)}
                                            className="text-red-400 hover:bg-gray-700"
                                        >
                                            Delete User
                                        </DropdownMenuItem>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: 50,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter users..."
                    value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("username")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
                            Columns <Icon icon="heroicons:chevron-down-16-solid" className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize text-gray-300 hover:bg-gray-700"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border border-gray-700 bg-gray-800/30 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-gray-400"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-400">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </p>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-400">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] bg-gray-800/50 border-gray-700 text-white">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="bg-gray-800 border-gray-700">
                                {[10, 25, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-gray-300 hover:bg-gray-700">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex w-[100px] items-center justify-center text-sm text-gray-400">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <Icon icon="heroicons:chevron-double-left-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <Icon icon="heroicons:chevron-left-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <Icon icon="heroicons:chevron-right-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <Icon icon="heroicons:chevron-double-right-16-solid" className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="bg-gray-900/95 border border-gray-700/50 backdrop-blur-xl shadow-2xl max-w-3xl max-h-[85vh] flex flex-col rounded-xl p-0" showCloseButton={false}>
                    {/* Custom close button with proper positioning */}
                    <button
                        onClick={() => setEditingUser(null)}
                        className="absolute top-6 right-6 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none text-gray-400 hover:text-white"
                    >
                        <Icon icon="heroicons:x-mark-16-solid" className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                    <DialogHeader className="pb-4 border-b border-gray-700/30 px-6 pt-6">
                        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                <Icon icon="heroicons:user-16-solid" className="w-5 h-5 text-white" />
                            </div>
                            Edit User: {editingUser?.username}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 py-6 px-6 space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:identification-16-solid" className="w-5 h-5 text-purple-400" />
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-sm font-medium text-gray-300">Username</Label>
                                    <Input
                                        id="username"
                                        value={editFormData.username}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gameCharacterName" className="text-sm font-medium text-gray-300">Game Character Name</Label>
                                    <Input
                                        id="gameCharacterName"
                                        value={editFormData.gameCharacterName}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, gameCharacterName: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Position & Role */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:briefcase-16-solid" className="w-5 h-5 text-purple-400" />
                                Position & Role
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rank" className="text-sm font-medium text-gray-300">Rank</Label>
                                    <Input
                                        id="rank"
                                        value={editFormData.rank}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, rank: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-300">Job Title</Label>
                                    <Input
                                        id="jobTitle"
                                        value={editFormData.jobTitle}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact & Assignment */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:phone-16-solid" className="w-5 h-5 text-purple-400" />
                                Contact & Assignment
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-300">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        value={editFormData.phoneNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 7) {
                                                setEditFormData(prev => ({ ...prev, phoneNumber: value }));
                                            }
                                        }}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                        placeholder="5551234"
                                        maxLength={7}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="callsign" className="text-sm font-medium text-gray-300">Callsign</Label>
                                    <Input
                                        id="callsign"
                                        value={editFormData.callsign}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, callsign: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                        placeholder="E-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="assignment" className="text-sm font-medium text-gray-300">Assignment</Label>
                                <Input
                                    id="assignment"
                                    value={editFormData.assignment}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, assignment: e.target.value }))}
                                    className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                    placeholder="Entry Level Medic"
                                />
                            </div>
                        </div>

                        {/* Status & Availability */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:clock-16-solid" className="w-5 h-5 text-purple-400" />
                                Status & Availability
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="activity" className="text-sm font-medium text-gray-300">Activity</Label>
                                    <Select
                                        value={String(editFormData.activity || 'Active')}
                                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, activity: value as 'Active' | 'Moderate' | 'Inactive' }))}
                                    >
                                        <SelectTrigger className="bg-gray-800/60 border border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800/95 border border-gray-600/50 backdrop-blur-md">
                                            <SelectItem value="Active" className="text-gray-300 hover:bg-purple-600/20">Active</SelectItem>
                                            <SelectItem value="Moderate" className="text-gray-300 hover:bg-purple-600/20">Moderate</SelectItem>
                                            <SelectItem value="Inactive" className="text-gray-300 hover:bg-purple-600/20">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-medium text-gray-300">Status</Label>
                                    <Select
                                        value={String(editFormData.status || 'Full-Time')}
                                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as 'Full-Time' | 'Part-Time' | 'On-Call' }))}
                                    >
                                        <SelectTrigger className="bg-gray-800/60 border border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800/95 border border-gray-600/50 backdrop-blur-md">
                                            <SelectItem value="Full-Time" className="text-gray-300 hover:bg-purple-600/20">Full-Time</SelectItem>
                                            <SelectItem value="Part-Time" className="text-gray-300 hover:bg-purple-600/20">Part-Time</SelectItem>
                                            <SelectItem value="On-Call" className="text-gray-300 hover:bg-purple-600/20">On-Call</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:globe-alt-16-solid" className="w-5 h-5 text-purple-400" />
                                Additional Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timezone" className="text-sm font-medium text-gray-300">Timezone</Label>
                                    <Input
                                        id="timezone"
                                        value={editFormData.timezone}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, timezone: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                        placeholder="PST"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discordUsername" className="text-sm font-medium text-gray-300">Discord Username</Label>
                                    <Input
                                        id="discordUsername"
                                        value={editFormData.discordUsername}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, discordUsername: e.target.value }))}
                                        className="bg-gray-800/60 border border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors"
                                        placeholder="username#1234"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* System Role */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:shield-check-16-solid" className="w-5 h-5 text-purple-400" />
                                System Role
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-300">Access Level</Label>
                                <Select
                                    value={String(editFormData.role || 'viewer')}
                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value as UserRole }))}
                                >
                                    <SelectTrigger className="w-full bg-gray-800/60 border border-gray-600/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800/95 border border-gray-600/50 backdrop-blur-md">
                                        <SelectItem value="viewer" className="text-gray-300 hover:bg-purple-600/20">Viewer</SelectItem>
                                        <SelectItem value="editor" className="text-gray-300 hover:bg-purple-600/20">Editor</SelectItem>
                                        <SelectItem value="admin" className="text-gray-300 hover:bg-purple-600/20">Admin</SelectItem>
                                        <SelectItem value="super_admin" className="text-gray-300 hover:bg-purple-600/20">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Certifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:academic-cap-16-solid" className="w-5 h-5 text-purple-400" />
                                Certifications
                            </h3>
                            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isFTO"
                                            checked={editFormData.isFTO}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isFTO: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isFTO" className="text-sm text-gray-300 cursor-pointer">FTO</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isSoloCleared"
                                            checked={editFormData.isSoloCleared}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isSoloCleared: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isSoloCleared" className="text-sm text-gray-300 cursor-pointer">Solo Cleared</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isWaterRescue"
                                            checked={editFormData.isWaterRescue}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isWaterRescue: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isWaterRescue" className="text-sm text-gray-300 cursor-pointer">Water Rescue</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isCoPilotCert"
                                            checked={editFormData.isCoPilotCert}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isCoPilotCert: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isCoPilotCert" className="text-sm text-gray-300 cursor-pointer">Co-Pilot Cert.</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isAviationCert"
                                            checked={editFormData.isAviationCert}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isAviationCert: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isAviationCert" className="text-sm text-gray-300 cursor-pointer">Aviation Cert.</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <FormCheckbox
                                            id="isPsychNeuro"
                                            checked={editFormData.isPsychNeuro}
                                            onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, isPsychNeuro: !!checked }))}
                                            className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                        />
                                        <Label htmlFor="isPsychNeuro" className="text-sm text-gray-300 cursor-pointer">Psych/Neuro</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Linked Account */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <Icon icon="heroicons:link-16-solid" className="w-5 h-5 text-purple-400" />
                                Linked Account
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="linkedUserId" className="text-sm font-medium text-gray-300">Link to another user</Label>
                                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={comboboxOpen}
                                            className="w-full justify-between bg-gray-800/60 border border-gray-600/50 text-white hover:bg-gray-700/60 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        >
                                            {editFormData.linkedUserId && editFormData.linkedUserId !== "none"
                                                ? data?.find(user => user.$id === editFormData.linkedUserId)?.username + " (" + data?.find(user => user.$id === editFormData.linkedUserId)?.email + ")"
                                                : "Select user to link..."
                                            }
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 bg-gray-800/95 border border-gray-600/50 backdrop-blur-md">
                                        <Command className="bg-transparent">
                                            <CommandInput placeholder="Search users..." className="bg-transparent border-0 text-white placeholder:text-gray-400" />
                                            <CommandList>
                                                <CommandEmpty className="text-gray-400 text-center py-6">No user found.</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="none"
                                                        onSelect={() => {
                                                            setEditFormData(prev => ({ ...prev, linkedUserId: "" }))
                                                            setComboboxOpen(false)
                                                        }}
                                                        className="text-gray-300 hover:bg-purple-600/20"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                (!editFormData.linkedUserId || editFormData.linkedUserId === "none") ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        None
                                                    </CommandItem>
                                                    {data && Array.isArray(data) && data
                                                        .filter(user => user && user.$id && user.$id !== editingUser?.$id && user.username && user.email)
                                                        .map(user => (
                                                            <CommandItem
                                                                key={user.$id}
                                                                value={`${user.username} ${user.email}`}
                                                                onSelect={() => {
                                                                    setEditFormData(prev => ({ ...prev, linkedUserId: user.$id }))
                                                                    setComboboxOpen(false)
                                                                }}
                                                                className="text-gray-300 hover:bg-purple-600/20"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        editFormData.linkedUserId === user.$id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {user.username} ({user.email})
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-gray-700/30 pt-6 px-6 pb-6 bg-gray-900/50">
                        <div className="flex gap-3 w-full justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                                className="bg-gray-800/60 border border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveUser}
                                disabled={saveLoading}
                                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200 px-6"
                            >
                                {saveLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 