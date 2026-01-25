import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, getIdentifierFromRequest } from './rate-limit';

/**
 * 速率限制选项
 */
export interface RateLimitOptions {
  limiter: RateLimiter;
  keyGenerator?: (request: Request) => string;
  onSuccess?: (request: NextRequest, response: NextResponse) => NextResponse;
  onLimitReached?: (request: NextRequest) => NextResponse;
}

/**
 * 创建速率限制中间件
 */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  const {
    limiter,
    keyGenerator = getIdentifierFromRequest,
    onSuccess,
    onLimitReached,
  } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    // 生成唯一标识符
    const identifier = keyGenerator(request);

    // 检查速率限制
    const result = limiter.check(identifier);

    // 添加速率限制头
    const headers = new Headers({
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.getTime().toString(),
    });

    // 如果超过限制，返回429错误
    if (!result.success) {
      console.log('[RateLimit] 请求超过限制:', identifier, result);
      
      if (onLimitReached) {
        return onLimitReached(request);
      }

      return NextResponse.json(
        {
          error: result.message || '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: Object.fromEntries(headers.entries()),
        }
      );
    }

    // 如果没有超过限制，继续处理请求
    // 注意：这个函数需要在API路由中手动调用，而不是作为中间件
    // 由于Next.js的限制，我们返回success标志
    return { success: true, headers };

    // 添加速率限制头到响应
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.getTime().toString());

    if (onSuccess) {
      return onSuccess(request, response);
    }

    return response;
  };
}

/**
 * 应用速率限制到API路由
 */
export function applyRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): { success: boolean; response?: NextResponse } {
  const id = identifier || getIdentifierFromRequest(request);
  const result = limiter.check(id);

  if (!result.success) {
    const response = NextResponse.json(
      {
        error: result.message || '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil((result.resetTime.getTime() - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.getTime().toString(),
          'Retry-After': Math.ceil((result.resetTime.getTime() - Date.now()) / 1000).toString(),
        },
      }
    );

    return { success: false, response };
  }

  return { success: true };
}
