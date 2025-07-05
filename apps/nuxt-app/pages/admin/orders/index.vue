<template>
  <div class="container mx-auto py-10 px-5">
    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">{{ t('admin.orders.title') }}</h1>
        <p class="text-muted-foreground mt-1">{{ t('admin.users.subtitle') }}</p>
      </div>
      
      <!-- Create Order Button (optional feature) -->
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        {{ t('admin.orders.actions.createOrder') }}
      </Button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="text-center py-10">
      <p class="text-destructive mb-4">{{ t('admin.orders.messages.fetchError') }}</p>
      <Button @click="refresh" variant="outline">
        {{ t('actions.tryAgain') }}
      </Button>
    </div>

    <!-- Loading State -->
    <div v-else-if="pending" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span class="ml-2 text-muted-foreground">{{ t('common.loading') }}</span>
    </div>

    <!-- Data Table -->
    <div v-else class="flex flex-col gap-4">
      <OrdersDataTable 
        :data="(data?.orders || []) as any[]" 
        :pagination="pagination || undefined"
        @refresh-data="refresh"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

// Define page metadata
definePageMeta({
  layout: 'admin'
})

// Get composables
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Parse query parameters - matching users API pattern
const page = computed(() => parseInt(String(route.query.page || '1')) || 1)
const limit = 10

// Build query object for API call
const queryParams = computed(() => {
  const params: any = {
    page: page.value,
    limit,
  }
  
  // Add search parameters if present
  if (route.query.searchValue) {
    params.searchValue = String(route.query.searchValue)
  }
  if (route.query.searchField) {
    params.searchField = String(route.query.searchField)
  }
  if (route.query.status && route.query.status !== 'all') {
    params.status = String(route.query.status)
  }
  if (route.query.provider && route.query.provider !== 'all') {
    params.provider = String(route.query.provider)
  }
  if (route.query.sortBy) {
    params.sortBy = String(route.query.sortBy)
  }
  if (route.query.sortDirection) {
    params.sortDirection = String(route.query.sortDirection)
  }
  
  return params
})

// Fetch orders data
const { data, error, pending, refresh } = await useFetch('/api/admin/orders', {
  query: queryParams,
  server: false,
  default: () => ({
    orders: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  }),

  onResponseError({ response }) {
    console.error('Failed to fetch orders:', response._data)
    toast.error(t('admin.orders.messages.fetchError'))
  }
})

// Compute pagination object - matching users pattern
const pagination = computed(() => {
  if (!data.value) return undefined
  
  return {
    currentPage: page.value,
    totalPages: data.value.totalPages || 1,
    pageSize: limit,
    total: data.value.total || 0
  }
})

// Watch for query changes and refresh data
watch(() => route.query, () => {
  refresh()
}, { deep: true })

// Set page title
useHead({
  title: computed(() => t('admin.orders.title'))
})
</script> 