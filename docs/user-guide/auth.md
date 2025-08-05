# 身份认证配置指南

TinyShip 基于 Better Auth 构建了完整的身份认证系统，支持多种认证方式，包括邮箱密码、OAuth 社交登录和手机短信验证。本指南将帮助你配置和自定义认证功能。

## 🔐 认证技术栈

- **认证库**: Better Auth
- **会话管理**: 基于 Token 的安全会话
- **多因素认证**: 邮箱验证、短信验证
- **社交登录**: Google、GitHub、微信等
- **安全特性**: CSRF 保护、速率限制、密码哈希

## 🚀 快速配置

### 基本环境变量

在 `.env` 文件中配置认证相关环境变量：

```env
# 认证配置
BETTER_AUTH_SECRET="your-secret-key-here-32-characters-min" # 32位随机数
BETTER_AUTH_URL="http://localhost:7001"  # 7001端口是应用启动的默认端口，生产环境改为实际域名

# 数据库配置（认证需要，上一步应该已经配置）
DATABASE_URL="postgresql://username:password@localhost:5432/tinyship"
```

**生成 32 位随机字符串的方法：**

命令行生成：
```bash
# 使用 openssl 生成（推荐）
openssl rand -hex 32

# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 使用 Python 生成
python -c "import secrets; print(secrets.token_hex(32))"
```

在线生成器：
- [RandomKeygen](https://randomkeygen.com/) - 提供多种格式的随机密钥生成
- [Password Generator](https://passwordsgenerator.net/) - 可自定义长度和字符类型

现在我们的应用应该就可以最小化运行了 🎉🎉🎉，可以在根目录运行如下命令来启动应用：

```bash
# 启动 next.js 应用
pnpm run dev:next
# 或者启动 nuxt.js 应用
pnpm run dev:nuxt
# 访问 https://localhost:7001
```

你可以先感受一下大体的功能，现在是最小化应用，一些高级的配置还没有实现（更多登录方式/支付等等），可以继续看下面的内容完成更多配置：

## 📧 邮箱密码认证（默认启用）

邮箱密码认证是默认启用的认证方式，包含以下功能：

### 核心特性
- ✅ 用户注册，支持邮箱验证
- ✅ 用户登录，支持"记住我"功能
- ✅ 密码重置功能
- ✅ 账户恢复选项
- ✅ 安全的会话管理

### 邮箱验证配置

默认情况下，系统要求新用户验证邮箱不需要验证就可以使用。你可以在 `config.ts` 中开启此功能

`config.ts` 是整个应用的配置文件，在这里我们可以修改关于应用的各种配置：

```typescript
// 当设置为 true 的时候，系统会在新用户注册的时候发送验证邮件
// 并且假如用户邮箱没有验证，登录以后没有验证的警告
// 设置为 false 以后，用户注册没有任何限制
auth: {
  requireEmailVerification: true,
}
```

这里强烈建议在线上设置为 true，它通过确认电子邮件地址属于用户来帮助防止垃圾邮件和滥用，也是大多数网站的默认方式。

### 📧 邮件服务配置（可选）

假如你将 `requireEmailVerification` 设置为 true，认证系统会自动发送验证邮件和密码重置邮件。这个时候你就需要接入邮件服务

现在推荐选用 Resend，配置如下：

#### 设置步骤
1. 访问 [Resend](https://resend.com/) 注册账号
2. 验证你的发送域名
3. 获取 API Key

#### 环境变量配置
```env
RESEND_API_KEY="re_123456789_abcdefghijklmnop"
# 默认发送邮件地址, 按照你验证的网址进行配置, 这里你需要任意一个域名进行验证
EMAIL_DEFAULT_FROM="noreply@tinyship.cn"
```

#### 修改配置文件

`config.ts`

```typescript
  email: {
    /**
     * 默认 email 发送提供商
     */
    defaultProvider: 'resend',
  },
```

配置完毕以后应该就在注册的时候成功的发送验证邮件了。

目前应用中使用邮件发送位置如下，用于发送验证邮件和密码重置邮件，供参考：


```typescript
// libs/auth/auth.ts
emailVerification: {
  sendVerificationEmail: async ({ user, url }, request) => {
    // 发送验证邮件，支持多语言
    await sendVerificationEmail(user.email, {
      name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
      verification_url: url,
      expiry_hours: 1,
      locale: locale as 'en' | 'zh-CN' // 类型转换
    });
  }
},
emailAndPassword: {
  sendResetPassword: async ({ user, url }, request) => {
    // 使用我们的邮件模块发送重置密码邮件
    await sendResetPasswordEmail(user.email, {
      name: user.name || user.email.split('@')[0], // 如果没有名字，使用邮箱前缀
      reset_url: url,
      expiry_hours: 1,
      locale: locale as 'en' | 'zh-CN' // 类型转换
    });
  }
}
```

**开发环境建议**: 在本地开发时，调试成功以后，建议先注释掉邮件发送代码，如果想获得最终的数据，我们的代码代码中已经将它添加到一个临时字段中：

```typescript
// 开发环境：将验证链接存储到 context 中，通过 hooks 返回
if (process.env.NODE_ENV === 'development') {
  // 将验证链接存储到全局上下文中，hooks 可以访问
  (request as any).context = (request as any).context || {};
  (request as any).context.verificationUrl = url;
  console.log('🔗 [DEVELOPMENT MODE] Verification URL stored in context:', url);
}
```

你可以查看 network，将对应的 url 复制出来，然后在浏览器中打开即可，在生产环境再启用。

### 扩展邮件功能

除了认证邮件，你还可以扩展邮件服务用于：
- 🎉 欢迎邮件
- 📧 营销邮件
- 🔔 通知邮件
- 📊 系统报告
- 🚨 安全警报

详细配置请参考：[邮件服务文档](../../libs/email/README.md)

## 🌐 OAuth 社交登录（可选）

TinyShip 支持多种 OAuth 提供商，你可以根据需要启用任何一种或多种认证方式。

### 1. Google OAuth 配置

#### 设置步骤
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 在“API 和服务 > 凭据”中创建或编辑 OAuth 2.0 客户端 ID。[Google API Credentials](https://console.cloud.google.com/apis/credentials)
3. 在“授权的 JavaScript 来源”中添加 http://localhost 或 http://127.0.0.1。
4. 在“授权的重定向 URI”中添加具体的回调地址，例如 `https://yourdomain.com/api/auth/callback/google`
本地开发可以设置为：`http://localhost:7001/api/auth/callback/google`

#### 环境变量配置
```env
GOOGLE_CLIENT_ID="your_google_client_id.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```


### 2. GitHub OAuth 配置

#### 设置步骤
1. 访问 [GitHub OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息
4. 设置回调 URL: `https://yourdomain.com/api/auth/callback/github`
本地开发可以设置为：`http://localhost:7001/api/auth/callback/github`

#### 环境变量配置
```env
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### 3. 微信扫码登录配置

#### 设置步骤
1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 注册开发者账号并认证
3. 管理中心 => 网站应用 => 创建网站应用
4. 按邀请输入各种相关信息
5. 获取 AppID 和 AppSecret
6. 设置授权回调域: 网站应用 => 详情 => 开发配置 => 授权回调域:
本地开发可以设置为：`http://localhost:7001/` 这里不需要写后面的后缀

#### 环境变量配置
```env
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_APP_SECRET="your_wechat_app_secret"
```

### 添加更多 OAuth 提供商

Better Auth 支持几乎所有主流 OAuth 提供商。参考 [Better Auth 文档](https://www.better-auth.com/docs/authentication/oauth) 添加更多提供商，如：

- Apple
- Facebook  
- Twitter/X
- LinkedIn
- Discord
- 等等...


## 📱 短信验证登录（可选）

短信验证提供了基于手机号的一次性密码（OTP）认证功能。

### 支持的短信服务商

目前支持阿里云（国内）和 Twillo（国际）两种，你可以按需求进行选择：

* [阿里云短信](https://www.aliyun.com/product/sms) **特别注意：现在使用阿里云短信需要时企业用户，现在有签名报备制度，个人无法通过报备**
* [Twillo](https://www.twilio.com/docs/messaging) **适合出海应用，支持除中国之外的大部分国家**

### 添加环境变量

1. 阿里云短信服务
```env
ALIYUN_ACCESS_KEY_ID="your_aliyun_key_id"
ALIYUN_ACCESS_KEY_SECRET="your_aliyun_key_secret"
ALIYUN_SMS_SIGN_NAME="your-sms-sign-name" #签名名称
ALIYUN_SMS_TEMPLATE_CODE="SMS_000000000" #模版Code
```

2. Twilio 短信服务
```env
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_DEFAULT_FROM="+1234567890"
```

### 修改配置文件

`config.ts` 是整个应用的配置文件，在这里我们可以修改关于应用的各种配置：

### 短信验证配置

在 `libs/auth/auth.ts` 中配置短信发送：

```typescript
  sms: {
    /**
     * Default SMS Provider
     */
    defaultProvider: 'aliyun',
  },
```

配置完毕以后应该就在注册的时候成功的发送验证短信了。

目前应用中使用发送短信功能位置如下 `libs/auth.ts`，用于发送验证短信，供参考：

```typescript
phoneNumber: {
  enabled: true,
  sendOTP: async ({ phoneNumber, code }, request) => {
    console.log(`准备向 ${phoneNumber} 发送验证码: ${code}`);
    
    try {
      // 发送短信验证码
      const result = await sendSMS({
        to: phoneNumber,
        templateParams: {
          code
        },
        provider: 'aliyun' // 或 'twilio'
      });
      
      if (!result.success) {
        const errorMessage = result.error?.message || '短信发送失败';
        console.error('短信发送失败:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log(`验证码 ${code} 已成功发送到 ${phoneNumber}`);
    } catch (error) {
      console.error('发送短信验证码失败:', error);
      throw new Error(`短信发送失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },
  // 验证码多少位
  otpLength: 6,
  otpExpiry: 300, // 5分钟
}
```

**开发环境建议**: 测试完成后，建议在开发环境注释掉短信发送代码，直接保留 `console.log(`准备向 ${phoneNumber} 发送验证码: ${code}`);` 输入打印出的 code 即可，避免产生不必要的费用。
同时如果想在 HTTP 相应中查看：我们的代码代码中已经将它添加到一个临时字段中：

```typescript
// 开发环境：将 OTP 代码存储到 context 中，通过 hooks 返回
if (process.env.NODE_ENV === 'development') {
  (request as any).context = (request as any).context || {};
  (request as any).context.otpCode = code;
  console.log('📱 [DEVELOPMENT MODE] OTP code stored in context:', code);
}
```

你可以查看 network 来获取对应的信息详情。

### 扩展短信功能
除了认证邮件，你还可以扩展短信服务用于：
- 📧 营销短信
- 🔔 通知短信
- 🚨 安全警报
- 自定义验证流程

详细配置请参考：[短信服务文档](../../libs/sms/README.md)

### 前端界面配置

你可以定制化前端的节目，来显示你想要显示的验证方式，或者也可以按照你的需求完全的自定义：

#### Next.js 应用
编辑 `apps/next-app/components/social-auth.tsx` 来控制显示的 OAuth 按钮：

```tsx
const defaultProviders: SocialProvider[] = ['google', 'github', 'wechat', 'phone'];
```

#### Nuxt.js 应用
编辑 `apps/nuxt-app/components/SocialAuth.vue`：

```typescript
const props = withDefaults(defineProps<Props>(), {
  className: '',
  providers: () => ['google', 'github', 'wechat', 'phone']
})
```


更多认证配置和 API 使用请参考 [Better Auth 官方文档](https://www.better-auth.com/docs) 和 `libs/auth/README.md` 文件。

接下来如果你想接入支付的话，让我们来配置 [支付设置](./payment.md), 让你的应用开始赚钱吧。
