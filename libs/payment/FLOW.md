# Payment Flow Design

## 数据结构

```typescript
// libs/database/schema/order.ts
export const order = pgTable("order", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  planId: text("plan_id").notNull(), // 对应 config.payment.plans 中的 id
  status: text("status").notNull(), // pending, paid, failed
  provider: text("provider").notNull(), // wechat, stripe
  providerOrderId: text("provider_order_id"), // 支付平台的订单ID
  metadata: jsonb("metadata"), // 存储支付平台返回的额外信息
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## 订阅状态管理

```typescript
// libs/database/utils/subscription.ts
export async function checkSubscriptionStatus(userId: string) {
  // 获取用户的订阅
  const userSub = await db.select()
    .from(subscription)
    .where(
      and(
        eq(subscription.userId, userId),
        eq(subscription.status, subscriptionStatus.ACTIVE)
      )
    )
    .limit(1);

  if (!userSub.length) return null;

  // 检查是否过期
  const sub = userSub[0];
  if (sub.endDate < new Date()) {
    // 更新状态
    await db.update(subscription)
      .set({ status: subscriptionStatus.CANCELED })
      .where(eq(subscription.id, sub.id));
    
    return null;
  }

  return sub;
}

// 计算订阅结束时间
function calculateEndDate(planId: string): Date {
  const plan = config.payment.plans[planId];
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + plan.duration.months);
  return endDate;
}

// 使用示例：
// 1. API 中间件
export async function withSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sub = await checkSubscriptionStatus(req.user.id);
  if (!sub) {
    return res.status(403).json({ error: 'Subscription required' });
  }
  req.subscription = sub;
  next();
}

// 2. 页面访问
// apps/next-app/app/dashboard/page.tsx
export default async function DashboardPage() {
  const sub = await checkSubscriptionStatus(session.user.id);
  
  return (
    <div>
      {sub ? (
        <PremiumDashboard subscription={sub} />
      ) : (
        <UpgradePrompt plans={Object.values(config.payment.plans)} />
      )}
    </div>
  );
}
```

## API 路由设计

```typescript
// apps/next-app/app/api/payment/initiate/route.ts
export async function POST(req: Request) {
  const { userId, planId, provider } = await req.json();
  
  // 获取计划信息
  const plan = config.payment.plans[planId];
  if (!plan) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // 1. 创建订单记录
  const order = await db.insert(orders).values({
    id: generateId(),
    userId,
    planId,
    amount: plan.amount,
    currency: plan.currency,
    status: 'pending',
    provider
  }).returning();

  // 2. 调用支付服务
  const paymentService = new PaymentService();
  const paymentResult = await paymentService.initiatePayment({
    orderId: order.id,
    userId,
    planId,
    amount: plan.amount,
    currency: plan.currency,
    provider,
    description: `${plan.name} - ${plan.duration.description}`
  });

  return Response.json(paymentResult);
}

// apps/next-app/app/api/payment/webhook/route.ts
export async function POST(req: Request) {
  const payload = await req.json();
  const provider = determineProvider(req.headers);
  
  const paymentService = new PaymentService();
  await paymentService.handleWebhook(provider, payload);
  
  return new Response(null, { status: 200 });
}
```

## 前端流程

```typescript
// apps/next-app/app/dashboard/subscription/page.tsx
'use client';

async function handlePayment(planId: string) {
  // 1. 发起支付
  const response = await fetch('/api/payment/initiate', {
    method: 'POST',
    body: JSON.stringify({
      planId,
      provider: 'wechat' // 或者 'stripe'
    })
  });
  
  const { paymentUrl, orderId } = await response.json();
  
  // 2. 对于微信支付，显示二维码
  if (provider === 'wechat') {
    showQRCode(paymentUrl);
    // 启动轮询检查支付状态
    startPolling(orderId);
  }
  
  // 对于Stripe，重定向到支付页面
  if (provider === 'stripe') {
    window.location.href = paymentUrl;
  }
}

// 轮询检查支付状态
async function startPolling(orderId: string) {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/payment/check/${orderId}`);
    const { status } = await response.json();
    
    if (status === 'paid') {
      clearInterval(interval);
      // 刷新用户订阅状态
      router.refresh();
    }
  }, 3000);
}
```

## 支付服务实现

```typescript
// libs/payment/index.ts
export class PaymentService {
  private providers: Record<string, PaymentProvider>;

  constructor() {
    this.providers = {
      wechat: new WeChatPayProvider(config.payment.providers.wechat),
      stripe: new StripeProvider(config.payment.providers.stripe)
    };
  }

  async initiatePayment(params: PaymentParams): Promise<PaymentResult> {
    const provider = this.providers[params.provider];
    const result = await provider.createPayment(params);
    
    // 更新订单信息
    await db.update(orders)
      .set({ 
        providerOrderId: result.providerOrderId,
        metadata: result.metadata 
      })
      .where(eq(orders.id, params.orderId));
    
    return result;
  }

  async handleWebhook(provider: string, payload: any) {
    const paymentProvider = this.providers[provider];
    const verification = await paymentProvider.verifyPayment(payload);
    
    if (verification.success) {
      // 1. 获取订单信息
      const order = await db.select()
        .from(orders)
        .where(eq(orders.id, verification.orderId))
        .limit(1);

      if (!order.length) return;
      
      // 2. 更新订单状态
      await db.update(orders)
        .set({ status: 'paid' })
        .where(eq(orders.id, verification.orderId));
      
      // 3. 创建或更新订阅
      await db.insert(subscription).values({
        userId: verification.userId,
        status: subscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: calculateEndDate(order[0].planId),
        transactionId: verification.orderId,
        amount: order[0].amount,
        currency: order[0].currency
      });
    }
  }
}
```

## 主要流程说明

1. **计划配置**
   - 在 config.ts 中定义所有可用的订阅计划
   - 包含价格、时长、功能特性等信息
   - 支持与第三方支付平台的产品映射

2. **发起支付**
   - 用户选择订阅计划
   - 创建订单记录，关联计划信息
   - 调用对应支付平台创建支付
   - 返回支付链接或二维码

3. **支付状态更新**
   - 支付平台通过 webhook 通知支付结果
   - 更新订单状态
   - 根据计划信息创建/更新用户订阅记录

4. **订阅状态管理**
   - 采用按需检查方案
   - 在用户访问需要订阅的功能时检查状态
   - 自动将过期订阅标记为已取消
   - 可以通过中间件或页面级别进行检查

5. **前端处理**
   - 展示可用的订阅计划
   - 微信支付：显示二维码并轮询支付状态
   - Stripe：重定向到支付页面
   - 支付完成后刷新用户订阅状态

6. **错误处理**
   - 支付超时处理
   - 订单状态异常处理
   - 重复支付处理
   - 订阅状态检查失败处理

这个设计现在更加完整，通过配置文件管理订阅计划，既保持了灵活性，又避免了数据库的复杂性。你可以根据需要扩展更多功能，比如：
- 退款处理
- 订单查询接口
- 支付统计
- 发票生成等 