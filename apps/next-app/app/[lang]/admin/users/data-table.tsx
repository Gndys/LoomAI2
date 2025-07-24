"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ColumnToggle } from "./components/column-toggle"
import { Search } from "./components/search"
import { useTranslation } from "@/hooks/use-translation"

interface DataTableProps<TData, TValue> {
  columns: () => ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    total: number
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    emailVerified: false,
    createdAt: true,
    updatedAt: false,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  // Initialize sorting from URL parameters
  useEffect(() => {
    const sortBy = searchParams.get('sortBy')
    const sortDirection = searchParams.get('sortDirection')
    
    if (sortBy && sortDirection) {
      setSorting([{
        id: sortBy,
        desc: sortDirection === 'desc'
      }])
    }
  }, [searchParams])

  const table = useReactTable({
    data,
    columns: columns(),
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      
      // Update URL with new sorting parameters
      const searchParams = new URLSearchParams(window.location.search)
      if (newSorting.length > 0) {
        searchParams.set("sortBy", newSorting[0].id)
        searchParams.set("sortDirection", newSorting[0].desc ? "desc" : "asc")
      } else {
        searchParams.delete("sortBy")
        searchParams.delete("sortDirection")
      }
      // Reset to first page when sorting changes
      searchParams.set("page", "1")
      router.push(`${pathname}?${searchParams.toString()}`)
    },
    state: {
      columnVisibility,
      sorting,
    },
    manualSorting: true, // Enable manual sorting for server-side
    enableSorting: true,
  })

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", page.toString())
    router.push(`${pathname}?${searchParams.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Search />
        <ColumnToggle table={table} />
      </div>
      <div className="rounded-md border">
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns().length} className="h-24 text-center">
                  {t.admin.users.table.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const page = index + 1;
              // Show first page, last page, and pages around current page
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === pagination.currentPage}
                      onClick={() => handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              // Show ellipsis for gaps
              if (
                page === pagination.currentPage - 3 ||
                page === pagination.currentPage + 3
              ) {
                return (
                  <PaginationItem key={page}>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                className={pagination.currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
