"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColumnToggleProps<TData> {
  table: Table<TData>
}

export function ColumnToggle<TData>({
  table,
}: ColumnToggleProps<TData>) {
  const hiddenColumns = [
    "id",
    "emailVerified",
    "createdAt",
    "updatedAt",
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8">
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && 
              hiddenColumns.includes(column.id)
          )
          .map((column) => {
            return (
              <DropdownMenuItem
                key={column.id}
                className="flex items-center justify-between"
                onSelect={(e) => {
                  e.preventDefault()
                  column.toggleVisibility()
                }}
              >
                <span className="capitalize">
                  {column.id === "emailVerified" 
                    ? "Email Verified" 
                    : column.id === "createdAt"
                    ? "Created At"
                    : column.id === "updatedAt"
                    ? "Updated At"
                    : column.id}
                </span>
                {column.getIsVisible() && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 