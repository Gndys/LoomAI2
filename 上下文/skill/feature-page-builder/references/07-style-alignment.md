# Style alignment (Raphael + Landing)

## 竞品节奏（Raphael 去背景页）

参考其结构节奏，聚焦“先体验，再解释”的信息流：

- Hero：一句话价值 + 主/次 CTA
- 立即体验：上传/拖拽 + 示例图入口 + 简短隐私/条款提示
- 示例与结果：按类型切换的真实对比展示
- 功能亮点：3-8 个要点卡片
- 操作步骤：3-4 步流程
- FAQ + CTA：帮助转化与自助答疑

## 本仓库落地页风格对齐

与 `apps/next-app/app/[lang]/(root)/page.tsx` 和 `loomai-features/page.tsx` 保持一致：

- 背景：使用柔和渐变 + 圆形光晕（`bg-gradient-to-br`、`bg-chart-*` 模糊块）
- 卡片：`bg-card` + `border-border` + 轻阴影（`shadow-sm`/`shadow-lg`）
- CTA：`rounded-full`、大尺寸按钮、主次按钮成对出现
- 文字：标题加粗、行距充足，强调性文字可用 `text-gradient-chart-warm`
- 分区：浅色分隔区块（如 `bg-muted/50`）形成节奏

## 快速引用

- 区块模板：`references/08-block-templates.md`
- 视觉参数：`references/09-visual-params.md`

## 交互层级建议

- 首屏必须可“立即上传”，避免先读长文
- 示例和结果放在首屏后 1-2 屏内可见
- 复杂设置折叠到侧栏或可折叠区
- FAQ 与 CTA 放在页面尾部承接转化
