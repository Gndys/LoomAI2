# 部署指南

本指南介绍如何部署 ShipEasy 项目的 Next.js 和 Nuxt.js 应用到生产环境。

## 🤔 部署方式选择

### 方式对比

| 部署方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **Git Clone 部署** | 开发/测试环境 | 简单直接、版本控制方便 | 服务器需要开发环境、构建慢 |
| **预构建部署** | 生产环境 | 服务器轻量、启动快、安全 | 流程稍复杂 |
| **Docker 部署** | 容器化环境 | 环境一致、易扩展 | 需要 Docker 知识 |

### 推荐方案

- **🥇 生产环境推荐**: Docker 部署或预构建部署
- **🥈 开发/测试环境**: Git Clone 部署
- **🥉 快速验证**: Git Clone 部署

## 📋 部署前准备

### 1. 服务器环境要求

**基础环境：**
- **Node.js**: v22+ (LTS 推荐)
- **pnpm**: v8.6.0+
- **Git**: 用于代码拉取
- **PM2**: 进程管理 (可选，推荐)

**快速安装：**
```bash
# 安装 Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2 (可选)
npm install -g pm2
```

### 2. 环境变量配置

项目使用根目录的 `.env` 文件统一管理环境变量，支持开发和生产环境：

```bash
# 应用配置
NODE_ENV=production
APP_BASE_URL=https://yourdomain.com

# 数据库
DATABASE_URL="postgresql://user:password@host:5432/database"

# 认证
BETTER_AUTH_SECRET="your-production-secret-key"
BETTER_AUTH_URL="https://yourdomain.com"

# 邮件服务
RESEND_API_KEY="your-resend-api-key"
EMAIL_DEFAULT_FROM="noreply@yourdomain.com"

# 其他服务配置...
```

**环境变量加载机制：**
- **Next.js**: `next.config.ts` 自动加载根目录 `.env` 文件
- **Nuxt.js**: 启动脚本使用 `--env-file=../../.env` 参数


### 3. 数据库准备

```bash
# 生成迁移文件
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate

# 检查数据库连接
pnpm db:check
```

## 🚀 Next.js 部署

### 快速启动

```bash
# 1. 构建应用
pnpm build:next

# 2. 启动生产服务器（端口 7001）
pnpm start:next

# 3. 使用 PM2 管理进程（推荐）
pnpm add -g pm2
pm2 start "pnpm start:next" --name "shipeasy-next"
```

**可用的启动命令：**
- `pnpm start:next` - 使用 Turbo 启动（推荐）
- `cd apps/next-app && pnpm start` - 直接启动

### 传统服务器部署

```bash
# 1. 安装依赖和构建应用
pnpm install
pnpm build:next

# 2. 启动生产服务器
NODE_ENV=production pnpm start:next

# 3. 使用 PM2 管理进程（推荐）
pm2 start "pnpm start:next" --name "shipeasy-next"
```

### Docker 部署

1. **创建 Dockerfile**
   ```dockerfile
# apps/next-app/Dockerfile
FROM node:22-alpine
   
   # 安装 pnpm
   RUN corepack enable && corepack prepare pnpm@8.6.0 --activate
   
   WORKDIR /app
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/next-app/package.json ./apps/next-app/
   COPY libs ./libs
   
   RUN pnpm install --frozen-lockfile
   
   COPY apps/next-app ./apps/next-app
   RUN pnpm build:next
   
   EXPOSE 7001
   CMD ["pnpm", "start:next"]
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker build -t shipeasy-next ./apps/next-app
   
   # 运行容器（通过环境变量传入配置）
   docker run -p 7001:7001 \
     -e NODE_ENV=production \
     -e DATABASE_URL="postgresql://user:password@host:5432/database" \
     -e BETTER_AUTH_SECRET="your-secret" \
     -e BETTER_AUTH_URL="https://yourdomain.com" \
     shipeasy-next
   
   # 或使用 .env 文件
   docker run -p 7001:7001 --env-file .env shipeasy-next
   ```

### Vercel 部署

1. **连接仓库**
   ```bash
   # 安装 Vercel CLI
   pnpm add -g vercel
   
   # 登录并部署
   vercel --cwd apps/next-app
   ```

2. **环境变量配置**
   在 Vercel 控制台设置环境变量，或使用命令行：
   ```bash
   vercel env add APP_BASE_URL
   vercel env add DATABASE_URL
   vercel env add BETTER_AUTH_SECRET
   ```

3. **项目配置**
   ```json
   {
     "buildCommand": "pnpm build:next",
     "outputDirectory": "apps/next-app/.next",
     "installCommand": "pnpm install",
     "framework": "nextjs"
   }
   ```

## 🎯 Nuxt.js 部署

### 快速启动

```bash
# 1. 构建应用
pnpm build:nuxt

# 2. 启动生产服务器（端口 7001）
pnpm start:nuxt

# 3. 使用 PM2 管理（推荐）
pm2 start "pnpm start:nuxt" --name "shipeasy-nuxt"
```

**可用的启动命令：**
- `pnpm start:nuxt` - 使用 Turbo 启动（推荐）
- `cd apps/nuxt-app && pnpm start` - 直接启动

### 传统服务器部署

```bash
# 1. 安装依赖和构建应用
pnpm install
pnpm build:nuxt

# 2. 启动服务器（自动加载环境变量）
NODE_ENV=production pnpm start:nuxt

# 3. 或者直接启动构建输出
NODE_ENV=production node --env-file=.env apps/nuxt-app/.output/server/index.mjs

# 4. 使用 PM2 管理（推荐）
pm2 start "pnpm start:nuxt" --name "shipeasy-nuxt"
```

### Docker 部署

```dockerfile
# apps/nuxt-app/Dockerfile
FROM node:22-alpine

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/nuxt-app/package.json ./apps/nuxt-app/
COPY libs ./libs

RUN pnpm install --frozen-lockfile

COPY apps/nuxt-app ./apps/nuxt-app
RUN pnpm build:nuxt

EXPOSE 7001
# Docker 环境下直接启动，环境变量通过 docker run -e 传入
CMD ["pnpm", "start:nuxt"]
```

**构建和运行：**
```bash
# 构建镜像
docker build -t shipeasy-nuxt ./apps/nuxt-app

# 或使用 .env 文件
docker run -p 7001:7001 --env-file .env shipeasy-nuxt
```

### Vercel 部署

1. **部署命令**
   ```bash
   vercel --cwd apps/nuxt-app
   ```

2. **构建配置**
   ```json
   {
     "buildCommand": "pnpm build:nuxt",
     "outputDirectory": "apps/nuxt-app/.output/public",
     "installCommand": "pnpm install"
   }
   ```


## 🔧 通用配置

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:7001;  # 注意端口改为 7001
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 端口配置说明

- **开发环境端口**: 7001
- **生产环境端口**: 7001
- **注意**: Next.js 和 Nuxt.js 都使用 7001 端口，不能同时启动

### SSL 证书

```bash
# 使用 Certbot 获取免费 SSL 证书
sudo certbot --nginx -d yourdomain.com
```

## 📊 性能优化

### 缓存策略

```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 压缩配置

```nginx
# 启用 Gzip 压缩
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 🔍 健康检查

### 应用监控

项目已内置健康检查端点：

- **Next.js**: `http://localhost:7001/api/health`
- **Nuxt.js**: `http://localhost:7001/api/health`

**健康检查端点代码：**

```typescript
// apps/next-app/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}

// apps/nuxt-app/server/api/health.get.ts
export default defineEventHandler(() => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})
```

### 服务检查命令

```bash
# 检查数据库连接
pnpm db:check

# 检查应用健康状态
curl http://localhost:7001/api/health
```

## 🚨 故障排除

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 构建失败 | 检查环境变量和依赖版本 |
| 数据库连接错误 | 验证 DATABASE_URL 和网络配置 |
| 静态资源 404 | 检查静态文件路径和 CDN 配置 |
| 权限错误 | 确认认证服务配置正确 |
| 端口占用 | 检查是否有其他服务占用 7001 端口 |
| 环境变量缺失 | 确认 .env 文件存在且格式正确 |
| Turbo 缓存问题 | 运行 `pnpm clean` 清理缓存 |

### 日志查看

```bash
# PM2 日志
pm2 logs

# 查看特定应用日志
pm2 logs shipeasy-next
pm2 logs shipeasy-nuxt

# Docker 日志
docker logs container-name

# Turbo 日志
turbo run build --verbosity=2

# 系统日志
tail -f /var/log/nginx/error.log
```

## 📚 相关资源

- **[Next.js 部署文档](https://nextjs.org/docs/deployment)**
- **[Nuxt.js 部署文档](https://nuxt.com/docs/getting-started/deployment)**
- **[Vercel 部署指南](https://vercel.com/docs)**
- **[Docker 官方文档](https://docs.docker.com/)**

---

选择适合您需求的部署方式，确保在生产环境中正确配置所有环境变量和安全设置。 