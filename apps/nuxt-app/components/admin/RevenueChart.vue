<template>
  <div>
    <!-- Tab Switcher -->
    <div class="flex items-center justify-end mb-4">
      <div class="inline-flex items-center p-1 bg-muted rounded-lg">
        <button
          @click="activeTab = 'revenue'"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === 'revenue'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ labels.revenue }}
        </button>
        <button
          @click="activeTab = 'orders'"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === 'orders'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ labels.orders }}
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div class="h-64">
      <ClientOnly>
        <AreaChart
          :key="`${activeTab}-${theme}-${colorScheme}`"
          :data="chartData"
          :height="256"
          :categories="activeCategories"
          :y-grid-line="true"
          :x-formatter="xFormatter"
          :curve-type="CurveType.MonotoneX"
          :legend-position="LegendPosition.Top"
          :hide-legend="true"
        />
        <template #fallback>
          <div class="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
            <div class="text-muted-foreground">Loading chart...</div>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { oklch2hex } from 'colorizr'

// Interface for chart data structure
interface RevenueChartItem {
  month: string
  revenue: number
  orders: number
}

// Define props
interface Props {
  chartData?: RevenueChartItem[]
  labels?: {
    revenue: string
    orders: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  chartData: () => [],
  labels: () => ({ revenue: 'Revenue', orders: 'Orders' })
})

// Theme composable for theme switching
const { theme, colorScheme } = useTheme()

// Active tab state
const activeTab = ref<'revenue' | 'orders'>('revenue')

// Parse OKLCH string to object format for colorizr library
const parseOklchString = (oklchString: string) => {
  // Match OKLCH format: oklch(l c h) or oklch(l c h / alpha)
  const match = oklchString.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*[0-9.]+)?\s*\)/)
  
  if (!match) {
    console.warn('Failed to parse OKLCH string:', oklchString)
    return null
  }
  
  const l = parseFloat(match[1])
  const c = parseFloat(match[2])
  const h = parseFloat(match[3])
  
  // Validate parsed values
  if (isNaN(l) || isNaN(c) || isNaN(h)) {
    console.warn('Invalid OKLCH values:', { l, c, h, original: oklchString })
    return null
  }
  
  return { l, c, h }
}

// Get chart colors from CSS custom properties (hex format for chart compatibility)
const getChartColor = (colorVar: string): string => {
  if (import.meta.client) {
    const colorValue = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${colorVar}`)
      .trim()

    if (!colorValue) {
      // Fallback colors
      return colorVar === 'chart-1' ? '#D97706' : '#009689'
    }
    
    // Check if it's already a hex color
    if (colorValue.startsWith('#') || colorValue.startsWith('rgb(')) {
      return colorValue
    }
    
    // Check if it's an OKLCH color and convert to RGB hex using colorizr
    if (colorValue.startsWith('oklch(')) {
      const oklchObject = parseOklchString(colorValue)
      if (oklchObject) {
        try {
          const hexColor = oklch2hex(oklchObject)
          if (process.env.NODE_ENV === 'development') {
            console.log(`OKLCH ${colorValue} → ${hexColor}`)
          }
          return hexColor || '#3b82f6'
        } catch (error) {
          console.warn('Failed to convert OKLCH color:', colorValue, error)
          return '#3b82f6'
        }
      }
    }
        
    // Fallback if format is unrecognized
    return colorValue || '#3b82f6'
  }
  
  // Fallback colors for SSR
  return colorVar === 'chart-1' ? '#D97706' : '#009689'
}

// Active categories based on selected tab
const activeCategories = computed(() => {
  const chartColor = getChartColor('chart-1')
  
  if (activeTab.value === 'revenue') {
    return {
      revenue: {
        name: props.labels.revenue,
        color: chartColor,
      },
    }
  } else {
    return {
      orders: {
        name: props.labels.orders,
        color: chartColor,
      },
    }
  }
})

// Use chartData from props, with fallback demo data
const chartData = computed(() => {
  if (props.chartData && props.chartData.length > 0) {
    return props.chartData
  }
  
  // Fallback demo data for development
  return [
    { month: 'Jan', revenue: 12000, orders: 4500 },
    { month: 'Feb', revenue: 15000, orders: 5200 },
    { month: 'Mar', revenue: 18000, orders: 6100 },
    { month: 'Apr', revenue: 22000, orders: 7300 },
    { month: 'May', revenue: 19000, orders: 6800 },
    { month: 'Jun', revenue: 25000, orders: 8400 },
  ]
})

// X-axis formatter function
const xFormatter = (i: number): string => {
  return chartData.value[i]?.month || ''
}
</script>
