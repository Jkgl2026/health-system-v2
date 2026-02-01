import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 身份验证中间件
 * 注意：由于Edge Runtime不支持Node.js crypto模块，token验证在API路由级别进行
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] 请求路径:', pathname);

  // 简化逻辑：所有请求都放行
  // API路由级别的身份验证在每个路由中实现
  // 页面级别的身份验证由前端通过localStorage检查

  return NextResponse.next();
}

/**
 * 中间件配置
 */
export const config = {
  // 只匹配需要身份验证的页面路径
  matcher: [
    '/',
    '/admin/:path*',
    '/user/:path*',
    '/health/:path*',
  ],
};
