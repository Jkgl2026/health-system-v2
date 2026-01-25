/**
 * 速率限制配置接口
 */
export interface RateLimitConfig {
  windowMs: number;      // 时间窗口（毫秒）
  maxRequests: number;   // 最大请求数
  skipSuccessfulRequests?: boolean;  // 是否跳过成功请求
  skipFailedRequests?: boolean;      // 是否跳过失败请求
  message?: string;      // 限制时的提示消息
}

/**
 * 速率限制结果接口
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  message?: string;
}

/**
 * 请求记录接口
 */
interface RequestRecord {
  count: number;
  resetTime: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 100,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  message: '请求过于频繁，请稍后再试',
};

/**
 * 预设配置
 */
export const RateLimitPresets = {
  // 严格：用于登录API
  strict: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    maxRequests: 5,            // 最多5次
    message: '登录尝试次数过多，请15分钟后再试',
  },
  // 中等：用于敏感操作
  moderate: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    maxRequests: 30,           // 最多30次
    message: '请求过于频繁，请稍后再试',
  },
  // 宽松：用于普通API
  lenient: {
    windowMs: 15 * 60 * 1000,  // 15分钟
    maxRequests: 100,          // 最多100次
    message: '请求过于频繁，请稍后再试',
  },
  // 宽容：用于健康检查等公共API
  permissive: {
    windowMs: 60 * 60 * 1000,  // 1小时
    maxRequests: 1000,         // 最多1000次
    message: '请求过于频繁，请稍后再试',
  },
};

/**
 * 速率限制器类
 */
export class RateLimiter {
  private store: Map<string, RequestRecord>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = new Map();
    
    // 定期清理过期记录
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 每分钟清理一次
  }

  private cleanupInterval: NodeJS.Timeout;

  /**
   * 生成唯一标识
   */
  private getIdentifier(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.store.entries()) {
      if (record.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 检查速率限制
   */
  check(identifier: string): RateLimitResult {
    const key = this.getIdentifier(identifier);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    // 获取或创建记录
    let record = this.store.get(key);

    if (!record || record.resetTime < now) {
      // 创建新记录
      record = {
        count: 0,
        resetTime,
      };
      this.store.set(key, record);
    }

    // 增加计数
    record.count++;

    // 检查是否超过限制
    const isExceeded = record.count > this.config.maxRequests;

    return {
      success: !isExceeded,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: new Date(record.resetTime),
      message: isExceeded ? this.config.message : undefined,
    };
  }

  /**
   * 检查速率限制（跳过成功请求）
   */
  checkSkipSuccessful(identifier: string, isSuccess: boolean): RateLimitResult {
    if (this.config.skipSuccessfulRequests && isSuccess) {
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: new Date(Date.now() + this.config.windowMs),
      };
    }

    return this.check(identifier);
  }

  /**
   * 重置限制
   */
  reset(identifier: string): void {
    const key = this.getIdentifier(identifier);
    this.store.delete(key);
  }

  /**
   * 获取当前状态
   */
  getStatus(identifier: string): RateLimitResult {
    const key = this.getIdentifier(identifier);
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.resetTime < now) {
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: new Date(now + this.config.windowMs),
      };
    }

    return {
      success: record.count <= this.config.maxRequests,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: new Date(record.resetTime),
    };
  }

  /**
   * 获取统计信息
   */
  getStats(): { totalIdentifiers: number; activeIdentifiers: number } {
    const now = Date.now();
    let activeCount = 0;

    for (const record of this.store.values()) {
      if (record.resetTime > now) {
        activeCount++;
      }
    }

    return {
      totalIdentifiers: this.store.size,
      activeIdentifiers: activeCount,
    };
  }

  /**
   * 销毁限制器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

/**
 * 创建速率限制器工厂函数
 */
export function createRateLimiter(
  config?: RateLimitConfig | keyof typeof RateLimitPresets
): RateLimiter {
  if (typeof config === 'string') {
    return new RateLimiter(RateLimitPresets[config]);
  }
  return new RateLimiter(config);
}

/**
 * 单例速率限制器实例
 */
const rateLimiters = new Map<string, RateLimiter>();

/**
 * 获取或创建速率限制器
 */
export function getRateLimiter(
  key: string,
  config?: RateLimitConfig | keyof typeof RateLimitPresets
): RateLimiter {
  let limiter = rateLimiters.get(key);

  if (!limiter) {
    limiter = createRateLimiter(config);
    rateLimiters.set(key, limiter);
  }

  return limiter;
}

/**
 * 清理所有速率限制器
 */
export function clearAllRateLimiters(): void {
  for (const limiter of rateLimiters.values()) {
    limiter.destroy();
  }
  rateLimiters.clear();
}

/**
 * 辅助函数：从NextRequest中获取标识符
 */
export function getIdentifierFromRequest(request: Request): string {
  // 优先使用IP地址
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  const ip = forwarded?.split(',')[0].trim() || 
             realIp || 
             'unknown';

  // 如果有用户信息，可以加上用户ID
  // const userId = request.headers.get('x-user-id');
  // if (userId) {
  //   return `${userId}:${ip}`;
  // }

  return ip;
}

export { RateLimiter, RateLimitConfig, RateLimitResult };
export default RateLimiter;
