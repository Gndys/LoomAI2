# Visual parameters (landing alignment)

用于统一功能页与落地页的视觉节奏与尺寸参数。

## Section spacing

- 首屏 Hero: `py-20 md:py-28`
- 标准区块: `py-16 md:py-20`
- 分隔区块: `bg-muted/50`
- 容器: `container px-4 md:px-6`

## Background

- 渐变背景: `bg-gradient-to-br from-background via-background to-muted`
- 光晕装饰: `bg-chart-*/20 blur-3xl`
- 分区背景: `bg-muted/50` 或 `bg-background`

## Card

- 基础卡片: `bg-card border border-border shadow-sm rounded-2xl`
- 强调卡片: `shadow-lg` + `hover:shadow-xl`
- 图文卡: `p-6` 或 `p-5`

## CTA buttons

- 主按钮: `size="lg" rounded-full px-8 py-4 text-lg`
- 次按钮: `variant="outline" size="lg" rounded-full px-8 py-4 text-lg`
- CTA 成对出现（主+次），间距 `gap-4`

## Typography

- Hero 标题: `text-4xl md:text-6xl font-bold`
- Section 标题: `text-3xl md:text-4xl font-bold`
- 说明文: `text-muted-foreground text-lg` 或 `text-sm`
- 强调字: `text-gradient-chart-warm`

## Interaction priority

- 首屏必须包含“立即上传/开始体验”
- 示例区和结果区靠前（1-2 屏内可见）
- 复杂设置收纳到侧栏或折叠区
