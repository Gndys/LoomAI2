# 支付服务

## 概述
一个灵活的支付服务实现，支持微信支付、Stripe 和 Creem 支付方式，同时支持单次付费和订阅两种模式。该服务提供简单的工厂函数来创建支付提供商实例。

## 目录结构
```
libs/payment/
├── providers/           # 支付提供商实现
│   ├── wechat.ts       # 微信支付实现（原生二维码）
│   ├── stripe.ts       # Stripe 实现（结账会话）
│   └── creem.ts        # Creem 实现（结账会话）
├── types.ts            # 共享类型和接口
└── index.ts            # 工厂函数和类型导出
```

## 核心接口

```typescript
// 支付参数
interface PaymentParams {
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: string;
  metadata?: {
    clientIp?: string;
    [key: string]: any;
  };
}

// 支付结果
interface PaymentResult {
  paymentUrl: string;
  providerOrderId: string;
  metadata?: Record<string, any>;
}

// 支付提供商接口
interface PaymentProvider {
  createPayment(params: PaymentParams): Promise<PaymentResult>;
  handleWebhook(payload: any, signature: string): Promise<WebhookVerification>;
  queryOrder?(orderId: string): Promise<OrderQueryResult>;
}

// 工厂函数
function createPaymentProvider(provider: 'stripe' | 'wechat' | 'creem'): PaymentProvider;
```

## 实现说明

1. **提供商创建**
   - 使用 `createPaymentProvider` 工厂函数创建提供商实例
   - 每个提供商都实现 `PaymentProvider` 接口
   - 配置从 `config.ts` 自动加载

2. **支付流程**
   - 在数据库中创建订单记录
   - 创建支付提供商实例
   - 通过提供商初始化支付
   - 处理 Webhook 通知以更新状态

3. **Webhook 处理**
   - 每个提供商实现自己的 Webhook 验证
   - 标准化的 Webhook 响应格式
   - 支持各种支付事件（支付成功、订阅更新等）

4. **订单状态跟踪**
   - 直接从提供商实例查询订单状态
   - 支持异步支付完成

## 使用示例

```typescript
// 创建支付提供商实例
const stripeProvider = createPaymentProvider('stripe');
const creemProvider = createPaymentProvider('creem');

// 使用 Stripe 初始化支付
const stripeResult = await stripeProvider.createPayment({
  orderId: 'order_123',
  userId: 'user_123',
  planId: 'plan_123',
  amount: 100,
  currency: 'CNY',
  provider: 'stripe',
  metadata: {
    clientIp: '127.0.0.1'
  }
});

// 使用 Creem 初始化支付
const creemResult = await creemProvider.createPayment({
  orderId: 'order_456',
  userId: 'user_123',
  planId: 'monthlyCreem',
  amount: 10,
  currency: 'USD',
  provider: 'creem',
  metadata: {
    clientIp: '127.0.0.1'
  }
});

// 处理 Stripe Webhook
app.post('/api/webhook/stripe', async (req, res) => {
  const provider = createPaymentProvider('stripe');
  const result = await provider.handleWebhook(
    req.body,
    req.headers['stripe-signature']
  );
  res.status(200).json(result);
});

// 处理 Creem Webhook
app.post('/api/webhook/creem', async (req, res) => {
  const provider = createPaymentProvider('creem');
  const result = await provider.handleWebhook(
    req.body,
    '' // Creem 不使用签名验证
  );
  res.status(200).json(result);
});

// 查询订单状态
const provider = createPaymentProvider('stripe');
const status = await provider.queryOrder('order_123');
```

## 错误处理

- 提供商特定的错误被规范化为标准格式
- 创建提供商时有清晰的错误消息
- 适当的错误日志记录和监控

## 配置

- API 密钥和密钥的环境变量
- `config.ts` 中的提供商特定配置
- 支持测试/生产模式
- 创建提供商时自动加载配置

## 支付工作流程

### 完整支付流程

支付系统遵循从订单创建到订阅激活的结构化工作流程：

```
1. 用户发起支付（前端）
   ↓
2. 创建订单记录（支付发起 API）
   ↓
3. 初始化支付提供商（支付库）
   ↓
4. 重定向到支付提供商（Stripe/Creem）或显示二维码（微信）
   ↓
5. 用户完成支付（外部支付提供商）
   ↓
6. 支付提供商发送 Webhook（提供商 → 我们的 Webhook 端点）
   ↓
7. 验证支付并创建订阅（Webhook 处理器）
   ↓
8. 用户重定向到成功页面（支付提供商 → 前端）
```

### 关键组件

#### 1. 订单创建
**位置**: `/api/payment/initiate`（Next.js 和 Nuxt 都有）
- 在数据库中创建状态为 `PENDING` 的订单记录
- 使用 `nanoid()` 生成唯一订单ID
- 设置2小时订单过期计时器
- 存储订单元数据，包括用户、计划和金额信息

```typescript
// 订单创建示例
await db.insert(order).values({
  id: orderId,
  userId: session.user.id,
  planId,
  amount: plan.amount.toString(),
  currency: plan.currency,
  status: orderStatus.PENDING,
  provider,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date()
});
```

#### 2. 支付提供商集成
**位置**: `libs/payment/providers/`（Stripe、微信、Creem）
- 每个提供商都实现 `PaymentProvider` 接口
- 处理支付URL生成和提供商特定逻辑
- 管理客户创建和支付会话设置

#### 3. Webhook 处理
**位置**: `/api/payment/webhook/[provider]`
- 接收来自提供商的支付通知
- **更新订单状态**从 `PENDING` 到 `PAID`
- 在数据库中创建订阅记录
- 处理单次和定期支付
- 处理订阅更新和续费

```typescript
// 订单状态更新示例
await db.update(order)
  .set({ 
    status: orderStatus.PAID,
    updatedAt: new Date()
  })
  .where(eq(order.id, session.metadata.orderId));
```

#### 4. 订阅创建和管理
**位置**: 各提供商中的 Webhook 处理器

**初始订阅创建**（首次支付）：
- 通过 Webhook 确认支付时自动创建
- 支持单次购买和定期订阅
- 处理订阅元数据和计费周期

```typescript
// 初始订阅创建示例
await db.insert(userSubscription).values({
  id: randomUUID(),
  userId: session.metadata.userId,
  planId: session.metadata.planId,
  status: subscriptionStatus.ACTIVE,
  paymentType: paymentTypes.RECURRING, // 或 ONE_TIME
  stripeSubscriptionId: subscription.id, // 提供商特定ID
  periodStart: now,
  periodEnd: periodEnd,
  cancelAtPeriodEnd: false,
  metadata: JSON.stringify({ sessionId: session.id })
});
```

**订阅更新和续费**：
- 处理定期支付续费
- 处理计划升级/降级
- 管理订阅取消
- 更新计费周期和定价

```typescript
// 订阅续费示例（Stripe）
await db.update(userSubscription)
  .set({
    planId: newPlanId, // 如果计划更改则更新
    periodStart: new Date(subscriptionItem.current_period_start * 1000),
    periodEnd: new Date(subscriptionItem.current_period_end * 1000),
    updatedAt: new Date()
  })
  .where(eq(userSubscription.stripeSubscriptionId, stripeSubscription.id));
```

### 提供商特定流程

#### Stripe 流程
1. **支付发起**: 创建 Stripe 结账会话
2. **用户支付**: 重定向到 Stripe 托管的结账页面
3. **Webhook**: `checkout.session.completed` 事件触发订阅创建
4. **成功重定向**: 用户重定向到 `/payment-success?session_id=xxx&provider=stripe`

#### Creem 流程
1. **支付发起**: 创建 Creem 结账会话
2. **用户支付**: 重定向到 Creem 托管的结账页面
3. **Webhook**: `checkout.completed` 事件触发订阅创建
4. **成功重定向**: 用户重定向到 `/payment-success?provider=creem&checkout_id=xxx&...`

#### 微信支付流程
1. **支付发起**: 创建微信支付二维码
2. **用户支付**: 使用微信应用扫描二维码
3. **轮询**: 前端每3秒轮询支付状态
4. **Webhook**: 微信发送支付通知（可选）
5. **成功重定向**: 轮询确认支付后前端重定向到成功页面

### 订阅生命周期管理

#### 初始支付和订阅创建
```
Webhook 事件 → 订单更新 (PENDING → PAID) → 订阅创建 (ACTIVE)
```

#### 定期支付续费（Stripe/Creem）
```
订阅续费到期 → 提供商扣费 → Webhook 事件 → 
订阅周期更新 → 计费周期延长
```

#### 订阅更新和计划变更
```
用户升级计划 → 提供商 API 调用 → Webhook 事件 → 
数据库更新（planId、定价、计费周期）
```

#### 各提供商的 Webhook 事件类型

**Stripe Webhook 事件**：
- `checkout.session.completed`: 初始支付完成
- `customer.subscription.updated`: 计划变更、续费
- `customer.subscription.deleted`: 订阅取消
- `invoice.paid`: 定期支付成功
- `invoice.payment_failed`: 续费支付失败

**Creem Webhook 事件**：
- `checkout.completed`: 初始支付完成
- `subscription.active`: 订阅激活
- `subscription.paid`: 定期支付成功
- `subscription.canceled`: 订阅取消
- `subscription.expired`: 订阅过期

**微信支付**：
- 通过轮询验证支付状态（无定期订阅）
- 支付完成的 Webhook 通知（可选）

### 订单生命周期

#### 订单状态和转换
- `PENDING`: 订单已创建，等待支付
- `PAID`: **通过 Webhook 确认支付**，订阅已创建
- `FAILED`: 支付失败或 Webhook 验证失败
- `CANCELED`: 订单过期（2小时后）或手动取消
- `REFUNDED`: 支付已退款（单独处理）

#### 订单状态更新流程
```
1. 订单创建 (PENDING)
   ↓
2. 用户完成支付（外部提供商）
   ↓
3. 接收并验证 Webhook
   ↓
4. 订单更新 (PENDING → PAID)
   ↓
5. 订阅创建/更新 (ACTIVE)
```

**关键**: 订单状态**仅在 Webhook 验证后**更新为 PAID，而不是在支付重定向后立即更新。这确保了支付完整性并防止竞态条件。

#### 自动订单过期
订单在2小时后自动过期，以防止过期的待处理订单：

```typescript
setTimeout(async () => {
  const currentOrder = await db.query.order.findFirst({
    where: eq(order.id, orderId)
  });
  
  if (currentOrder?.status === orderStatus.PENDING) {
    await db.update(order)
      .set({ status: orderStatus.CANCELED })
      .where(eq(order.id, orderId));
      
    // 对于微信支付，也关闭提供商的订单
    if (provider === paymentProviders.WECHAT) {
      await paymentProvider.closeOrder(orderId);
    }
  }
}, ORDER_EXPIRATION_TIME); // 2小时
```

### 错误处理和恢复

#### 支付验证
- **成功页面**: 在显示成功之前验证支付会话
- **Stripe**: 验证 `session_id` 参数
- **Creem**: 使用所有参数验证URL签名
- **微信**: 通过前端轮询预先验证

#### 支付失败
- 订单保持 `PENDING` 状态直到过期
- 用户可以使用相同订单重试支付
- 失败的 Webhook 处理触发错误日志记录

#### 国际化
- **语言环境中间件**: 自动为支付回调URL添加语言环境前缀
- **URL 模式**: `/payment-success` → `/zh-CN/payment-success`
- **语言检测**: 基于 `Accept-Language` 头和 Cookie

## 微信支付证书配置

### 证书管理
微信支付使用环境变量存储证书，替代文件存储方式：

- **WECHAT_PAY_PRIVATE_KEY**: 商户 API 私钥（PEM 格式）
- **WECHAT_PAY_PUBLIC_KEY**: 商户 API 证书（PEM 格式）

### 证书格式
证书内容使用 `\n` 转义符存储为单行格式：

```env
WECHAT_PAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
WECHAT_PAY_PUBLIC_KEY="-----BEGIN CERTIFICATE-----\nMIIEpDCCA4ygAwIBAgIU...\n-----END CERTIFICATE-----"
```

### 证书转换
从 PEM 文件转换为环境变量格式：

```bash
# 转换私钥
awk '{printf "%s\\n", $0}' apiclient_key.pem

# 转换证书
awk '{printf "%s\\n", $0}' apiclient_cert.pem
```

### 安全优势
- ✅ 避免证书文件在代码库中暴露
- ✅ 简化部署流程，无需文件依赖
- ✅ 解决 Monorepo 构建中的文件包含问题
- ✅ 云原生友好，所有平台支持环境变量
