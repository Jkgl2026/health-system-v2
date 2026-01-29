import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { SessionManager } from '@/lib/session-manager';
import { getRateLimiter, getIdentifierFromRequest } from '@/lib/rate-limit';
import { applyRateLimit } from '@/lib/rate-limit-middleware';

// 创建速率限制器（严格模式：15分钟内最多5次登录尝试）
const loginRateLimiter = getRateLimiter('admin-login', 'strict');

// POST /api/admin/login - 管理员登录
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, loginRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const admin = await healthDataManager.verifyAdmin(username, password);

    if (!admin) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 获取客户端信息
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 生成token对
    const tokenResponse = SessionManager.createTokenPair(
      admin.id,
      admin.username,
      ip,
      userAgent
    );

    // 创建响应并设置cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      token: tokenResponse,
      admin: tokenResponse.admin,
    });

    // 设置认证cookie
    await SessionManager.setAuthCookies(response, tokenResponse);

    console.log('[AdminLogin] 登录成功:', admin.username, 'IP:', ip);

    return response;
  } catch (error) {
    console.error('[AdminLogin] 登录失败:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
