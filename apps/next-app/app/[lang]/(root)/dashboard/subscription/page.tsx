'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { withSubscription } from "@/hooks/useSubscription";
import { CalendarIcon, CreditCard, ExternalLink, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { config } from "@config";

// 基础页面组件 - 会被 withSubscription 包装
function SubscriptionDashboardPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('订阅信息获取失败', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptionDetails();
  }, []);

  // 打开 Stripe 客户门户
  const openStripePortal = async () => {
    try {
      setRedirecting(true);
      const returnUrl = `${window.location.origin}/${currentLocale}/dashboard/subscription`;
      
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnUrl }),
      });
      
      if (!response.ok) {
        throw new Error('无法打开客户门户');
      }
      
      const { url } = await response.json();
      
      // 重定向到 Stripe 客户门户
      window.location.href = url;
    } catch (error) {
      console.error('打开 Stripe 客户门户失败:', error);
      toast.error('无法打开客户门户，请稍后再试');
      setRedirecting(false);
    }
  };

  // 获取计划名称
  const getPlanName = (planId: string) => {
    const plan = config.payment.plans[planId as keyof typeof config.payment.plans];
    if (!plan) return planId; // 如果找不到计划，则返回 planId
    
    // 使用当前语言的翻译
    if (plan.i18n && plan.i18n[currentLocale]) {
      return plan.i18n[currentLocale].name;
    }
    
    // 如果没有当前语言的翻译，则使用默认名称
    return plan.name;
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // 计算订阅期间已经过去的时间比例
  const calculateProgress = () => {
    if (!subscriptionData?.subscription) return 0;
    
    const start = new Date(subscriptionData.subscription.periodStart).getTime();
    const end = new Date(subscriptionData.subscription.periodEnd).getTime();
    const now = Date.now();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return Math.floor(((now - start) / (end - start)) * 100);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 如果用户没有有效订阅（这种情况理论上不会发生，因为 withSubscription 已经处理了）
  if (!subscriptionData?.hasSubscription) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>未找到有效订阅</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">您当前没有活跃的订阅计划。</p>
            <Button asChild>
              <Link href="/pricing">查看订阅计划</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLifetime = subscriptionData.isLifetime;
  const sub = subscriptionData.subscription;
  const planId = sub?.planId || '';

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">我的订阅</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* 订阅概览 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">计划类型</span>
                </div>
                <span className="font-medium text-primary">
                  {isLifetime ? '终身会员' : getPlanName(planId)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">状态</span>
                </div>
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  已激活
                </span>
              </div>
              
              {!isLifetime && sub && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">开始日期</span>
                    </div>
                    <span>{formatDate(sub.periodStart)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">结束日期</span>
                    </div>
                    <span>{formatDate(sub.periodEnd)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">订阅进度</span>
                      <span>{calculateProgress()}%</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 订阅管理 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">需要帮助？</h3>
              <p className="text-sm text-muted-foreground mb-4">
                如果您对订阅有任何问题或需要帮助，请联系我们的客户支持团队。
              </p>
              <Button variant="outline" asChild>
                <Link href="/support">联系支持</Link>
              </Button>
            </div>
            
            {!isLifetime && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">订阅管理</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  您可以在 Stripe 客户门户中管理您的订阅、付款方式和账单历史。
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="default" 
                    className="flex items-center gap-1"
                    onClick={openStripePortal}
                    disabled={redirecting}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {redirecting ? '正在跳转...' : '管理订阅'}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/pricing">更改计划</Link>
                  </Button>
                </div>
              </div>
            )}

            {isLifetime && (
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">终身会员</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  您已经是我们的终身会员，可以永久享受所有高级功能。
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="default" 
                    className="flex items-center gap-1"
                    onClick={openStripePortal}
                    disabled={redirecting}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {redirecting ? '正在跳转...' : '查看账单历史'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 使用 withSubscription 高阶组件包装页面，这样只有订阅用户才能访问
export default withSubscription(SubscriptionDashboardPage); 