import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from './session-manager';

/**
 * API路由的身份验证结果
 */
export interface AuthResult {
  success: boolean;
  session?: Awaited<ReturnType<typeof SessionManager.verifyAccessToken>>;
  error?: string;
}

/**
 * 验证API请求的身份
 * 在API路由中使用此函数进行身份验证
 */
export async function verifyApiAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // 从cookie中获取访问token
    const accessToken = request.cookies.get('admin_access_token')?.value;

    if (!accessToken) {
      return {
        success: false,
        error: '未找到访问token',
      };
    }

    // 验证token
    const session = SessionManager.verifyAccessToken(accessToken);

    if (!session) {
      return {
        success: false,
        error: '无效的访问token',
      };
    }

    return {
      success: true,
      session,
    };
  } catch (error) {
    console.error('[verifyApiAuth] 验证失败:', error);
    return {
      success: false,
      error: '身份验证失败',
    };
  }
}

/**
 * 返回未授权响应
 */
export function unauthorizedResponse(message: string = '未授权，请先登录'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

/**
 * API路由的身份验证装饰器
 * 使用示例：
 * export async function GET(request: NextRequest) {
 *   const auth = await withAuth(request);
 *   if (!auth.success) return unauthorizedResponse(auth.error);
 *   // 继续处理...
 * }
 */
export async function withAuth(request: NextRequest): Promise<AuthResult> {
  return verifyApiAuth(request);
}
