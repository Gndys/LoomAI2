# Layout patterns

## 推荐区块顺序

- Hero（`FeaturePageShell`）
- 上传区（Dropzone + 列表）
- 设置区（Select/Toggle/Tags）
- 结果区（Grid/List + 状态）
- 质检区（可选）
- 导出区（可选）
- 下一步引导（可选）

## 竞品式结构（参考 Raphael 的“去背景”页）

- Hero：标题 + 价值点 + 主/次 CTA
- 立即体验区：上传/拖拽 + 示例图入口
- 结果展示：Before/After 视觉对比（卡片或对比弹窗）
- 功能亮点：3-6 个要点卡片
- 操作步骤：3-4 步流程
- FAQ + CTA（可选）

## 模板建议

- 优先使用 `references/08-block-templates.md` 的 Hero/Steps/FAQ 模板。
- 视觉与间距参数统一使用 `references/09-visual-params.md`。

## 布局建议

- 桌面端：主区域左右分栏，上传/结果为主，设置为次。
- 移动端：按主流程排序，设置区可折叠，导出按钮可置底。

## 复用建议

- 外层壳：`FeaturePageShell`
- 卡片容器：`FeatureCard`
- 上传风格：参考白底图页与模特氛围图页
