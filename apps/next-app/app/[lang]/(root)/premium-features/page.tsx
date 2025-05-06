'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, FileText, BarChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function PremiumFeaturesPage() {
  const { t } = useTranslation();
  const [userData, setUserData] = useState<{
    subscriptionActive: boolean;
    subscriptionType: string;
    isLifetime: boolean;
    expiresAt?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setUserData({
            subscriptionActive: data.hasSubscription,
            subscriptionType: data.isLifetime ? 'lifetime' : 'recurring',
            isLifetime: data.isLifetime,
            expiresAt: data.subscription?.periodEnd
          });
        }
      } catch (error) {
        console.error('Failed to fetch subscription details', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptionDetails();
  }, []);

  // 高级功能列表
  const premiumFeatures = [
    {
      icon: <User className="h-6 w-6" />,
      title: "高级个人资料",
      description: "自定义您的个人资料，添加更多详细信息和个性化设置。"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI 辅助工具",
      description: "使用我们的人工智能工具简化工作流程，提高工作效率。"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "高级报告",
      description: "访问详细的数据报告和分析，深入了解您的业务表现。"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "高级统计",
      description: "查看详细的统计数据和趋势分析，做出明智的决策。"
    }
  ];

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">高级功能</h1>
            {userData?.isLifetime && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                终身会员
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            感谢您的订阅！以下是您现在可以使用的所有高级功能。
          </p>
        </div>
      </div>

      {/* 显示订阅信息 */}
      {userData && (
        <Card className="mt-6 mb-8">
          <CardHeader>
            <CardTitle>您的订阅</CardTitle>
            <CardDescription>当前订阅状态和详细信息</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">状态</div>
                <div className="text-lg font-bold">{userData.subscriptionActive ? '已激活' : '未激活'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">类型</div>
                <div className="text-lg font-bold">
                  {userData.subscriptionType === 'lifetime' ? '终身会员' : '常规订阅'}
                </div>
              </div>
              {userData.expiresAt && userData.subscriptionType !== 'lifetime' && (
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">到期日期</div>
                  <div className="text-lg font-bold">
                    {new Date(userData.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 高级功能列表 */}
      <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-4">
        {premiumFeatures.map((feature, index) => (
          <Card key={index} className="flex flex-col justify-between">
            <CardHeader>
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">访问功能</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 