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
import { SlidersHorizontal, Check } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface ColumnToggleProps<TData> {
  table: Table<TData>
}

export function ColumnToggle<TData>({
  table,
}: ColumnToggleProps<TData>) {
  const { t } = useTranslation()
  
  // Hidden column IDs that should not be toggleable
  const hiddenColumnIds = ['id', 'userEmail', 'status', 'provider', 'actions']

  // Filter columns to only show toggleable ones
  const filteredColumns = table.getAllColumns().filter(
    (column) => 
      typeof column.accessorFn !== 'undefined' && 
      column.getCanHide() &&
      !hiddenColumnIds.includes(column.id)
  )

  // Get display name for column
  const getColumnDisplayName = (columnId: string): string => {
    const columnMap: Record<string, string> = {
      planId: t.admin.subscriptions.table.columns.plan,
      paymentType: t.admin.subscriptions.table.columns.paymentType,
      periodStart: t.admin.subscriptions.table.columns.periodStart,
      periodEnd: t.admin.subscriptions.table.columns.periodEnd,
      cancelAtPeriodEnd: t.admin.subscriptions.table.columns.cancelAtPeriodEnd,
      createdAt: t.admin.subscriptions.table.columns.createdAt,
      updatedAt: t.admin.subscriptions.table.columns.updatedAt,
      metadata: t.admin.subscriptions.table.columns.metadata,
    }
    
    return columnMap[columnId] || columnId
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {t.admin.subscriptions.table.view}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>{t.admin.subscriptions.table.toggleColumns}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredColumns.map((column) => {
          return (
            <DropdownMenuItem
              key={column.id}
              className="capitalize"
              onSelect={(event) => { 
                event.preventDefault()
                column.toggleVisibility() 
              }}
            >
              <div className="flex items-center space-x-2 w-full">
                {column.getIsVisible() ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4" />
                )}
                <span className="flex-1">{getColumnDisplayName(column.id)}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 