/**
 * Next.js全局中间件
 * 
 * 功能：
 * - 拦截/admin/*页面，未登录跳转到登录页
 * - 已登录用户访问/login自动跳转到/admin/dashboard
 * - 保护所有后台管理页面
 * 
 * 工作原理：
 * - 检查Cookie中的admin_token
 * - 根据路径和登录状态决定是否允许访问
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 中间件配置
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

/**
 * 中间件主函数
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查Cookie中的Token
  const token = request.cookies.get('admin_token');
  
  // 登录页面：如果已登录，跳转到后台首页
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // 其他/admin/*页面：如果未登录，跳转到登录页
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // 允许访问
  return NextResponse.next();
}
