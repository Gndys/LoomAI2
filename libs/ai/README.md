# TinyShip AI 集成库

**中文** | [English](./README_EN.md)

这是一个基于 [Vercel AI SDK](https://sdk.vercel.ai/) 的通用 AI 集成解决方案。目前实现了基础的聊天功能和三个 AI 提供商（Qwen、DeepSeek、OpenAI），用户可以根据自己的需求进行扩展。

## 📁 目录结构

```
libs/ai/
├── config.ts         # AI 配置和环境变量设置
├── providers.ts      # AI 模型提供商设置 (OpenAI, DeepSeek, Qwen 等)
├── types.ts          # TypeScript 类型定义
├── utils.ts          # 工具函数
├── index.ts          # 主入口文件
├── README.md         # 中文文档
└── README_EN.md      # 英文文档
```

## 🚀 配置步骤

### 1. 环境变量配置

在根目录的 `.env` 文件中添加 AI 相关的环境变量：

```env
# AI 配置
AI_PROVIDER=qwen  # 默认使用的 AI 提供商

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=optional_base_url  # 可选：自定义 API 基础地址

# 通义千问 (Qwen) 配置
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# DeepSeek 配置
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 2. 支持的 AI 提供商

#### Qwen (通义千问) - 推荐
- **模型**: `qwen-max`, `qwen-plus`, `qwen-turbo`
- **优势**: 中文支持优秀，性价比高
- **获取 API Key**: [阿里云灵积模型服务](https://dashscope.aliyun.com/)

#### DeepSeek
- **模型**: `deepseek-chat`, `deepseek-coder`
- **优势**: 编程能力强，成本低
- **获取 API Key**: [DeepSeek 开放平台](https://platform.deepseek.com/)

#### OpenAI
- **模型**: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`
- **优势**: 性能优秀，生态成熟
- **获取 API Key**: [OpenAI 平台](https://platform.openai.com/)

## 💻 使用方法

### 统一的 Provider 创建

```typescript
import { createAIHandler } from '@libs/ai';

// 使用默认提供商（从环境变量 AI_PROVIDER 获取）
const defaultHandler = createAIHandler();

// 使用指定提供商
const qwenHandler = createAIHandler({ provider: 'qwen' });
const deepseekHandler = createAIHandler({ provider: 'deepseek' });
const openaiHandler = createAIHandler({ provider: 'openai' });
```

### 通用的流式响应函数

```typescript
import { streamResponse } from '@libs/ai';

// 流式响应，支持自定义提供商和模型
const response = streamResponse({
  messages: [
    { role: 'user', content: '你好' }
  ],
  provider: 'qwen',  // 可选，默认使用环境变量配置
  model: 'qwen-max'  // 可选，使用提供商的默认模型
});
```

### 服务器端用法

- **Next.js**: 参考 `apps/next-app/app/api/chat/route.ts`
- **Nuxt.js**: 参考 `apps/nuxt-app/server/api/chat.post.ts`

### 前端用法

- **Next.js (React)**: 参考 `apps/next-app/app/[lang]/(root)/ai/page.tsx`
- **Nuxt.js (Vue)**: 参考 `apps/nuxt-app/pages/ai.vue`

## 🎯 功能特性

1. **多提供商支持**: 统一接口支持 Qwen、DeepSeek、OpenAI
2. **流式响应**: 基于 Vercel AI SDK 的实时流式输出
3. **类型安全**: 完整的 TypeScript 类型支持
4. **可扩展**: 支持添加新的 AI 提供商

## 📦 依赖包

```json
{
  "ai": "4.3.4",
  "@ai-sdk/openai": "1.3.9",
  "@ai-sdk/deepseek": "0.2.8",
  "@ai-sdk/react": "latest",    // Next.js
  "@ai-sdk/vue": "1.2.12"       // Nuxt.js
}
```

## 🔧 添加新的 AI 提供商

### 1. 安装提供商包

```bash
pnpm add @ai-sdk/<provider-name>
```

### 2. 更新类型定义 (`types.ts`)

```typescript
import type { NewProviderSettings } from '@ai-sdk/new-provider';

export type ProviderName = 'qwen' | 'openai' | 'deepseek' | 'new-provider';

export type ProviderConfig = {
  qwen: QwenConfig;
  openai: OpenAIConfig;
  deepseek: DeepSeekConfig;
  'new-provider': NewProviderSettings;
};
```

### 3. 更新环境变量配置 (`config.ts`)

```typescript
const ENV_KEYS = {
  'new-provider': {
    apiKey: 'NEW_PROVIDER_API_KEY',
    baseURL: 'NEW_PROVIDER_BASE_URL' // 如果需要
  }
} as const;
```

### 4. 添加提供商创建逻辑 (`providers.ts`)

```typescript
import { createNewProvider } from '@ai-sdk/new-provider';

export function createProvider(providerName: ProviderName, config: ProviderConfig[ProviderName]) {
  switch (providerName) {
    // ... 现有 case
    case 'new-provider':
      return createNewProvider(config);
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}
```

## 📚 参考文档

- [Vercel AI SDK 文档](https://sdk.vercel.ai/) - 核心 AI SDK 使用指南
- [通义千问 API 文档](https://help.aliyun.com/zh/dashscope/) - 阿里云大模型服务  
- [DeepSeek API 文档](https://platform.deepseek.com/api-docs/) - DeepSeek 开放平台
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference) - OpenAI API 参考
