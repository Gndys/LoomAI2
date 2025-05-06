import { auth } from "@libs/auth";
import { createPaymentProvider } from "@libs/payment";
import { nanoid } from "nanoid";
import { db } from "@libs/database";
import { order, orderStatus, paymentProviders } from "@libs/database/schema/order";
import { config } from "@config";

export async function POST(req: Request) {
  try {
    // 1. 验证用户登录状态
    const requestHeaders = new Headers(req.headers);
    const session = await auth.api.getSession({
      headers: requestHeaders
    });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 获取请求参数
    const { planId, provider = paymentProviders.STRIPE } = await req.json();
    if (!planId) {
      return Response.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // 3. 创建订单记录
    const orderId = nanoid();
    const plan = config.payment.plans[planId as keyof typeof config.payment.plans];
    if (!plan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    await db.insert(order).values({
      id: orderId,
      userId: session.user.id,
      planId,
      amount: plan.amount.toString(), // Convert to string for numeric field
      currency: plan.currency,
      status: orderStatus.PENDING,
      provider,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Order created:', orderId);
    // 4. 创建支付提供商实例并发起支付
    const paymentProvider = createPaymentProvider(provider as 'stripe' | 'wechat');
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    
    const result = await paymentProvider.createPayment({
      orderId,
      userId: session.user.id,
      planId,
      amount: plan.amount,
      currency: plan.currency,
      provider,
      metadata: {
        clientIp,
        description: `${plan.name} - ${plan.duration.description}`
      }
    });
    console.log('Payment initiation result:', result);
    return Response.json(result);
  } catch (error) {
    console.error('Payment initiation error:', error);
    return Response.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
} 