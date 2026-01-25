import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

/**
 * 需要身份验证的路径列表
 */
const PROTECTED_PATHS = [
  '/api/admin',
  '/admin',
];

/**
 * 不需要身份验证的路径（排除项）
 */
const PUBLIC_PATHS = [
  '/api/admin/login',
  '/api/admin/health',
  '/api/admin/init-admin',
  '/admin/login',
];

/**
 * 检查路径是否为公开路径
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(publicPath => pathname.startsWith(publicPath));
}

/**
 * 检查路径是否为受保护路径
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(protectedPath => pathname.startsWith(protectedPath));
}

/**
 * 身份验证中间件
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] 请求路径:', pathname);

  // 如果是公开路径，直接放行
  if (isPublicPath(pathname)) {
    console.log('[Middleware] 公开路径，放行');
    return NextResponse.next();
  }

  // 如果不是受保护路径，放行
  if (!isProtectedPath(pathname)) {
    console.log('[Middleware] 非受保护路径，放行');
    return NextResponse.next();
  }

  // 受保护路径，需要验证身份
  console.log('[Middleware] 受保护路径，需要验证身份');

  // 检查访问token
  const session = await SessionManager.validateSession();

  if (!session) {
    console.log('[Middleware] 未登录，重定向到登录页');

    // 如果是API请求，返回401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '未授权，请先登录', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 如果是页面请求，重定向到登录页
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log('[Middleware] 已登录，用户:', session.username);

  // 检查token是否即将过期，如果是，添加刷新token的提示
  const isExpiringSoon = await SessionManager.isTokenExpiringSoon();
  
  if (isExpiringSoon) {
    console.log('[Middleware] Token即将过期，提示刷新');
    
    const response = NextResponse.next();
    response.headers.set('X-Token-Expiring-Soon', 'true');
    return response;
  }

  // 验证通过，放行
  return NextResponse.next();
}

/**
 * 中间件配置
 */
export const config = {
  // 匹配所有路径（除了静态资源）
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static（静态文件）
     * - _next/image（图片优化）
     * - favicon.ico（网站图标）
     * - public文件夹
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
