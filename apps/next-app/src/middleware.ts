import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@libs/auth';

export function middleware(request: NextRequest) {
  // // 检查是否是管理员路由
  // if (request.nextUrl.pathname.startsWith('/admin')) {
  //   // 在实际应用中，你应该从请求头、cookie 或 JWT token 中获取用户角色
  //   // 这里仅作示例
  //   const userRole = request.cookies.get('userRole')?.value;
    
  //   if (userRole !== 'admin') {
  //     // 如果不是管理员，重定向到首页
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }
  // }

  // return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: '/admin/:path*',
};