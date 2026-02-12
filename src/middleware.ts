import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要验证登录的路由
const protectedRoutes = ['/admin'];

// 公开路由（不需要登录）
const publicRoutes = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // 获取token（使用admin_access_token）
  const token = request.cookies.get('admin_access_token')?.value;

  // 如果是受保护的路由且没有token，重定向到登录页
  if (isProtectedRoute && !isPublicRoute && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已经登录且访问登录页，重定向到首页
  if (isPublicRoute && token) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// 配置匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，除了静态文件、API路由、_next等
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
