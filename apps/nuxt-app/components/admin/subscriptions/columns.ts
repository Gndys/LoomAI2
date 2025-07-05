import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ExternalLink, RefreshCw, ArrowUpDown, Copy } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

// Subscription type definition
export interface Subscription {
  id: string
  userId: string | null
  planId: string | null
  status: string
  paymentType: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  creemCustomerId: string | null
  creemSubscriptionId: string | null
  periodStart: Date | null
  periodEnd: Date | null
  cancelAtPeriodEnd: boolean | null
  metadata: any
  createdAt: Date | null
  updatedAt: Date | null
  // Associated user information
  userName: string | null
  userEmail: string | null
}

// Status badge variants
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default'
    case 'trialing':
      return 'secondary'
    case 'canceled':
    case 'cancelled':
      return 'destructive'
    case 'past_due':
      return 'destructive'
    case 'unpaid':
      return 'destructive'
    case 'inactive':
      return 'outline'
    default:
      return 'outline'
  }
}

// Payment type display helper
const getPaymentTypeDisplay = (paymentType: string) => {
  switch (paymentType.toLowerCase()) {
    case 'one_time':
      return 'One-time'
    case 'recurring':
      return 'Recurring'
    default:
      return paymentType
  }
}

// Provider display helper
const getProviderDisplay = (subscription: Subscription) => {
  if (subscription.stripeCustomerId || subscription.stripeSubscriptionId) {
    return 'Stripe'
  }
  if (subscription.creemCustomerId || subscription.creemSubscriptionId) {
    return 'Creem'
  }
  // Default to WeChat for unknown providers
  return 'WeChat'
}

// Format date helper
const formatDate = (date: Date | string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date with time helper
const formatDateTime = (date: Date | string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Table columns definition
export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: 'id',
    header: () => {
      const { t } = useI18n()
      return h('span', {}, t('admin.subscriptions.table.columns.id'))
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const id = row.getValue('id') as string
      
      // Create copy functionality
      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(id)
          console.log('Subscription ID copied to clipboard:', id)
        } catch (err) {
          console.error('Failed to copy Subscription ID:', err)
        }
      }
      
      return h('div', { class: 'group relative' }, [
        // Main ID display
        h('div', { 
          class: 'font-mono text-sm max-w-[100px] truncate cursor-pointer',
          title: id,
          onClick: copyToClipboard
        }, `#${id.slice(-8)}`),
        
        // Tooltip
        h('div', { class: 'absolute z-50 hidden group-hover:block top-full left-0 pt-1' }, [
          h('div', { class: 'bg-popover text-popover-foreground shadow-md rounded-md border p-2 text-xs font-mono min-w-max' }, [
            h('div', { class: 'flex items-center gap-2' }, [
              h('span', { class: 'select-all' }, id),
              h('button', { 
                class: 'p-1 hover:bg-accent rounded',
                onClick: copyToClipboard 
              }, [
                h(Copy, { class: 'h-3 w-3' })
              ])
            ]),
            h('div', { class: 'text-xs text-muted-foreground mt-1' }, t('admin.subscriptions.table.actions.clickToCopy'))
          ])
        ])
      ])
    },
    enableSorting: false,
  },
  {
    accessorKey: 'userEmail',
    header: ({ column }) => {
      const { t } = useI18n()
      return h('button', {
        class: 'flex items-center space-x-2 hover:text-accent-foreground',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, [
        h('span', {}, t('admin.subscriptions.table.columns.user')),
        h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })
      ])
    },
    enableHiding: false,
    cell: ({ row }) => {
      const { t } = useI18n()
      const email = row.getValue('userEmail') as string
      const name = row.original.userName
      return h('div', { class: 'max-w-[150px]' }, [
        h('div', { 
          class: 'font-medium truncate text-foreground',
          title: name || t('common.notAvailable') 
        }, name || t('common.notAvailable')),
        h('div', { 
          class: 'text-sm text-muted-foreground truncate',
          title: email || t('common.notAvailable') 
        }, email || t('common.notAvailable'))
      ])
    },
  },
  {
    accessorKey: 'planId',
    header: () => {
      const { t } = useI18n()
      return h('span', {}, t('admin.subscriptions.table.columns.plan'))
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const planId = row.getValue('planId') as string
      return h('div', { class: 'font-medium' }, planId || t('common.notAvailable'))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      const { t } = useI18n()
      return h('button', {
        class: 'flex items-center space-x-2 hover:text-accent-foreground',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, [
        h('span', {}, t('admin.subscriptions.table.columns.status')),
        h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })
      ])
    },
    enableHiding: false,
    cell: ({ row }) => {
      const { t } = useI18n()
      const status = row.getValue('status') as string
      const variant = getStatusVariant(status)
      return h(Badge, { variant }, () => t(`admin.subscriptions.status.${status.toLowerCase()}`, status))
    },
  },
  {
    accessorKey: 'paymentType',
    header: () => {
      const { t } = useI18n()
      return h('span', {}, t('admin.subscriptions.table.columns.paymentType'))
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const paymentType = row.getValue('paymentType') as string
      return h('div', { class: 'font-medium' }, 
        t(`admin.subscriptions.paymentType.${paymentType?.toLowerCase()}`, getPaymentTypeDisplay(paymentType))
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'provider',
    header: () => {
      const { t } = useI18n()
      return h('span', {}, t('admin.subscriptions.table.columns.provider'))
    },
    cell: ({ row }) => {
      const provider = getProviderDisplay(row.original)
      return h('div', { class: 'font-medium' }, provider)
    },
    enableSorting: false,
  },
  {
    accessorKey: 'periodStart',
    header: ({ column }) => {
      const { t } = useI18n()
      return h('button', {
        class: 'flex items-center space-x-2 hover:text-accent-foreground',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, [
        h('span', {}, t('admin.subscriptions.table.columns.periodStart')),
        h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })
      ])
    },
    cell: ({ row }) => {
      const date = row.getValue('periodStart') as Date
      return h('div', { class: 'text-sm' }, formatDate(date))
    },
  },
  {
    accessorKey: 'periodEnd',
    header: ({ column }) => {
      const { t } = useI18n()
      return h('button', {
        class: 'flex items-center space-x-2 hover:text-accent-foreground',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, [
        h('span', {}, t('admin.subscriptions.table.columns.periodEnd')),
        h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })
      ])
    },
    cell: ({ row }) => {
      const date = row.getValue('periodEnd') as Date
      const isExpired = date && new Date(date) < new Date()
      return h('div', { 
        class: `text-sm ${isExpired ? 'text-destructive font-medium' : ''}` 
      }, formatDate(date))
    },
  },
  {
    accessorKey: 'cancelAtPeriodEnd',
    header: () => {
      const { t } = useI18n()
      return h('span', {}, t('admin.subscriptions.table.columns.cancelAtPeriodEnd'))
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const willCancel = row.getValue('cancelAtPeriodEnd') as boolean
      return h('div', { class: 'text-sm' }, 
        willCancel ? t('common.yes') : t('common.no')
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      const { t } = useI18n()
      return h('button', {
        class: 'flex items-center space-x-2 hover:text-accent-foreground',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      }, [
        h('span', {}, t('admin.subscriptions.table.columns.createdAt')),
        h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })
      ])
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      return h('div', { class: 'text-sm' }, formatDateTime(date))
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const { t } = useI18n()
      const subscription = row.original
      
      return h('div', { class: 'flex items-center justify-end' }, [
        h(DropdownMenu, {}, {
          default: () => [
            h(DropdownMenuTrigger, { asChild: true }, () => [
              h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, () => [
                h('span', { class: 'sr-only' }, t('admin.subscriptions.table.actions.openMenu')),
                h(MoreHorizontal, { class: 'h-4 w-4' })
              ])
            ]),
            h(DropdownMenuContent, { align: 'end' }, () => [
              h(DropdownMenuLabel, {}, () => t('admin.subscriptions.table.actions.actions')),
              h(DropdownMenuItem, { 
                onClick: () => console.log('View subscription:', subscription.id) 
              }, () => [
                h(ExternalLink, { class: 'mr-2 h-4 w-4' }),
                t('admin.subscriptions.table.actions.viewSubscription')
              ]),
              h(DropdownMenuItem, { 
                onClick: () => console.log('Cancel subscription:', subscription.id),
                class: 'text-destructive'
              }, () => [
                h(RefreshCw, { class: 'mr-2 h-4 w-4' }),
                t('admin.subscriptions.table.actions.cancelSubscription')
              ])
            ])
          ]
        })
      ])
    },
  },
] 