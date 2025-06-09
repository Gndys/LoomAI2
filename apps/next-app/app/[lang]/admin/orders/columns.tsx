"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/use-translation"

export type Order = {
  id: string
  userId: string
  amount: string
  currency: string
  planId: string
  status: string
  provider: string
  providerOrderId?: string | null
  metadata?: any
  createdAt: string | Date
  updatedAt?: string | Date
  // 关联的用户信息
  userName?: string | null
  userEmail?: string | null
}

const getStatusBadge = (status: string, t: any) => {
  const statusConfig = {
    pending: { label: t.admin.orders.table.search.pending, variant: "outline" as const },
    paid: { label: t.admin.orders.table.search.paid, variant: "default" as const },
    failed: { label: t.admin.orders.table.search.failed, variant: "destructive" as const },
    refunded: { label: t.admin.orders.table.search.refunded, variant: "secondary" as const },
    canceled: { label: t.admin.orders.table.search.canceled, variant: "secondary" as const },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const getProviderBadge = (provider: string, t: any) => {
  const providerConfig = {
    stripe: { label: t.admin.orders.table.search.stripe, variant: "default" as const },
    wechat: { label: t.admin.orders.table.search.wechat, variant: "outline" as const },
  }
  
  const config = providerConfig[provider as keyof typeof providerConfig] || { label: provider, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

export const useOrderColumns = (): ColumnDef<Order>[] => {
  const { t } = useTranslation()

  return [
    {
      accessorKey: "id",
      header: t.admin.orders.table.columns.id,
      cell: ({ row }) => (
        <div className="font-mono text-sm max-w-[100px] truncate" title={row.getValue("id")}>
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "userEmail",
      header: t.admin.orders.table.columns.user,
      cell: ({ row }) => {
        const email = row.getValue("userEmail") as string
        const name = row.original.userName
        return (
          <div className="max-w-[150px]">
            <div className="font-medium truncate" title={name || 'N/A'}>
              {name || 'N/A'}
            </div>
            <div className="text-sm text-gray-500 truncate" title={email || 'N/A'}>
              {email || 'N/A'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: t.admin.orders.table.columns.amount,
      cell: ({ row }) => {
        const amount = row.getValue("amount") as string
        const currency = row.original.currency
        return <div className="font-medium">{currency} {amount}</div>
      },
    },
    {
      accessorKey: "planId",
      header: t.admin.orders.table.columns.plan,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("planId")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: t.admin.orders.table.columns.status,
      cell: ({ row }) => getStatusBadge(row.getValue("status"), t),
    },
    {
      accessorKey: "provider",
      header: t.admin.orders.table.columns.provider,
      cell: ({ row }) => getProviderBadge(row.getValue("provider"), t),
    },
    {
      accessorKey: "providerOrderId",
      header: t.admin.orders.table.columns.providerOrderId,
      cell: ({ row }) => {
        const providerOrderId = row.getValue("providerOrderId") as string
        return (
          <div className="font-mono text-xs max-w-[120px] truncate" title={providerOrderId || 'N/A'}>
            {providerOrderId || 'N/A'}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t.admin.orders.table.columns.createdAt,
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return <div>{formatDate(date)}</div>
      },
    },
    {
      id: "actions",
      header: t.admin.orders.table.columns.actions,
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t.admin.orders.table.columns.actions}</DropdownMenuLabel>
              <DropdownMenuItem>{t.admin.orders.table.actions.viewOrder}</DropdownMenuItem>
              <DropdownMenuItem>{t.admin.orders.table.actions.refundOrder}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// 为了向后兼容，保留原来的导出
export const columns: ColumnDef<Order>[] = [] 