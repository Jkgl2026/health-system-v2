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
  // 匹配所有路径（除了静态资源和 API 健康检查）
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static（静态文件）
     * - _next/image（图片优化）
     * - favicon.ico（网站图标）
     * - public 文件夹下的静态资源（icons, images 等）
     * - API 健康检查路径
     * - 静态文件扩展名
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icons|images|api/health|api/init-db|api/init-admin|.*\\.(svg|png|jpg|jpeg|gif|webp|ico|json|woff|woff2|ttf|css|js)$).*)',
  ],
};
