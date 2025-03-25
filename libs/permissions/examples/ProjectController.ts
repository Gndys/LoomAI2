import { NextRequest, NextResponse } from 'next/server';
import { Action, AppUser, Role, Subject } from '../types';
import { can, mapDatabaseRoleToAppRole } from '../utils';

// 简化的用户类型，仅用于示例
interface SimpleUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: string;
  image?: string | null;
  provider?: string | null;
  providerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
}

/**
 * 项目控制器示例
 * 演示如何在 API 路由中使用权限系统
 */
export async function getProject(req: NextRequest) {
  // 1. 获取用户信息（实际项目中通常由认证中间件提供）
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  // 2. 获取请求参数
  const url = new URL(req.url);
  const projectId = url.searchParams.get('id');
  if (!projectId) {
    return NextResponse.json({ error: '缺少项目ID' }, { status: 400 });
  }

  try {
    // 3. 获取要操作的资源
    const project = await getProjectById(projectId);
    
    // 4. 权限检查 - 检查用户是否可以读取该项目
    // 将普通用户转换为具有角色的 AppUser
    const appUser = {
      ...user,
      role: mapDatabaseRoleToAppRole(user.role || 'normal') as Role
    } as AppUser;
    
    if (!can(appUser, Action.READ, Subject.PROJECT, project)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }
    
    // 5. 通过权限检查，返回数据
    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('获取项目出错:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

/**
 * 模拟获取当前认证用户
 */
async function getAuthenticatedUser(req: NextRequest): Promise<SimpleUser | null> {
  // 实际项目中，这里通常会解析 JWT token 或会话信息
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  // 模拟从数据库获取用户
  return {
    id: 'user_123',
    name: '测试用户',
    email: 'user@example.com',
    emailVerified: true,
    role: 'normal',
    image: null,
    provider: null,
    providerId: null,
    phoneNumber: null,
    phoneNumberVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * 模拟从数据库获取项目
 */
async function getProjectById(id: string) {
  // 实际项目中，这里会从数据库获取项目信息
  return {
    id,
    name: '测试项目',
    description: '这是一个测试项目',
    ownerId: 'user_123', // 与上面用户ID匹配，表示这是该用户的项目
    createdAt: new Date(),
    updatedAt: new Date()
  };
} 