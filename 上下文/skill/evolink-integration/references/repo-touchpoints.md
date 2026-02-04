# Evolink 对接触点

## 环境变量/配置
- env 示例：`env.example`（EVOLINK_API_KEY, EVOLINK_BASE_URL）
- Evolink 配置：`config/evolink.ts`
- 总配置：`config.ts`（导出 config.evolink / config.ai / config.aiImage）

## 图片生成（异步任务）
- 封装：`libs/ai/evolink.ts`
- 图片配置：`config/aiImage.ts`
- 计费配置：`config/credits.ts`
- 示例 API：
  - `apps/next-app/app/api/image-generate/route.ts`
  - `apps/next-app/app/api/clothes-*/route.ts`

## 文本/聊天（provider 体系）
- Provider 类型：`libs/ai/types.ts`
- Provider env：`libs/ai/config.ts`
- Provider 工厂：`libs/ai/providers.ts`
- Chat 路由：`apps/next-app/app/api/chat/route.ts`
- Chat 模型配置：`config/ai.ts`
