# Docker 部署快速指南

## 🚀 推荐方式：Docker Compose

使用项目根目录的 `docker compose.yml` 文件：

```bash
# 启动 Next.js 应用
docker compose --profile next up -d

# 启动 Nuxt.js 应用  
docker compose --profile nuxt up -d

# 查看日志
docker compose logs -f

# 停止应用
docker compose down
```

## 🔧 手动 Docker 部署

### Next.js 部署

```bash
# 1. 在项目根目录构建镜像
docker build -t tinyship-next -f apps/next-app/Dockerfile .

# 2. 运行容器
docker run -d \
  --name tinyship-next \
  -p 7001:7001 \
  --env-file .env \
  --restart unless-stopped \
  tinyship-next
```

### Nuxt.js 部署

```bash
# 1. 在项目根目录构建镜像
docker build -t tinyship-nuxt -f apps/nuxt-app/Dockerfile .

# 2. 运行容器
docker run -d \
  --name tinyship-nuxt \
  -p 7001:7001 \
  --env-file .env \
  --restart unless-stopped \
  tinyship-nuxt
```

## ⚠️ 重要提醒

### 构建路径
- **必须在项目根目录**运行 `docker build` 命令
- 使用 `-f` 参数指定 Dockerfile 路径
- 构建上下文是项目根目录 (`.`)

### 构建依赖
Dockerfile 会自动复制这些必要的配置文件：
- `turbo.json` - Turbo 构建配置
- `config.ts` - 应用配置文件
- `tsconfig.json` - TypeScript 路径别名
- `libs/` - 共享库目录

### 跨框架兼容性
项目中的 `libs/auth/authClient.ts` 同时支持 React 和 Vue：
- Next.js 项目需要 Vue 作为 devDependency (已配置)
- 这是因为 better-auth 库会尝试导入 Vue 模块
- 在本地环境中，Vue 通过 Nuxt.js 间接提供

### 构建时环境变量
- Dockerfile 中设置 `BUILD_TIME=true` 避免构建失败
- 运行时环境变量 (如 API keys) 在构建时不是必需的
- 实际部署时仍会在运行时验证必要的环境变量

### 数据库连接
Docker 容器中**不能使用 `localhost`** 连接宿主机服务：

```bash
# ❌ 错误 - 容器内访问不到宿主机的 localhost
DATABASE_URL=postgresql://localhost:5432/db

# ✅ 正确 - 连接宿主机数据库
# Mac/Windows Docker Desktop:
DATABASE_URL=postgresql://viking@host.docker.internal:5432/tinyship_dev

# Linux VPS (两种方式):
# 方式1: 网桥模式
DATABASE_URL=postgresql://viking@172.17.0.1:5432/tinyship_dev
# 方式2: 主机网络模式 (推荐)
DATABASE_URL=postgresql://viking@localhost:5432/tinyship_dev

# ✅ 正确 - 连接远程数据库
DATABASE_URL=postgresql://user:pass@your-db-server.com:5432/db
```

**Linux VPS 主机网络模式：**
```bash
# 使用主机网络运行 (推荐)
docker run -d \
  --name tinyship-nuxt \
  --network host \
  --env-file .env \
  --restart unless-stopped \
  tinyship-nuxt
```

**重要提示**：
- 必须明确指定用户名，即使本地不需要用户名也要在 Docker 中指定
- 对于 Homebrew 安装的 PostgreSQL，用户名通常是你的系统用户名
- **Linux VPS 推荐使用主机网络模式**，避免网关地址问题
- 只有数据库等后端服务需要修改连接地址，应用的对外 URL (如 `APP_BASE_URL`) 不需要修改

## 🔧 常用命令

```bash
# 查看运行中的容器
docker ps

# 查看日志
docker logs tinyship-next
docker logs tinyship-nuxt

# 停止容器
docker stop tinyship-next

# 删除容器
docker rm tinyship-next

# 删除镜像
docker rmi tinyship-next
```

## 📋 环境变量示例

创建 `.env` 文件：

```bash
NODE_ENV=production
# 数据库连接 - 根据运行方式选择
# Mac/Windows Docker Desktop:
# DATABASE_URL=postgresql://viking@host.docker.internal:5432/tinyship_dev
# Linux VPS 网桥模式:
# DATABASE_URL=postgresql://viking@172.17.0.1:5432/tinyship_dev
# Linux VPS 主机网络模式 (推荐):
DATABASE_URL=postgresql://viking@localhost:5432/tinyship_dev
# 应用 URL - 保持实际访问地址
APP_BASE_URL=https://yourdomain.com
BETTER_AUTH_SECRET=your-production-secret-key
BETTER_AUTH_URL=https://yourdomain.com
RESEND_API_KEY=your-resend-api-key
EMAIL_DEFAULT_FROM=noreply@yourdomain.com
``` 