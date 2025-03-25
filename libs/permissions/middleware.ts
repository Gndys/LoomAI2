import { NextRequest, NextResponse } from 'next/server';
import { Action, AppUser, Subject } from './types';
import { can, mapDatabaseRoleToAppRole } from './utils';

/**
 * NextJS 中间件示例：权限检查
 * 使用方式：在 Next.js 路由处理函数中调用
 */
export async function checkPermission(
  req: NextRequest, 
  action: Action,
  subject: Subject,
  data?: any
) {
  // 假设从请求中获取用户信息
  // 实际使用时，需要根据你的认证系统获取当前用户信息
  const user = req.headers.get('x-user-info') 
    ? JSON.parse(req.headers.get('x-user-info') || '{}')
    : null;

  if (!user) {
    return NextResponse.json(
      { message: '未授权访问' },
      { status: 401 }
    );
  }

  // 将会话用户转换为 AppUser (包含角色)
  const appUser: AppUser = {
    ...user,
    role: mapDatabaseRoleToAppRole(user.role || 'normal')
  };

  // 检查权限
  if (!can(appUser, action, subject, data)) {
    return NextResponse.json(
      { message: '权限不足' },
      { status: 403 }
    );
  }

  // 通过权限检查
  return null;
}

/**
 * Express/Nest.js 中间件示例
 * 使用方式：作为 Express/Nest.js 中间件使用
 */
export const permissionMiddleware = (action: Action, subject: Subject, data?: any) => {
  return (req: any, res: any, next: any) => {
    const user = req.user; // 假设用户已由认证中间件放入 req.user
    
    if (!user) {
      return res.status(401).json({ message: '未授权访问' });
    }

    // 将用户转换为 AppUser (包含角色)
    const appUser: AppUser = {
      ...user,
      role: mapDatabaseRoleToAppRole(user.role || 'normal')
    };

    // 检查权限
    if (!can(appUser, action, subject, data)) {
      return res.status(403).json({ message: '权限不足' });
    }

    // 通过权限检查
    next();
  };
};

/**
 * React 组件权限校验 Hook 示例
 * 使用示例：
 * 
 * ```tsx
 * function AdminSettingsPage() {
 *   const hasAccess = usePermission(Action.READ, Subject.SETTING);
 *   
 *   if (!hasAccess) {
 *     return <AccessDenied />;
 *   }
 *   
 *   return <SettingsPanel />;
 * }
 * ```
 */
export const checkComponentPermission = (user: AppUser | null, action: Action, subject: Subject, data?: any): boolean => {
  return can(user, action, subject, data);
}; 