import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';

// POST /api/admin/logout - 管理员登出
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除认证cookie
    SessionManager.clearAuthCookies(response);

    console.log('[AdminLogout] 登出成功');

    return response;
  } catch (error) {
    console.error('[AdminLogout] 登出失败:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
