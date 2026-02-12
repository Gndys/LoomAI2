# Inputs (normalize first)

在开始前，请将用户需求整理为以下字段。

## 必填

- `route`: 页面路由（例如 `/model-atmosphere`）
- `slug`: 路由 slug（例如 `model-atmosphere`）
- `pageType`: `public` 或 `internal`
- `coreFlow`: 主流程步骤列表（上传 → 设置 → 生成 → 结果 → 导出）
- `constraints`: 文件限制（格式/大小/批量上限）
- `states`: 关键状态（空态/处理中/失败/成功）
- `styleTarget`: `landing`（与落地页一致）或 `tool`（保持工具页简洁）

## 可选

- `heroCopy`: 标题与副标题文案
- `settings`: 需要暴露的设置项列表
- `resultActions`: 结果区操作（对比/再生成/下载）
- `exportRules`: 导出命名与导出方式
- `nextStep`: 下一步引导（可选）
- `sectionsWanted`: 需要的内容段（如 示例/步骤/FAQ/CTA）

## i18n 规则

- `pageType = public` 时必须走 i18n
- `pageType = internal` 时可先硬编码，但需标记 TODO

## 示例

route: /product-white-background
slug: product-white-background
pageType: public
coreFlow: 上传 -> 设置 -> 生成 -> 结果 -> 导出
constraints: JPG/PNG/WEBP, 单张<=15MB, 批量<=30
states: 空态, 处理中, 失败, 成功
