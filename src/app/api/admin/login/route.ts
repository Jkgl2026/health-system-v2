import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { SessionManager } from '@/lib/session-manager';
import { getRateLimiter, getIdentifierFromRequest } from '@/lib/rate-limit';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { getDb } from 'coze-coding-dev-sdk';
import { auditLogs } from '@/storage/database/shared/schema';

// 创建速率限制器（严格模式：15分钟内最多5次登录尝试）
const loginRateLimiter = getRateLimiter('admin-login', 'strict');

// 记录登录日志
async function recordLoginLog(
  adminId: string,
  username: string,
  ip: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
) {
  try {
    const db = await getDb();
    await db.insert(auditLogs).values({
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      tableName: 'admins',
      recordId: adminId,
      operatorId: adminId,
      operatorName: username,
      operatorType: 'ADMIN',
      oldData: null,
      newData: {
        ip,
        userAgent,
        success,
        failureReason: failureReason || null,
        loginTime: new Date().toISOString(),
      },
      ip,
      userAgent,
      description: success 
        ? `管理员 ${username} 登录成功` 
        : `管理员 ${username} 登录失败: ${failureReason}`,
    });
  } catch (error) {
    console.error('[LoginLog] 记录登录日志失败:', error);
  }
}

// POST /api/admin/login - 管理员登录
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, loginRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();
    const { username, password, isAutoLogin } = data;

    // 获取客户端信息
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const admin = await healthDataManager.verifyAdmin(username, password);

    if (!admin) {
      // 记录登录失败日志
      await recordLoginLog('unknown', username, ip, userAgent, false, '用户名或密码错误');
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成token对
    const tokenResponse = SessionManager.createTokenPair(
      admin.id,
      admin.username,
      ip,
      userAgent
    );

    // 记录登录成功日志
    await recordLoginLog(admin.id, admin.username, ip, userAgent, true);

    // 创建响应并设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      token: tokenResponse,
      admin: tokenResponse.admin,
      isAutoLogin: isAutoLogin || false,
    });

    // 设置认证cookie
    SessionManager.setAuthCookies(response, tokenResponse);

    console.log('[AdminLogin] 登录成功:', admin.username, 'IP:', ip, '自动登录:', isAutoLogin || false);

    return response;
  } catch (error) {
    console.error('[AdminLogin] 登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
