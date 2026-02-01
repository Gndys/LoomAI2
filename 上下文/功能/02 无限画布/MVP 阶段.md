设计方案（推荐分阶段落地）

  阶段 0：最小可用

  - 目标：先让“无限画布”可用（拖拽、缩放、放图、保存），再逐步加编辑能力。
  - 落点：先在 Next 的画布页或 apps/next-app/app/[lang]/(root)/playground/page.tsx 内
    实现。

  阶段 1：核心架构

  1. 视口/相机（Camera）

  - 状态：{x, y, scale}（世界坐标到屏幕坐标的变换）
  - 交互：滚轮缩放（以鼠标为中心）、空格+拖拽平移、双击复位
  - 方案：一个外层容器 + 内层 scene 容器，通过 CSS transform 实现 translate + scale

  2. 数据模型（Canvas Scene）

  - Item 基础结构：
      - id, type, x, y, width, height, rotation, zIndex, data
  - type 先支持：image, text, rect，后续扩展 group, vector
  - 维护 selection、hover、tool（选择/移动/缩放）

  3. 渲染策略

  - DOM/SVG 版（易实现）：图片和文本用 DOM，辅助边框/控点用 SVG
  - 视口裁剪：只渲染当前 viewport 内的 items（简单 AABB 裁剪）
  - 未来可升级为 Konva/Pixi（对象量大时）

  4. 状态管理

  - 初期用 React context + reducer
  - 如果对象量大，建议用 zustand + useSyncExternalStore

  5. 持久化

  - 本地：自动保存到 localStorage
  - 服务端：Canvas JSON 存 DB，图片/素材存 libs/storage 对接 S3/OSS
  - 结构：canvas(id, userId, name, dataJson, updatedAt)

  阶段 2：功能扩展

  - 图层面板、对齐吸附、复制/粘贴、快捷键（Ctrl/Cmd+Z）
  - 画布导出（PNG/PDF，超大画面用分块渲染）
  - 资源管理（素材库、历史生成图）

  阶段 3：性能与协作
  - 视口渲染优化、图片懒加载、离屏缓存
  - 多人协作：Yjs / Liveblocks（可选）