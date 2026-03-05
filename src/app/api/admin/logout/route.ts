import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';
import { getDb } from 'coze-coding-dev-sdk';
import { auditLogs } from '@/storage/database/shared/schema';

/**
 * 管理员登出
 * 
 * 清除认证 Cookie 并记录登出日志
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前登录的管理员信息
    const accessToken = await SessionManager.getAccessToken();
    const session = accessToken ? SessionManager.verifyAccessToken(accessToken) : null;

    if (session) {
      // 记录登出日志
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      try {
        const db = await getDb();
        await db.insert(auditLogs).values({
          action: 'LOGOUT',
          tableName: 'admins',
          recordId: session.adminId,
          operatorId: session.adminId,
          operatorName: session.username,
          operatorType: 'ADMIN',
          oldData: null,
          newData: {
            ip,
            userAgent,
            logoutTime: new Date().toISOString(),
          },
          ip,
          userAgent,
          description: `管理员 ${session.username} 登出成功`,
        });
      } catch (logError) {
        console.error('[LogoutLog] 记录登出日志失败:', logError);
      }
    }

    // 创建响应并清除认证 Cookie
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    SessionManager.clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('[Logout] 登出失败:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
