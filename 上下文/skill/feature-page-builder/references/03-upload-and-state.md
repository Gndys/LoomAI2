# Upload & state

## 文件校验

- 仅允许图片类型（`file.type.startsWith('image/')`）
- 单张大小限制
- 批量上限限制
- 校验失败给出 toast 提示

## 队列状态

- `ready` → `processing` → `done/failed`
- 上传列表需支持删除、清空
- 失败项可重试

## 资源清理

- 创建预览：`URL.createObjectURL(file)`
- 删除/清空/卸载时：`URL.revokeObjectURL(url)`

## 反馈模式

- 使用 `sonner` 的 `toast.success/error`
- 处理中态显示加载与进度文案
