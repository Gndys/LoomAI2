import { useCallback, useMemo } from 'react';
import { Action, AppUser, Subject } from './types';
import { can, getAbility, getAvailableActions } from './utils';

/**
 * React Hook: 在组件中检查权限
 * 
 * @param user 当前用户
 * @param action 要检查的操作
 * @param subject 要检查的资源
 * @param data 可选的数据上下文
 * @returns 是否有权限
 */
export function usePermission(
  user: AppUser | null | undefined,
  action: Action,
  subject: Subject,
  data?: any
): boolean {
  return useMemo(() => {
    return can(user, action, subject, data);
  }, [user, action, subject, data]);
}

/**
 * React Hook: 获取用户对某个资源的所有可用操作
 * 
 * @param user 当前用户
 * @param subject 资源类型
 * @returns 可执行的操作列表
 */
export function useAvailableActions(
  user: AppUser | null | undefined,
  subject: Subject
): Action[] {
  return useMemo(() => {
    if (!user) return [];
    return getAvailableActions(user, subject);
  }, [user, subject]);
}

/**
 * React Hook: 获取高级权限控制接口
 * 
 * @param user 当前用户
 * @returns 一个包含权限检查方法的对象
 */
export function useAbility(user: AppUser | null | undefined) {
  const checkPermission = useCallback(
    (action: Action, subject: Subject, data?: any) => {
      return can(user, action, subject, data);
    },
    [user]
  );

  const getActions = useCallback(
    (subject: Subject) => {
      if (!user) return [];
      return getAvailableActions(user, subject);
    },
    [user]
  );

  return useMemo(
    () => ({
      can: checkPermission,
      getActions,
    }),
    [checkPermission, getActions]
  );
}

/**
 * 权限控制组件示例使用方法:
 * 
 * ```tsx
 * // 在页面组件中使用
 * const ProfilePage = () => {
 *   const user = useUser(); // 假设有一个获取当前用户的hook
 *   const canEditProfile = usePermission(user, Action.UPDATE, Subject.USER);
 *   
 *   return (
 *     <div>
 *       <h1>用户资料</h1>
 *       {canEditProfile ? (
 *         <EditProfileForm user={user} />
 *       ) : (
 *         <ViewOnlyProfile user={user} />
 *       )}
 *     </div>
 *   );
 * };
 * 
 * // 或者使用权限控制组件
 * const AdminSettingsPage = () => {
 *   const user = useUser();
 *   return (
 *     <PermissionGuard
 *       user={user}
 *       action={Action.READ}
 *       subject={Subject.SETTING}
 *       fallback={<AccessDenied />}
 *     >
 *       <SettingsPanel />
 *     </PermissionGuard>
 *   );
 * };
 * ```
 */ 