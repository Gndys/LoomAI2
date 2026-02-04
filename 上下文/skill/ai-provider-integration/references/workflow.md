# AI Provider / Model 添加流程

## 1) 新增文本/聊天 Provider
1. 在 `libs/ai/types.ts` 中把 provider 名加入 AllProviderName 与 ChatProviderName，并为 ProviderConfig 添加配置类型。
2. 在 `libs/ai/config.ts` 的 PROVIDER_ENV_KEYS 里添加 apiKey/baseURL 与 capabilities: ['chat']。
3. 在 `libs/ai/providers.ts` 新增 case：
   - OpenAI 兼容接口用 `createOpenAICompatible`。
   - baseURL 统一规范为结尾 `/v1`（参考 devdove 写法）。
4. 在 `config/ai.ts` 加入 defaultModels 与 availableModels。
5. 如需 UI 展示 provider/model 文案，补充前端 i18n 映射。
6. 用 `apps/next-app/app/api/chat/route.ts` 做联调（provider/model 会透传）。

## 2) 新增文本模型（已有 Provider 下）
1. 只改 `config/ai.ts` 的 defaultModels/availableModels。
2. 若有计费规则，更新 `config/credits.ts` 的 dynamicConsumption.modelMultipliers。

## 3) 新增图片 Provider（非 Evolink）
1. 更新 `libs/ai/types.ts` 的 ImageProviderName 与 ImageGenerationOptions。
2. 在 `libs/ai/providers.ts` 的 createImageProvider 添加 provider 案例。
3. 在 `libs/ai/image.ts` 添加生成函数，并在 `generateImageResponse` 分支调用。
4. 补充默认模型与参数（DEFAULT_MODELS）。

## 4) Evolink 图片模型新增
1. 更新 `libs/ai/evolink.ts` 的模型 union。
2. 更新 `config/aiImage.ts` 的 defaultModels/availableModels/尺寸策略。
3. 更新 `config/credits.ts` 的 aiImage 固定计费模型。
4. 复用 `apps/next-app/app/api/image-generate/route.ts` 轮询任务流程。
