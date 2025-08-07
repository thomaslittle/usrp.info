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

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { UserHoverCard } from "@/components/user-hover-card"
import { sortUsersByRank } from "@/lib/rank-utils"
import { User } from "@/types"

interface EMSRosterTableProps {
    data: User[]
}

const getRankColor = (rank: string) => {
    if (!rank) return 'text-gray-400';

    const lowerRank = rank.toLowerCase();
    if (lowerRank.includes('chief') || lowerRank.includes('head')) {
        return 'text-yellow-400 font-bold';
    }
    if (lowerRank.includes('captain') || lowerRank.includes('lieutenant')) {
        return 'text-purple-400 font-semibold';
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

const getActivityColor = (activity: string) => {
    switch (activity?.toLowerCase()) {
        case 'active':
            return 'bg-green-500/20 border-green-500/50 text-green-300';
        case 'moderate':
            return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300';
        case 'inactive':
            return 'bg-red-500/20 border-red-500/50 text-red-300';
        default:
            return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'full-time':
            return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
        case 'part-time':
            return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
        case 'on-call':
            return 'bg-orange-500/20 border-orange-500/50 text-orange-300';
        default:
            return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
};

// Global filter function for searching across multiple columns
const globalFilterFn = (row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    const searchableFields = [
        row.original.gameCharacterName?.toLowerCase() || '',
        row.original.username?.toLowerCase() || '',
        row.original.rank?.toLowerCase() || '',
        row.original.callsign?.toLowerCase() || '',
        row.original.assignment?.toLowerCase() || '',
        row.original.activity?.toLowerCase() || '',
        row.original.status?.toLowerCase() || '',
        row.original.phoneNumber?.toLowerCase() || '',
        row.original.timezone?.toLowerCase() || '',
    ];

    // Also include certifications in search
    const certifications = [];
    if (row.original.isFTO) certifications.push('fto');
    if (row.original.isSoloCleared) certifications.push('solo');
    if (row.original.isWaterRescue) certifications.push('water');
    if (row.original.isCoPilotCert) certifications.push('co-pilot', 'copilot');
    if (row.original.isAviationCert) certifications.push('aviation');
    if (row.original.isPsychNeuro) certifications.push('psych', 'neuro', 'psych/neuro');

    searchableFields.push(...certifications);

    return searchableFields.some(field => field.includes(searchValue));
};

export function EMSRosterTable({ data }: EMSRosterTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    // Sort data by rank before passing to table
    const sortedData = React.useMemo(() => sortUsersByRank(data), [data])

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "gameCharacterName",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-auto p-0 font-semibold text-gray-300 hover:text-white"
                    >
                        Name
                        <Icon
                            icon={column.getIsSorted() === "asc" ? "heroicons:chevron-up-16-solid" : "heroicons:chevron-down-16-solid"}
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
                            <div className="font-medium text-white">
                                <UserHoverCard user={user}>
                                    <span className="cursor-pointer hover:text-blue-300 transition-colors">
                                        {user.gameCharacterName || user.username}
                                    </span>
                                </UserHoverCard>
                            </div>
                            <div className="text-sm text-gray-400">
                                @{user.username}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "rank",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-auto p-0 font-semibold text-gray-300 hover:text-white"
                    >
                        Rank
                        <Icon
                            icon={column.getIsSorted() === "asc" ? "heroicons:chevron-up-16-solid" : "heroicons:chevron-down-16-solid"}
                            className="ml-2 h-4 w-4"
                        />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const rank = row.getValue("rank") as string
                return (
                    <div className={`font-medium ${getRankColor(rank)}`}>
                        {rank || 'Unassigned'}
                    </div>
                )
            },
        },
        {
            accessorKey: "callsign",
            header: "Callsign",
            cell: ({ row }) => {
                const callsign = row.getValue("callsign") as string
                return (
                    <div className="font-mono text-purple-300 font-medium">
                        {callsign || 'N/A'}
                    </div>
                )
            },
        },
        {
            accessorKey: "assignment",
            header: "Assignment",
            cell: ({ row }) => {
                const assignment = row.getValue("assignment") as string
                return (
                    <div className="text-gray-300">
                        {assignment || 'Unassigned'}
                    </div>
                )
            },
        },
        {
            accessorKey: "activity",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-auto p-0 font-semibold text-gray-300 hover:text-white"
                    >
                        Activity
                        <Icon
                            icon={column.getIsSorted() === "asc" ? "heroicons:chevron-up-16-solid" : "heroicons:chevron-down-16-solid"}
                            className="ml-2 h-4 w-4"
                        />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const activity = row.getValue("activity") as string
                return (
                    <Badge className={`${getActivityColor(activity)} border`}>
                        {activity || 'Unknown'}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge className={`${getStatusColor(status)} border`}>
                        {status || 'Unknown'}
                    </Badge>
                )
            },
        },
        {
            id: "certifications",
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

                if (certifications.length === 0) {
                    return (
                        <Badge className="bg-gray-500/20 border-gray-500/50 text-gray-400 border">
                            None
                        </Badge>
                    )
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {certifications.map((cert) => (
                            <Badge
                                key={cert}
                                className="bg-purple-500/20 border-purple-500/50 text-purple-300 border text-xs"
                            >
                                {cert}
                            </Badge>
                        ))}
                    </div>
                )
            },
        },
        {
            accessorKey: "phoneNumber",
            header: "Phone",
            cell: ({ row }) => {
                const phone = row.getValue("phoneNumber") as string
                return (
                    <div className="text-gray-300 font-mono text-sm">
                        {phone || 'N/A'}
                    </div>
                )
            },
        },
        {
            accessorKey: "timezone",
            header: "Timezone",
            cell: ({ row }) => {
                const timezone = row.getValue("timezone") as string
                return (
                    <div className="text-gray-300 text-sm">
                        {timezone || 'N/A'}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: sortedData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalFilterFn,
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
            globalFilter,
        },
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Search across all fields (name, rank, callsign, certifications, etc.)..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(String(event.target.value))}
                        className="max-w-md bg-gray-800/60 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <div className="text-sm text-gray-400">
                        {table.getFilteredRowModel().rows.length} of {data.length} members
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="bg-gray-800/60 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white"
                        >
                            <Icon icon="heroicons:view-columns-16-solid" className="mr-2 h-4 w-4" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-gray-800/95 border-gray-600/50 backdrop-blur-md"
                    >
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize text-gray-300 hover:bg-purple-600/20"
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
            <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-gray-700/50 hover:bg-gray-700/20"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="text-gray-300 font-semibold"
                                        >
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
                                    className="border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="text-gray-300"
                                        >
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
                                    No members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-400">
                        Rows per page
                    </p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px] bg-gray-800/60 border-gray-600/50 text-gray-300">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top" className="bg-gray-800/95 border-gray-600/50 backdrop-blur-md">
                            {[10, 25, 50, 100].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`} className="text-gray-300 hover:bg-purple-600/20">
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex w-[100px] items-center justify-center text-sm text-gray-400">
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex bg-gray-800/60 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white disabled:opacity-50"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <Icon icon="heroicons:chevron-double-left-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 bg-gray-800/60 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white disabled:opacity-50"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <Icon icon="heroicons:chevron-left-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 bg-gray-800/60 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white disabled:opacity-50"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <Icon icon="heroicons:chevron-right-16-solid" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex bg-gray-800/60 border-gray-600/50 text-gray-300 hover:bg-gray-700/60 hover:text-white disabled:opacity-50"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <Icon icon="heroicons:chevron-double-right-16-solid" className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 