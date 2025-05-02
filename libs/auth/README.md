# 认证服务

这个服务使用 [Better Auth](https://www.better-auth.com/) 提供完整的身份认证和授权功能。支持多种认证方式，包括邮箱密码、社交登录、手机号码验证等。

## 功能特点

- 多种认证方式
  - 邮箱密码登录
  - 社交账号登录（Google、GitHub、微信）
  - 手机号码验证登录
- 账户管理
  - 邮箱验证
  - 密码重置
  - 账号关联（可以将多个登录方式关联到同一账户）
- 权限控制
  - 管理员角色
  - 基于角色的访问控制
- 国际化支持
  - 支持中英文邮件模板
  - 根据用户语言偏好发送邮件

## 配置说明

配置分为两部分：
- 敏感信息（如 OAuth 密钥等）通过环境变量配置
- 非敏感信息（如功能开关、过期时间等）直接在 `config.ts` 中配置

### 环境变量

复制 `.env.example` 文件为 `.env`，并填入敏感信息：

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# 微信 OAuth
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 基础 URL（可选，默认为 http://localhost:3000）
AUTH_BASE_URL=your_base_url
```

### 配置文件

认证服务配置结构（在 `config.ts` 中）：

```typescript
export const config = {
  auth: {
    // 应用名称
    appName: 'shipeasy',

    // 基础 URL
    baseURL: 'http://localhost:3000',

    // 社交登录提供商配置
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
      },
      wechat: {
        appId: process.env.WECHAT_APP_ID,
        appSecret: process.env.WECHAT_APP_SECRET
      }
    },

    // 邮件验证配置
    emailVerification: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: true,
      autoSignInAfterVerification: true,
      expiryHours: 1
    },

    // 账户配置
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google', 'github', 'wechat']
      }
    },

    // 管理员配置
    admin: {
      roles: ['admin']
    }
  }
};
```

## 使用方法

### 服务端

```typescript
import { auth } from '@libs/auth';
import { toNextJsHandler } from "better-auth/next-js";

// Next.js API 路由处理
export const { GET, POST } = auth.createHandler(
  toNextJsHandler()
);
```

### 客户端（React）

```typescript
import { authClientReact } from '@libs/auth/authClient';

// 在组件中使用
const { signIn, signOut, user } = authClientReact.useAuth();

// 邮箱密码登录
await signIn.emailAndPassword({
  email: 'user@example.com',
  password: 'password123'
});

// 社交登录
await signIn.socialProvider('google');

// 退出登录
await signOut();
```

### 客户端（Vue）

```typescript
import { authClientVue } from '@libs/auth/authClient';

// 在组件中使用
const { signIn, signOut, user } = authClientVue.useAuth();

// 邮箱密码登录
await signIn.emailAndPassword({
  email: 'user@example.com',
  password: 'password123'
});

// 社交登录
await signIn.socialProvider('google');

// 退出登录
await signOut();
```

## 数据库模型

认证服务使用 Drizzle ORM，包含以下数据表：
- `user`: 用户基本信息
- `account`: 关联的社交账号信息
- `session`: 用户会话信息
- `verification`: 验证记录（如邮箱验证、手机验证等）

## 插件系统

服务使用了以下 Better Auth 插件：
- `admin`: 提供管理员角色和权限控制
- `phoneNumber`: 提供手机号码验证功能
- `validator`: 提供输入验证功能
- 自定义的 `wechat` 插件：提供微信登录功能

## 更多文档

- [Better Auth 官方文档](https://www.better-auth.com/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/docs/overview)
- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html) 