import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

// POST /api/admin/refresh - 刷新访问token
export async function POST(request: NextRequest) {
  try {
    // 刷新token
    const tokenResponse = await SessionManager.refreshToken();

    if (!tokenResponse) {
      return NextResponse.json(
        { 
          success: false, 
          message: '刷新token失败，请重新登录',
          code: 'REFRESH_FAILED'
        },
        { status: 401 }
      );
    }

    // 创建响应并设置新的cookie
    const response = NextResponse.json({
      success: true,
      message: 'Token刷新成功',
      token: tokenResponse,
    });

    // 更新认证cookie
    await SessionManager.setAuthCookies(response, tokenResponse);

    console.log('[AdminRefresh] Token刷新成功');

    return response;
  } catch (error) {
    console.error('[AdminRefresh] 刷新token失败:', error);
    return NextResponse.json(
      { error: '刷新失败，请稍后重试' },
      { status: 500 }
    );
  }
}
