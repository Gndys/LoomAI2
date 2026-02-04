# Storage / Upload 触点

## 核心库
- 入口与工厂：`libs/storage/index.ts`
- 配置：`config/storage.ts`
- 类型：`libs/storage/types.ts`
- Provider 实现：`libs/storage/providers/*`
- 环境变量示例：`env.example`

## API 路由示例
- 通用上传：`apps/next-app/app/api/upload/route.ts`
- 生成签名 URL：`apps/next-app/app/api/storage/sign/route.ts`
- 图像处理后上传：
  - `apps/next-app/app/api/image-layered/route.ts`
  - `apps/next-app/app/api/image-seg/route.ts`
