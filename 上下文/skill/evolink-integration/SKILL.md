---
name: evolink-integration
description: 在本仓库中对接 Evolink 的文本/聊天与图片生成：新增/更新模型，配置环境变量，复用已有的 Evolink 图片异步任务轮询流程；用于“接入 Evolink / 增加 Evolink 模型 / 排查 Evolink 调用”的任务。
---

# Evolink 对接

## 概览
提供本仓库内 Evolink 接入的标准流程与触点，确保配置、模型与调用链路一致。

## 快速开始
1. 先读 `references/repo-touchpoints.md` 找到要改的文件。
2. 再读 `references/evolink-api.md` 了解 Evolink 接口要点。
3. 选择：图片异步任务流 or 文本/聊天 provider 接入，然后按下面步骤执行。

## 图片生成（异步任务流）
- 使用 `libs/ai/evolink.ts`：POST `/images/generations` + GET `/tasks/{id}`。
- prompt/size/model 校验以 `config/aiImage.ts` 为准。
- 轮询与超时逻辑参考 `apps/next-app/app/api/image-generate/route.ts`。
- 新增图片模型时：
  - 更新 `config/aiImage.ts`（defaultModels / availableModels / 尺寸策略）。
  - 更新 `libs/ai/evolink.ts` 的模型 union。
  - 如采用固定计费，更新 `config/credits.ts`。

## 文本/聊天（OpenAI 兼容）
- Evolink 文本接口为 OpenAI 兼容，建议按 `devdove` 模式接入。
- 必改位置：
  - `libs/ai/types.ts`：加入 `evolink` provider 与配置类型。
  - `libs/ai/config.ts`：加入 `EVOLINK_API_KEY` / `EVOLINK_BASE_URL`。
  - `libs/ai/providers.ts`：用 `createOpenAICompatible` 接入，baseURL 统一规范为 `/v1` 结尾。
  - `config/ai.ts`：补充 default/available models。
- 路由使用 `apps/next-app/app/api/chat/route.ts`（会透传 provider/model）。

## 自检清单
- EVOLINK_API_KEY 是否配置。
- Base URL 是否正确（默认 `https://api.evolink.ai/v1`）。
- 模型名是否与配置一致。
- 前端如有下拉选择，记得补 UI 文案映射。

## 参考资料
- `references/evolink-api.md`
- `references/repo-touchpoints.md`
