# 💳 支付配置指南

支付是我们重要的核心功能，目前我们支持三种支付方式：**WeChat Pay**、**Stripe** 和 **Creem**，并且支持单次付费和订阅两种模式（微信支付只支持单次付费）。

## 🎯 支持的支付方式

| 支付方式 | 单次付费 | 订阅付费 | 主要市场 | 币种支持 |
|---------|---------|---------|---------|---------|
| WeChat Pay | ✅ | ❌ | 中国大陆 | CNY |
| Stripe | ✅ | ✅ | 全球 | 多币种 |
| Creem | ✅ | ✅ | 全球 | USD, EUR等 |

## ⚙️ 配置概览

通过 `config.ts` 中的 **payment.providers** 进行设置。建议您根据项目需求和目标市场选择一种支付方式进行配置：

- **中国大陆用户**：推荐 WeChat Pay
- **国际用户**：推荐 Stripe 
- **需要更灵活定价**：推荐 Creem

## 🔧 环境变量申请和配置

### 1. WeChat Pay (微信支付)

微信支付是中国大陆地区最主要的支付方式，适合面向中国用户的应用（需要企业资质，个人无法申请）。

#### 📋 申请流程

1. **注册微信商户平台账号**
   - 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
   - 准备企业营业执照、法人身份证等资料
   - 完成企业认证和账户审核（通常需要1-7个工作日）

2. **获取必要参数**
   - **App ID**: 微信公众号或小程序的应用ID
   - **商户号 (Mch ID)**: 微信支付分配的商户号
   - **API密钥 (API Key)**: 在商户平台的账户设置中生成

3. **配置回调域名**
   - 在商户平台配置支付回调URL
   - 设置为：`https://yourdomain.com/api/payment/webhook/wechat`

#### 🔑 环境变量配置

在 `.env` 文件中添加：

```env
# WeChat Pay 微信支付配置
WECHAT_PAY_APP_ID=wx1234567890abcdef    # 微信应用ID
WECHAT_PAY_MCH_ID=1234567890            # 商户号
WECHAT_PAY_API_KEY=your-32-char-api-key # API密钥
```

#### ⚠️ 注意事项

- 微信支付只支持 CNY (人民币) 币种
- 仅支持单次付费，不支持订阅模式
- 需要企业资质，个人无法申请
- 回调地址必须使用 HTTPS

### 2. Stripe

Stripe 是全球领先的在线支付平台，支持多种币种和支付方式，特别适合国际业务。

#### 📋 申请流程

1. **注册 Stripe 账号**
   - 访问 [Stripe 官网](https://stripe.com/)
   - 使用邮箱注册账号
   - 完成身份验证（需要提供企业或个人信息）

2. **获取 API 密钥**
   - 登录 Stripe Dashboard
   - 前往 "开发者" → "API 密钥"
   - 获取可发布密钥 (Publishable Key) 和秘密密钥 (Secret Key)

3. **创建产品和价格**
   - 在 Dashboard 创建产品 (Products)
   - 为每个产品创建价格 (Prices)
   - 记录价格ID，用于配置 `stripePriceId`

4. **配置 Webhook**
   - 前往 "开发者" → "Webhooks"
   - 添加端点：`https://yourdomain.com/api/payment/webhook/stripe`
   - 选择事件：`checkout.session.completed`, `payment_intent.succeeded`

#### 🔑 环境变量配置

在 `.env` 文件中添加：

```env
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_xxxxxxxx        # 秘密密钥 (生产环境用 sk_live_)
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxx        # 可发布密钥 (生产环境用 pk_live_)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx      # Webhook 签名秘钥
```

#### ✨ 特性

- 支持全球多种币种 (USD, EUR, CNY, JPY 等)
- 支持单次付费和订阅模式
- 支持信用卡、借记卡、数字钱包等多种支付方式
- 个人和企业均可申请

### 3. Creem

Creem 是新兴的支付平台，提供灵活的定价和订阅管理功能。它比 Stripe 的要求更简单，是非常适合独立开发者出海的平台。

#### 📋 申请流程

1. **注册 Creem 账号**
   - 访问 [Creem 官网](https://creem.io/)
   - 注册账号并完成验证

2. **获取 API 密钥**
   - 登录 Creem Dashboard
   - 前往 API 设置页面
   - 生成 API Key 和 Webhook Secret

3. **创建产品**
   - 使用 API 或 Dashboard 创建产品
   - 配置价格和订阅周期
   - 记录产品ID，用于配置 `creemProductId`

#### 🔑 环境变量配置

在 `.env` 文件中添加：

```env
# Creem 配置
CREEM_API_KEY=creem_xxxxxxxx             # API 密钥
CREEM_SERVER_URL=https://api.creem.io    # 服务器地址 (可选，默认为测试环境)
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxx      # Webhook 签名秘钥
```

#### ✨ 特性

- 支持多种币种
- 灵活的定价模型
- 支持单次付费和订阅模式
- 现代化的 API 设计

## 📋 完整环境变量模板

将以下内容添加到你的 `.env` 文件中，根据需要配置相应的支付方式：

```env
# ===========================================
# 支付配置 Payment Configuration  
# ===========================================

# WeChat Pay 微信支付 (中国大陆)
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_API_KEY=your-32-char-api-key

# Stripe (全球)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Creem (全球)
CREEM_API_KEY=creem_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CREEM_SERVER_URL=https://api.creem.io
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```


## 📦 配置付款计划

通过 `config.ts` 中的 **payment.plans** 配置产品定价方案。这里配置的计划会自动显示在 `/pricing` 页面中。

### 💰 计划类型

系统支持两种付费模式：

#### 单次付费 (One-time)
```typescript
type OneTimePlan = {
  duration: { type: 'one_time'; months: number };
  // 其他字段...
}
```

#### 订阅付费 (Recurring) 
```typescript
type RecurringPlan = {
  duration: { type: 'recurring'; months: number };
  stripePriceId?: string;    // Stripe 价格 ID
  creemProductId?: string;   // Creem 产品 ID
  // 其他字段...
}
```

### 🛠️ 计划配置示例

以下是基于 `config.ts` 的实际配置示例：

#### 1. 微信支付方案 (单次付费)

```typescript
monthlyWechat: {
  provider: 'wechat',           // 指定支付提供商
  id: 'monthlyWechat',          // 每种支付方案需要分配一个不同的 id
  amount: 0.01,                 // 金额 (分)
  currency: 'CNY',              // 币种
  duration: {
    months: 1,
    type: 'one_time'            // 微信支付只支持单次付费
  },
  i18n: {
    'en': {
      name: 'Monthly Plan',
      description: 'Perfect for short-term projects',
      duration: 'month',
      features: ['All premium features', 'Priority support']
    },
    'zh-CN': {
      name: '月度订阅wechat',
      description: '每月订阅，灵活管理',
      duration: '月',
      features: ['所有高级功能', '优先支持']
    }
  }
}
```

#### 2. Stripe 订阅方案

```typescript
monthly: {
  provider: 'stripe',
  id: 'monthly',
  // 当使用 Stripe 支付时，订阅的时长和价格将由 stripePriceId 决定
  // 这里的 duration 和 amount 仅用于显示和计算，实际订阅周期和价格以 Stripe 后台配置为准
  amount: 10,                   // 显示金额
  currency: 'CNY',
  duration: {
    months: 1,
    type: 'recurring'           // 支持订阅模式
  },
  stripePriceId: 'price_1RL2GgDjHLfDWeHDBHjoZaap', // Stripe 价格 ID
  recommended: true,            // 推荐标记
  i18n: {
    'en': {
      name: 'Monthly Plan',
      description: 'Perfect for short-term projects',
      duration: 'month',
      features: ['All premium features', 'Priority support']
    },
    'zh-CN': {
      name: '月度订阅',
      description: '每月订阅，灵活管理',
      duration: '月',
      features: ['所有高级功能', '优先支持']
    }
  }
}
```

#### 3. Stripe 终身方案 (单次付费)

```typescript
lifetime: {
  provider: 'stripe',
  id: 'lifetime',
  amount: 999,
  currency: 'CNY',
  recommended: true,            // 设为推荐
  duration: {
    months: 999999,             // 表示终身 plan.duration.months >= 9999; 会被定义为终生会员
    type: 'one_time'           // 单次付费
  },
  stripePriceId: 'price_1RL2IcDjHLfDWeHDMCmobkzb',
  i18n: {
    'en': {
      name: 'Lifetime',
      description: 'One-time payment, lifetime access',
      duration: 'lifetime',
      features: ['All premium features', 'Priority support', 'Free lifetime updates']
    },
    'zh-CN': {
      name: '终身会员',
      description: '一次付费，永久使用',
      duration: '终身',
      features: ['所有高级功能', '优先支持', '终身免费更新']
    }
  }
}
```

#### 4. Creem 订阅方案

```typescript
monthlyCreem: {
  provider: 'creem',
  id: 'monthlyCreem',
  amount: 10,
  currency: 'USD',              // Creem 支持美元
  duration: {
    months: 1,
    type: 'recurring'
  },
  creemProductId: 'prod_1M1c4ktVmvLgrNtpVB9oQf', // Creem 产品 ID
  i18n: {
    'en': {
      name: 'Monthly Plan (Creem)',
      description: 'Perfect for short-term projects via Creem',
      duration: 'month',
      features: ['All premium features', 'Priority support']
    },
    'zh-CN': {
      name: '月度订阅 (Creem)',
      description: '每月订阅，通过Creem支付',
      duration: '月',
      features: ['所有高级功能', '优先支持']
    }
  }
}
```

### 🔗 获取价格 ID

#### Stripe 价格 ID
1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 前往 "产品" → "产品目录"
3. 创建产品并设置价格
4. 复制价格 ID (以 `price_` 开头)

#### Creem 产品 ID  
1. 登录 Creem Dashboard
2. 创建产品并配置价格
3. 或使用 API 创建产品：

```javascript
// 使用 Creem API 创建产品
const product = await fetch('https://api.creem.io/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CREEM_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Monthly Plan',
    price: 10,
    currency: 'USD',
    billing_type: 'recurring',
    billing_period: 'monthly'
  })
});
```

### ⚙️ 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 计划唯一标识符 |
| `provider` | string | ✅ | 支付提供商 (`stripe`, `wechat`, `creem`) |
| `amount` | number | ✅ | 显示金额 |
| `currency` | string | ✅ | 币种代码 |
| `duration.type` | string | ✅ | `one_time` 或 `recurring` |
| `duration.months` | number | ✅ | 时长（月数） |
| `recommended` | boolean | ❌ | 是否推荐 |
| `stripePriceId` | string | ❌ | Stripe 价格 ID (Stripe 必需) |
| `creemProductId` | string | ❌ | Creem 产品 ID (Creem 必需) |
| `i18n` | object | ✅ | 国际化配置 |
| `i18n.{locale}.name` | string | ✅ | 计划名称 |
| `i18n.{locale}.description` | string | ✅ | 计划描述 |
| `i18n.{locale}.duration` | string | ✅ | 时长显示文本 |
| `i18n.{locale}.features` | string[] | ✅ | 功能列表 |

### 🌍 国际化配置

每个计划都需要配置多语言支持：

```typescript
i18n: {
  'en': {                    // 英文
    name: 'Monthly Plan',
    description: 'Perfect for short-term projects', 
    duration: 'month',
    features: ['All premium features', 'Priority support']
  },
  'zh-CN': {                 // 简体中文
    name: '月度订阅',
    description: '每月订阅，灵活管理',
    duration: '月', 
    features: ['所有高级功能', '优先支持']
  }
}
```

### 💡 最佳实践

1. **计划设计**
   - 提供 2-4 个不同价位的计划
   - 设置一个"推荐"计划引导用户选择
   - 功能差异要明显，让用户容易理解价值

2. **定价策略**
   - 终身计划价格通常为年费的 3-5 倍
   - 月费可以设置为年费的 1/10 左右
   - 考虑不同地区的购买力差异

3. **功能配置**
   - 功能描述要简洁明了
   - 突出核心价值点
   - 避免功能列表过长

4. **多币种支持**
   - 根据目标市场配置合适的币种
   - 微信支付只支持 CNY
   - Stripe 和 Creem 支持多种国际币种

## 🔄 支付流程

### 支付处理流程

1. **用户选择计划** → 2. **创建订单** → 3. **跳转支付** → 4. **处理回调** → 5. **更新状态**

### API 端点

项目提供以下支付相关的 API 端点：

```typescript
// 发起支付
POST /api/payment/initiate
{
  "planId": "monthly",
  "provider": "stripe"
}

// 支付状态查询  
GET /api/payment/query/:orderId

// 支付回调处理
POST /api/payment/webhook/:provider

// 取消支付
POST /api/payment/cancel/:orderId
```

### 前端集成示例

```typescript
// 发起支付
const initiatePayment = async (planId: string, provider: string) => {
  try {
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, provider })
    });
    
    const { paymentUrl, orderId } = await response.json();
    
    // 跳转到支付页面
    window.location.href = paymentUrl;
  } catch (error) {
    console.error('Payment initiation failed:', error);
  }
};

// 查询支付状态
const checkPaymentStatus = async (orderId: string) => {
  const response = await fetch(`/api/payment/query/${orderId}`);
  const { status } = await response.json();
  return status; // 'pending' | 'paid' | 'failed' | 'cancelled'
};
```

## 🧪 测试配置

### 测试环境设置

在开发环境中，可以使用测试密钥进行支付测试：

#### Stripe 测试模式

```env
# 使用 test 密钥
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

测试卡号：
- **成功支付**: `4242424242424242`
- **失败支付**: `4000000000000002`  
- **需要验证**: `4000002500003155`

#### 微信支付测试

微信支付需要在商户平台配置测试环境，使用测试商户号进行测试。

#### Creem 测试模式

```env
# 使用测试环境
CREEM_SERVER_URL=https://test-api.creem.io
CREEM_API_KEY=creem_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 本地开发测试

1. **启动本地隧道** (用于接收 Webhook)

```bash
# 使用 ngrok 创建公网隧道
npx ngrok http 3000

# 或使用 localtunnel
npx localtunnel --port 3000
```

2. **配置 Webhook URL**

将隧道地址配置到各支付平台：
- Stripe: `https://abc123.ngrok.io/api/payment/webhook/stripe`
- 微信支付: `https://abc123.ngrok.io/api/payment/webhook/wechat`
- Creem: `https://abc123.ngrok.io/api/payment/webhook/creem`

3. **测试支付流程**

```bash
# 启动开发服务器
pnpm run dev

# 访问定价页面
open http://localhost:3000/pricing

# 选择计划进行测试支付
```

## 🔧 故障排除

### 常见问题

#### 1. Webhook 接收失败

**现象**: 支付成功但订单状态未更新

**解决方案**:
```bash
# 检查 Webhook 签名验证
# 确保 WEBHOOK_SECRET 配置正确
# 查看服务器日志确认是否收到回调
```

#### 2. 支付跳转失败

**现象**: 点击支付按钮无反应或报错

**检查项目**:
- 环境变量是否正确配置
- API 密钥是否有效
- 网络连接是否正常

#### 3. 微信支付回调域名错误

**现象**: `redirect_uri 参数错误`

**解决方案**:
- 检查商户平台配置的回调域名
- 确保域名已备案且可正常访问
- 确认回调 URL 格式正确

#### 4. Stripe 产品价格不匹配

**现象**: 价格显示与实际收费不符

**解决方案**:
- 检查 `stripePriceId` 是否正确
- 确认 Stripe 后台价格配置
- 注意币种和金额单位 (分 vs 元)

### 调试工具

#### 查看支付日志

```bash
# 查看应用日志
pm2 logs

# 查看数据库订单记录
pnpm run db:studio
```

#### Webhook 调试

```bash
# 使用 Stripe CLI 转发 Webhook
stripe listen --forward-to localhost:3000/api/payment/webhook/stripe

# 使用 ngrok 查看请求日志
ngrok http 3000 --log=stdout
```

## 📚 参考文档

- [Stripe 开发文档](https://stripe.com/docs)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)
- [Creem API 文档](https://docs.creem.io/)


