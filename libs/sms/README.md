# SMS Service

这个服务提供了一个统一的短信发送接口，支持多个短信服务提供商。目前支持阿里云和 Twilio，可以轻松扩展支持其他提供商。

## 配置

配置分为两部分：
- 敏感信息（如密钥、令牌等）通过环境变量配置
- 非敏感信息（如默认提供商、API端点等）直接在 `config.ts` 中配置

### 环境变量

复制 `.env.example` 文件为 `.env`，并填入敏感信息：

```env
# 阿里云短信配置（敏感信息）
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret

# Twilio短信配置（敏感信息）
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
```

### 配置文件

`config.ts` 文件中的 SMS 配置结构：

```typescript
export const config = {
  sms: {
    // 默认的短信服务提供商
    defaultProvider: 'aliyun',

    // 阿里云短信配置
    aliyun: {
      accessKeyId: requireEnv('ALIYUN_ACCESS_KEY_ID'),        // 敏感信息：从环境变量获取
      accessKeySecret: requireEnv('ALIYUN_ACCESS_KEY_SECRET'), // 敏感信息：从环境变量获取
      endpoint: 'dysmsapi.aliyuncs.com',                      // 固定值
      signName: '您的签名名称',                               // 固定值
    },

    // Twilio短信配置
    twilio: {
      accountSid: requireEnv('TWILIO_ACCOUNT_SID'),    // 敏感信息：从环境变量获取
      authToken: requireEnv('TWILIO_AUTH_TOKEN'),      // 敏感信息：从环境变量获取
      defaultFrom: '+1234567890',                      // 固定值
    }
  }
};
```

## 使用方法

### 基本使用

```typescript
import { sendSMS } from '@libs/sms';

// 使用默认提供商发送短信
await sendSMS({
  to: '+86123456789',
  message: '您的验证码是：123456',
  templateCode: 'SMS_123456',
  templateParams: {
    code: '123456'
  }
});

// 使用 Twilio 发送短信
await sendSMS({
  to: '+1234567890',
  message: 'Your verification code is: 123456',
  provider: 'twilio'
});

// 使用自定义发送号码
await sendSMS({
  to: '+1234567890',
  message: 'Your verification code is: 123456',
  from: '+0987654321',  // 覆盖配置中的默认发送号码
  provider: 'twilio'
});
```

### 响应格式

```typescript
interface SMSResponse {
  success: boolean;        // 发送是否成功
  messageId?: string;      // 消息ID
  requestId?: string;      // 请求ID
  error?: {
    message: string;
    name: string;
    provider?: 'aliyun' | 'twilio';
  } | null;
}
```

## 添加新的服务提供商

1. 在 `.env.example` 和 `.env` 中添加新提供商所需的敏感信息
2. 在 `config.ts` 中的 `sms` 配置中添加新提供商的配置（区分敏感和非敏感信息）
3. 在 `providers` 目录下创建新的提供商实现文件
4. 在 `types.ts` 中的 `SMSProvider` 类型中添加新的提供商
5. 在 `sms-sender.ts` 中添加新的 case 处理

## 注意事项

- 确保在使用前正确配置所有必需的环境变量（仅敏感信息）
- 在 `config.ts` 中直接配置非敏感信息
- 不同提供商可能需要不同的配置参数
- 建议在生产环境中使用错误处理和重试机制 