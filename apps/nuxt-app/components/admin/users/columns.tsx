import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ArrowUpDown, Copy } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import UsersActionsCell from '@/components/admin/users/UsersActionsCell.vue'

// User type definition based on the API response
export interface User {
  id: string
  name: string | null
  email: string
  role: string // Changed from 'admin' | 'user' to string to match API
  emailVerified: boolean
  banned: boolean | null // Changed to match API (can be null)
  createdAt: string | Date // Can be Date from API
  updatedAt: string | Date // Can be Date from API
}

export const columns: ColumnDef<User>[] = [
  // ID Column (hidden by default, no sorting needed)
  {
    accessorKey: 'id',
    header: () => {
      const { t } = useI18n()
      return <span>{t('admin.users.table.columns.id')}</span>
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const id = row.getValue('id') as string
      
      // Create tooltip content with copy functionality
      const copyToClipboard = async () => {
        try {
          await navigator.clipboard.writeText(id)
          // You could add a toast notification here
          console.log('ID copied to clipboard:', id)
        } catch (err) {
          console.error('Failed to copy ID:', err)
        }
      }
      
      return (
        <div class="group relative">
          {/* Main ID display */}
          <div 
            class="font-mono text-xs w-[180px] truncate cursor-pointer"
            onClick={copyToClipboard}
          >
            {id}
          </div>
          
          {/* Tooltip that appears on hover */}
          <div class="absolute z-50 hidden group-hover:block top-full left-0 pt-1">
            <div class="bg-popover text-popover-foreground shadow-md rounded-md border p-2 text-xs font-mono min-w-max">
              <div class="flex items-center gap-2">
                <span class="select-all">{id}</span>
                <button
                  class="p-1 hover:bg-accent rounded"
                  onClick={copyToClipboard}
                >
                  <Copy class="h-3 w-3" />
                </button>
              </div>
              <div class="text-xs text-muted-foreground mt-1">Click to copy</div>
            </div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  
  // Name Column (sortable - useful for alphabetical order)
  {
    accessorKey: 'name',
    header: ({ column }) => {
      const { t } = useI18n()
      return (
        <button
          class="flex items-center space-x-2 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>{t('admin.users.table.columns.name')}</span>
          <ArrowUpDown class="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string | null
      return <div class="font-medium">{name || 'N/A'}</div>
    },
  },
  
  // Email Column (sortable - useful for alphabetical order)
  {
    accessorKey: 'email',
    header: ({ column }) => {
      const { t } = useI18n()
      return (
        <button
          class="flex items-center space-x-2 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>{t('admin.users.table.columns.email')}</span>
          <ArrowUpDown class="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return <div class="text-sm">{email}</div>
    },
  },
  
  // Role Column (no sorting needed - just admin/user filter)
  {
    accessorKey: 'role',
    header: () => {
      const { t } = useI18n()
      return <span>{t('admin.users.table.columns.role')}</span>
    },
    cell: ({ row }) => {
      const { t } = useI18n()
      const role = row.getValue('role') as string
      const badgeClass = role === 'admin' 
        ? 'bg-chart-1 text-destructive-foreground'
        : 'bg-primary text-primary-foreground'
      
      // Use translated role names
      const roleLabel = role === 'admin' ? t('dashboard.roles.admin') : t('dashboard.roles.user')
      
      return (
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
          {roleLabel}
        </span>
      )
    },
    enableSorting: false,
  },
  
  // Email Verified Column (no sorting needed - just status display)
  {
    accessorKey: 'emailVerified',
    header: () => {
      const { t } = useI18n()
      return <span>{t('admin.users.table.columns.emailVerified')}</span>
    },
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean
      
      if (verified) {
        return (
          <div class="text-foreground">
            ✓ Verified
          </div>
        )
      }
      
      return (
        <div class="text-muted-foreground">
          ✗ Not verified
        </div>
      )
    },
    enableSorting: false,
  },
  
  // Banned Status Column (no sorting needed - just status display)
  {
    accessorKey: 'banned',
    header: () => {
      const { t } = useI18n()
      return <span>Status</span>
    },
    cell: ({ row }) => {
      const banned = row.getValue('banned') as boolean | null
      
      if (banned) {
        return (
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
            Banned
          </span>
        )
      }
      
      return (
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          Active
        </span>
      )
    },
    enableSorting: false,
  },
  
  // Created At Column (sortable - very useful for chronological order)
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      const { t } = useI18n()
      return (
        <button
          class="flex items-center space-x-2 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>{t('admin.users.table.columns.createdAt')}</span>
          <ArrowUpDown class="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string | Date
      const date = new Date(createdAt)
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      return <div class="text-sm text-muted-foreground">{formatted}</div>
    },
  },
  
  // Updated At Column (sortable - useful to see recent activity)
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      const { t } = useI18n()
      return (
        <button
          class="flex items-center space-x-2 hover:text-accent-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>{t('admin.users.table.columns.updatedAt')}</span>
          <ArrowUpDown class="ml-2 h-4 w-4" />
        </button>
      )
    },
    cell: ({ row }) => {
      const updatedAt = row.getValue('updatedAt') as string | Date
      const date = new Date(updatedAt)
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      return <div class="text-sm text-muted-foreground">{formatted}</div>
    },
  },
  
  // Actions Column (no sorting)
  {
    id: 'actions',
    header: () => {
      const { t } = useI18n()
      return <div class="text-center">{t('admin.users.table.columns.actions')}</div>
    },
    cell: ({ row, table }) => {
      const user = row.original
      
      // Get the onUserUpdated and onUserDeleted functions from table meta
      const meta = table.options.meta as any
      const onUserUpdated = meta?.onUserUpdated
      const onUserDeleted = meta?.onUserDeleted
      
      return h('div', { class: 'flex justify-center' }, 
        h(UsersActionsCell, { 
          user,
          'onUser-updated': onUserUpdated,
          'onUser-deleted': onUserDeleted
        })
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
] 