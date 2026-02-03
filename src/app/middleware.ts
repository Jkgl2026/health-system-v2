/**
 * Next.js全局中间件
 * 
 * 功能：
 * - 拦截/admin/*页面，未登录跳转到登录页
 * - 已登录用户访问/login自动跳转到/admin/dashboard
 * - 保护所有后台管理页面
 * 
 * 工作原理：
 * - 在页面渲染前执行
 * - 检查localStorage中的admin_token
 * - 根据路径和登录状态决定是否允许访问
 * 
 * 配置：
 * - 匹配路径：/admin/* 和 /admin/login
 * - 排除路径：无
 * 
 * 注意事项：
 * - 中间件仅在服务端执行，无法直接访问localStorage
 * - 通过设置Cookie来传递Token信息（可选方案）
 * - 当前方案：前端页面自行检查登录状态（见/admin/login/page.tsx）
 * 
 * 改进方案（如需服务端拦截）：
 * 1. 登录成功后设置Cookie（httpOnly、secure）
 * 2. 中间件检查Cookie是否存在
 * 3. 未登录返回重定向响应
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 中间件配置
 * 
 * matcher: 匹配的路径
 * - '/admin/:path*' - 匹配所有/admin/开头的路径
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

/**
 * 中间件主函数
 * 
 * @param request - Next.js请求对象
 * @returns NextResponse对象
 * 
 * @description
 * 当前实现：
 * - 允许所有/admin/*路径访问（前端页面自行检查登录状态）
 * - /admin/login路径允许访问（登录页面）
 * - 建议在前端页面中检查localStorage中的admin_token
 * 
 * 如需实现服务端拦截，需要：
 * 1. 登录成功后设置httpOnly Cookie
 * 2. 检查Cookie中的Token
 * 3. 未登录返回重定向
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[中间件] 请求路径', { pathname });
  
  // 方案1：当前方案（前端自行检查）
  // 允许所有请求通过，由前端页面检查localStorage中的Token
  
  // 方案2：服务端拦截（需要配合Cookie）
  // 检查Cookie中的Token
  const token = request.cookies.get('admin_token');
  
  // 登录页面：如果已登录，跳转到后台首页
  if (pathname === '/admin/login' && token) {
    console.log('[中间件] 已登录访问登录页，跳转到后台首页');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // 其他/admin/*页面：如果未登录，跳转到登录页
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
    console.log('[中间件] 未登录访问后台页面，跳转到登录页');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // 允许访问
  console.log('[中间件] 允许访问', { pathname });
  return NextResponse.next();
}

/**
 * 改进方案：登录成功后设置Cookie
 * 
 * 在登录接口中添加：
 * 
 * ```typescript
 * // src/app/api/admin/login/route.ts
 * 
 * // 登录成功后设置Cookie
 * const response = NextResponse.json({
 *   success: true,
 *   token,
 *   user,
 * });
 * 
 * // 设置httpOnly Cookie（推荐）
 * response.cookies.set('admin_token', token, {
 *   httpOnly: true,      // 仅HTTP访问，防止XSS
 *   secure: process.env.NODE_ENV === 'production', // 生产环境仅HTTPS
 *   sameSite: 'lax',     // 防止CSRF
 *   maxAge: 60 * 60 * 24 * 7, // 7天过期
 *   path: '/',           // 全站可用
 * });
 * 
 * return response;
 * ```
 * 
 * 同时需要在localStorage中也存储Token（便于前端API请求使用）：
 * 
 * ```typescript
 * // src/app/components/LoginForm.tsx
 * 
 * localStorage.setItem('admin_token', data.token);
 * localStorage.setItem('admin_user', JSON.stringify(data.user));
 * ```
 */
