import { Action, AppUser, Subject } from './types';
import { can, mapDatabaseRoleToAppRole } from './utils';

/**
 * 通用权限检查函数
 * 可用于任何框架的中间件或路由处理器
 */
export function checkPermission(
  user: AppUser | null | undefined,
  action: Action,
  subject: Subject,
  data?: any
): boolean {
  if (!user) return false;
  return can(user, action, subject, data);
}

/**
 * 将数据库用户转换为带有角色的AppUser
 */
export function createAppUser(user: any, defaultRole = 'normal'): AppUser {
  if (!user) return null as unknown as AppUser;

  return {
    ...user,
    role: mapDatabaseRoleToAppRole(user.role || defaultRole)
  };
}

/**
 * 权限检查辅助函数示例
 * 
 * 使用示例:
 * 
 * ```typescript
 * // Express/Nest.js 中间件
 * export const permissionMiddleware = (action: Action, subject: Subject) => {
 *   return (req, res, next) => {
 *     const user = req.user; // 假设用户已由认证中间件放入 req.user
 *     
 *     if (!user) {
 *       return res.status(401).json({ message: '未授权访问' });
 *     }
 *     
 *     // 创建 AppUser
 *     const appUser = createAppUser(user);
 *     
 *     // 检查权限
 *     if (!checkPermission(appUser, action, subject)) {
 *       return res.status(403).json({ message: '权限不足' });
 *     }
 *     
 *     // 通过权限检查
 *     next();
 *   };
 * };
 * 
 * // Next.js API 路由
 * export default async function handler(req, res) {
 *   const session = await getSession({ req });
 *   const appUser = createAppUser(session?.user);
 *   
 *   if (!checkPermission(appUser, Action.CREATE, Subject.PROJECT)) {
 *     return res.status(403).json({ message: '权限不足' });
 *   }
 *   
 *   // 继续处理请求...
 * }
 * ```
 */ 