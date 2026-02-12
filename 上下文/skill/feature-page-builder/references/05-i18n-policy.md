# i18n policy

## 规则

- public 页面必须 i18n
- internal 页面可先硬编码，但需标记 TODO

## 操作步骤

- 先在 `libs/i18n/locales/en.ts` 添加结构（作为类型源）
- 再在 `libs/i18n/locales/zh-CN.ts` 对齐字段
- 页面侧使用 `useTranslation()` 读取

## 注意

- 保持 key 结构一致
- 避免超过 4 层嵌套
