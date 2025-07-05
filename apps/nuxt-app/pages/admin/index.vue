<template>
  <div class="p-8 bg-background min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-foreground">{{ $t('admin.dashboard.title') }}</h1>
        <ClientOnly>
          <div class="text-sm text-muted-foreground">
            {{ $t('admin.dashboard.lastUpdated') }}: {{ formattedUpdateTime }}
          </div>
          <template #fallback>
            <div class="text-sm text-muted-foreground">
              {{ $t('admin.dashboard.lastUpdated') }}: --
            </div>
          </template>
        </ClientOnly>
      </div>
      
      <!-- Core Business Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Revenue -->
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ $t('admin.dashboard.metrics.totalRevenue') }}</h3>
              <p class="text-2xl font-bold text-card-foreground">¥{{ formatNumber(stats.revenue.total) }}</p>
              <p class="text-sm text-muted-foreground">{{ $t('admin.dashboard.metrics.totalRevenueDesc') }}</p>
            </div>
            <div class="p-3 bg-chart-2 rounded-full">
              <DollarSign class="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <!-- New Customers -->
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ $t('admin.dashboard.metrics.newCustomers') }}</h3>
              <p class="text-2xl font-bold text-card-foreground">{{ formatNumber(stats.customers.new) }}</p>
              <p class="text-sm text-muted-foreground">{{ $t('admin.dashboard.metrics.newCustomersDesc') }}</p>
            </div>
            <div class="p-3 bg-chart-1 rounded-full">
              <Users class="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <!-- New Orders -->
        <Card class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-muted-foreground">{{ $t('admin.dashboard.metrics.newOrders') }}</h3>
              <p class="text-2xl font-bold text-card-foreground">{{ formatNumber(stats.orders.new) }}</p>
              <p class="text-sm text-muted-foreground">{{ $t('admin.dashboard.metrics.newOrdersDesc') }}</p>
            </div>
            <div class="p-3 bg-chart-3 rounded-full">
              <ShoppingBag class="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Monthly Revenue Trend Chart -->
      <Card class="p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-card-foreground">{{ $t('admin.dashboard.chart.monthlyRevenueTrend') }}</h3>
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-chart-1 rounded-full mr-2"></div>
              <span class="text-muted-foreground">{{ $t('admin.dashboard.chart.revenue') }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-chart-2 rounded-full mr-2"></div>
              <span class="text-muted-foreground">{{ $t('admin.dashboard.chart.orders') }}</span>
            </div>
          </div>
        </div>
        <RevenueChart :chart-data="stats.chartData" />
      </Card>

      <!-- Time-based Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Today's Data -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4 text-card-foreground">{{ $t('admin.dashboard.todayData.title') }}</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.todayData.revenue') }}</span>
              <span class="text-lg font-semibold text-card-foreground">¥{{ formatNumber(stats.todayData.revenue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.todayData.newUsers') }}</span>
              <span class="text-lg font-semibold text-card-foreground">{{ stats.todayData.newUsers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.todayData.orders') }}</span>
              <span class="text-lg font-semibold text-card-foreground">{{ stats.todayData.orders }}</span>
            </div>
          </div>
        </Card>

        <!-- This Month's Data -->
        <Card class="p-6">
          <h3 class="text-lg font-semibold mb-4 text-card-foreground">{{ $t('admin.dashboard.monthData.title') }}</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.monthData.revenue') }}</span>
              <span class="text-lg font-semibold text-card-foreground">¥{{ formatNumber(stats.monthData.revenue) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.monthData.newUsers') }}</span>
              <span class="text-lg font-semibold text-card-foreground">{{ stats.monthData.newUsers }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">{{ $t('admin.dashboard.monthData.orders') }}</span>
              <span class="text-lg font-semibold text-card-foreground">{{ stats.monthData.orders }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Orders -->
      <AdminOrdersCard :limit="10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DollarSign, Users, ShoppingBag } from 'lucide-vue-next'
import RevenueChart from '../../components/admin/RevenueChart.vue'

// Define metadata for SEO
definePageMeta({
  layout: 'admin'
})

// Define types for admin statistics
interface AdminStats {
  revenue: {
    total: number
  }
  customers: {
    new: number
  }
  orders: {
    new: number
  }
  todayData: {
    revenue: number
    newUsers: number
    orders: number
  }
  monthData: {
    revenue: number
    newUsers: number
    orders: number
  }
  chartData: Array<{
    month: string
    revenue: number
    orders: number
  }>
}

// Composables  
const { locale } = useI18n()

// Reactive data
const stats = ref<AdminStats>({
  revenue: { total: 0 },
  customers: { new: 0 },
  orders: { new: 0 },
  todayData: { revenue: 0, newUsers: 0, orders: 0 },
  monthData: { revenue: 0, newUsers: 0, orders: 0 },
  chartData: []
})

const loading = ref(true)
const error = ref<string | null>(null)

// Computed properties
const formattedUpdateTime = computed(() => {
  return new Date().toLocaleString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US')
})

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Fetch admin statistics
const fetchAdminStats = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch<AdminStats>('/api/admin/stats')
    stats.value = response
  } catch (err) {
    console.error('Failed to fetch admin stats:', err)
    error.value = 'Failed to fetch admin statistics'
    
    // Fallback to demo data for development
    stats.value = {
      revenue: { total: 125000 },
      customers: { new: 48 },
      orders: { new: 73 },
      todayData: { revenue: 2500, newUsers: 5, orders: 8 },
      monthData: { revenue: 35000, newUsers: 48, orders: 73 },
      chartData: []
    }
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  fetchAdminStats()
})
</script> 