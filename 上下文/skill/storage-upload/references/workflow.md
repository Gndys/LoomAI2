# Storage / Upload 接入流程

## 1) 选择 provider
- 默认由 `STORAGE_PROVIDER` 控制（oss/s3/r2/cos/local）。
- `config/storage.ts` 会读取对应环境变量。

## 2) 使用方式（两种）
- 服务端直传：
  - `createStorageProvider(provider)`
  - `uploadFile({ file, fileName, contentType, folder })`
- 前端直传（签名 URL）：
  - `generateSignedUrl({ key, operation: 'put', contentType, expiresIn })`
  - 前端 PUT 到签名 URL 后，再回调业务。

## 3) 新增 provider
1. 在 `libs/storage/types.ts` 添加类型与接口。
2. 在 `libs/storage/providers/` 新增实现。
3. 在 `libs/storage/index.ts` 的 `createStorageProvider` 中接入。
4. 在 `config/storage.ts` 添加配置读取与默认值。
5. 更新 `env.example`。

## 4) 常见注意点
- OSS/COS/S3/R2 的 bucket/region/endpoint 必须匹配。
- R2 走 S3 兼容实现（`createR2Provider()`）。
- 上传大小限制可在 API route 中集中校验（如 `apps/next-app/app/api/upload/route.ts`）。
