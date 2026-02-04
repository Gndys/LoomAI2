---
name: storage-upload
description: 在本仓库内接入与维护存储/上传能力：配置 OSS/S3/R2/COS/Local，生成签名 URL，新增存储 Provider，或排查上传失败。用于“上传/存储/签名 URL”相关任务。
---

# Storage / Upload 接入

## 概览
统一存储抽象层的接入步骤，涵盖环境变量、provider 工厂、上传 API 与签名 URL 流程。

## 快速开始
1. 先读 `references/repo-touchpoints.md` 找到关键文件。
2. 再读 `references/workflow.md` 选择流程（直传 / 签名 URL / 新 provider）。

## 关键约定
- 默认 provider 由 `STORAGE_PROVIDER` 决定，配置在 `config/storage.ts`。
- 统一通过 `createStorageProvider()` 或默认 `storage` 实例调用。
- 前端直传必须用签名 URL；后端直传可直接 `uploadFile()`。

## 常见操作
### 上传文件（后端直传）
使用 `createStorageProvider(provider)` + `uploadFile()`；参考 `apps/next-app/app/api/upload/route.ts`。

### 生成签名 URL（前端直传）
用 `generateSignedUrl()`；参考 `apps/next-app/app/api/storage/sign/route.ts`。

### 新增 Provider
按 `references/workflow.md` 的“新增 provider”步骤执行。

## 参考资料
- `references/repo-touchpoints.md`
- `references/workflow.md`
