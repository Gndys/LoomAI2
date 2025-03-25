# Nuxt.js 基础结构设置流程

本文档概述了在 ShipEasy SaaS 模板中设置 Nuxt.js 应用基础结构的主要步骤。

## 1. TailwindCSS 集成

### 1.1 安装 TailwindCSS 4.0

```bash
# 在 nuxt-app 目录中安装 TailwindCSS 及其依赖
cd apps/nuxt-app
# 安装 Tailwind CSS 4.0 和 Vite 插件
pnpm add tailwindcss @tailwindcss/vite
```

### 1.2 配置 TailwindCSS

1. 修改 `nuxt.config.ts` 添加 Tailwind Vite 插件:
```ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // 其他配置...
})
```

2. 创建 CSS 文件:
```bash
mkdir -p assets/css
touch assets/css/main.css
```

3. 编辑 `assets/css/main.css` 文件:
```css
@import "tailwindcss";
```

4. 在 `nuxt.config.ts` 中添加 CSS 文件:
```ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // 其他配置...
})
```

5. 如需自定义 Tailwind 配置，可以创建 `tailwind.config.js` 文件（可选）:
```bash
npx tailwindcss init
```

## 2. Shadcn-Vue 组件库设置

### 2.1 安装 shadcn-vue CLI

```bash
pnpm add -D shadcn-vue@latest
```

### 2.2 初始化 shadcn-vue

```bash
npx shadcn-vue init
```
根据提示完成配置:
- 选择使用 Tailwind CSS
- 指定组件存放位置（如 `components/ui`）
- 设置颜色主题
- 设置支持暗色模式

### 2.3 安装基础组件

```bash
# 安装基础组件如按钮、表单、输入框等
npx shadcn-vue add button
npx shadcn-vue add input
npx shadcn-vue add form
# 根据需要添加更多组件
```

## 3. API 路由基础结构

### 3.1 创建 API 目录结构

```bash
mkdir -p server/api/auth
mkdir -p server/api/users
mkdir -p server/api/organizations
```

### 3.2 实现基本 API 端点

1. 创建健康检查 API:
```ts
// server/api/health.ts
export default defineEventHandler(() => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString()
  }
})
```

2. 建立 API 响应格式标准化工具:
```ts
// server/utils/api-response.ts
export function createApiResponse(data, message = '', success = true) {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  }
}
```

## 4. 路由和布局设置

### 4.1 定义主要页面结构

```
pages/
├── index.vue                # 首页
├── auth/
│   ├── login.vue            # 登录页
│   ├── register.vue         # 注册页
│   └── forgot-password.vue  # 忘记密码页
├── dashboard/
│   ├── index.vue            # 仪表板首页
│   └── profile.vue          # 用户资料页
└── organizations/
    └── index.vue            # 组织管理页
```

### 4.2 设置布局文件

```
layouts/
├── default.vue              # 默认布局
├── auth.vue                 # 认证页面布局
└── dashboard.vue            # 仪表板布局
```

## 5. 状态管理和公共服务

### 5.1 Pinia 状态管理设置

```bash
# 安装 Pinia
pnpm add pinia @pinia/nuxt
```

修改 `nuxt.config.ts` 以包含 Pinia:
```ts
export default defineNuxtConfig({
  modules: [
    // 其他模块...
    '@pinia/nuxt',
  ],
})
```

### 5.2 创建主要状态存储

```
stores/
├── auth.ts                  # 认证状态管理
├── user.ts                  # 用户信息状态
└── organization.ts          # 组织相关状态
```

## 6. 集成公共工具和服务

### 6.1 HTTP 客户端设置

```bash
# 安装 Nuxt HTTP 模块
pnpm add @nuxt/http
```

### 6.2 环境变量和配置

确保正确配置环境变量以支持不同的开发/生产环境:

```
.env.development
.env.production
```

## 7. 测试和验证

### 7.1 验证步骤

- 确认 TailwindCSS 样式生效
- 测试 shadcn-vue 组件渲染正常
- 验证所有路由可访问
- 确认 API 端点可正常响应

### 7.2 开发服务器启动

```bash
# 启动开发服务器
pnpm dev
```

访问 http://localhost:3001 验证应用是否正常运行。

## 后续步骤

完成基础结构设置后，可进行以下工作:

1. 实现认证和用户管理功能
2. 开发核心业务功能
3. 添加更多自定义 UI 组件
4. 集成支付和订阅功能

确保在进行下一阶段开发前，基础结构正常工作且符合项目需求。 