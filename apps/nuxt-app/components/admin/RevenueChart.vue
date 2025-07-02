<template>
  <!-- Re-render the component on colorMode change -->
  <AreaChart
    :key="colorMode.value"
    :data="chartData"
    :height="300"
    :categories="categories"
    :y-grid-line="true"
    :x-formatter="xFormatter"
    :curve-type="CurveType.MonotoneX"
    :legend-position="LegendPosition.Top"
    :hide-legend="false"
  />
</template>

<script setup lang="ts">
// Interface for chart data structure
interface RevenueChartItem {
  month: string
  revenue: number
  orders: number
}

// Define props
interface Props {
  chartData?: RevenueChartItem[]
}

const props = withDefaults(defineProps<Props>(), {
  chartData: () => []
})

// Color mode composable for theme switching
const colorMode = useColorMode()

// Get chart colors from CSS custom properties (hex format for chart compatibility)
const getChartColor = (colorVar: string): string => {
  if (import.meta.client) {
    const hexValue = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${colorVar}-hex`)
      .trim()
    
    return hexValue || '#3b82f6'
  }
  
  // Fallback colors for SSR
  return colorVar === 'chart-1' ? '#D97706' : '#009689'
}

// Define chart categories with CSS variable colors
const categories = computed(() => {
  const revenueColor = getChartColor('chart-1')
  const ordersColor = getChartColor('chart-2')
  
  return {
    revenue: {
      name: 'Revenue',
      color: revenueColor, // Uses CSS variable --chart-1-hex
    },
    orders: {
      name: 'Orders', 
      color: ordersColor, // Uses CSS variable --chart-2-hex
    },
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