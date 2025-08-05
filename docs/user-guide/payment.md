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
- **审核通过更容易**：推荐 Creem

**特别注意：在本地开发阶段我们要使用这些平台的测试/沙盒模式（Stripe 和 Creem 支持，微信支付不支持），所以微信支付如果想测试都是使用真实 0.01 元真实支付进行测试。**

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

3. **下载支付证书**
   - 在商户平台的"账户中心" → "API安全"中下载证书
   - 下载 `apiclient_key.pem`（私钥）和 `apiclient_cert.pem`（证书）
   - 将证书内容转换为环境变量格式（见下方配置说明）

4. **配置回调域名**
  - 在环境变量中设置，请看环境变量配置环节

#### 🔑 环境变量配置

在 `.env` 文件中添加：

```env
# WeChat Pay 微信支付配置
WECHAT_PAY_APP_ID=wx1234567890abcdef    # 微信应用ID
WECHAT_PAY_MCH_ID=1234567890            # 商户号
WECHAT_PAY_API_KEY=your-32-char-api-key # API密钥
# 需要设置成为公网地址，使用内网穿透工具, 后面的 endpoint /api/payment/webhook/wechat 不需要修改
# 具体工具教程请参看，下面的 本地开发测试 环节
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/webhook/wechat

# 微信支付证书配置（将证书文件内容转换为单行格式）
WECHAT_PAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----"
WECHAT_PAY_PUBLIC_KEY="-----BEGIN CERTIFICATE-----\nMIIEpDCCA4ygAwIBAgIU...\n-----END CERTIFICATE-----"
```

#### 📋 证书格式转换

如果你已有证书文件，需要将其转换为单行格式：

```bash
# 转换私钥文件
awk '{printf "%s\\n", $0}' apiclient_key.pem

# 转换证书文件  
awk '{printf "%s\\n", $0}' apiclient_cert.pem
```

将输出结果分别复制到 `WECHAT_PAY_PRIVATE_KEY` 和 `WECHAT_PAY_PUBLIC_KEY` 环境变量中。

#### ⚠️ 注意事项

- 微信支付只支持 CNY (人民币) 币种
- 仅支持单次付费，不支持订阅模式
- 需要企业资质，个人无法申请
- 回调地址必须使用 HTTPS
- 证书内容包含敏感信息，请确保环境变量安全

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

4. **配置 Webhook**
   - 前往 "Developers" → "Webhooks"
   - 添加 Webhook URL：`https://yourdomain.com/api/payment/webhook/stripe`

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
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/webhook/wechat
# 微信支付证书（将证书文件转换为单行格式）
WECHAT_PAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAK...\n-----END RSA PRIVATE KEY-----"
WECHAT_PAY_PUBLIC_KEY="-----BEGIN CERTIFICATE-----\nMIIEpDCCA4y...\n-----END CERTIFICATE-----"

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
默认项目有所有三种支付方式的六种价格条目供参考。

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
  currency: 'USD', 
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

微信支付没有测试沙盒环境，可以使用小金额直接进行测试 - 比如一个订单 0.01 元。

#### Creem 测试模式

```env
# 使用测试环境
CREEM_SERVER_URL=https://test-api.creem.io
CREEM_API_KEY=creem_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 本地开发测试

我们需要使用真实的域名来接收 webhook 的数据，所以这里我们需要将本地服务映射到真实域名上。

* 微信支付 和 Creem 需要使用内网穿透工具
* Stripe 比较方便，它已经有对应的 CLI 工具

1. **启动本地隧道 针对微信支付和 Creem** (用于接收 Webhook)，这里可以选择 ngrok，cloudflare tunnel 等你喜欢的内网穿透工具。

* [ngrok 文档地址](https://ngrok.com/docs/getting-started/)
* [cloudflare 文档地址](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

```bash
# 使用 ngrok 创建公网隧道
npx ngrok http 7001
```

将隧道地址配置到各支付平台：
- 微信支付: `https://abc123.ngrok.io/api/payment/webhook/wechat`
- Creem: `https://abc123.ngrok.io/api/payment/webhook/creem`

**Stripe 使用CLI Stripe CLI**

文档地址： [https://docs.stripe.com/stripe-cli](https://docs.stripe.com/stripe-cli)
```bash
# 使用 Stripe CLI 转发 Webhook
stripe listen --forward-to localhost:7001/api/payment/webhook/stripe
```

3. **测试支付流程**

```bash
# 启动开发服务器
pnpm run dev

# 访问定价页面
open http://localhost:7001/pricing

# 选择计划进行测试支付
```

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

## 📚 参考文档

- [Stripe 开发文档](https://stripe.com/docs)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)
- [Creem API 文档](https://docs.creem.io/)


