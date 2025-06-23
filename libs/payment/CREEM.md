# Creem Payment Provider Integration

## Overview

The Creem payment provider integrates with Creem's payment platform to handle subscriptions and one-time payments. This implementation uses the official [Creem TypeScript SDK](https://docs.creem.io/sdk/typescript-sdk) and includes support for MCP (Model Context Protocol) tools for easy management.

## SDK Implementation

Our implementation uses the official Creem TypeScript SDK for better type safety and maintenance. The SDK is configured to automatically select the correct server environment:

```typescript
const creem = new Creem({
  serverIdx: isTestMode ? 1 : 0, // 0: production, 1: test-mode
  serverURL: config.payment.providers.creem.serverUrl
});
```

Due to some discrepancies between the SDK's TypeScript definitions and the actual API structure (which matches the MCP tools format), we use the MCP-compatible parameter structure internally.

### ⚠️ Important API Constraints

- **Customer Parameters**: Creem API only allows **either** `customer.id` **OR** `customer.email`, not both simultaneously
- **Error Handling**: If both are provided, you'll get a 400 error: "You may only specify one of these parameters: customer.id, customer.email"

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Creem Configuration
CREEM_API_KEY=ck_live_your_api_key_here  # or ck_test_... for testing
CREEM_WEBHOOK_SECRET=your_webhook_secret_here  # Required for webhook verification
CREEM_SERVER_URL=https://api.creem.io     # Default production URL
```

### 🔑 获取 Webhook Secret

1. 登录 [Creem Dashboard](https://dashboard.creem.io)
2. 进入 **Developers > Webhook** 页面
3. 复制你的 **Webhook Secret**
4. 将其设置为 `CREEM_WEBHOOK_SECRET` 环境变量

> ⚠️ **重要**: Webhook Secret 是验证 webhook 请求真实性的关键，确保安全存储。

### Plan Configuration

In your `config.ts`, add Creem plans:

```typescript
monthlyCreem: {
  provider: 'creem',
  id: 'monthlyCreem',
  name: '月度订阅',
  description: '每月订阅，灵活管理',
  amount: 10,
  currency: 'USD',
  duration: {
    months: 1,
    description: '1个月',
    type: 'recurring'
  },
  creemProductId: 'prod_xxxxxxxxxxxxx', // Set after creating product in Creem
  features: [
    '所有高级功能',
    '优先支持'
  ],
  i18n: {
    'en': {
      name: 'Monthly Plan (Creem)',
      description: 'Perfect for short-term projects via Creem',
      duration: 'month',
      features: [
        'All premium features',
        'Priority support'
      ]
    },
    'zh-CN': {
      name: '月度订阅 (Creem)',
      description: '每月订阅，通过Creem支付',
      duration: '月',
      features: [
        '所有高级功能',
        '优先支持'
      ]
    }
  }
}
```

## Setup Process

### 1. Create Products in Creem

Use MCP tools to create products in Creem:

```typescript
// Example: Create a monthly subscription product
await mcp_Creem_create_product({
  request: {
    'x-api-key': 'your_api_key',
    CreateProductRequestEntity: {
      name: 'Monthly Subscription',
      price: 1000, // $10.00 (price in cents)
      currency: 'USD',
      billing_type: 'recurring',
      billing_period: 'month',
      description: 'Monthly subscription with premium features',
      default_success_url: 'https://yourapp.com/payment-success',
      tax_mode: 'automatic',
      tax_category: 'digital_services'
    }
  }
});
```

### 2. Update Configuration

After creating products, update your `config.ts` with the returned product IDs:

```typescript
creemProductId: 'prod_xxxxxxxxxxxxx' // Replace with actual product ID
```

### 3. Database Schema Updates

The database schema has been updated to include Creem-specific fields:

```sql
-- User table additions
ALTER TABLE "user" ADD COLUMN "creem_customer_id" text;

-- Subscription table additions  
ALTER TABLE "subscription" ADD COLUMN "creem_customer_id" text;
ALTER TABLE "subscription" ADD COLUMN "creem_subscription_id" text;
```

## Usage

### Creating Payments

```typescript
import { createPaymentProvider } from '@libs/payment';

const creemProvider = createPaymentProvider('creem');

const result = await creemProvider.createPayment({
  orderId: 'order_123',
  userId: 'user_123', 
  planId: 'monthlyCreem',
  amount: 10,
  currency: 'USD',
  metadata: {
    customField: 'value'
  }
});

// Redirect user to: result.paymentUrl
```

#### Creem API Response Structure

The actual Creem checkout response contains:

```typescript
{
  id: 'ch_2PzhfVVjkMmwen6agGGBSu',           // Checkout ID
  mode: 'test',                              // 'test' or 'live'
  object: 'checkout',                        // Object type
  status: 'pending',                         // Checkout status
  product: 'prod_1M1c4ktVmvLgrNtpVB9oQf',   // Product ID
  units: 1,                                  // Quantity
  checkoutUrl: 'https://creem.io/test/checkout/...', // Payment URL
  metadata: {                                // Your custom metadata
    planId: 'monthlyCreem',
    userId: 'user_id',
    orderId: 'order_id'
  }
}
```

> 📝 **Note**: We use the `checkout.id` as the `providerOrderId` since Creem doesn't provide a separate order ID in the initial response.

### Webhook Handling

Creem webhooks are automatically handled at `/api/payment/webhook/creem` with signature verification:

```typescript
// Webhook events handled:
// - checkout.completed: Payment successful
// - subscription.created: New subscription
// - subscription.updated: Subscription changes
// - subscription.cancelled: Subscription cancellation
```

#### 🔐 Webhook 签名验证

根据 [Creem 文档](https://docs.creem.io/learn/webhooks/verify-webhook-requests)，所有 webhook 请求都包含 `creem-signature` 头部，用于验证请求的真实性：

```typescript
// 自动验证过程
1. 提取 'creem-signature' 头部
2. 使用 HMAC-SHA256 算法验证签名
3. 比较计算出的签名与接收到的签名
4. 只有验证通过的请求才会被处理

// 验证算法
const computedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');
```

#### 📊 Webhook 数据结构

实际的 Creem webhook 数据结构：

```typescript
{
  "id": "evt_5WHHcZPv7VS0YUsberIuOz",
  "eventType": "checkout.completed",           // 事件类型
  "created_at": 1728734325927,
  "object": {                                  // 主要数据在 object 字段中
    "id": "ch_4l0N34kxo16AhRKUHFUuXr",        // Checkout ID
    "object": "checkout",
    "request_id": "my-request-id",
    "order": {                                 // 订单信息
      "id": "ord_4aDwWXjMLpes4Kj4XqNnUA",
      "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
      "product": "prod_d1AY2Sadk9YAvLI0pj97f",
      "amount": 1000,
      "currency": "EUR",
      "status": "paid",
      "type": "recurring"
    },
    "customer": {                              // 客户信息
      "id": "cust_1OcIK1GEuVvXZwD19tjq2z",
      "email": "tester@gmail.com",
      "name": "Tester Test"
    },
    "subscription": {                          // 订阅信息(如果是订阅)
      "id": "sub_6pC2lNB6joCRQIZ1aMrTpi",
      "product": "prod_d1AY2Sadk9YAvLI0pj97f",
      "customer": "cust_1OcIK1GEuVvXZwD19tjq2z",
      "status": "active"
    },
    "metadata": {                              // 你的自定义数据
      "orderId": "your_order_id",
      "userId": "your_user_id",
      "planId": "your_plan_id"
    },
    "status": "completed"
  }
}
```

> ✅ **安全性**: 只有来自 Creem 的真实请求才能通过签名验证，防止恶意请求。

### Return URL Verification

Based on [Creem's Return URLs documentation](https://docs.creem.io/learn/checkout-session/return-url), we implement signature verification for payment success redirects:

```typescript
// Automatic verification endpoint
// Users are redirected to: /api/payment/verify/creem
// Which validates the signature and redirects to success/cancel pages

// Manual verification
const creemProvider = createPaymentProvider('creem');
const verification = creemProvider.verifyReturnUrl(returnUrl);

if (verification.isValid) {
  // Process successful payment
  console.log('Payment verified:', verification.params);
} else {
  // Handle verification failure
  console.error('Verification failed:', verification.error);
}
```

The verification process includes:
- **Signature validation**: Using SHA256 hash with API key as salt
- **Parameter validation**: Ensuring required fields are present
- **Optional API verification**: Double-checking with Creem API
- **Database updates**: Updating local order status

#### Return URL Format

When a payment is successful, Creem redirects users to your success URL with these parameters:

```
https://yourapp.com/api/payment/verify/creem?checkout_id=ch_1QyIQDw9cbFWdA1ry5Qc6I&order_id=ord_4ucZ7Ts3r7EhSrl5yQE4G6&customer_id=cust_2KaCAtu6l3tpjIr8Nr9XOp&subscription_id=sub_ILWMTY6uBim4EB0uxK6WE&product_id=prod_6tW66i0oZM7w1qXReHJrwg&signature=044bd1691d254c4ad4b31b7f246330adf09a9f07781cd639979a288623f4394c
```

| Parameter | Description |
|-----------|-------------|
| `checkout_id` | The checkout session ID |
| `order_id` | The order ID created after payment |
| `customer_id` | The customer ID |
| `subscription_id` | The subscription ID (if applicable) |
| `product_id` | The product ID |
| `signature` | SHA256 hash of all parameters + API key |

### Customer Portal

Create customer portal links for subscription management:

```typescript
const creemProvider = createPaymentProvider('creem');
const portal = await creemProvider.createCreemCustomerPortal(
  customerId,
  'https://yourapp.com/dashboard'
);

// Redirect user to: portal.url
```

## MCP Tools Available

The following MCP tools are available for Creem management:

### Products
- `mcp_Creem_create-product`: Create new products
- `mcp_Creem_retrieve-product`: Get product details
- `mcp_Creem_search-products`: List all products

### Customers
- `mcp_Creem_retrieve-customer`: Get customer details
- `mcp_Creem_generate-customer-links`: Create customer portal links

### Subscriptions
- `mcp_Creem_retrieve-subscription`: Get subscription details
- `mcp_Creem_cancel-subscription`: Cancel a subscription
- `mcp_Creem_update-subscription`: Update subscription
- `mcp_Creem_upgrade-subscription`: Upgrade to different product

### Checkouts
- `mcp_Creem_create-checkout`: Create new checkout session
- `mcp_Creem_retrieve-checkout`: Get checkout details

### Licenses
- `mcp_Creem_activate-license`: Activate license keys
- `mcp_Creem_deactivate-license`: Deactivate licenses
- `mcp_Creem_validate-license`: Validate license status

### Discounts
- `mcp_Creem_create-discount`: Create discount codes
- `mcp_Creem_retrieve-discount`: Get discount details
- `mcp_Creem_delete-discount`: Remove discounts

### Transactions
- `mcp_Creem_search-transactions`: List transaction history

## Example MCP Tool Usage

### Creating a Product

```typescript
const product = await mcp_Creem_create_product({
  request: {
    'x-api-key': process.env.CREEM_API_KEY,
    CreateProductRequestEntity: {
      name: 'Premium Plan',
      price: 2000, // $20.00
      currency: 'USD',
      billing_type: 'recurring',
      billing_period: 'month',
      description: 'Premium features with priority support',
      image_url: 'https://yourapp.com/images/premium-plan.png',
      custom_field: [
        {
          type: 'text',
          key: 'company',
          label: 'Company Name',
          optional: true,
          text: {
            max_length: 100,
            min_length: 1
          }
        }
      ]
    }
  }
});
```

### Managing Subscriptions

```typescript
// Cancel a subscription
await mcp_Creem_cancel_subscription({
  request: {
    id: 'sub_xxxxxxxxxxxxx',
    'x-api-key': process.env.CREEM_API_KEY
  }
});

// Upgrade subscription
await mcp_Creem_upgrade_subscription({
  request: {
    id: 'sub_xxxxxxxxxxxxx',
    'x-api-key': process.env.CREEM_API_KEY,
    UpgradeSubscriptionRequestEntity: {
      product_id: 'prod_new_plan_id',
      update_behavior: 'proration-charge-immediately'
    }
  }
});
```

## Error Handling

The Creem provider includes comprehensive error handling:

```typescript
try {
  const result = await creemProvider.createPayment(params);
  // Handle success
} catch (error) {
  if (error.message.includes('Creem product ID not configured')) {
    // Handle missing product configuration
  } else if (error.message.includes('User not found')) {
    // Handle user validation errors
  } else {
    // Handle other payment errors
  }
}
```

## Testing

Use test API keys for development:

```bash
CREEM_API_KEY=ck_test_your_test_key_here
CREEM_SERVER_URL=https://test-api.creem.io
```

## Migration from Other Providers

If migrating from Stripe or other providers:

1. Map existing subscription data to Creem format
2. Update webhook endpoints
3. Test payment flows thoroughly
4. Update customer portal integrations

## Support

For Creem-specific issues:
- Check Creem documentation: https://docs.creem.io
- Use MCP tools for debugging
- Monitor webhook logs for payment events 

## 🔄 避免重复操作的设计

### 问题描述
在 Creem 支付流程中，可能存在两个更新订单状态的路径：
1. **Return URL 验证** - 用户支付成功后重定向回来
2. **Webhook 处理** - Creem 服务器主动通知支付结果

这可能导致：
- **重复更新**：同一个订单被更新两次
- **竞态条件**：两个请求同时到达
- **数据不一致**：状态可能被覆盖

### 解决方案

#### 📋 职责分离

**Return URL 验证** (`handleSuccessRedirect`):
- **唯一职责**：验证签名，确保重定向安全性
- **不做任何数据库操作**：完全依赖 webhook 处理业务逻辑
- **用户体验**：快速验证并重定向，提供即时反馈

**Webhook 处理** (`handleCheckoutCompleted`):
- **唯一权威**：所有订单状态更新和业务逻辑处理
- **最终状态**：直接设置为 `PAID` 状态
- **完整处理**：创建订阅记录、更新用户信息等
- **简化逻辑**：无需检查重复，直接处理

#### 🔒 简化设计原则

**完全分离关注点**：
```typescript
// Return URL 处理 - 只验证，不更新数据库
async handleSuccessRedirect(urlString: string) {
  const verification = this.verifyReturnUrl(urlString);
  if (!verification.isValid) {
    return { success: false, error: verification.error };
  }
  
  // 可选：验证 Creem API 状态（仅用于用户体验）
  // 不进行任何数据库操作
  return { success: true, params: verification.params };
}

// Webhook 处理 - 唯一的数据更新源
async handleCheckoutCompleted(webhookData: any) {
  // 直接更新，无需检查重复
  await db.update(order).set({ 
    status: orderStatus.PAID,
    metadata: JSON.stringify({
      webhookProcessed: true,
      // ... Creem 数据
    })
  });
}
```

#### 🔍 状态追踪

通过 metadata 字段记录处理信息：

- `webhookProcessed: true` - Webhook 已处理
- `webhookProcessedAt` - 处理时间戳
- `creemCheckoutId`, `creemOrderId` 等 - Creem 相关数据

### 推荐流程

1. **用户支付成功** → Return URL 验证签名 → 重定向到成功页面
2. **Creem Webhook** → 唯一的数据处理 → 设置 `"paid"` 状态
3. **前端轮询/实时更新** → 检查订单状态变化 → 更新 UI

这样确保：
- ✅ **架构简洁**：单一数据源，无重复逻辑
- ✅ **数据一致性**：Webhook 是唯一权威源
- ✅ **用户体验**：快速重定向 + 实时状态更新
- ✅ **安全性**：Return URL 签名验证防止伪造
- ✅ **可靠性**：即使 Return URL 失败，Webhook 仍会处理

## 📝 测试建议

测试不同的到达顺序：

```bash
# 测试 1: Return URL 先到达
curl -X POST "http://localhost:3000/api/payment/verify/creem?checkout_id=test&..."

# 测试 2: Webhook 后到达
curl -X POST "http://localhost:3000/api/payment/webhook/creem" \
  -H "Content-Type: application/json" \
  -d '{"event": "checkout.completed", "data": {...}}'
```

检查 metadata 中的处理标记：
```sql
SELECT metadata FROM "order" WHERE id = 'your-order-id';
```

## 🎯 最佳实践

1. **单一数据源**：Webhook 是唯一的订单状态更新源
2. **Return URL 纯验证**：只做签名验证，不触碰数据库
3. **前端状态同步**：通过轮询或 WebSocket 实时更新用户界面
4. **错误处理**：Return URL 失败不影响支付处理
5. **完整日志**：记录验证和处理步骤用于调试
6. **架构简洁**：避免复杂的状态检查和合并逻辑
7. **安全第一**：
   - 始终验证 webhook 签名
   - 安全存储 webhook secret
   - 验证 Return URL 签名
   - 记录所有验证失败的尝试 