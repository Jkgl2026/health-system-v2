import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

/**
 * 验证管理员登录状态
 * 
 * 检查 Cookie 中的认证信息是否有效
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 中获取访问 token
    const accessToken = await SessionManager.getAccessToken();

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: '未登录',
      }, { status: 401 });
    }

    // 验证 token
    const session = SessionManager.verifyAccessToken(accessToken);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: '登录已过期，请重新登录',
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: session.adminId,
        username: session.username,
      },
    });
  } catch (error) {
    console.error('验证认证失败:', error);
    return NextResponse.json({
      success: false,
      error: '认证验证失败',
    }, { status: 500 });
  }
}
