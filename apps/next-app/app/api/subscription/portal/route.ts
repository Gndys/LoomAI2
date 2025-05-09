import { NextResponse } from 'next/server';
import { auth } from '@libs/auth';
import { db } from '@libs/database';
import { subscription } from '@libs/database/schema/subscription';
import { eq } from 'drizzle-orm';
import { createPaymentProvider, StripeProvider } from '@libs/payment';
import { config } from '@config';

export async function POST(request: Request) {
  try {
    // 获取用户会话信息
    const requestHeaders = new Headers(request.headers);
    const session = await auth.api.getSession({
        headers: requestHeaders
    });

    // 检查用户是否已登录
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取用户的 Stripe 客户 ID
    const userSubscription = await db.query.subscription.findFirst({
      where: eq(subscription.userId, userId)
    });

    if (!userSubscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: '找不到订阅信息' },
        { status: 404 }
      );
    }

    // 创建 Stripe provider
    const stripeProvider = createPaymentProvider('stripe') as StripeProvider;
    
    // 获取请求体，如果有的话
    const body = await request.json().catch(() => ({}));
    // 从请求中提取 return_url，如果没有则使用默认值
    const returnUrl = body.returnUrl || `${config.app.baseUrl}/dashboard/subscription`;

    // 使用封装好的方法创建客户门户会话
    const portalSession = await stripeProvider.createCustomerPortal(
      userSubscription.stripeCustomerId,
      returnUrl
    );

    // 返回门户会话 URL
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('创建客户门户会话失败:', error);
    return NextResponse.json(
      { error: '创建门户会话失败' },
      { status: 500 }
    );
  }
} 