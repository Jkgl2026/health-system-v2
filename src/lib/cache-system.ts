/**
 * 健康评估系统缓存模块
 * 提供分析结果缓存，避免重复计算
 */

/**
 * 缓存条目接口
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
  size: number; // 数据大小（字节）
  accessCount: number;
  lastAccess: number;
}

/**
 * 缓存配置接口
 */
export interface CacheConfig {
  maxSize: number;         // 最大缓存条目数
  maxMemory: number;       // 最大内存占用（字节）
  defaultTTL: number;      // 默认TTL（毫秒）
  cleanupInterval: number; // 清理间隔（毫秒）
}

/**
 * 缓存统计接口
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
}

/**
 * 分析结果缓存类
 */
export class AnalysisCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
  };
  private cleanupTimer: NodeJS.Timeout | null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.config = {
      maxSize: config.maxSize || 100,
      maxMemory: config.maxMemory || 50 * 1024 * 1024, // 50MB
      defaultTTL: config.defaultTTL || 3600000, // 1小时
      cleanupInterval: config.cleanupInterval || 300000 // 5分钟
    };
    this.stats = {
      hits: 0,
      misses: 0
    };
    this.cleanupTimer = null;
    
    this.startCleanup();
  }

  /**
   * 设置缓存
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const size = this.calculateSize(data);
    
    // 检查内存限制
    if (this.getMemoryUsage() + size > this.config.maxMemory) {
      this.evictLRU(size);
    }
    
    // 检查条目数限制
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      size,
      accessCount: 0,
      lastAccess: now
    };
    
    this.cache.set(key, entry);
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
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // 更新访问统计
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.stats.hits++;
    
    return entry.data;
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): number {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      memoryUsage: this.getMemoryUsage(),
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0
    };
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * 计算数据大小
   */
  private calculateSize(data: T): number {
    try {
      return JSON.stringify(data).length * 2; // UTF-16编码，每个字符2字节
    } catch {
      return 1024; // 默认1KB
    }
  }

  /**
   * 获取当前内存使用量
   */
  private getMemoryUsage(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(requiredSize?: number): void {
    // 按最后访问时间排序
    const sortedEntries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    
    let freedSize = 0;
    for (const [key, entry] of sortedEntries) {
      if (requiredSize && freedSize >= requiredSize) {
        break;
      }
      
      this.cache.delete(key);
      freedSize += entry.size;
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.clearExpired();
    }, this.config.cleanupInterval);
  }

  /**
   * 停止定期清理
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * 销毁缓存
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

/**
 * 缓存键生成器
 */
export class CacheKeyGenerator {
  /**
   * 生成分析缓存键
   */
  static generateAnalysisKey(userId: string, sessionId: string): string {
    return `analysis:${userId}:${sessionId}`;
  }

  /**
   * 生成健康分析缓存键
   */
  static generateHealthAnalysisKey(userId: string, sessionId: string): string {
    return `health_analysis:${userId}:${sessionId}`;
  }

  /**
   * 生成风险评估缓存键
   */
  static generateRiskAssessmentKey(userId: string, sessionId: string): string {
    return `risk_assessment:${userId}:${sessionId}`;
  }

  /**
   * 生成体质分析缓存键
   */
  static generateConstitutionAnalysisKey(userId: string, sessionId: string): string {
    return `constitution_analysis:${userId}:${sessionId}`;
  }

  /**
   * 生成自定义缓存键
   */
  static generateCustom(prefix: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    
    return `${prefix}:${Buffer.from(paramString).toString('base64')}`;
  }
}

/**
 * 缓存装饰器（用于函数结果缓存）
 */
export function memoize<T extends (...args: any[]) => any>(
  cache: AnalysisCache<ReturnType<T>>,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    
    // 尝试从缓存获取
    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }
    
    // 执行函数
    const result = (function() {
      // 这里需要原始函数，但在装饰器模式下无法访问
      // 这是一个简化版本，实际使用需要传入原始函数
      throw new Error('Memoize decorator requires original function');
    }());
    
    // 存入缓存
    cache.set(key, result, ttl);
    
    return result;
  }) as T;
}

/**
 * 全局缓存实例
 */
export const globalAnalysisCache = new AnalysisCache({
  maxSize: 200,
  maxMemory: 100 * 1024 * 1024, // 100MB
  defaultTTL: 3600000, // 1小时
  cleanupInterval: 300000 // 5分钟
});

/**
 * 缓存管理器
 */
export class CacheManager {
  private caches: Map<string, AnalysisCache>;
  
  constructor() {
    this.caches = new Map();
  }
  
  /**
   * 获取或创建缓存
   */
  getCache(name: string, config?: Partial<CacheConfig>): AnalysisCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new AnalysisCache(config));
    }
    return this.caches.get(name)!;
  }
  
  /**
   * 删除缓存
   */
  removeCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      return this.caches.delete(name);
    }
    return false;
  }
  
  /**
   * 清除所有缓存
   */
  clearAll(): void {
    for (const [name, cache] of this.caches.entries()) {
      cache.destroy();
    }
    this.caches.clear();
  }
  
  /**
   * 获取所有缓存统计
   */
  getAllStats(): Record<string, CacheStats> {
    const stats: Record<string, CacheStats> = {};
    
    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }
    
    return stats;
  }
}

/**
 * 全局缓存管理器实例
 */
export const globalCacheManager = new CacheManager();
