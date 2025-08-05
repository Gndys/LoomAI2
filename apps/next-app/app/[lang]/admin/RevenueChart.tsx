'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

// 格式化数字显示
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Revenue chart tooltip
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-card-foreground">{`${label}`}</p>
        <p className="text-sm text-chart-1">
          {`收入: ¥${payload[0]?.value?.toLocaleString() || 0}`}
        </p>
      </div>
    );
  }
  return null;
};

// Orders chart tooltip
const OrdersTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-lg shadow-lg">
        <p className="text-sm font-medium text-card-foreground">{`${label}`}</p>
        <p className="text-sm text-chart-2">
          {`订单: ${payload[0]?.value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在服务端渲染时显示占位符
  if (!isClient) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted-foreground/30 rounded w-32 mx-auto mb-2"></div>
            <div className="h-3 bg-muted-foreground/20 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // 获取 CSS 变量值
  const getComputedColor = (variable: string) => {
    if (typeof window === 'undefined') return '#000';
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };

  const chart1Color = getComputedColor('--chart-1');
  const chart2Color = getComputedColor('--chart-2');
  const borderColor = getComputedColor('--border');
  const mutedForegroundColor = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <div className="space-y-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chart1Color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chart1Color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="month" 
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `¥${formatNumber(value)}`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chart1Color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="space-y-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chart2Color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chart2Color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                dataKey="month" 
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={mutedForegroundColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<OrdersTooltip />} />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={chart2Color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorOrders)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 