"use client"

import * as React from "react"
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Content, ContentType, ContentStatus, User } from "@/types"

interface ContentDataTableProps {
    data: Content[]
    user: User | null
    userDepartment: any
    departments: any[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: ContentStatus) => void
}

const contentTypeColors: { [key in ContentType | string]: "default" | "green" | "blue" | "sky" } = {
    sop: 'blue',
    guide: 'green',
    announcement: 'sky',
    resource: 'blue',
    training: 'sky',
    policy: 'green',
}

const statusColors: { [key in ContentStatus]: "default" | "green" | "blue" | "sky" } = {
    draft: 'default',
    published: 'green',
    archived: 'default',
}

export function ContentDataTable({
    data,
    user,
    userDepartment,
    departments,
    onDelete,
    onStatusChange,
}: ContentDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const canEdit = (contentItem: Content) => {
        if (!user) return false
        if (user.role === 'super_admin') return true
        if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true
        if (user.role === 'editor' && userDepartment && userDepartment.$id === contentItem.departmentId) return true
        return false
    }

    const canPublish = (contentItem: Content) => {
        if (!user) return false
        if (user.role === 'super_admin') return true
        if (user.role === 'admin' && userDepartment && userDepartment.$id === contentItem.departmentId) return true
        return false
    }

    const getDepartmentName = (departmentId: string) => {
        const dept = departments.find(d => d.$id === departmentId)
        return dept ? dept.name : 'Unknown Department'
    }

    const columns: ColumnDef<Content>[] = [
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
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2 text-left"
                    >
                        Title
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
                const content = row.original
                return (
                    <div className="max-w-[200px]">
                        <div className="font-medium text-white truncate">{content.title}</div>
                        <div className="text-sm text-gray-400 truncate">{content.slug}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("type") as ContentType
                return (
                    <Badge colorVariant={contentTypeColors[type] || 'default'} variant="solid">
                        {type.toUpperCase()}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as ContentStatus
                return (
                    <Badge colorVariant={statusColors[status]} variant="solid">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "version",
            header: "Version",
            cell: ({ row }) => {
                const version = row.getValue("version") as number
                return <span className="text-sm text-gray-300">v{version.toFixed(2)}</span>
            },
        },
        {
            accessorKey: "departmentId",
            header: "Department",
            cell: ({ row }) => {
                const departmentId = row.getValue("departmentId") as string
                return (
                    <span className="text-sm text-gray-300">
                        {getDepartmentName(departmentId)}
                    </span>
                )
            },
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Updated
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
                const date = new Date(row.getValue("updatedAt"))
                return <span className="text-sm text-gray-300">{date.toLocaleDateString()}</span>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            size: 60,
            cell: ({ row }: { row: { getValue: (key: string) => string; original: Content } }) => {
                const content = row.original

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
                                onClick={() => navigator.clipboard.writeText(content.$id)}
                                className="text-gray-300 hover:bg-gray-700"
                            >
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            {canEdit(content) && (
                                <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-700">
                                    <Link href={`/dashboard/content/${content.$id}/edit`}>
                                        Edit content
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {canPublish(content) && content.status === 'draft' && (
                                <DropdownMenuItem
                                    onClick={() => onStatusChange(content.$id, 'published')}
                                    className="text-green-400 hover:bg-gray-700"
                                >
                                    Publish
                                </DropdownMenuItem>
                            )}
                            {canPublish(content) && content.status === 'published' && (
                                <DropdownMenuItem
                                    onClick={() => onStatusChange(content.$id, 'archived')}
                                    className="text-yellow-400 hover:bg-gray-700"
                                >
                                    Archive
                                </DropdownMenuItem>
                            )}
                            {canEdit(content) && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(content.$id)}
                                    className="text-red-400 hover:bg-gray-700"
                                >
                                    Delete
                                </DropdownMenuItem>
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full max-w-full overflow-hidden">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter titles..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
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
            <div className="rounded-md border border-gray-700 bg-gray-900/50">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const isSelectOrActions = header.id === 'select' || header.id === 'actions'
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`whitespace-nowrap ${isSelectOrActions ? '' : 'min-w-[120px]'}`}
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
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const isSelectOrActions = cell.column.id === 'select' || cell.column.id === 'actions'
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={`whitespace-nowrap ${isSelectOrActions ? '' : 'min-w-[120px]'}`}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-gray-400 whitespace-normal"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-gray-400">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
} 