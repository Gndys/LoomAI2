# Nuxt应用实施计划

> **项目目标**: 基于已完成的Next.js应用，实现功能完全对等的Nuxt.js应用
> 
> **技术栈**: Nuxt 3 + Vue 3 + shadcn-vue + Tailwind v4 + Better-Auth
> 
> **预计工期**: 8-10个工作日
> 
> **最后更新**: 2024-12-19

## 📊 总体进度

- [ ] 第一阶段：基础设施搭建 (1-2天)
- [ ] 第二阶段：认证系统 (2-3天) 
- [ ] 第三阶段：核心页面功能 (3-4天)
- [ ] 第四阶段：AI功能 (2天)
- [ ] 第五阶段：管理后台 (2-3天)
- [ ] 第六阶段：组件对照实现 (1天)
- [ ] 第七阶段：样式一致性保证 (1天)
- [ ] 第八阶段：功能对等验证 (1天)

---

## 🎯 第一阶段：基础设施搭建 (1-2天)

### 1.1 shadcn-vue 环境搭建
- [ ] 安装shadcn-vue CLI工具
  ```bash
  npx shadcn-vue@latest init
  ```
- [ ] 选择配置选项：
  - [ ] TypeScript: Yes
  - [ ] Framework: Nuxt
  - [ ] Style: New York
  - [ ] Base color: Slate
  - [ ] CSS variables: Yes
- [ ] 验证初始化成功
- [ ] 测试示例组件渲染

### 1.2 依赖管理更新
- [ ] 更新 `package.json` 添加必需依赖：
  - [ ] `@radix-vue/cn`
  - [ ] `reka-ui` 
  - [ ] `lucide-vue-next`
  - [ ] `tailwind-merge`
  - [ ] `clsx`
  - [ ] `tw-animate-css`
  - [ ] `@vueuse/core`
  - [ ] `@vueuse/nuxt`
  - [ ] `@pinia/nuxt`
  - [ ] `@nuxtjs/i18n`
  - [ ] `vee-validate`
  - [ ] `@vee-validate/zod`
- [ ] 执行依赖安装
- [ ] 验证依赖版本兼容性

### 1.3 Nuxt配置增强
- [ ] 更新 `nuxt.config.ts`：
  - [ ] 添加必需模块配置
  - [ ] 配置组件自动导入
  - [ ] 设置路径别名
  - [ ] 配置CSS和PostCSS
  - [ ] 添加环境变量配置
- [ ] 创建 `components.json` 配置文件
- [ ] 配置 TypeScript 路径映射
- [ ] 测试开发服务器启动

### 1.4 目录结构创建
- [ ] 创建 `components/ui/` 目录
- [ ] 创建 `components/forms/` 目录  
- [ ] 创建 `components/layout/` 目录
- [ ] 创建 `composables/` 目录
- [ ] 创建 `layouts/` 目录
- [ ] 创建 `middleware/` 目录
- [ ] 创建 `stores/` 目录
- [ ] 创建 `types/` 目录
- [ ] 创建 `plugins/` 目录

### 1.5 基础shadcn-vue组件安装
- [ ] 安装核心UI组件：
  ```bash
  npx shadcn-vue@latest add button
  npx shadcn-vue@latest add card  
  npx shadcn-vue@latest add input
  npx shadcn-vue@latest add form
  npx shadcn-vue@latest add dialog
  npx shadcn-vue@latest add table
  npx shadcn-vue@latest add select
  npx shadcn-vue@latest add badge
  npx shadcn-vue@latest add avatar
  npx shadcn-vue@latest add dropdown-menu
  npx shadcn-vue@latest add sheet
  npx shadcn-vue@latest add sidebar
  npx shadcn-vue@latest add tabs
  npx shadcn-vue@latest add progress
  npx shadcn-vue@latest add switch
  npx shadcn-vue@latest add separator
  npx shadcn-vue@latest add label
  npx shadcn-vue@latest add tooltip
  npx shadcn-vue@latest add alert
  npx shadcn-vue@latest add alert-dialog
  ```
- [ ] 验证组件正确安装
- [ ] 测试组件基础功能

---

## 🔐 第二阶段：认证系统 (2-3天)

### 2.1 Better-Auth集成配置
- [ ] 创建 `plugins/auth.client.ts`
- [ ] 创建 `plugins/auth.server.ts` 
- [ ] 配置与 `libs/auth` 库的集成
- [ ] 创建 `server/api/auth/[...all].ts` API路由
- [ ] 测试认证API端点响应
- [ ] 验证会话管理功能

### 2.2 认证状态管理
- [ ] 创建 `stores/auth.ts` Pinia store
- [ ] 实现用户状态管理
- [ ] 实现登录状态持久化
- [ ] 创建认证相关的composables：
  - [ ] `composables/useAuth.ts`
  - [ ] `composables/useUser.ts`
- [ ] 测试状态同步功能

### 2.3 认证中间件
- [ ] 创建 `middleware/auth.ts` (需要登录)
- [ ] 创建 `middleware/guest.ts` (游客访问)
- [ ] 创建 `middleware/admin.ts` (管理员权限)
- [ ] 测试路由保护功能
- [ ] 验证重定向逻辑

### 2.4 登录页面实现
- [ ] 创建 `pages/signin.vue`
- [ ] 实现页面布局和样式
- [ ] 创建 `components/LoginForm.vue`：
  - [ ] 邮箱/密码登录表单
  - [ ] 表单验证逻辑
  - [ ] 错误处理显示
  - [ ] 提交状态管理
- [ ] 创建 `components/SocialAuth.vue`：
  - [ ] 社交登录按钮组
  - [ ] 微信登录支持
  - [ ] GitHub登录支持
  - [ ] Google登录支持
- [ ] 测试登录流程完整性

### 2.5 注册页面实现  
- [ ] 创建 `pages/signup.vue`
- [ ] 实现页面布局和样式
- [ ] 创建 `components/SignupForm.vue`：
  - [ ] 用户信息输入表单
  - [ ] 密码强度验证
  - [ ] 确认密码验证
  - [ ] 服务条款确认
- [ ] 测试注册流程

### 2.6 密码相关页面
- [ ] 创建 `pages/forgot-password.vue`
- [ ] 创建 `pages/reset-password.vue`
- [ ] 实现密码重置流程
- [ ] 测试邮件发送功能

### 2.7 手机号登录支持
- [ ] 创建 `pages/cellphone.vue`
- [ ] 创建 `components/PhoneLoginForm.vue`：
  - [ ] 国家代码选择器
  - [ ] 手机号验证
  - [ ] 验证码输入
  - [ ] SMS集成
- [ ] 测试短信登录流程

### 2.8 微信登录页面
- [ ] 创建 `pages/wechat.vue`
- [ ] 实现微信扫码登录
- [ ] 集成微信SDK
- [ ] 测试微信登录流程

---

## 🏠 第三阶段：核心页面功能 (3-4天)

### 3.1 布局系统实现
- [ ] 创建 `layouts/default.vue` 主布局：
  - [ ] 响应式布局结构
  - [ ] 侧边栏集成
  - [ ] 头部导航集成
  - [ ] 移动端适配
- [ ] 创建 `layouts/auth.vue` 认证页面布局
- [ ] 创建 `layouts/admin.vue` 管理后台布局
- [ ] 测试布局切换功能

### 3.2 全局组件实现
- [ ] 创建 `components/GlobalHeader.vue`：
  - [ ] 用户头像和下拉菜单
  - [ ] 主题切换按钮
  - [ ] 语言切换器
  - [ ] 通知中心
  - [ ] 响应式菜单
- [ ] 创建 `components/AppSidebar.vue`：
  - [ ] 导航菜单
  - [ ] 活动状态标识
  - [ ] 折叠/展开功能
  - [ ] 权限控制显示
- [ ] 创建 `components/ThemeToggle.vue`
- [ ] 测试全局组件功能

### 3.3 首页实现
- [ ] 创建 `pages/index.vue`
- [ ] 实现首页布局
- [ ] 添加功能介绍区块
- [ ] 添加定价展示
- [ ] 实现响应式设计
- [ ] 测试首页功能

### 3.4 用户仪表盘主页
- [ ] 创建 `pages/dashboard/index.vue`
- [ ] 创建 `components/dashboard/DashboardTabs.vue`：
  - [ ] 个人资料标签页
  - [ ] 订阅管理标签页  
  - [ ] 订单历史标签页
  - [ ] 安全设置标签页
- [ ] 实现标签页切换逻辑
- [ ] 测试仪表盘导航

### 3.5 个人资料管理
- [ ] 创建个人资料显示组件：
  - [ ] 用户信息展示
  - [ ] 头像上传功能
  - [ ] 信息编辑模式
  - [ ] 保存/取消操作
- [ ] 实现信息更新API调用
- [ ] 添加成功/错误提示
- [ ] 测试个人资料更新

### 3.6 订阅管理功能
- [ ] 创建 `pages/dashboard/subscription.vue`
- [ ] 创建 `components/dashboard/SubscriptionCard.vue`：
  - [ ] 当前订阅状态显示
  - [ ] 订阅计划详情
  - [ ] 续费/升级按钮
  - [ ] 取消订阅功能
- [ ] 实现订阅状态查询
- [ ] 集成支付流程
- [ ] 测试订阅管理功能

### 3.7 订单历史
- [ ] 创建 `components/dashboard/OrdersCard.vue`：
  - [ ] 订单列表展示
  - [ ] 订单状态标识
  - [ ] 订单详情查看
  - [ ] 分页功能
- [ ] 实现订单查询API
- [ ] 添加订单筛选功能
- [ ] 测试订单历史显示

### 3.8 安全设置
- [ ] 创建 `components/dashboard/ChangePasswordDialog.vue`：
  - [ ] 当前密码验证
  - [ ] 新密码输入
  - [ ] 密码强度检查
- [ ] 创建 `components/dashboard/DeleteAccountDialog.vue`：
  - [ ] 删除确认流程
  - [ ] 数据备份提醒
- [ ] 创建 `components/dashboard/LinkedAccountsCard.vue`：
  - [ ] 社交账号绑定状态
  - [ ] 绑定/解绑操作
- [ ] 测试安全设置功能

### 3.9 支付相关页面
- [ ] 创建 `pages/pricing.vue`：
  - [ ] 定价计划展示
  - [ ] 功能对比表格
  - [ ] 购买按钮集成
- [ ] 创建 `pages/payment-success.vue`
- [ ] 创建 `pages/payment-cancel.vue`
- [ ] 创建 `pages/premium-features.vue`
- [ ] 测试支付流程页面

---

## 🤖 第四阶段：AI功能 (2天)

### 4.1 AI聊天页面基础
- [ ] 创建 `pages/ai.vue`
- [ ] 实现聊天界面布局：
  - [ ] 消息展示区域
  - [ ] 输入框区域
  - [ ] 侧边栏 (历史对话)
  - [ ] 响应式设计
- [ ] 添加权限检查 (需要有效订阅)

### 4.2 聊天组件实现
- [ ] 创建 `components/ai/ChatMessage.vue`：
  - [ ] 用户消息样式
  - [ ] AI回复样式
  - [ ] 消息时间戳
  - [ ] 复制功能
- [ ] 创建 `components/ai/ChatInput.vue`：
  - [ ] 多行文本输入
  - [ ] 发送按钮
  - [ ] 快捷键支持
  - [ ] 输入状态指示
- [ ] 创建 `components/ai/ChatHistory.vue`：
  - [ ] 对话历史列表
  - [ ] 新建对话功能
  - [ ] 删除对话功能

### 4.3 AI API集成
- [ ] 创建 `server/api/chat.ts`
- [ ] 实现流式响应处理
- [ ] 集成 `libs/ai` 库
- [ ] 添加错误处理
- [ ] 实现消息历史存储

### 4.4 实时功能
- [ ] 实现打字指示器
- [ ] 添加消息流式显示
- [ ] 实现中断生成功能
- [ ] 添加重新生成功能
- [ ] 测试AI聊天完整流程

---

## 👨‍💼 第五阶段：管理后台 (2-3天)

### 5.1 管理员权限控制
- [ ] 完善 `middleware/admin.ts`
- [ ] 实现权限检查逻辑
- [ ] 添加权限不足提示
- [ ] 测试权限控制功能

### 5.2 管理员仪表盘
- [ ] 创建 `pages/admin/index.vue`
- [ ] 创建 `components/admin/RevenueChart.vue`：
  - [ ] 收入趋势图表
  - [ ] 时间范围选择器
  - [ ] 数据统计展示
- [ ] 实现数据概览卡片：
  - [ ] 总用户数
  - [ ] 活跃订阅数
  - [ ] 月收入统计
  - [ ] 增长率指标
- [ ] 测试仪表盘数据展示

### 5.3 用户管理
- [ ] 创建 `pages/admin/users/index.vue`
- [ ] 创建 `pages/admin/users/[id]/index.vue` 用户详情页
- [ ] 实现用户数据表格：
  - [ ] 用户列表展示
  - [ ] 分页功能
  - [ ] 搜索筛选
  - [ ] 排序功能
- [ ] 创建 `components/admin/users/UserSearch.vue`
- [ ] 创建 `components/admin/users/UserColumns.ts` 表格列定义
- [ ] 实现用户操作功能：
  - [ ] 查看详情
  - [ ] 编辑信息
  - [ ] 禁用/启用账户
  - [ ] 删除用户
- [ ] 测试用户管理功能

### 5.4 订单管理
- [ ] 创建 `pages/admin/orders/index.vue`
- [ ] 创建订单数据表格：
  - [ ] 订单列表展示
  - [ ] 状态筛选
  - [ ] 日期范围筛选
  - [ ] 金额排序
- [ ] 创建 `components/admin/orders/OrderSearch.vue`
- [ ] 创建 `components/admin/orders/OrderColumns.ts`
- [ ] 实现订单操作功能：
  - [ ] 查看订单详情
  - [ ] 退款处理
  - [ ] 状态更新
- [ ] 测试订单管理功能

### 5.5 订阅管理
- [ ] 创建 `pages/admin/subscriptions/index.vue`
- [ ] 创建订阅数据表格：
  - [ ] 订阅列表展示
  - [ ] 状态分类
  - [ ] 到期提醒
  - [ ] 收入统计
- [ ] 创建 `components/admin/subscriptions/SubscriptionSearch.vue`
- [ ] 创建 `components/admin/subscriptions/SubscriptionColumns.ts`
- [ ] 实现订阅操作功能：
  - [ ] 查看订阅详情
  - [ ] 手动续费
  - [ ] 取消订阅
  - [ ] 升级/降级
- [ ] 测试订阅管理功能

### 5.6 管理后台API
- [ ] 创建 `server/api/admin/users.ts`
- [ ] 创建 `server/api/admin/users/update.ts`
- [ ] 创建 `server/api/admin/users/delete.ts`
- [ ] 创建 `server/api/admin/orders.ts`
- [ ] 创建 `server/api/admin/subscriptions.ts`
- [ ] 测试管理API功能

---

## 🔌 第六阶段：API路由实现 (1天)

### 6.1 支付API路由
- [ ] 创建 `server/api/payment/initiate.ts`
- [ ] 创建 `server/api/payment/query.ts`
- [ ] 创建 `server/api/payment/cancel.ts`
- [ ] 创建 `server/api/payment/verify/creem.ts`
- [ ] 创建 `server/api/payment/verify/stripe.ts`
- [ ] 创建 `server/api/payment/webhook/creem.ts`
- [ ] 创建 `server/api/payment/webhook/stripe.ts`
- [ ] 创建 `server/api/payment/webhook/wechat.ts`
- [ ] 集成 `libs/payment` 库
- [ ] 测试支付API端点

### 6.2 订阅API路由
- [ ] 创建 `server/api/subscription/status.ts`
- [ ] 创建 `server/api/subscription/portal.ts`
- [ ] 集成订阅状态管理
- [ ] 测试订阅API功能

### 6.3 用户API路由
- [ ] 创建 `server/api/users/[id].ts`
- [ ] 实现用户信息CRUD操作
- [ ] 添加权限验证
- [ ] 测试用户API功能

### 6.4 订单API路由
- [ ] 创建 `server/api/orders.ts`
- [ ] 实现订单查询功能
- [ ] 添加分页和筛选
- [ ] 测试订单API功能

---

## 🎨 第七阶段：样式一致性保证 (1天)

### 7.1 Tailwind v4配置同步
- [ ] 对比Next.js应用的CSS变量配置
- [ ] 同步主题色彩变量：
  - [ ] `--background`
  - [ ] `--foreground` 
  - [ ] `--primary`
  - [ ] `--secondary`
  - [ ] `--muted`
  - [ ] `--accent`
  - [ ] `--destructive`
  - [ ] `--border`
  - [ ] `--input`
  - [ ] `--ring`
- [ ] 配置 `@theme inline` 指令
- [ ] 测试主题切换功能

### 7.2 组件样式验证
- [ ] 对比所有shadcn-vue组件样式：
  - [ ] Button组件样式一致性
  - [ ] Card组件样式一致性
  - [ ] Form组件样式一致性
  - [ ] Table组件样式一致性
  - [ ] Dialog组件样式一致性
- [ ] 验证响应式断点一致性
- [ ] 检查动画效果一致性

### 7.3 深色模式支持
- [ ] 配置深色模式CSS变量
- [ ] 测试主题切换功能
- [ ] 验证所有组件在深色模式下的表现
- [ ] 确保主题偏好设置持久化

### 7.4 移动端适配
- [ ] 验证所有页面移动端表现
- [ ] 测试触摸交互功能
- [ ] 检查移动端导航菜单
- [ ] 验证表单在小屏幕上的可用性

---

## 🧪 第八阶段：功能对等验证 (1天)

### 8.1 核心功能清单检查
- [ ] ✅ 用户注册流程完整性
- [ ] ✅ 邮箱/密码登录功能
- [ ] ✅ 手机号登录功能 
- [ ] ✅ 社交登录功能 (微信/GitHub/Google)
- [ ] ✅ 密码重置流程
- [ ] ✅ 用户个人资料管理
- [ ] ✅ 头像上传功能
- [ ] ✅ 密码修改功能
- [ ] ✅ 账户删除功能

### 8.2 订阅和支付功能
- [ ] ✅ 定价页面展示
- [ ] ✅ 订阅购买流程
- [ ] ✅ 支付成功/失败页面
- [ ] ✅ 订阅状态查询
- [ ] ✅ 订阅取消功能
- [ ] ✅ 订阅升级/降级
- [ ] ✅ 发票和收据生成
- [ ] ✅ 客户门户集成

### 8.3 AI功能验证
- [ ] ✅ AI聊天界面
- [ ] ✅ 消息发送和接收
- [ ] ✅ 流式响应显示
- [ ] ✅ 对话历史保存
- [ ] ✅ 新建对话功能
- [ ] ✅ 权限验证 (需要有效订阅)

### 8.4 管理后台功能
- [ ] ✅ 管理员权限验证
- [ ] ✅ 用户管理 (查看/编辑/删除)
- [ ] ✅ 订单管理和查询
- [ ] ✅ 订阅管理功能
- [ ] ✅ 收入统计图表
- [ ] ✅ 数据导出功能

### 8.5 国际化和主题
- [ ] ✅ 中英文切换功能
- [ ] ✅ 语言偏好保存
- [ ] ✅ 深色/浅色主题切换
- [ ] ✅ 主题偏好持久化
- [ ] ✅ 所有文本的翻译覆盖

### 8.6 响应式和兼容性
- [ ] ✅ 桌面端表现 (>= 1024px)
- [ ] ✅ 平板端表现 (768px - 1023px)
- [ ] ✅ 手机端表现 (< 768px)
- [ ] ✅ 主流浏览器兼容性
- [ ] ✅ 键盘导航支持
- [ ] ✅ 屏幕阅读器支持

### 8.7 性能和SEO
- [ ] ✅ 页面加载速度优化
- [ ] ✅ 图片懒加载实现
- [ ] ✅ 代码分割配置
- [ ] ✅ SEO元标签配置
- [ ] ✅ 结构化数据标记
- [ ] ✅ Sitemap生成

### 8.8 最终测试
- [ ] ✅ 端到端用户流程测试
- [ ] ✅ 支付流程完整测试
- [ ] ✅ 管理功能权限测试
- [ ] ✅ 跨浏览器兼容性测试
- [ ] ✅ 移动端功能测试
- [ ] ✅ 性能基准测试

---

## 📋 详细文件对照表

### 🔐 认证相关文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 登录页面 | `app/[lang]/(auth)/signin/page.tsx` | `pages/signin.vue` | ⏳ 待实现 |
| 注册页面 | `app/[lang]/(auth)/signup/page.tsx` | `pages/signup.vue` | ⏳ 待实现 |
| 忘记密码页面 | `app/[lang]/(auth)/forgot-password/page.tsx` | `pages/forgot-password.vue` | ⏳ 待实现 |
| 重置密码页面 | `app/[lang]/(auth)/reset-password/page.tsx` | `pages/reset-password.vue` | ⏳ 待实现 |
| 手机登录页面 | `app/[lang]/(auth)/cellphone/page.tsx` | `pages/cellphone.vue` | ⏳ 待实现 |
| 微信登录页面 | `app/[lang]/(auth)/wechat/page.tsx` | `pages/wechat.vue` | ⏳ 待实现 |
| 认证布局 | `app/[lang]/(auth)/layout.tsx` | `layouts/auth.vue` | ⏳ 待实现 |
| 登录表单 | `components/login-form.tsx` | `components/LoginForm.vue` | ⏳ 待实现 |
| 注册表单 | `components/signup-form.tsx` | `components/SignupForm.vue` | ⏳ 待实现 |
| 手机登录表单 | `components/phone-login-form.tsx` | `components/PhoneLoginForm.vue` | ⏳ 待实现 |
| 社交登录 | `components/social-auth.tsx` | `components/SocialAuth.vue` | ⏳ 待实现 |

### 🏠 核心页面文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 首页 | `app/[lang]/(root)/page.tsx` | `pages/index.vue` | ⏳ 待实现 |
| 定价页面 | `app/[lang]/(root)/pricing/page.tsx` | `pages/pricing.vue` | ⏳ 待实现 |
| 支付成功 | `app/[lang]/(root)/payment-success/page.tsx` | `pages/payment-success.vue` | ⏳ 待实现 |
| 支付取消 | `app/[lang]/(root)/payment-cancel/page.tsx` | `pages/payment-cancel.vue` | ⏳ 待实现 |
| 高级功能 | `app/[lang]/(root)/premium-features/page.tsx` | `pages/premium-features.vue` | ⏳ 待实现 |
| AI聊天页面 | `app/[lang]/(root)/ai/page.tsx` | `pages/ai.vue` | ⏳ 待实现 |
| 根布局 | `app/[lang]/(root)/layout.tsx` | `layouts/default.vue` | ⏳ 待实现 |
| 全局布局 | `app/[lang]/layout.tsx` | `app.vue` | ⏳ 待实现 |

### 📊 仪表盘文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 仪表盘主页 | `app/[lang]/(root)/dashboard/page.tsx` | `pages/dashboard/index.vue` | ⏳ 待实现 |
| 订阅页面 | `app/[lang]/(root)/dashboard/subscription/page.tsx` | `pages/dashboard/subscription.vue` | ⏳ 待实现 |
| 仪表盘布局 | `app/[lang]/(root)/dashboard/layout.tsx` | `layouts/dashboard.vue` | ⏳ 待实现 |
| 订阅布局 | `app/[lang]/(root)/dashboard/subscription/layout.tsx` | - | 💡 可选 |
| 仪表盘标签页 | `app/[lang]/(root)/dashboard/components/dashboard-tabs.tsx` | `components/dashboard/DashboardTabs.vue` | ⏳ 待实现 |
| 订阅卡片 | `app/[lang]/(root)/dashboard/components/subscription-card.tsx` | `components/dashboard/SubscriptionCard.vue` | ⏳ 待实现 |
| 订单卡片 | `app/[lang]/(root)/dashboard/components/orders-card.tsx` | `components/dashboard/OrdersCard.vue` | ⏳ 待实现 |
| 修改密码对话框 | `app/[lang]/(root)/dashboard/components/change-password-dialog.tsx` | `components/dashboard/ChangePasswordDialog.vue` | ⏳ 待实现 |
| 删除账户对话框 | `app/[lang]/(root)/dashboard/components/delete-account-dialog.tsx` | `components/dashboard/DeleteAccountDialog.vue` | ⏳ 待实现 |
| 关联账户卡片 | `app/[lang]/(root)/dashboard/components/linked-accounts-card.tsx` | `components/dashboard/LinkedAccountsCard.vue` | ⏳ 待实现 |

### 👨‍💼 管理后台文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 管理员首页 | `app/[lang]/admin/page.tsx` | `pages/admin/index.vue` | ⏳ 待实现 |
| 用户管理页面 | `app/[lang]/admin/users/page.tsx` | `pages/admin/users/index.vue` | ⏳ 待实现 |
| 用户详情页面 | `app/[lang]/admin/users/[id]/page.tsx` | `pages/admin/users/[id]/index.vue` | ⏳ 待实现 |
| 订单管理页面 | `app/[lang]/admin/orders/page.tsx` | `pages/admin/orders/index.vue` | ⏳ 待实现 |
| 订阅管理页面 | `app/[lang]/admin/subscriptions/page.tsx` | `pages/admin/subscriptions/index.vue` | ⏳ 待实现 |
| 管理员布局 | `app/[lang]/admin/layout.tsx` | `layouts/admin.vue` | ⏳ 待实现 |
| 收入图表 | `app/[lang]/admin/RevenueChart.tsx` | `components/admin/RevenueChart.vue` | ⏳ 待实现 |
| 管理员订单卡片 | `app/[lang]/admin/components/admin-orders-card.tsx` | `components/admin/AdminOrdersCard.vue` | ⏳ 待实现 |
| 用户数据表格 | `app/[lang]/admin/users/data-table.tsx` | `components/admin/users/DataTable.vue` | ⏳ 待实现 |
| 用户表格列定义 | `app/[lang]/admin/users/columns.tsx` | `components/admin/users/columns.ts` | ⏳ 待实现 |
| 用户搜索组件 | `app/[lang]/admin/users/components/search.tsx` | `components/admin/users/Search.vue` | ⏳ 待实现 |
| 用户列切换器 | `app/[lang]/admin/users/components/column-toggle.tsx` | `components/admin/users/ColumnToggle.vue` | ⏳ 待实现 |
| 数据表格排序头 | `app/[lang]/admin/users/components/data-table-column-header.tsx` | `components/admin/users/DataTableColumnHeader.vue` | ⏳ 待实现 |
| 订单数据表格 | `app/[lang]/admin/orders/data-table.tsx` | `components/admin/orders/DataTable.vue` | ⏳ 待实现 |
| 订单表格列定义 | `app/[lang]/admin/orders/columns.tsx` | `components/admin/orders/columns.ts` | ⏳ 待实现 |
| 订单搜索组件 | `app/[lang]/admin/orders/components/search.tsx` | `components/admin/orders/Search.vue` | ⏳ 待实现 |
| 订阅数据表格 | `app/[lang]/admin/subscriptions/data-table.tsx` | `components/admin/subscriptions/DataTable.vue` | ⏳ 待实现 |
| 订阅表格列定义 | `app/[lang]/admin/subscriptions/columns.tsx` | `components/admin/subscriptions/columns.ts` | ⏳ 待实现 |
| 订阅搜索组件 | `app/[lang]/admin/subscriptions/components/search.tsx` | `components/admin/subscriptions/Search.vue` | ⏳ 待实现 |

### 🎨 布局和全局组件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 全局头部 | `components/global-header.tsx` | `components/GlobalHeader.vue` | ⏳ 待实现 |
| 应用侧边栏 | `components/app-sidebar.tsx` | `components/AppSidebar.vue` | ⏳ 待实现 |
| 主题切换 | `components/theme-toggle.tsx` | `components/ThemeToggle.vue` | ⏳ 待实现 |

### 🔌 API 路由文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 认证API | `app/api/auth/[...all]/route.ts` | `server/api/auth/[...all].ts` | ⏳ 待实现 |
| 聊天API | `app/api/chat/route.ts` | `server/api/chat.ts` | ⏳ 待实现 |
| 订单API | `app/api/orders/route.ts` | `server/api/orders.ts` | ⏳ 待实现 |
| 支付发起 | `app/api/payment/initiate/route.ts` | `server/api/payment/initiate.ts` | ⏳ 待实现 |
| 支付查询 | `app/api/payment/query/route.ts` | `server/api/payment/query.ts` | ⏳ 待实现 |
| 支付取消 | `app/api/payment/cancel/route.ts` | `server/api/payment/cancel.ts` | ⏳ 待实现 |
| Creem支付验证 | `app/api/payment/verify/creem/route.ts` | `server/api/payment/verify/creem.ts` | ⏳ 待实现 |
| Stripe支付验证 | `app/api/payment/verify/stripe/route.ts` | `server/api/payment/verify/stripe.ts` | ⏳ 待实现 |
| Creem Webhook | `app/api/payment/webhook/creem/route.ts` | `server/api/payment/webhook/creem.ts` | ⏳ 待实现 |
| Stripe Webhook | `app/api/payment/webhook/stripe/route.ts` | `server/api/payment/webhook/stripe.ts` | ⏳ 待实现 |
| 微信 Webhook | `app/api/payment/webhook/wechat/route.ts` | `server/api/payment/webhook/wechat.ts` | ⏳ 待实现 |
| 订阅门户 | `app/api/subscription/portal/route.ts` | `server/api/subscription/portal.ts` | ⏳ 待实现 |
| 订阅状态 | `app/api/subscription/status/route.ts` | `server/api/subscription/status.ts` | ⏳ 待实现 |
| 用户API | `app/api/users/[id]/route.ts` | `server/api/users/[id].ts` | ⏳ 待实现 |
| 管理员订单 | `app/api/admin/orders/route.ts` | `server/api/admin/orders.ts` | ⏳ 待实现 |
| 管理员订阅 | `app/api/admin/subscriptions/route.ts` | `server/api/admin/subscriptions.ts` | ⏳ 待实现 |
| 管理员用户更新 | `app/api/admin/users/update/route.ts` | `server/api/admin/users/update.ts` | ⏳ 待实现 |
| 管理员用户删除 | `app/api/admin/users/delete/route.ts` | `server/api/admin/users/delete.ts` | ⏳ 待实现 |

### 🛠️ 工具和配置文件

| 功能 | Next.js 参考文件 | Nuxt.js 目标文件 | 状态 |
|------|-----------------|-----------------|------|
| 国际化Hook | `hooks/use-translation.ts` | `composables/useTranslation.ts` | ⏳ 待实现 |
| 主题Hook | `hooks/use-theme.tsx` | `composables/useTheme.ts` | ⏳ 待实现 |
| 移动端Hook | `hooks/use-mobile.ts` | `composables/useMobile.ts` | ⏳ 待实现 |
| 订阅Hook | `hooks/useSubscription.tsx` | `composables/useSubscription.ts` | ⏳ 待实现 |
| 中间件配置 | `middleware.ts` | `middleware/auth.global.ts` | ⏳ 待实现 |
| 认证中间件 | `middlewares/authMiddleware.ts` | `middleware/auth.ts` | ⏳ 待实现 |
| 本地化中间件 | `middlewares/localeMiddleware.ts` | `plugins/i18n.client.ts` | ⏳ 待实现 |
| 订阅中间件 | `middlewares/subscriptionMiddleware.ts` | `middleware/subscription.ts` | ⏳ 待实现 |
| 国际化配置 | `app/i18n-config.ts` | `i18n.config.ts` | ⏳ 待实现 |

### 📱 UI组件文件 (shadcn-vue 自动生成)

这些组件将通过 `npx shadcn-vue@latest add` 命令自动生成，参考 Next.js 对应组件的使用方式：

| Next.js UI组件 | Nuxt.js UI组件 | 安装命令 |
|---------------|---------------|----------|
| `components/ui/button.tsx` | `components/ui/Button.vue` | `npx shadcn-vue@latest add button` |
| `components/ui/card.tsx` | `components/ui/Card.vue` | `npx shadcn-vue@latest add card` |
| `components/ui/input.tsx` | `components/ui/Input.vue` | `npx shadcn-vue@latest add input` |
| `components/ui/form.tsx` | `components/ui/Form.vue` | `npx shadcn-vue@latest add form` |
| `components/ui/dialog.tsx` | `components/ui/Dialog.vue` | `npx shadcn-vue@latest add dialog` |
| `components/ui/table.tsx` | `components/ui/Table.vue` | `npx shadcn-vue@latest add table` |
| `components/ui/select.tsx` | `components/ui/Select.vue` | `npx shadcn-vue@latest add select` |
| `components/ui/badge.tsx` | `components/ui/Badge.vue` | `npx shadcn-vue@latest add badge` |
| `components/ui/avatar.tsx` | `components/ui/Avatar.vue` | `npx shadcn-vue@latest add avatar` |
| `components/ui/dropdown-menu.tsx` | `components/ui/DropdownMenu.vue` | `npx shadcn-vue@latest add dropdown-menu` |
| `components/ui/sheet.tsx` | `components/ui/Sheet.vue` | `npx shadcn-vue@latest add sheet` |
| `components/ui/sidebar.tsx` | `components/ui/Sidebar.vue` | `npx shadcn-vue@latest add sidebar` |
| `components/ui/tabs.tsx` | `components/ui/Tabs.vue` | `npx shadcn-vue@latest add tabs` |
| `components/ui/progress.tsx` | `components/ui/Progress.vue` | `npx shadcn-vue@latest add progress` |
| `components/ui/switch.tsx` | `components/ui/Switch.vue` | `npx shadcn-vue@latest add switch` |
| `components/ui/separator.tsx` | `components/ui/Separator.vue` | `npx shadcn-vue@latest add separator` |
| `components/ui/label.tsx` | `components/ui/Label.vue` | `npx shadcn-vue@latest add label` |
| `components/ui/tooltip.tsx` | `components/ui/Tooltip.vue` | `npx shadcn-vue@latest add tooltip` |
| `components/ui/alert.tsx` | `components/ui/Alert.vue` | `npx shadcn-vue@latest add alert` |
| `components/ui/alert-dialog.tsx` | `components/ui/AlertDialog.vue` | `npx shadcn-vue@latest add alert-dialog` |

---

## 🛠️ 技术栈对照

| 类别 | Next.js | Nuxt.js | 说明 |
|------|---------|---------|------|
| **框架** | Next.js 15 | Nuxt 3 | ✅ 版本对应 |
| **UI组件** | shadcn/ui | shadcn-vue | ✅ 完全对等 |
| **样式** | Tailwind v4 | Tailwind v4 | ✅ 版本一致 |
| **状态管理** | React useState | Pinia + Vue ref | 🔄 需适配 |
| **表单处理** | React Hook Form | Vee-Validate | 🔄 需适配 |
| **路由** | App Router | Nuxt Router | 🔄 需适配 |
| **认证** | Better-Auth | Better-Auth | ✅ 库相同 |
| **国际化** | 自定义Hook | @nuxtjs/i18n | 🔄 需适配 |
| **API** | Route Handlers | Nitro API | 🔄 需适配 |

---

## 📊 进度追踪

### 总体进度: 0% (0/8 阶段完成)

- 🔴 **第一阶段**: 0% (0/5 子任务完成)
- 🔴 **第二阶段**: 0% (0/8 子任务完成)  
- 🔴 **第三阶段**: 0% (0/9 子任务完成)
- 🔴 **第四阶段**: 0% (0/4 子任务完成)
- 🔴 **第五阶段**: 0% (0/6 子任务完成)
- 🔴 **第六阶段**: 0% (0/4 子任务完成)
- 🔴 **第七阶段**: 0% (0/4 子任务完成)
- 🔴 **第八阶段**: 0% (0/8 子任务完成)

### 图例
- ✅ 已完成
- ⏳ 进行中  
- 🔴 未开始
- ⚠️ 有问题

---

## 📖 实施指南：如何参考Next.js文件

### 🔍 组件迁移步骤

当实现每个Vue组件时，请按以下步骤参考对应的React组件：

#### 1. 页面组件迁移 (pages/*.vue)
```bash
# 例如：实现登录页面
# 参考文件：apps/next-app/app/[lang]/(auth)/signin/page.tsx
# 目标文件：apps/nuxt-app/pages/signin.vue

# 步骤：
# 1. 查看React页面的布局结构
# 2. 识别使用的UI组件 (Card, CardHeader等)
# 3. 查看业务逻辑和状态管理
# 4. 查看国际化文本使用
# 5. 转换为Vue 3 Composition API语法
```

#### 2. 组件迁移 (components/*.vue)
```bash
# 例如：实现登录表单
# 参考文件：apps/next-app/components/login-form.tsx
# 目标文件：apps/nuxt-app/components/LoginForm.vue

# 迁移对照：
# React Hook Form + zod → Vee-Validate + zod
# useState → ref/reactive
# useEffect → watch/onMounted
# React.FC<Props> → defineProps<Props>
```

#### 3. API路由迁移 (server/api/*.ts)
```bash
# 例如：实现聊天API
# 参考文件：apps/next-app/app/api/chat/route.ts
# 目标文件：apps/nuxt-app/server/api/chat.ts

# 迁移对照：
# export async function POST(request: Request) → export default defineEventHandler(async (event) => {})
# request.json() → readBody(event)
# NextResponse.json() → return { ... }
```

#### 4. Hooks到Composables迁移
```bash
# 例子：useTranslation
# 参考文件：apps/next-app/hooks/use-translation.ts
# 目标文件：apps/nuxt-app/composables/useTranslation.ts

# 迁移要点：
# - 保持相同的API接口
# - 使用Vue的响应式系统
# - 适配Nuxt的插件系统
```

### 📁 关键文件内容参考指南

#### 🔐 认证相关
- **登录表单逻辑**: 查看 `components/login-form.tsx` 的表单验证、错误处理、提交逻辑
- **社交登录**: 参考 `components/social-auth.tsx` 的按钮配置和回调处理
- **认证状态**: 查看 `hooks/use-translation.ts` 了解如何与Better-Auth集成

#### 📊 仪表盘功能
- **标签页结构**: 参考 `dashboard/components/dashboard-tabs.tsx` 的布局和状态管理
- **订阅卡片**: 查看 `dashboard/components/subscription-card.tsx` 的数据展示和操作按钮
- **状态管理**: 观察 `hooks/useSubscription.tsx` 的数据获取和更新逻辑

#### 👨‍💼 管理后台
- **数据表格**: 重点参考 `admin/users/data-table.tsx` 的分页、排序、筛选实现
- **表格列定义**: 查看 `admin/users/columns.tsx` 的列配置和渲染逻辑
- **搜索组件**: 参考 `admin/users/components/search.tsx` 的实时搜索实现

#### 🎨 UI和样式
- **主题切换**: 查看 `components/theme-toggle.tsx` 的实现方式
- **响应式布局**: 参考 `components/global-header.tsx` 的移动端适配
- **CSS变量**: 查看 `globals.css` 的主题变量定义

### 🔄 技术栈转换对照

| React 概念 | Vue 3 等价物 | 示例 |
|-----------|-------------|------|
| `useState(false)` | `ref(false)` | `const loading = ref(false)` |
| `useEffect(() => {}, [])` | `onMounted(() => {})` | `onMounted(() => { ... })` |
| `useCallback` | `computed` 或直接定义函数 | `const handleClick = () => {}` |
| `useMemo` | `computed` | `const filteredData = computed(() => {})` |
| `React.FC<Props>` | `defineProps<Props>()` | `const props = defineProps<Props>()` |
| `{children}` | `<slot />` | `<slot />` |
| `className` | `class` | `class="bg-white"` |
| `onClick` | `@click` | `@click="handleClick"` |

### 📝 代码迁移示例

#### React组件示例：
```tsx
// apps/next-app/components/login-form.tsx
export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  
  const handleSubmit = async (data: LoginData) => {
    setLoading(true);
    // ... 登录逻辑
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button disabled={loading}>
        {t.auth.signin.signIn}
      </Button>
    </form>
  );
}
```

#### 对应的Vue组件：
```vue
<!-- apps/nuxt-app/components/LoginForm.vue -->
<template>
  <form @submit="handleSubmit">
    <Button :disabled="loading">
      {{ t.auth.signin.signIn }}
    </Button>
  </form>
</template>

<script setup lang="ts">
const loading = ref(false);
const { t } = useTranslation();

const handleSubmit = async (data: LoginData) => {
  loading.value = true;
  // ... 登录逻辑
  loading.value = false;
};
</script>
```

### 🛠️ 调试和测试建议

1. **对比渲染结果**: 在两个应用中打开相同页面，对比视觉效果
2. **功能测试**: 确保每个交互功能都与Next.js版本一致
3. **API测试**: 使用相同的测试数据验证API响应
4. **样式验证**: 检查响应式布局和主题切换

---

## 📝 开发注意事项

### 代码质量要求
- [ ] 所有组件必须有TypeScript类型定义
- [ ] 遵循Vue 3 Composition API最佳实践
- [ ] 使用ESLint和Prettier保持代码风格一致
- [ ] 组件必须包含必要的props验证
- [ ] 重要功能需要添加单元测试

### 性能要求
- [ ] 页面首次加载时间 < 3秒
- [ ] 组件懒加载配置
- [ ] 图片优化和懒加载
- [ ] API请求去重和缓存
- [ ] 合理的代码分割策略

### 兼容性要求
- [ ] 支持主流现代浏览器 (Chrome, Firefox, Safari, Edge)
- [ ] 移动端响应式设计
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容性
- [ ] 深色模式完整支持

---

## 🔗 相关文档链接

- [shadcn-vue 官方文档](https://www.shadcn-vue.com/)
- [Tailwind v4 升级指南](https://tailwindcss.com/docs/upgrade-guide)
- [Nuxt 3 官方文档](https://nuxt.com/docs)
- [Better-Auth 文档](https://www.better-auth.com/docs)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [Vee-Validate 表单验证](https://vee-validate.logaretm.com/v4/)

---

**最后更新**: 2024-12-19
**预计完成**: 2024-12-30
**负责人**: 开发团队
**当前阶段**: 准备阶段 