'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { config } from "@config";

interface Order {
  id: string;
  amount: string;
  currency: string;
  planId: string;
  status: string;
  provider: string;
  providerOrderId?: string | null;
  metadata?: any;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface OrdersCardProps {
  // Props interface for orders data if needed
}

export function OrdersCard({}: OrdersCardProps) {
  const { t, locale: currentLocale } = useTranslation();
  const [ordersData, setOrdersData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrdersData() {
      try {
        const ordersResponse = await fetch('/api/orders');
        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          setOrdersData(data.orders || []);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Failed to fetch orders data', error);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrdersData();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 格式化金额
  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return `${currency === 'CNY' ? '¥' : '$'}${numAmount.toLocaleString()}`;
  };

  // 获取计划名称
  const getPlanName = (planId: string) => {
    const plan = config.payment.plans[planId as keyof typeof config.payment.plans];
    return plan?.i18n[currentLocale]?.name || planId;
  };

  // 获取订单状态显示
  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          text: t.dashboard.orders.status.paid,
          variant: 'default' as const,
          icon: CheckCircle
        };
      case 'pending':
        return {
          text: t.dashboard.orders.status.pending,
          variant: 'secondary' as const,
          icon: Clock
        };
      case 'failed':
        return {
          text: t.dashboard.orders.status.failed,
          variant: 'destructive' as const,
          icon: XCircle
        };
      case 'refunded':
        return {
          text: t.dashboard.orders.status.refunded,
          variant: 'outline' as const,
          icon: RotateCcw
        };
      case 'canceled':
        return {
          text: t.dashboard.orders.status.canceled,
          variant: 'secondary' as const,
          icon: XCircle
        };
      default:
        return {
          text: status,
          variant: 'outline' as const,
          icon: AlertCircle
        };
    }
  };

  // 获取支付方式显示
  const getProviderDisplay = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return t.dashboard.orders.provider.stripe;
      case 'wechat':
        return t.dashboard.orders.provider.wechat;
      default:
        return provider;
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t.dashboard.orders.title}
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t.dashboard.orders.title}
        </h3>
        <div className="text-destructive text-sm">
          {error}
        </div>
      </div>
    );
  }



  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {t.dashboard.orders.title}
        </h3>
        <div className="text-sm text-muted-foreground">
          {t.dashboard.orders.page.totalOrders.replace('{count}', ordersData.length.toString())}
        </div>
      </div>
      
      {ordersData.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            {t.dashboard.orders.noOrdersDescription}
          </p>
          <Button variant="outline" asChild>
            <Link href={`/${currentLocale}/pricing`}>
              {t.dashboard.subscription.viewPlans}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  {t.dashboard.orders.orderDetails.orderId}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  {t.dashboard.orders.orderDetails.plan}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  {t.dashboard.orders.orderDetails.amount}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  {t.dashboard.orders.orderDetails.provider}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  {t.dashboard.orders.orderDetails.status}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[120px]">
                  {t.dashboard.orders.orderDetails.createdAt}
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {ordersData.map((order) => {
                const statusDisplay = getOrderStatusDisplay(order.status);
                return (
                  <tr key={order.id} className="hover:bg-muted/50">
                    <td className="px-3 py-4 text-sm font-medium text-card-foreground">
                      <div className="truncate">#{order.id.slice(-8)}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-muted-foreground">
                      <div className="truncate">{getPlanName(order.planId)}</div>
                    </td>
                    <td className="px-3 py-4 text-sm font-semibold text-card-foreground">
                      <div className="truncate">{formatAmount(order.amount, order.currency)}</div>
                    </td>
                    <td className="px-3 py-4 text-sm text-muted-foreground">
                      <div className="truncate">{getProviderDisplay(order.provider)}</div>
                    </td>
                    <td className="px-3 py-4">
                      <Badge variant={statusDisplay.variant} className="text-xs">
                        <statusDisplay.icon className="h-3 w-3 mr-1" />
                        <span className="truncate">{statusDisplay.text}</span>
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-sm text-muted-foreground">
                      <div className="truncate">{formatDate(order.createdAt)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 