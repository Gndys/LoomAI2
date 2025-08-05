# 数据库配置指南

TinyShip 使用 PostgreSQL 作为主数据库，结合 Drizzle ORM 提供类型安全的数据库操作。本指南将帮助你配置和管理项目数据库。

## 🗄️ 数据库技术栈

- **数据库**: PostgreSQL 13+
- **ORM**: Drizzle ORM
- **迁移工具**: Drizzle Kit
- **类型安全**: 完全的 TypeScript 支持
- **管理工具**: Drizzle Studio

## 🚀 快速开始

### 1. 创建 PostgreSQL 数据库

我们需要在 PostgreSQL中 创建一个新的数据库来使用 tinyship，下面是三种推荐的方式

#### 方法 1: 使用 Docker（推荐）
```bash
# 拉取并运行 PostgreSQL 容器
docker run --name tinyship-db \
  -e POSTGRES_USER=tinyship \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=tinyship \
  -p 5432:5432 \
  -d postgres:15

# 验证容器运行
docker ps | grep tinyship-db
```

#### 方法 2: 本地安装
```bash
# 创建数据库用户和数据库
sudo -u postgres createuser --interactive tinyship
sudo -u postgres createdb tinyship --owner=tinyship

# 设置用户密码
sudo -u postgres psql -c "ALTER USER tinyship PASSWORD 'your_password';"
```

#### 方法 3: 云数据库服务
支持以下云服务提供商：
- **Vercel Postgres**: 与 Vercel 部署无缝集成
- **Supabase**: 提供免费套餐，易于设置
- **AWS RDS**: 企业级选择
- **Google Cloud SQL**: 可靠的托管服务
- **阿里云 RDS**: 国内用户推荐

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接配置
DATABASE_URL="postgresql://username:password@localhost:5432/tinyship"
```

```bash
# 检查数据库是否可以成功连接
pnpm run db:check
```

### 3. 初始化数据库架构

下面让我们将需要的表结构推送到本地的数据库

#### 开发环境 - 直接推送（推荐）

```bash
# 将架构直接推送到数据库
pnpm run db:push
```

### 4. 填充测试数据

接下来填充一些用户测试数据，一个管理员一个普通用户：

```bash
# 运行种子脚本
pnpm run db:seed

```

这将创建两个测试用户：
- **管理员**: `admin@example.com` / `admin123` (角色: admin)
- **普通用户**: `user@example.com` / `user123456` (角色: user)

两个用户都已验证邮箱，可以直接登录系统进行测试。

## 📊 数据库架构

现在数据库完成配置成功，让我们来验证一下：

```bash
# 打开 Driizle 内置的数据管理系统
# 验证表架构是否成功创建以及数据是否成功插入，打开 https://local.drizzle.studio 可以访问
pnpm run db:studio
```

### 核心表结构

* 用户表 (user) 管理应用中的用户账户信息
* 会话表 (session) 管理用户登录会话
* 账户 (account)
* 验证 (verification)
* 订阅表 (subscription)
* 订单表 (order)

现在我们的数据库就已经配置完毕了

更多数据库相关配置请参考 [Drizzle ORM 文档](https://orm.drizzle.team/) 和各个 `libs/database/` 目录下的 README 文件。

接下来让我们来配置 [身份认证](./auth.md), 还有一步就可以成功的运行应用了。