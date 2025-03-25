# ShipEasy 权限控制系统

这是一个基于 CASL 的简单权限控制系统，用于 ShipEasy 应用中控制用户对不同资源的访问权限。

## 设计思想

权限系统基于以下核心概念：

1. **角色 (Roles)**: 定义用户在系统中的身份，如普通用户(normal)、高级用户(vip)、管理员(admin)
2. **资源 (Subjects)**: 定义系统中可被操作的实体，如用户、项目、订阅等
3. **操作 (Actions)**: 定义用户可对资源执行的动作，如创建、读取、更新、删除
4. **规则 (Rules)**: 定义角色、资源和操作之间的关系

## 系统组件

权限系统包含以下核心组件：

- **types.ts**: 定义了系统中的角色、资源和操作的类型
- **abilities.ts**: 定义了不同角色的用户权限规则
- **utils.ts**: 提供了权限检查和角色映射的工具函数
- **middleware.ts**: 提供了用于 Next.js 和 Express/Nest.js 的权限检查中间件
- **hooks.ts**: 提供了在 React 组件中使用的权限检查 hooks

## 基本使用

### 后端权限检查

```typescript
import { Action, Subject, can } from '@libs/permissions';

// 在 API 路由处理函数中检查权限
async function handleUpdateProject(req, res) {
  const user = req.user; // 假设已通过认证中间件获取用户
  const projectId = req.params.id;
  
  // 检查用户是否有权限更新项目
  if (!can(user, Action.UPDATE, Subject.PROJECT)) {
    return res.status(403).json({ message: '权限不足' });
  }
  
  // 检查用户是否可以访问特定资源（如自己的用户信息）
  if (!can(user, Action.UPDATE, Subject.USER, { id: userId })) {
    return res.status(403).json({ message: '权限不足' });
  }
  
  // 权限检查通过，继续处理业务逻辑
  // ...
}
```

### 使用中间件

```typescript
import { Action, Subject, permissionMiddleware } from '@libs/permissions';
import express from 'express';

const app = express();

// 在路由中使用权限中间件
app.put(
  '/api/projects/:id',
  // 检查是否有更新项目的权限
  permissionMiddleware(Action.UPDATE, Subject.PROJECT),
  (req, res) => {
    // 权限检查通过，继续处理请求
  }
);
```

### 前端组件中使用

```tsx
import { usePermission, Action, Subject } from '@libs/permissions';

function ProjectPage({ project, user }) {
  // 检查用户是否有权限编辑项目
  const canEdit = usePermission(user, Action.UPDATE, Subject.PROJECT);
  
  return (
    <div>
      <h1>{project.name}</h1>
      {canEdit && <button>编辑项目</button>}
    </div>
  );
}
```

## 测试

权限系统包含全面的测试用例，确保权限规则按预期工作。测试文件位于 `tests/unit/permissions` 目录下，包括：

- **abilities.test.ts**: 测试不同角色用户的权限定义
- **utils.test.ts**: 测试权限工具函数
- **middleware.test.ts**: 测试权限中间件
- **integration.test.ts**: 测试权限系统在实际应用场景中的集成使用

### 运行测试

```bash
# 运行所有测试
pnpm test

# 只运行权限相关测试
pnpm test tests/unit/permissions

# 使用 UI 界面运行测试
pnpm test:ui

# 生成测试覆盖率报告
pnpm test:coverage
```

## 扩展

如需扩展权限系统，可以：

1. 在 `types.ts` 中添加新的角色、资源或操作
2. 在 `abilities.ts` 中为角色添加新的权限规则
3. 根据需要创建新的工具函数或中间件

## 高级用法

对于复杂的权限场景，可以在 `utils.ts` 中扩展 `can` 函数，增加特定资源的条件检查逻辑。 