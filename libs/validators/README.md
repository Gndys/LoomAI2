# 验证器 (Validators) 系统

ShipEasy 项目的数据验证系统，基于 Zod 构建，提供类型安全的数据验证和表单处理能力。

## 🎯 设计目标

- **类型安全**: 使用 TypeScript 和 Zod 确保编译时和运行时的类型安全
- **简洁直观**: 保持验证规则简单明了，易于理解和维护
- **高度复用**: 支持验证器组合和扩展，避免重复代码
- **表单集成**: 与 React Hook Form 无缝集成，提供优秀的用户体验
- **国际化**: 支持多语言错误信息显示

## 📁 目录结构

```
libs/validators/
├── README.md          # 本文档
├── user.ts           # 用户相关验证器
└── index.ts          # 统一导出 (未来规划)
```

## 🏗️ 核心架构

### 验证器分类

我们的验证器按照业务场景进行分类：

1. **基础验证器** - 对应数据库实体的完整验证
2. **表单验证器** - 针对特定表单场景的验证
3. **操作验证器** - 针对特定业务操作的验证
4. **扩展验证器** - 基于基础验证器的扩展和变体

### 命名规范

- 基础验证器: `entitySchema` (如 `userSchema`)
- 表单验证器: `actionFormSchema` (如 `signupFormSchema`, `loginFormSchema`)
- 操作验证器: `actionSchema` (如 `changePasswordSchema`, `resetPasswordSchema`)
- 扩展验证器: `baseEntityExtendedSchema` (如 `updateUserSchema`)


## 🔧 使用方式

### 1. 与 React Hook Form 集成

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "@libs/validators/user";
import type { z } from "zod";

type FormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData) => {
    // 表单提交逻辑
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 表单字段 */}
    </form>
  );
}
```

### 2. 直接数据验证

```typescript
import { userSchema } from "@libs/validators/user";

// 安全解析 (推荐)
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error('验证失败:', result.error.issues);
  return;
}
// 使用验证后的数据: result.data
```

### 3. TypeScript 类型推断

```typescript
import type { z } from "zod";
import { userSchema } from "@libs/validators/user";

// 自动推断类型
type User = z.infer<typeof userSchema>;

function createUser(userData: User) {
  // userData 具有完整的类型提示
}
```

## 🎨 最佳实践

### 验证器设计原则

- **单一职责**: 每个验证器专注于特定的使用场景
- **组合优于继承**: 使用 `.extend()` 和 `.partial()` 组合验证器
- **明确的错误信息**: 提供清晰的验证错误信息
- **性能考虑**: 避免复杂的验证逻辑，保持验证器轻量

### 表单验证配置

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',              // 失焦时验证
  reValidateMode: 'onChange',  // 重新验证模式
  defaultValues: { /* ... */ } // 提供默认值
});
```

### 验证器扩展

```typescript
// 基于现有验证器创建新的验证器
export const adminUserSchema = userSchema.extend({
  permissions: z.array(z.string()),
});

// 创建可选字段版本
export const partialUserSchema = userSchema.partial();

// 选择特定字段
export const userProfileSchema = userSchema.pick({
  name: true,
  email: true,
  image: true,
});
```

## 🧪 测试

验证器有完整的测试覆盖，位于 `tests/unit/validators/user.test.ts`。

## 🔮 未来规划

1. **更多验证器**: 计划添加订阅、支付等业务相关验证器
2. **自定义验证器**: 支持更复杂的业务规则验证
3. **验证器工具**: 开发验证器生成和测试工具

## 🤝 贡献指南

添加新的验证器时，请遵循以下步骤：

1. 在相应的验证器文件中添加新的 schema
2. 遵循现有的命名规范
3. 添加完整的 TypeScript 类型注释
4. 编写相应的测试用例
5. 更新本 README 文档

## 📚 相关技术

- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [React Hook Form](https://react-hook-form.com/) - 高性能表单库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全 