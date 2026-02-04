import { NextRequest, NextResponse } from 'next/server';

/**
 * 重置管理员登录速率限制
 * POST /api/admin/reset-rate-limit
 *
 * 注意：此接口仅用于开发和调试，生产环境应移除或添加严格的认证
 */
export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json() || {};

    if (!identifier) {
      // 获取请求的IP地址
      const ip = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';

      // 动态导入速率限制器
      const { getRateLimiter, getIdentifierFromRequest } = await import('@/lib/rate-limit');
      const rateLimiter = getRateLimiter('admin-login', 'strict');
      const requestIdentifier = getIdentifierFromRequest(request);

      // 重置限制
      rateLimiter.reset(requestIdentifier);

      return NextResponse.json({
        success: true,
        message: '速率限制已重置',
        identifier: requestIdentifier,
      });
    } else {
      // 重置指定标识符的限制
      const { getRateLimiter } = await import('@/lib/rate-limit');
      const rateLimiter = getRateLimiter('admin-login', 'strict');
      rateLimiter.reset(identifier);

      return NextResponse.json({
        success: true,
        message: '速率限制已重置',
        identifier,
      });
    }
  } catch (error) {
    console.error('[ResetRateLimit] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '重置失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

/**
 * 获取当前速率限制状态
 * GET /api/admin/reset-rate-limit
 */
export async function GET(request: NextRequest) {
  try {
    // 动态导入速率限制器
    const { getRateLimiter, getIdentifierFromRequest } = await import('@/lib/rate-limit');
    const rateLimiter = getRateLimiter('admin-login', 'strict');
    const identifier = getIdentifierFromRequest(request);

    // 获取状态
    const status = rateLimiter.getStatus(identifier);

    return NextResponse.json({
      success: true,
      status: {
        limit: status.limit,
        remaining: status.remaining,
        resetTime: status.resetTime,
        isLimited: !status.success,
      },
      identifier,
    });
  } catch (error) {
    console.error('[GetRateLimitStatus] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取状态失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
