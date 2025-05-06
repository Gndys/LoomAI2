# ShipEasy 数据库模块

这个模块使用 Drizzle ORM 管理与 PostgreSQL 数据库的交互，提供了简单易用的数据访问接口。

## 使用方法

### 前提条件

确保你的 `.env` 文件中设置了数据库连接信息:

```
DATABASE_URL=postgresql://username:password@localhost:5432/shipeasy
```

### 在应用中使用

```typescript
// 导入数据库客户端和模型
import { db, users, subscriptions, orders } from "../../libs/database";

// 查询用户
const user = await db.select().from(users).where(eq(users.email, "user@example.com"));

// 创建订阅
await db.insert(subscriptions).values({
  userId: user[0].id,
  status: "active",
  paymentType: "one_time",
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
});

// 创建支付订单
await db.insert(orders).values({
  userId: user[0].id,
  amount: 100,
  currency: "CNY",
  description: "高级会员 - 1个月",
  provider: "wechat",
  status: "pending"
});
```

## 数据模型

### 用户 (Users)

用户表管理应用中的用户账户信息，包括:
- 基本信息 (email, name, avatar)
- 身份验证信息 (passwordHash, emailVerified)
- OAuth2 相关信息 (provider, providerId)

### 订阅 (Subscriptions)

订阅表跟踪用户的付款和订阅信息，支持:
- 一次性付款
- 订阅付款
- 有效期跟踪

### 订单 (Orders)

订单表管理所有支付交易记录，包括:
- 基本支付信息 (金额、币种、商品描述)
- 支付状态跟踪 (pending, paid, failed, refunded)
- 支付提供商信息 (微信支付、Stripe)
- 关联订阅ID (可选)
- 支付平台返回的额外信息

### 会话 (Sessions)

会话表管理用户登录会话，跟踪:
- 会话过期时间
- 用户设备信息
- IP 地址

## 数据库管理命令

通过根目录的命令可以管理数据库：

```bash
# 检查数据库连接
pnpm db:check

# 生成数据库迁移文件 (使用 drizzle-kit)
pnpm db:generate

# 推送数据库架构到数据库 (使用 drizzle-kit)
pnpm db:push

# 应用数据库迁移
pnpm db:migrate

# 启动 Drizzle Studio 可视化界面
pnpm db:studio

# 填充测试数据
pnpm db:seed
```

### Drizzle Studio

Drizzle Studio 提供了一个可视化界面来查看和修改数据库内容。使用 `pnpm db:studio` 命令启动，
然后在浏览器中访问提供的URL（通常是 http://localhost:4983）。

通过 Studio 你可以：
- 浏览数据库表和记录
- 添加、编辑和删除记录
- 查看表关系
- 执行基本查询 