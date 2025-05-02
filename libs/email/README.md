# Email Service

这个服务提供了一个统一的邮件发送接口，支持多个邮件服务提供商。目前支持 Resend，计划支持 SendGrid 和 SMTP。

## 配置

配置分为两部分：
- 敏感信息（如 API 密钥、密码等）通过环境变量配置
- 非敏感信息（如默认提供商、服务器地址等）直接在 `config.ts` 中配置

### 环境变量

复制 `.env.example` 文件为 `.env`，并填入敏感信息：

```env
# Resend 配置（敏感信息）
RESEND_API_KEY=your_resend_api_key

# SendGrid 配置（敏感信息）
SENDGRID_API_KEY=your_sendgrid_api_key

# SMTP 配置（敏感信息）
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

### 配置文件

`config.ts` 文件中的 Email 配置结构：

```typescript
export const config = {
  email: {
    // 默认的邮件服务提供商
    defaultProvider: 'resend',

    // 默认发件人邮箱
    defaultFrom: 'noreply@example.com',

    // Resend 配置
    resend: {
      apiKey: requireEnv('RESEND_API_KEY'),  // 敏感信息：从环境变量获取
    },

    // SendGrid 配置
    sendgrid: {
      apiKey: requireEnv('SENDGRID_API_KEY'),  // 敏感信息：从环境变量获取
    },

    // SMTP 配置
    smtp: {
      host: 'smtp.example.com',              // 固定值
      port: 587,                             // 固定值
      username: requireEnv('SMTP_USERNAME'), // 敏感信息：从环境变量获取
      password: requireEnv('SMTP_PASSWORD'), // 敏感信息：从环境变量获取
      secure: true,                          // 固定值
    }
  }
};
```

## 使用方法

### 基本使用

```typescript
import { sendEmail } from '@libs/email';

// 使用默认提供商发送邮件
await sendEmail({
  to: 'user@example.com',
  subject: '欢迎使用我们的服务',
  html: '<h1>欢迎！</h1><p>感谢您注册我们的服务。</p>'
});

// 使用指定提供商发送邮件
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  provider: 'sendgrid'
});

// 使用自定义发件人
await sendEmail({
  to: 'user@example.com',
  from: 'support@example.com',
  subject: 'Hello',
  html: '<p>Hello World</p>',
  cc: ['admin@example.com'],
  bcc: ['archive@example.com'],
  replyTo: 'support@example.com'
});
```

### 响应格式

```typescript
interface EmailResponse {
  success: boolean;        // 发送是否成功
  id?: string;            // 邮件ID
  error?: {
    message: string;
    name: string;
    provider?: 'resend' | 'sendgrid' | 'smtp';
  } | null;
}
```

## 添加新的服务提供商

1. 在 `.env.example` 和 `.env` 中添加新提供商所需的敏感信息
2. 在 `config.ts` 中的 `email` 配置中添加新提供商的配置（区分敏感和非敏感信息）
3. 在 `providers` 目录下创建新的提供商实现文件
4. 在 `types.ts` 中的 `EmailProvider` 类型中添加新的提供商
5. 在 `email-sender.ts` 中添加新的 case 处理

## 注意事项

- 确保在使用前正确配置所有必需的环境变量（仅敏感信息）
- 在 `config.ts` 中直接配置非敏感信息
- 不同提供商可能需要不同的配置参数
- 建议在生产环境中使用错误处理和重试机制 