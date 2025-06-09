'use client';

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { authClientReact } from "@libs/auth/authClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Crown, 
  CreditCard, 
  Calendar, 
  Shield,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { t, locale: currentLocale } = useTranslation();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { 
    data: session, 
    isPending
  } = authClientReact.useSession();
  
  const user = session?.user;

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      try {
        const response = await fetch('/api/subscription/status');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchSubscriptionDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString(currentLocale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取用户角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return currentLocale === 'zh-CN' ? '管理员' : 'Administrator';
      case 'user':
        return currentLocale === 'zh-CN' ? '普通用户' : 'User';
      default:
        return role;
    }
  };

  // 获取用户角色徽章颜色
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // 获取订阅状态显示
  const getSubscriptionStatus = () => {
    if (!subscriptionData) return null;
    
    if (subscriptionData.isLifetime) {
      return {
        text: currentLocale === 'zh-CN' ? '终身会员' : 'Lifetime',
        variant: 'default' as const,
        icon: Crown
      };
    }
    
    if (subscriptionData.hasSubscription) {
      const status = subscriptionData.subscription?.status;
      switch (status) {
        case 'active':
          return {
            text: currentLocale === 'zh-CN' ? '有效' : 'Active',
            variant: 'default' as const,
            icon: CheckCircle
          };
        case 'canceled':
          return {
            text: currentLocale === 'zh-CN' ? '已取消' : 'Canceled',
            variant: 'secondary' as const,
            icon: XCircle
          };
        case 'past_due':
          return {
            text: currentLocale === 'zh-CN' ? '逾期' : 'Past Due',
            variant: 'destructive' as const,
            icon: Clock
          };
        default:
          return {
            text: status || (currentLocale === 'zh-CN' ? '未知' : 'Unknown'),
            variant: 'outline' as const,
            icon: CreditCard
          };
      }
    }
    
    return {
      text: currentLocale === 'zh-CN' ? '无订阅' : 'No Subscription',
      variant: 'outline' as const,
      icon: CreditCard
    };
  };

  if (isPending || loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push(`/${currentLocale}/signin`);
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentLocale === 'zh-CN' ? '仪表盘' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {currentLocale === 'zh-CN' ? '管理您的账户和订阅' : 'Manage your account and subscriptions'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 用户信息卡片 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {currentLocale === 'zh-CN' ? '个人信息' : 'Profile Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image || ""} alt={user.name || user.email || "User"} />
                  <AvatarFallback className="text-lg">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-lg font-semibold">{user.name || (currentLocale === 'zh-CN' ? '未设置姓名' : 'No name set')}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {currentLocale === 'zh-CN' ? '角色:' : 'Role:'}
                      </span>
                      <Badge variant={getRoleBadgeVariant(user.role || 'user')}>
                        {getRoleDisplayName(user.role || 'user')}
                      </Badge>
                    </div>
                    
                    {user.emailVerified && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {currentLocale === 'zh-CN' ? '邮箱已验证' : 'Email verified'}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${currentLocale}/profile`}>
                        {currentLocale === 'zh-CN' ? '编辑资料' : 'Edit Profile'}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 订阅状态卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {currentLocale === 'zh-CN' ? '订阅状态' : 'Subscription Status'}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {currentLocale === 'zh-CN' ? '您拥有终身访问权限' : 'You have lifetime access'}
                    </p>
                  </div>
                ) : subscriptionData?.hasSubscription ? (
                  <div className="space-y-2">
                    {subscriptionData.subscription?.periodEnd && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {currentLocale === 'zh-CN' ? '到期时间:' : 'Expires:'}
                        </span>
                        <span>{formatDate(subscriptionData.subscription.periodEnd)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {currentLocale === 'zh-CN' ? '您当前没有有效的订阅' : 'You currently have no active subscription'}
                  </p>
                )}

                <div className="pt-2">
                  {subscriptionData?.hasSubscription || subscriptionData?.isLifetime ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${currentLocale}/dashboard/subscription`}>
                        {currentLocale === 'zh-CN' ? '管理订阅' : 'Manage Subscription'}
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href={`/${currentLocale}/pricing`}>
                        {currentLocale === 'zh-CN' ? '查看套餐' : 'View Plans'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 账户统计卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {currentLocale === 'zh-CN' ? '账户信息' : 'Account Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {currentLocale === 'zh-CN' ? '注册时间' : 'Member since'}
                  </span>
                  <span className="text-sm font-medium">
                    {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </span>
                </div>
                
                {user.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {currentLocale === 'zh-CN' ? '手机号码' : 'Phone Number'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.phoneNumber}</span>
                      {user.phoneNumberVerified && (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 快速操作卡片 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{currentLocale === 'zh-CN' ? '快速操作' : 'Quick Actions'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/${currentLocale}/settings`}>
                    {currentLocale === 'zh-CN' ? '账户设置' : 'Account Settings'}
                  </Link>
                </Button>
                
                {subscriptionData?.hasSubscription && (
                  <Button variant="outline" asChild>
                    <Link href={`/${currentLocale}/dashboard/subscription`}>
                      {currentLocale === 'zh-CN' ? '订阅详情' : 'Subscription Details'}
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" asChild>
                  <Link href={`/${currentLocale}/support`}>
                    {currentLocale === 'zh-CN' ? '获取帮助' : 'Get Support'}
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href={`/${currentLocale}/docs`}>
                    {currentLocale === 'zh-CN' ? '查看文档' : 'View Documentation'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 