'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

interface SubscriptionCardProps {
  // Props interface for subscription data if needed
}

export function SubscriptionCard({}: SubscriptionCardProps) {
  const { t, locale: currentLocale } = useTranslation();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionData() {
      try {
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (subscriptionResponse.ok) {
          const data = await subscriptionResponse.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptionData();
  }, []);

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取订阅状态显示
  const getSubscriptionStatus = () => {
    if (!subscriptionData) return null;
    
    if (subscriptionData.isLifetime) {
      return {
        text: t.dashboard.subscription.status.lifetime,
        variant: 'default' as const,
        icon: Crown
      };
    }
    
    if (subscriptionData.hasSubscription) {
      const status = subscriptionData.subscription?.status;
      switch (status) {
        case 'active':
          return {
            text: t.dashboard.subscription.status.active,
            variant: 'default' as const,
            icon: CheckCircle
          };
        case 'canceled':
          return {
            text: t.dashboard.subscription.status.canceled,
            variant: 'secondary' as const,
            icon: XCircle
          };
        case 'past_due':
          return {
            text: t.dashboard.subscription.status.pastDue,
            variant: 'destructive' as const,
            icon: Clock
          };
        default:
          return {
            text: status || t.dashboard.subscription.status.unknown,
            variant: 'outline' as const,
            icon: CreditCard
          };
      }
    }
    
    return {
      text: t.dashboard.subscription.status.noSubscription,
      variant: 'outline' as const,
      icon: CreditCard
    };
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t.dashboard.subscription.title}
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
          <div className="h-4 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        {t.dashboard.subscription.title}
      </h3>
      <div className="space-y-4">
        {subscriptionStatus && (
          <div className="flex items-center gap-2">
            <subscriptionStatus.icon className="h-4 w-4" />
            <Badge variant={subscriptionStatus.variant}>
              {subscriptionStatus.text}
            </Badge>
          </div>
        )}

        {subscriptionData?.isLifetime ? (
          <p className="text-muted-foreground">
            {t.dashboard.subscription.lifetimeAccess}
          </p>
        ) : subscriptionData?.hasSubscription ? (
          <div>
            {subscriptionData.subscription?.periodEnd && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t.dashboard.subscription.expires}
                </span>
                <span>{formatDate(subscriptionData.subscription.periodEnd)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            {t.dashboard.subscription.noActiveSubscription}
          </p>
        )}

        <div>
          {subscriptionData?.hasSubscription || subscriptionData?.isLifetime ? (
            <Button variant="outline" asChild>
              <Link href={`/${currentLocale}/dashboard/subscription`}>
                {t.dashboard.subscription.manageSubscription}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/${currentLocale}/pricing`}>
                {t.dashboard.subscription.viewPlans}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 