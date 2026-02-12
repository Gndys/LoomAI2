---
name: feature-page-builder
description: 在本仓库内创建交互式工具功能页（前端 UI），适用于上传/生成/导出类页面。
---

# Feature Page Builder (Tool Pages)

本技能用于在本仓库中新增“交互式工具型功能页”的前端 UI。聚焦上传/设置/生成/结果/导出类流程，不涉及 API、导航入口或全局组件重构。

## v1 edit scope (hard limit)

Allowed:
- 新增页面文件 `apps/next-app/app/[lang]/(root)/<slug>/page.tsx`
- 在页面目录内新增局部组件（例如 `apps/next-app/app/[lang]/(root)/<slug>/components/**`）
- 依据页面类型补充 i18n 文案（见 `references/05-i18n-policy.md`）

Forbidden:
- 新增或修改 API 路由
- 修改导航入口或全局路由
- 大范围重构公共组件或样式系统
- 修改依赖与构建配置

## Inputs (normalize first)

请先整理输入，见 `references/00-inputs.md`。

## Execution order

1. 规范输入：`references/00-inputs.md`
2. 查找可复用文件：`references/01-repo-touchpoints.md`
3. 选择页面布局：`references/02-layout-patterns.md`
4. 对齐页面风格：`references/07-style-alignment.md`
5. 使用区块模板：`references/08-block-templates.md`
6. 统一视觉参数：`references/09-visual-params.md`
7. 处理上传与状态：`references/03-upload-and-state.md`
8. 处理结果与导出：`references/04-results-and-export.md`
9. 决定 i18n 策略：`references/05-i18n-policy.md`
10. 最终自检：`references/06-checklist.md`

## 参考资料

- `references/00-inputs.md`
- `references/01-repo-touchpoints.md`
- `references/02-layout-patterns.md`
- `references/03-upload-and-state.md`
- `references/04-results-and-export.md`
- `references/05-i18n-policy.md`
- `references/06-checklist.md`
- `references/07-style-alignment.md`
- `references/08-block-templates.md`
- `references/09-visual-params.md`
