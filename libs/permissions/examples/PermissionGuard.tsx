import React, { ReactNode } from 'react';
import { Action, AppUser, Subject } from '../types';
import { can } from '../utils';

interface PermissionGuardProps {
  user: AppUser | null | undefined;
  action: Action;
  subject: Subject;
  data?: any;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * 权限控制组件
 * 
 * 只有当用户有指定权限时才会渲染子组件，否则渲染替代内容
 */
export function PermissionGuard({
  user,
  action,
  subject,
  data,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const hasPermission = can(user, action, subject, data);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * 使用示例:
 * 
 * ```tsx
 * <PermissionGuard
 *   user={currentUser}
 *   action={Action.READ}
 *   subject={Subject.SETTING}
 *   fallback={<p>您没有权限访问此页面</p>}
 * >
 *   <SettingsPanel />
 * </PermissionGuard>
 * ```
 */ 