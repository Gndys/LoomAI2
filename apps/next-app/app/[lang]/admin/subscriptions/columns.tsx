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

export type Subscription = {
  id: string
  userId: string
  planId: string
  status: string
  paymentType: string
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  periodStart: string | Date
  periodEnd: string | Date
  cancelAtPeriodEnd?: boolean | null
  createdAt: string | Date
  updatedAt?: string | Date
  // 关联的用户信息
  userName?: string | null
  userEmail?: string | null
}

const getStatusBadge = (status: string, t: any) => {
  const statusConfig = {
    active: { label: t.admin.subscriptions.table.search.active, variant: "default" as const },
    canceled: { label: t.admin.subscriptions.table.search.canceled, variant: "secondary" as const },
    past_due: { label: t.admin.subscriptions.table.search.pastDue, variant: "destructive" as const },
    unpaid: { label: t.admin.subscriptions.table.search.unpaid, variant: "destructive" as const },
    trialing: { label: t.admin.subscriptions.table.search.trialing, variant: "outline" as const },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const getPaymentTypeBadge = (paymentType: string, t: any) => {
  const typeConfig = {
    one_time: { label: t.admin.subscriptions.table.search.oneTime, variant: "outline" as const },
    recurring: { label: t.admin.subscriptions.table.search.recurring, variant: "outline" as const },
  }
  
  const config = typeConfig[paymentType as keyof typeof typeConfig] || { label: paymentType, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

export const useSubscriptionColumns = (): ColumnDef<Subscription>[] => {
  const { t } = useTranslation()

  return [
    {
      accessorKey: "id",
      header: t.admin.subscriptions.table.columns.id,
      cell: ({ row }) => (
        <div className="font-mono text-sm max-w-[100px] truncate" title={row.getValue("id")}>
          {row.getValue("id")}
        </div>
      ),
    },
    {
      accessorKey: "userEmail",
      header: t.admin.subscriptions.table.columns.user,
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
      accessorKey: "planId",
      header: t.admin.subscriptions.table.columns.plan,
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("planId")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: t.admin.subscriptions.table.columns.status,
      cell: ({ row }) => getStatusBadge(row.getValue("status"), t),
    },
    {
      accessorKey: "paymentType",
      header: t.admin.subscriptions.table.columns.paymentType,
      cell: ({ row }) => getPaymentTypeBadge(row.getValue("paymentType"), t),
    },
    {
      accessorKey: "periodStart",
      header: t.admin.subscriptions.table.columns.period,
      cell: ({ row }) => {
        const startDate = row.getValue("periodStart") as string | Date
        const endDate = row.original.periodEnd
        return (
          <div className="text-sm">
            <div>{formatDate(startDate)}</div>
            <div className="text-gray-500">to {formatDate(endDate)}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t.admin.subscriptions.table.columns.createdAt,
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return <div>{formatDate(date)}</div>
      },
    },
    {
      id: "actions",
      header: t.admin.subscriptions.table.columns.actions,
      cell: ({ row }) => {
        const subscription = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t.admin.subscriptions.table.columns.actions}</DropdownMenuLabel>
              <DropdownMenuItem>{t.admin.subscriptions.table.actions.viewSubscription}</DropdownMenuItem>
              <DropdownMenuItem>{t.admin.subscriptions.table.actions.cancelSubscription}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// 为了向后兼容，保留原来的导出
export const columns: ColumnDef<Subscription>[] = [] 