'use client'

import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, CalendarDays, Download, Flame, Gauge, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreditConsumptionStats {
  summary: {
    totalConsumed: number
    consumedToday: number
    consumed7d: number
    consumed30d: number
    avgDaily30d: number
    transactions30d: number
    activeUsers30d: number
  }
  dailyTrend: Array<{
    date: string
    consumed: number
  }>
  topUsers: Array<{
    userId: string
    userEmail: string | null
    userName: string | null
    consumed: number
  }>
  topDescriptions: Array<{
    description: string
    consumed: number
  }>
  filterUsers: Array<{
    userId: string
    userEmail: string | null
    userName: string | null
  }>
  selectedUserId: string | null
  selectedUserInfo: {
    userId: string
    userEmail: string | null
    userName: string | null
  } | null
}

interface DashboardLabels {
  title: string
  subtitle: string
  empty: string
  summary: {
    consumedToday: string
    consumed7d: string
    consumed30d: string
    totalConsumed: string
    avgDaily30d: string
    activeUsers30d: string
    transactions30d: string
  }
  trend: {
    title: string
    description: string
    consumedLabel: string
    range7d: string
    range30d: string
    range90d: string
  }
  topUsers: {
    title: string
    subtitle: string
    anonymous: string
  }
  topDescriptions: {
    title: string
    subtitle: string
    unknown: string
  }
  controls: {
    allUsers: string
    filterUser: string
    exportCsv: string
    exporting: string
    loading: string
  }
}

interface ConsumptionDashboardProps {
  data: CreditConsumptionStats
  labels: DashboardLabels
  descriptionLabels?: Record<string, string>
}

function formatCredits(value: number): string {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDayLabel(date: string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const TrendTooltip = ({
  active,
  payload,
  label,
  consumedLabel,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
  consumedLabel: string
}) => {
  if (!active || !payload?.length) return null

  const value = payload[0]?.value || 0

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{consumedLabel}: {formatCredits(value)}</p>
    </div>
  )
}

export function ConsumptionDashboard({ data, labels, descriptionLabels }: ConsumptionDashboardProps) {
  const [currentData, setCurrentData] = useState<CreditConsumptionStats>(data)
  const [selectedUserId, setSelectedUserId] = useState<string>(data.selectedUserId || 'all')
  const [isMounted, setIsMounted] = useState(false)
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [chartColor, setChartColor] = useState('#3b82f6')
  const [gridColor, setGridColor] = useState('#e5e7eb')
  const [mutedColor, setMutedColor] = useState('#6b7280')

  useEffect(() => {
    setIsMounted(true)
    const styles = getComputedStyle(document.documentElement)
    setChartColor(styles.getPropertyValue('--chart-1').trim() || '#3b82f6')
    setGridColor(styles.getPropertyValue('--border').trim() || '#e5e7eb')
    setMutedColor(styles.getPropertyValue('--muted-foreground').trim() || '#6b7280')
  }, [])

  useEffect(() => {
    setCurrentData(data)
    setSelectedUserId(data.selectedUserId || 'all')
  }, [data])

  const fetchStats = async (userId: string) => {
    setIsLoading(true)
    try {
      const url = new URL('/api/admin/credits/stats', window.location.origin)
      if (userId !== 'all') {
        url.searchParams.set('userId', userId)
      }

      const response = await fetch(url.toString(), { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const nextData = await response.json()
      setCurrentData(nextData)
    } catch (error) {
      console.error('Failed to refresh consumption stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserChange = (value: string) => {
    setSelectedUserId(value)
    fetchStats(value)
  }

  const csvEscape = (value: string | number): string => {
    const text = String(value)
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const buildCsvText = (): string => {
    const rows: string[][] = []
    const selectedLabel =
      currentData.selectedUserInfo?.userName ||
      currentData.selectedUserInfo?.userEmail ||
      currentData.selectedUserId ||
      labels.controls.allUsers

    rows.push(['Scope', 'Metric', 'Value'])
    rows.push(['Filter', 'Selected User', selectedLabel])
    rows.push(['Summary', labels.summary.consumedToday, formatCredits(currentData.summary.consumedToday)])
    rows.push(['Summary', labels.summary.consumed7d, formatCredits(currentData.summary.consumed7d)])
    rows.push(['Summary', labels.summary.consumed30d, formatCredits(currentData.summary.consumed30d)])
    rows.push(['Summary', labels.summary.totalConsumed, formatCredits(currentData.summary.totalConsumed)])
    rows.push(['Summary', labels.summary.avgDaily30d, formatCredits(currentData.summary.avgDaily30d)])
    rows.push(['Summary', labels.summary.activeUsers30d, formatCredits(currentData.summary.activeUsers30d)])
    rows.push(['Summary', labels.summary.transactions30d, formatCredits(currentData.summary.transactions30d)])

    rows.push([])
    rows.push(['Trend', 'Date', labels.trend.consumedLabel])
    currentData.dailyTrend.forEach((item) => {
      rows.push(['Trend', item.date, formatCredits(item.consumed)])
    })

    rows.push([])
    rows.push(['TopUsers', 'User', labels.trend.consumedLabel])
    currentData.topUsers.forEach((item) => {
      rows.push([
        'TopUsers',
        item.userName || item.userEmail || item.userId,
        formatCredits(item.consumed),
      ])
    })

    rows.push([])
    rows.push(['TopDescriptions', 'Description', labels.trend.consumedLabel])
    currentData.topDescriptions.forEach((item) => {
      rows.push([
        'TopDescriptions',
        descriptionLabels?.[item.description] || item.description || labels.topDescriptions.unknown,
        formatCredits(item.consumed),
      ])
    })

    return rows.map((row) => row.map((cell) => csvEscape(cell)).join(',')).join('\n')
  }

  const handleExportCsv = () => {
    setIsExporting(true)
    try {
      const csvText = buildCsvText()
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const target = currentData.selectedUserId || 'all-users'
      const date = new Date().toISOString().slice(0, 10)

      link.href = url
      link.download = `credit-consumption-${target}-${date}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const trendData = useMemo(() => {
    return currentData.dailyTrend.slice(-range).map((item) => ({
      ...item,
      label: formatDayLabel(item.date),
    }))
  }, [currentData.dailyTrend, range])

  const summaryItems = [
    { key: 'consumedToday', label: labels.summary.consumedToday, value: currentData.summary.consumedToday, icon: CalendarDays },
    { key: 'consumed7d', label: labels.summary.consumed7d, value: currentData.summary.consumed7d, icon: Flame },
    { key: 'consumed30d', label: labels.summary.consumed30d, value: currentData.summary.consumed30d, icon: Gauge },
    { key: 'totalConsumed', label: labels.summary.totalConsumed, value: currentData.summary.totalConsumed, icon: Activity },
    { key: 'avgDaily30d', label: labels.summary.avgDaily30d, value: currentData.summary.avgDaily30d, icon: Gauge },
    { key: 'activeUsers30d', label: labels.summary.activeUsers30d, value: currentData.summary.activeUsers30d, icon: Users },
    { key: 'transactions30d', label: labels.summary.transactions30d, value: currentData.summary.transactions30d, icon: Activity },
  ]

  const noData = currentData.summary.totalConsumed <= 0 && trendData.every((item) => item.consumed <= 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{labels.title}</h2>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedUserId} onValueChange={handleUserChange}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder={labels.controls.filterUser} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.controls.allUsers}</SelectItem>
              {currentData.filterUsers.map((item) => (
                <SelectItem key={item.userId} value={item.userId}>
                  {item.userName || item.userEmail || item.userId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
          >
            <Download className="h-4 w-4" />
            {isExporting ? labels.controls.exporting : labels.controls.exportCsv}
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">{labels.controls.loading}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key} className="gap-0 py-4">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold">{formatCredits(item.value)}</p>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>{labels.trend.title}</CardTitle>
                <CardDescription>{labels.trend.description}</CardDescription>
              </div>
              <div className="inline-flex rounded-md border bg-muted p-1 text-xs">
                <button
                  className={`rounded px-2 py-1 ${range === 7 ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setRange(7)}
                >
                  {labels.trend.range7d}
                </button>
                <button
                  className={`rounded px-2 py-1 ${range === 30 ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setRange(30)}
                >
                  {labels.trend.range30d}
                </button>
                <button
                  className={`rounded px-2 py-1 ${range === 90 ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setRange(90)}
                >
                  {labels.trend.range90d}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {!isMounted ? (
              <div className="h-full animate-pulse rounded bg-muted/40" />
            ) : noData ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {labels.empty}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="consumptionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: mutedColor }} minTickGap={20} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: mutedColor }}
                    tickFormatter={(value) => formatCompact(value)}
                  />
                  <Tooltip content={<TrendTooltip consumedLabel={labels.trend.consumedLabel} />} />
                  <Area type="monotone" dataKey="consumed" stroke={chartColor} fill="url(#consumptionFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="gap-4">
            <CardHeader className="border-b pb-4">
              <CardTitle>{labels.topUsers.title}</CardTitle>
              <CardDescription>{labels.topUsers.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentData.topUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.empty}</p>
              ) : (
                currentData.topUsers.map((item, index) => (
                  <div key={item.userId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">#{index + 1} {item.userName || labels.topUsers.anonymous}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.userEmail || item.userId}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCredits(item.consumed)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader className="border-b pb-4">
              <CardTitle>{labels.topDescriptions.title}</CardTitle>
              <CardDescription>{labels.topDescriptions.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentData.topDescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{labels.empty}</p>
              ) : (
                currentData.topDescriptions.map((item) => (
                  <div key={item.description} className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-muted-foreground">
                      {descriptionLabels?.[item.description] || item.description || labels.topDescriptions.unknown}
                    </p>
                    <p className="text-sm font-semibold">{formatCredits(item.consumed)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
