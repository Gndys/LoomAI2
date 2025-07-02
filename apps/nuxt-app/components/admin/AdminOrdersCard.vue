<template>
  <Card>
    <CardHeader class="border-b border-border flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle class="text-lg font-semibold flex items-center gap-2">
        <ShoppingCart class="h-5 w-5" />
        {{ $t('admin.dashboard.recentOrders.title') }}
      </CardTitle>
      <div class="text-sm text-muted-foreground">
        {{ $t('admin.dashboard.recentOrders.total') }}: {{ ordersData.length }}
      </div>
    </CardHeader>
    
    <CardContent class="p-0">
      <!-- Loading state -->
      <div v-if="loading" class="p-6">
        <div class="flex items-center justify-center py-8">
          <div class="animate-pulse space-y-2">
            <div class="h-4 bg-muted rounded w-32"></div>
            <div class="h-4 bg-muted rounded w-48"></div>
          </div>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="p-6">
        <div class="text-center py-8">
          <div class="text-destructive text-sm">
            {{ error }}
          </div>
        </div>
      </div>
      
      <!-- No orders -->
      <div v-else-if="ordersData.length === 0" class="p-6">
        <div class="text-center py-8">
          <p class="text-muted-foreground">
            No recent orders found
          </p>
        </div>
      </div>
      
      <!-- Orders table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.orderId') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.customer') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.plan') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.amount') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.provider') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.status') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {{ $t('admin.dashboard.recentOrders.time') }}
              </th>
            </tr>
          </thead>
          
          <tbody class="bg-card divide-y divide-border">
            <tr v-for="order in ordersData" :key="order.id" class="hover:bg-muted/50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                #{{ order.id.slice(-8) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                <div class="flex items-center gap-2">
                  <User class="h-4 w-4" />
                  <div>
                    <div class="font-medium text-card-foreground">
                      {{ order.userName || 'N/A' }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ order.userEmail }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ getPlanName(order.planId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-card-foreground">
                {{ formatAmount(order.amount, order.currency) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground capitalize">
                {{ getProviderDisplay(order.provider) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :variant="getOrderStatusDisplay(order.status).variant">
                  <component :is="getOrderStatusDisplay(order.status).icon" class="h-3 w-3 mr-1" />
                  {{ getOrderStatusDisplay(order.status).text }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {{ formatDate(order.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { 
  ShoppingCart, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-vue-next'
import { config } from '@config'

// Define props interface
interface Props {
  limit?: number
}

// Define order interface
interface AdminOrder {
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
  userName?: string | null
  userEmail?: string | null
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  limit: 10
})

// Reactive data
const ordersData = ref<AdminOrder[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Helper functions
const formatAmount = (amount: string, currency: string): string => {
  const numAmount = parseFloat(amount)
  const symbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency
  return `${symbol}${numAmount.toLocaleString()}`
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPlanName = (planId: string): string => {
  const planNames: Record<string, string> = {
    'pro-monthly': 'Pro Monthly',
    'pro-yearly': 'Pro Yearly',
    'enterprise': 'Enterprise',
    'starter': 'Starter'
  }
  return planNames[planId] || planId
}

const getProviderDisplay = (provider: string): string => {
  const providers: Record<string, string> = {
    'stripe': 'Stripe',
    'wechat': 'WeChat Pay',
    'creem': 'Creem'
  }
  return providers[provider] || provider
}

const getOrderStatusDisplay = (status: string) => {
  const statusConfig: Record<string, { 
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: any 
  }> = {
    'pending': {
      text: 'Pending',
      variant: 'outline',
      icon: Clock
    },
    'paid': {
      text: 'Paid',
      variant: 'default',
      icon: CheckCircle
    },
    'failed': {
      text: 'Failed',
      variant: 'destructive',
      icon: XCircle
    },
    'cancelled': {
      text: 'Cancelled',
      variant: 'secondary',
      icon: XCircle
    },
    'expired': {
      text: 'Expired',
      variant: 'secondary',
      icon: AlertCircle
    },
    'refunded': {
      text: 'Refunded',
      variant: 'outline',
      icon: RotateCcw
    }
  }
  
  return statusConfig[status] || {
    text: status,
    variant: 'outline' as const,
    icon: AlertCircle
  }
}

// Fetch recent orders
const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch<{ orders: AdminOrder[], total: number }>(`/api/admin/orders?limit=${props.limit}`)
    ordersData.value = response.orders || []
  } catch (err) {
    console.error('Failed to fetch admin orders:', err)
    error.value = 'Failed to fetch orders'
    
    // Fallback to demo data for development
    ordersData.value = [
      {
        id: 'ord_demo123456789',
        userId: 'user_123',
        amount: '29.99',
        currency: 'USD',
        planId: 'pro-monthly',
        status: 'paid',
        provider: 'stripe',
        providerOrderId: 'pi_demo123',
        createdAt: new Date(),
        updatedAt: new Date(),
        userName: 'John Doe',
        userEmail: 'john@example.com'
      },
      {
        id: 'ord_demo987654321',
        userId: 'user_456',
        amount: '299.99',
        currency: 'USD',
        planId: 'pro-yearly',
        status: 'pending',
        provider: 'creem',
        providerOrderId: 'creem_456',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000),
        userName: 'Jane Smith',
        userEmail: 'jane@example.com'
      }
    ] as AdminOrder[]
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchOrders()
})
</script> 