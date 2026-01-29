/**
 * 高性能内存缓存工具
 * 用于缓存 API 响应，实现毫秒级响应
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // 缓存生存时间（毫秒）
  maxSize?: number; // 最大缓存条目数
  maxSizeBytes?: number; // 最大缓存大小（字节）
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  sizeBytes: number;
  hitRate: number;
}

const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 1000,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
};

/**
 * 高性能缓存类
 */
export class HighPerformanceCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private options: CacheOptions;
  private stats: { hits: number; misses: number };
  private cleanupInterval: NodeJS.Timeout;

  constructor(options?: CacheOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };

    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // 每分钟清理一次
  }

  /**
   * 获取缓存
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // 更新命中次数
    entry.hits++;
    this.stats.hits++;

    return entry.data;
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const size = this.estimateSize(data);
    const expiresAt = now + (ttl || this.options.ttl!);

    // 检查缓存大小限制
    this.ensureCapacity(size);

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      hits: 0,
      expiresAt,
    };

    this.cache.set(key, entry);
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const size = this.cache.size;
    const sizeBytes = this.getTotalSize();
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size,
      sizeBytes,
      hitRate,
    };
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache] 清理了 ${cleaned} 个过期缓存条目`);
    }
  }

  /**
   * 确保缓存容量
   */
  private ensureCapacity(newItemSize: number): void {
    const currentSize = this.getTotalSize();
    const maxSize = this.options.maxSizeBytes!;

    // 如果新增后超过限制，清理最少使用的条目
    if (currentSize + newItemSize > maxSize) {
      this.evictLeastUsed();
    }

    // 如果条目数超过限制，清理最早的条目
    if (this.cache.size >= this.options.maxSize!) {
      this.evictOldest();
    }
  }

  /**
   * 清理最少使用的缓存条目
   */
  private evictLeastUsed(): void {
    let minHits = Infinity;
    let keyToEvict: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < minHits) {
        minHits = entry.hits;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * 清理最早的缓存条目
   */
  private evictOldest(): void {
    let minTimestamp = Infinity;
    let keyToEvict: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < minTimestamp) {
        minTimestamp = entry.timestamp;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * 估算数据大小
   */
  private estimateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return 1024; // 默认估算 1KB
    }
  }

  /**
   * 获取总缓存大小
   */
  private getTotalSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += this.estimateSize(entry.data);
    }
    return total;
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

/**
 * 全局缓存实例
 */
export const globalCache = new HighPerformanceCache({
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 1000,
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
});

/**
 * 缓存装饰器 - 用于装饰 API 路由函数
 */
export function withCache<T>(
  keyGenerator: (args: any[]) => string,
  options?: CacheOptions
) {
  const cache = new HighPerformanceCache<T>(options);

  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]): Promise<T> {
      const key = keyGenerator(args);

      // 尝试从缓存获取
      const cached = cache.get(key);
      if (cached !== null) {
        console.log(`[Cache] 缓存命中: ${key}`);
        return cached;
      }

      // 缓存未命中，执行原方法
      console.log(`[Cache] 缓存未命中: ${key}`);
      const result = await originalMethod.apply(this, args);

      // 存入缓存
      cache.set(key, result);

      return result;
    };

    return descriptor;
  };
}

/**
 * 生成缓存键
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const keyValuePairs = sortedKeys.map(key => `${key}:${JSON.stringify(params[key])}`);
  return `${prefix}:${keyValuePairs.join(':')}`;
}

/**
 * 清除特定前缀的缓存
 */
export function clearCacheByPrefix(prefix: string): void {
  const cache = globalCache;
  // 由于 Map 没有 clearByPrefix 方法，我们需要遍历删除
  for (const key of cache['cache'].keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export default HighPerformanceCache;
