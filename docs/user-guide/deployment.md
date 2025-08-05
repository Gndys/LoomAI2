# 部署指南

本指南介绍如何部署 TinyShip 项目的 Next.js 和 Nuxt.js 应用到生产环境。

## 📋 部署前准备

### 1. 环境变量配置

复制 `env.example` 为 `.env.production`，配置生产环境变量：

```bash
# 应用配置
APP_BASE_URL=https://yourdomain.com
NODE_ENV=production

# 数据库
DATABASE_URL="postgresql://user:password@host:5432/database"

# 认证
BETTER_AUTH_SECRET="your-production-secret-key"
BETTER_AUTH_URL="https://yourdomain.com"

# 其他服务配置...
```

### 2. 数据库准备

```bash
# 生成迁移文件
pnpm db:generate

# 执行数据库迁移
pnpm db:migrate
```

## 🚀 Next.js 部署

### 传统服务器部署

```bash
# 1. 安装依赖和构建应用
pnpm install
pnpm build:next

# 2. 启动生产服务器
pnpm start --filter=@tinyship/next-app

# 3. 使用 PM2 管理进程（推荐）
pnpm add -g pm2
pm2 start "pnpm start --filter=@tinyship/next-app" --name "tinyship-next"
```

### Docker 部署

1. **创建 Dockerfile**
   ```dockerfile
   # apps/next-app/Dockerfile
   FROM node:18-alpine
   
   # 安装 pnpm
   RUN corepack enable && corepack prepare pnpm@8.6.0 --activate
   
   WORKDIR /app
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY apps/next-app/package.json ./apps/next-app/
   COPY libs ./libs
   
   RUN pnpm install --frozen-lockfile --prod
   
   COPY apps/next-app ./apps/next-app
   RUN pnpm build:next
   
   EXPOSE 3000
   CMD ["pnpm", "start", "--filter=@tinyship/next-app"]
   ```

2. **构建和运行**
   ```bash
   # 构建镜像
   docker build -t tinyship-next ./apps/next-app
   
   # 运行容器
   docker run -p 3000:3000 --env-file .env.production tinyship-next
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

### 传统服务器部署

```bash
# 1. 安装依赖和构建应用
pnpm install
pnpm build:nuxt

# 2. 启动服务器
node apps/nuxt-app/.output/server/index.mjs

# 3. 使用 PM2 管理（推荐）
pm2 start apps/nuxt-app/.output/server/index.mjs --name "tinyship-nuxt"
```

### Docker 部署

```dockerfile
# apps/nuxt-app/Dockerfile
FROM node:18-alpine

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/nuxt-app/package.json ./apps/nuxt-app/
COPY libs ./libs

RUN pnpm install --frozen-lockfile

COPY apps/nuxt-app ./apps/nuxt-app
RUN pnpm build:nuxt

EXPOSE 3000
CMD ["node", "apps/nuxt-app/.output/server/index.mjs"]
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

### Netlify 部署

1. **构建设置**
   ```toml
   # netlify.toml
   [build]
     command = "pnpm build:nuxt"
     publish = "apps/nuxt-app/.output/public"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

## 🔧 通用配置

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
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

```bash
# 添加健康检查端点
# apps/next-app/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}

# apps/nuxt-app/server/api/health.get.ts
export default defineEventHandler(() => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})
```

### 数据库连接检查

```bash
# 测试数据库连接
pnpm db:check
```

## 🚨 故障排除

### 常见问题

| 问题 | 解决方案 |
|------|----------|
| 构建失败 | 检查环境变量和依赖版本 |
| 数据库连接错误 | 验证 DATABASE_URL 和网络配置 |
| 静态资源 404 | 检查静态文件路径和 CDN 配置 |
| 权限错误 | 确认认证服务配置正确 |

### 日志查看

```bash
# PM2 日志
pm2 logs

# Docker 日志
docker logs container-name

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