# 更多配置

本文档介绍 TinyShip 应用的其他重要配置选项，包括应用基础配置、主题系统、国际化和验证码等功能的配置方法。

## 📑 目录

- [应用基础配置](#应用基础配置)
  - [应用名称](#应用名称)
  - [Logo 配置](#logo-配置)
- [主题系统配置](#主题系统配置)
  - [可用主题](#可用主题)
  - [在 config.ts 中配置](#在-configts-中配置)
  - [创建自定义主题](#创建自定义主题)
- [国际化配置](#国际化配置)
  - [支持的语言](#支持的语言)
  - [在 config.ts 中配置](#在-configts-中配置-1)
  - [添加新翻译](#添加新翻译)
- [验证码配置](#验证码配置)
  - [在 config.ts 中配置](#在-configts-中配置-2)
  - [环境变量配置](#环境变量配置)
  - [获取 Cloudflare Turnstile 密钥](#获取-cloudflare-turnstile-密钥)
- [AI 对话配置](#ai-对话配置)
  - [支持的 AI 提供商](#支持的-ai-提供商)
  - [在 config.ts 中配置](#在-configts-中配置-3)
  - [环境变量配置](#环境变量配置-1)
  - [获取 API 密钥](#获取-api-密钥)
- [存储服务配置](#存储服务配置)
  - [支持的存储服务商](#支持的存储服务商)
  - [在 config.ts 中配置](#在-configts-中配置-4)
  - [环境变量配置](#环境变量配置-2)
  - [使用方法](#使用方法)
- [总结](#总结)

---

## 应用基础配置

在开始使用 TinyShip 之前，您需要配置一些基础信息，包括应用名称和 Logo。这些配置会影响整个应用的品牌展示。

### 应用名称

应用名称会显示在页面标题、Logo 旁边的文字、邮件模板等位置。

```typescript
// config.ts
export const config = {
  app: {
    name: 'TinyShip',  // 修改为您的应用名称
  }
}
```

### Logo 配置

TinyShip 支持灵活的 Logo 配置，您可以使用图标 + 文字的组合，或者使用完整的 Logo 图片。

```typescript
// config.ts
export const config = {
  app: {
    logo: {
      /**
       * Logo 图标 URL（相对于 public 文件夹的路径或绝对 URL）
       * 推荐尺寸：24x24px 的 SVG 或 PNG
       * @example '/logo.svg' 或 'https://example.com/logo.png'
       */
      iconUrl: '/logo.svg',

      /**
       * 完整 Logo 图片 URL（可选，包含图标和文字）
       * 用于需要展示完整 Logo 图片而非图标 + 文字组合的场景
       * 如果不设置，将使用 iconUrl + app.name 的组合
       * 推荐尺寸：200x40px
       */
      fullLogoUrl: undefined,

      /**
       * 图标容器的自定义 CSS 类
       * 用于添加背景色、边框、圆角、内边距等样式
       * @example 'bg-primary rounded-full p-1' 或 'bg-white shadow-sm rounded-lg'
       */
      iconClassName: 'bg-chart-1 rounded-full p-2',
    },
  }
}
```

**配置选项说明**：

| 选项 | 说明 | 示例 |
|------|------|------|
| `iconUrl` | Logo 图标的路径，支持 SVG、PNG 等格式 | `/logo.svg` |
| `fullLogoUrl` | 完整 Logo 图片路径（可选），设置后会替代图标 + 文字的组合 | `/full-logo.png` |
| `iconClassName` | 图标容器的 Tailwind CSS 类，用于自定义样式 | `bg-chart-1 rounded-full p-2` |

**自定义 Logo 步骤**：

1. **准备 Logo 文件**：
   - 图标文件：推荐 24x24px 的 SVG 格式（白色填充，配合彩色背景使用）
   - 完整 Logo：推荐 200x40px 的 PNG 或 SVG 格式

2. **放置文件**：
   - 将 Logo 文件放入 `apps/next-app/public/` 目录
   - 同时也需要放入 `apps/nuxt-app/public/` 和 `apps/docs-app/public/` 目录

3. **更新配置**：
   ```typescript
   logo: {
     iconUrl: '/my-logo.svg',
     iconClassName: 'bg-blue-500 rounded-full p-1',
   }
   ```


---

## 主题系统配置

TinyShip 内置了强大的多主题系统，基于 shadcn/ui 主题架构，提供 5 种美观的颜色方案和完整的暗黑模式支持。

### 可用主题

1. **Default Theme**: 经典灰度配色，蓝紫色渐变
2. **Claude Theme**: 温暖橙色配色，灵感来自 Claude AI
3. **Cosmic Night Theme**: 神秘紫色配色，宇宙主题
4. **Modern Minimal Theme**: 现代简约紫蓝色配色
5. **Ocean Breeze Theme**: 清新青绿色配色，海洋主题

### 在 config.ts 中配置

主题配置位于 `config.ts` 的 `app` 对象中：

```typescript
// config.ts
export const config = {
  app: {
    theme: {
      defaultTheme: 'light' as const,        // 默认主题模式: 'light' | 'dark'
      defaultColorScheme: 'claude' as const, // 默认颜色方案
      storageKey: 'tinyship-ui-theme'        // 主题持久化存储键
    }
  },
  // 其他配置从 config/ 目录导入...
}
```

**配置选项说明**：
- `defaultTheme`: 应用启动时的默认主题模式
- `defaultColorScheme`: 可选值：`'default' | 'claude' | 'cosmic-night' | 'modern-minimal' | 'ocean-breeze'`
- `storageKey`: 用于在浏览器本地存储中保存用户的主题偏好

### 创建自定义主题

1. 访问 [tweakcn.com](https://tweakcn.com/editor/theme) 主题编辑器
2. 使用可视化编辑器自定义颜色
3. 导出主题 CSS
4. 在 `libs/ui/styles/themes/` 创建新主题文件
5. 添加生成的 CSS 并使用类选择器
6. 更新主题配置

---

## 国际化配置

TinyShip 提供了完整的国际化支持，支持中英文双语，可以轻松扩展到更多语言。

### 支持的语言

- **English (en)** - 英文
- **简体中文 (zh-CN)** - 简体中文，默认语言

### 在 config.ts 中配置

国际化配置位于 `config.ts` 的 `app` 对象中：

```typescript
// config.ts
export const config = {
  app: {
    i18n: {
      defaultLocale: 'zh-CN' as const,  // 默认语言: 'en' | 'zh-CN'
      locales: ['en', 'zh-CN'] as const, // 可用语言列表
      cookieKey: 'NEXT_LOCALE',         // 语言持久化 Cookie 键
      autoDetect: false                 // 是否自动检测浏览器语言
    }
  }
}
```

**配置选项说明**：
- `defaultLocale`: 应用启动时的默认语言
- `locales`: 应用支持的所有语言列表
- `cookieKey`: 用于保存用户语言偏好的 Cookie 名称
- `autoDetect`: 是否自动检测用户浏览器语言设置

### 添加新翻译

如需添加新的翻译内容：

1. 在 `libs/i18n/locales/en.ts` 中添加英文翻译
2. 在 `libs/i18n/locales/zh-CN.ts` 中添加对应的中文翻译
3. 重启开发服务器使更改生效

详细的国际化使用方法请参考：[国际化库文档](../../libs/i18n/README.md)

---

## 验证码配置

TinyShip 支持 Cloudflare Turnstile 验证码，用于防止垃圾注册和恶意请求。

### 在 config/captcha.ts 中配置

```typescript
// config/captcha.ts
export const captchaConfig = {
  enabled: false,                          // 启用/禁用验证码验证
  defaultProvider: 'cloudflare-turnstile', // 默认验证码提供商
  cloudflare: {
    // 配置会自动从环境变量读取，开发环境自动使用测试密钥
  }
}
```

**配置选项说明**：
- `enabled`: 控制是否启用验证码功能
- `defaultProvider`: 目前支持 `'cloudflare-turnstile'`
- `cloudflare`: Cloudflare Turnstile 相关配置

### 环境变量配置

在 `.env` 文件中添加：

```env
# Cloudflare Turnstile 验证码
TURNSTILE_SECRET_KEY="your-turnstile-secret-key"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-turnstile-site-key"
```

### 获取 Cloudflare Turnstile 密钥

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择您的账户
3. 进入 "Turnstile" 页面
4. 创建新站点或使用现有站点
5. 复制 Site Key 和 Secret Key

**注意**: 开发环境会自动使用测试密钥，生产环境必须配置真实的密钥。

---

## AI 对话配置

TinyShip 集成了强大的 AI 对话功能，基于 Vercel AI SDK v5，支持多个主流 AI 提供商，让您轻松构建智能对话体验。

### 支持的 AI 提供商

TinyShip 支持以下三个 AI 提供商，每个都有其独特优势：

| 提供商 | 模型 | 优势 | 推荐场景 |
|--------|------|------|----------|
| **Qwen (通义千问)** | qwen-max, qwen-plus, qwen-turbo | 中文支持优秀，性价比高 | 中文对话、通用场景 |
| **DeepSeek** | deepseek-chat, deepseek-coder | 编程能力强，成本低 | 代码辅助、技术支持 |
| **OpenAI** | gpt-5, gpt-5-codex, gpt-5-pro | 性能强大，生态完善 | 复杂推理、英文对话 |

### 在 config/ai.ts 中配置

```typescript
// config/ai.ts
export const aiConfig = {
  defaultProvider: 'qwen' as const,        // 默认 AI 提供商: 'qwen' | 'deepseek' | 'openai'
  
  defaultModels: {                         // 每个提供商的默认模型
    qwen: 'qwen-turbo',
    deepseek: 'deepseek-chat',
    openai: 'gpt-5'
  },
  
  availableModels: {                       // 每个提供商的可用模型列表
    qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
    openai: ['gpt-5', 'gpt-5-codex', 'gpt-5-pro']
  }
}
```

**配置选项说明**：
- `defaultProvider`: 应用启动时使用的默认 AI 提供商
- `defaultModels`: 每个提供商的默认模型，用户首次访问时使用
- `availableModels`: 在模型选择器中显示的所有可用模型列表

### 环境变量配置

在 `.env` 文件中添加对应的 API 密钥：

```env
# AI Provider Configuration
AI_PROVIDER=qwen  # 可选：qwen, deepseek, openai

# Qwen (通义千问) - 推荐用于中文对话
QWEN_API_KEY="your-qwen-api-key"
QWEN_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"

# DeepSeek - 推荐用于代码相关
DEEPSEEK_API_KEY="your-deepseek-api-key"

# OpenAI - 推荐用于复杂推理
OPENAI_API_KEY="your-openai-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"  # 可选，自定义 API 端点
```

**配置建议**：
- 至少配置一个提供商的 API 密钥
- `AI_PROVIDER` 环境变量会被 `config.ts` 中的 `defaultProvider` 覆盖
- 可以同时配置多个提供商，用户可在界面中切换

### 获取 API 密钥

#### 1. Qwen (通义千问)

1. 访问 [阿里云百炼平台](https://dashscope.aliyun.com/)
2. 注册/登录阿里云账号
3. 进入"API-KEY 管理"页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

**优势**: 中文支持最佳，新用户有免费额度，价格实惠

#### 2. DeepSeek

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入"API Keys"页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

**优势**: 代码生成能力强，价格非常低廉，新用户有免费额度

#### 3. OpenAI

1. 访问 [OpenAI 平台](https://platform.openai.com/)
2. 注册/登录账号
3. 进入"API keys"页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env` 文件

**优势**: 性能强大，生态完善，但价格相对较高

### AI 页面功能

TinyShip 提供了一个 AI 对话页面示例 (`/ai`)，这是一个**大模型对话的简单实现**，采用**可扩展设计**。该示例使用了最新的技术栈 **AI SDK v5 / AI Elements / StreamDown** 实现非常丝滑的聊天效果。

**核心特性**：

- ✨ **实时流式响应**: 基于 Vercel AI SDK v5 的流式对话，打字机效果流畅
- 🎨 **Markdown 渲染**: 支持代码高亮、表格、列表等格式，代码块一键复制
- 🔄 **模型切换**: 用户可在界面中实时切换不同的 AI 模型和提供商
- 💾 **会话管理**: 支持新建对话、重新生成回复等操作
- 🔐 **订阅保护**: 可选择性地限制只有付费用户才能使用 AI 功能
- 📱 **响应式设计**: 完美适配移动端和桌面端，支持自动滚动

**扩展能力**：

此页面只是一个**基础示例**，展示了如何集成 AI 对话功能。您可以基于当前的技术架构，按需扩展为更复杂的功能，例如：

- 🎯 **多轮对话上下文管理**: 实现长期记忆和上下文理解
- 🛠️ **工具调用集成**: 连接外部 API 和数据库，让 AI 执行实际操作
- 📁 **文件上传与分析**: 支持图片、PDF 等文件的 AI 分析
- 👥 **多用户会话隔离**: 为每个用户维护独立的对话历史
- 📊 **对话数据分析**: 记录和分析用户与 AI 的交互数据
- 🎨 **个性化助手**: 根据用户偏好定制 AI 行为和回复风格

**技术架构优势**：

- 基于 Vercel AI SDK v5 的统一接口，易于切换不同的 AI 提供商
- AI Elements 组件库提供开箱即用的 UI 组件
- 流式响应架构天然支持长文本生成
- 模块化设计便于功能扩展和维护

**使用建议**：

- AI 对话功能会消耗 API 配额，请合理控制使用
- 建议在生产环境启用订阅保护，避免滥用
- 可以通过修改 `config.ts` 来添加或移除可用的模型
- 参考 `libs/ai` 库的文档了解更多高级功能

---

## 存储服务配置

TinyShip 提供了统一的云存储服务，支持多个主流云存储服务商，让您轻松管理文件上传、下载和访问。

### 支持的存储服务商

| 服务商 | 优势 | 推荐场景 |
|--------|------|----------|
| **阿里云 OSS** | 中国区域访问快，与阿里云生态集成 | 面向中国用户的应用 |
| **AWS S3** | 全球覆盖，生态成熟，功能丰富 | 面向国际用户的应用 |
| **Cloudflare R2** | 无出口流量费用，性价比高，边缘分发 | 注重成本控制的应用 |

所有服务商都支持以下功能：
- ✅ 文件上传/下载
- ✅ 签名 URL 生成
- ✅ 文件删除
- ✅ 文件存在检查
- ✅ 元数据检索
- ✅ 目录列表

### 在 config/storage.ts 中配置

```typescript
// config/storage.ts
export const storageConfig = {
  defaultProvider: 'oss' as const,  // 默认服务商: 'oss' | 's3' | 'r2'
  
  oss: {
    region: 'oss-cn-shanghai',
    accessKeyId: '...',
    accessKeySecret: '...',
    bucket: 'your-bucket',
    endpoint: '',  // 可选：自定义端点
    defaultExpiration: 60
  },
  
  s3: {
    region: 'us-east-1',
    accessKeyId: '...',
    accessKeySecret: '...',
    bucket: 'your-bucket',
    endpoint: '',  // 可选：S3 兼容服务的自定义端点
    forcePathStyle: false,
    defaultExpiration: 3600
  },
  
  r2: {
    accountId: '...',
    accessKeyId: '...',
    accessKeySecret: '...',
    bucket: 'your-bucket',
    defaultExpiration: 3600
  }
}
```

**配置选项说明**：
- `defaultProvider`: 默认使用的存储服务商
- `defaultExpiration`: 签名 URL 的默认过期时间（秒）
- `forcePathStyle`: S3 兼容服务可能需要设置为 `true`

### 环境变量配置

在 `.env` 文件中添加对应服务商的配置：

```env
# 选择默认存储服务商
STORAGE_PROVIDER=oss  # 可选：oss, s3, r2

# 阿里云 OSS 配置
OSS_REGION=oss-cn-shanghai
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your-bucket-name

# AWS S3 配置
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key_id
S3_ACCESS_KEY_SECRET=your_secret_access_key
S3_BUCKET=your-bucket-name

# Cloudflare R2 配置
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_ACCESS_KEY_SECRET=your_r2_access_key_secret
R2_BUCKET=your-bucket-name
```

**注意**：OSS 的 Access Key 可以复用阿里云通用的 `ALIYUN_ACCESS_KEY_ID` 和 `ALIYUN_ACCESS_KEY_SECRET`，如果未单独配置 OSS 专用的 Key，系统会自动回退使用通用 Key。

### 使用方法

#### 基本使用

```typescript
import { storage } from '@libs/storage';

// 上传文件（使用默认服务商）
const result = await storage.uploadFile({
  file: fileBuffer,
  fileName: 'document.pdf',
  contentType: 'application/pdf',
  folder: 'uploads/2024'
});

// 生成签名下载 URL
const { url } = await storage.generateSignedUrl({
  key: result.key,
  expiresIn: 3600
});
```

#### 使用指定服务商

```typescript
import { createStorageProvider } from '@libs/storage';

// 创建指定服务商实例
const s3Storage = createStorageProvider('s3');
const ossStorage = createStorageProvider('oss');
const r2Storage = createStorageProvider('r2');

// 上传到 S3
await s3Storage.uploadFile({
  file: buffer,
  fileName: 'file.zip'
});
```

详细的 API 文档和更多示例请参考：[存储服务库文档](../../libs/storage/README.md)

---

## 总结

这些配置选项让您可以完全自定义 TinyShip 应用的品牌形象、外观、语言、安全、AI 和存储功能：

- **应用基础配置**: 自定义应用名称和 Logo
- **主题系统**: 5 种预设主题 + 自定义主题支持
- **国际化**: 完整的中英文支持 + 易于扩展
- **验证码**: Cloudflare Turnstile 集成防护
- **AI 对话**: 支持 Qwen、DeepSeek、OpenAI 三大提供商
- **存储服务**: 支持阿里云 OSS、AWS S3、Cloudflare R2

配置采用模块化结构：主文件 `config.ts` 保留应用核心配置（name、theme、i18n），其他配置分布在 `config/` 目录下的独立文件中（auth、payment、credits、ai、storage 等），确保清晰和易于维护。根据您的需求启用或禁用这些功能，打造独特的用户体验。
