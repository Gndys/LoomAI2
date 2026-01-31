# AI 图片生成功能页

## 功能概述

这是一个完整的 AI 图片生成功能页，用户可以：
1. 选择预设功能（平铺图、线稿、宣传图、版型、改色）
2. 上传图片
3. 编辑提示词
4. 调整参数
5. 生成并下载结果

## 文件结构

```
/apps/next-app/app/[lang]/ai-generate/
├── page.tsx                          # 主页面
├── components/
│   ├── FunctionSelector.tsx          # 功能选择组件（横向滚动）
│   ├── ImageUploader.tsx             # 图片上传组件（拖拽支持）
│   ├── ResultDisplay.tsx             # 结果展示组件
│   ├── PromptEditor.tsx              # 提示词编辑器（可展开负面提示词）
│   ├── ParamControls.tsx             # 参数控制组件（下拉菜单）
│   └── GenerateButton.tsx            # 生成按钮组件
└── README.md                         # 本文档

/libs/ai/
└── prompt-engine.ts                  # 提示词引擎（5个预设模板）

/apps/next-app/app/api/ai/generate/
└── route.ts                          # API 路由
```

## 核心功能

### 1. 功能选择（横向滚动）
- 5个预设功能卡片
- 点击自动填充提示词
- 高亮显示当前选中

### 2. 图片上传
- 支持拖拽上传
- 支持点击上传
- 文件大小限制：10MB
- 支持格式：PNG、JPG

### 3. 提示词编辑
- 正向提示词（始终显示）
- 负面提示词（可展开）
- 随机提示词按钮
- 清除按钮

### 4. 参数控制
- 尺寸选择（Auto、1:1、16:9、9:16、自定义）
- 风格选择（无风格、技术线稿、生活方式等）
- 模型选择（Loom Pro）

### 5. 生成和下载
- 生成按钮（显示消耗积分）
- 进度条显示
- 下载按钮
- 重新生成按钮

## 使用方法

### 访问页面

```
http://localhost:3000/zh-CN/ai-generate
```

### 操作流程

1. **选择功能**：点击功能卡片（如"平铺图"）
2. **上传图片**：拖拽或点击上传图片
3. **调整提示词**（可选）：编辑自动填充的提示词
4. **调整参数**（可选）：选择尺寸、风格等
5. **生成图片**：点击"生成图片"按钮
6. **下载结果**：点击"下载"按钮保存图片

## 技术实现

### 状态管理

使用 React useState 管理以下状态：
- `selectedFunction`: 当前选中的功能
- `uploadedImage`: 上传的图片（base64）
- `generatedImage`: 生成的图片（URL）
- `prompt`: 正向提示词
- `negativePrompt`: 负面提示词
- `size`: 尺寸设置
- `style`: 风格设置
- `model`: 模型设置
- `isGenerating`: 是否正在生成

### API 调用

```typescript
POST /api/ai/generate

Body:
{
  image: string,           // base64 图片数据
  prompt: string,          // 正向提示词
  negativePrompt: string,  // 负面提示词
  functionType: string,    // 功能类型
  size: string,            // 尺寸
  style: string,           // 风格
  model: string            // 模型
}

Response:
{
  imageUrl: string,        // 生成的图片 URL
  usedPrompt: string,      // 使用的提示词
  creditsUsed: number      // 消耗的积分
}
```

### 响应式设计

- **桌面端（>768px）**：左右布局（50% / 50%）
- **移动端（<768px）**：上下布局（100%）

## 待完善功能

### 1. 图片生成 API 集成

当前 API 路由使用的是 Gemini 文本模型，需要集成真正的图片生成 API：

**选项 A：使用 Imagen API**
```typescript
// 需要申请 Google Cloud Imagen API
import { ImagenClient } from '@google-cloud/imagen'
```

**选项 B：使用 Stability AI**
```typescript
// 使用 Stable Diffusion API
const response = await fetch('https://api.stability.ai/v1/generation/...')
```

**选项 C：使用 Replicate**
```typescript
// 使用 Replicate 的图片生成模型
import Replicate from 'replicate'
```

### 2. 积分系统集成

需要连接到现有的积分系统：
- 检查用户积分余额
- 扣除积分
- 记录使用历史

### 3. 历史记录

保存用户的生成历史：
- 保存到数据库
- 显示历史记录列表
- 支持复用历史配置

### 4. 图片对比模式

添加更多查看模式：
- 左右对比
- 上下对比
- 滑动对比
- 叠加对比

## 环境变量

需要在 `.env` 文件中配置：

```env
# Gemini API Key（当前使用）
GEMINI_API_KEY=your_gemini_api_key

# 图片生成 API Key（待集成）
IMAGEN_API_KEY=your_imagen_api_key
# 或
STABILITY_API_KEY=your_stability_api_key
# 或
REPLICATE_API_TOKEN=your_replicate_token
```

## 测试

### 本地测试

```bash
# 启动开发服务器
pnpm dev

# 访问页面
open http://localhost:3000/zh-CN/ai-generate
```

### 测试流程

1. 选择"平铺图"功能
2. 上传一张模特图
3. 查看自动填充的提示词
4. 点击"生成图片"
5. 等待生成完成
6. 下载结果

## 性能优化

### 已实现
- 图片懒加载（Next.js Image 组件）
- 组件按需渲染
- 防抖处理（下拉菜单）

### 待优化
- 图片压缩（上传前）
- 缓存生成结果
- 预加载功能预览图

## 浏览器兼容性

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile Safari: ✅
- Mobile Chrome: ✅

## 已知问题

1. **图片生成 API 未集成**：当前返回原图，需要集成真实的图片生成服务
2. **积分系统未连接**：需要连接到现有的积分系统
3. **历史记录未实现**：需要添加数据库存储

## 下一步计划

1. 集成图片生成 API（Imagen/Stability AI/Replicate）
2. 连接积分系统
3. 添加历史记录功能
4. 添加图片对比模式
5. 性能优化和测试

## 贡献指南

如需修改或扩展功能，请遵循以下规范：

1. **组件命名**：使用 PascalCase
2. **文件命名**：使用 kebab-case
3. **类型定义**：使用 TypeScript 接口
4. **样式**：使用 Tailwind CSS
5. **状态管理**：使用 React Hooks

## 联系方式

如有问题或建议，请联系开发团队。
