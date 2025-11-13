# 更多配置

本文档介绍 TinyShip 应用的其他重要配置选项，包括主题系统、国际化和验证码等功能的配置方法。

## 📑 目录

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
- [总结](#总结)

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

```typescript
export const config = {
  app: {
    theme: {
      defaultTheme: 'light' as const,        // 默认主题模式: 'light' | 'dark'
      defaultColorScheme: 'claude' as const, // 默认颜色方案
      storageKey: 'tinyship-ui-theme'        // 主题持久化存储键
    }
  }
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

```typescript
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

### 在 config.ts 中配置

```typescript
export const config = {
  captcha: {
    enabled: false,                          // 启用/禁用验证码验证
    defaultProvider: 'cloudflare-turnstile', // 默认验证码提供商
    cloudflare: {
      // 配置会自动从环境变量读取，开发环境自动使用测试密钥
    }
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

### 在 config.ts 中配置

```typescript
export const config = {
  ai: {
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

## 总结

这些配置选项让您可以完全自定义 TinyShip 应用的外观、语言、安全和 AI 功能：

- **主题系统**: 5 种预设主题 + 自定义主题支持
- **国际化**: 完整的中英文支持 + 易于扩展
- **验证码**: Cloudflare Turnstile 集成防护
- **AI 对话**: 支持 Qwen、DeepSeek、OpenAI 三大提供商

所有配置都通过 `config.ts` 统一管理，确保一致性和易于维护。根据您的需求启用或禁用这些功能，打造独特的用户体验。
