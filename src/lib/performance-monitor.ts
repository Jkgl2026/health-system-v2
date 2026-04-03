/**
 * 性能监控系统
 * 用于监控API响应时间、内存使用、缓存命中率等
 */

// 性能指标
export interface PerformanceMetrics {
  apiResponseTime: {
    [endpoint: string]: {
      avgTime: number;
      minTime: number;
      maxTime: number;
      totalCount: number;
      lastUpdated: Date;
    };
  };
  cacheMetrics: {
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
  };
  memoryMetrics: {
    used: number;
    total: number;
    percentage: number;
  };
  errorMetrics: {
    [errorType: string]: {
      count: number;
      lastOccurred: Date;
    };
  };
}

// 性能监控器类
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private enabled: boolean;
  private responseTimeHistory: Map<string, number[]> = new Map();

  constructor() {
    this.metrics = {
      apiResponseTime: {},
      cacheMetrics: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0
      },
      memoryMetrics: {
        used: 0,
        total: 0,
        percentage: 0
      },
      errorMetrics: {}
    };
    this.enabled = true;
  }

  /**
   * 记录API响应时间
   */
  recordApiResponse(endpoint: string, duration: number): void {
    if (!this.enabled) return;

    if (!this.metrics.apiResponseTime[endpoint]) {
      this.metrics.apiResponseTime[endpoint] = {
        avgTime: duration,
        minTime: duration,
        maxTime: duration,
        totalCount: 1,
        lastUpdated: new Date()
      };
      this.responseTimeHistory.set(endpoint, [duration]);
    } else {
      const history = this.responseTimeHistory.get(endpoint) || [];
      history.push(duration);
      
      // 保持最近100个记录
      if (history.length > 100) {
        history.shift();
      }
      
      this.responseTimeHistory.set(endpoint, history);

      const metrics = this.metrics.apiResponseTime[endpoint];
      metrics.totalCount++;
      metrics.minTime = Math.min(metrics.minTime, duration);
      metrics.maxTime = Math.max(metrics.maxTime, duration);
      metrics.avgTime = history.reduce((a, b) => a + b, 0) / history.length;
      metrics.lastUpdated = new Date();
    }
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(): void {
    if (!this.enabled) return;
    
    this.metrics.cacheMetrics.hits++;
    this.metrics.cacheMetrics.totalRequests++;
    this.updateCacheHitRate();
  }

  /**
   * 记录缓存未命中
   */
  recordCacheMiss(): void {
    if (!this.enabled) return;
    
    this.metrics.cacheMetrics.misses++;
    this.metrics.cacheMetrics.totalRequests++;
    this.updateCacheHitRate();
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(): void {
    const { hits, totalRequests } = this.metrics.cacheMetrics;
    this.metrics.cacheMetrics.hitRate = totalRequests > 0 
      ? (hits / totalRequests) * 100 
      : 0;
  }

  /**
   * 记录内存使用
   */
  recordMemoryUsage(): void {
    if (!this.enabled) return;

    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.metrics.memoryMetrics.used = usage.heapUsed / 1024 / 1024; // MB
      this.metrics.memoryMetrics.total = usage.heapTotal / 1024 / 1024; // MB
      this.metrics.memoryMetrics.percentage = 
        (usage.heapUsed / usage.heapTotal) * 100;
    }
  }

  /**
   * 记录错误
   */
  recordError(errorType: string): void {
    if (!this.enabled) return;

    if (!this.metrics.errorMetrics[errorType]) {
      this.metrics.errorMetrics[errorType] = {
        count: 1,
        lastOccurred: new Date()
      };
    } else {
      this.metrics.errorMetrics[errorType].count++;
      this.metrics.errorMetrics[errorType].lastOccurred = new Date();
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetrics {
    this.recordMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * 获取API响应时间指标
   */
  getApiResponseTimeMetrics(endpoint?: string): any {
    if (endpoint) {
      return this.metrics.apiResponseTime[endpoint] || null;
    }
    return this.metrics.apiResponseTime;
  }

  /**
   * 获取缓存指标
   */
  getCacheMetrics(): PerformanceMetrics['cacheMetrics'] {
    return { ...this.metrics.cacheMetrics };
  }

  /**
   * 获取错误指标
   */
  getErrorMetrics(): PerformanceMetrics['errorMetrics'] {
    return { ...this.metrics.errorMetrics };
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push('=== 性能监控报告 ===\n');
    
    // API响应时间
    report.push('API响应时间:');
    Object.entries(this.metrics.apiResponseTime).forEach(([endpoint, metrics]) => {
      report.push(`  ${endpoint}:`);
      report.push(`    平均时间: ${metrics.avgTime.toFixed(2)}ms`);
      report.push(`    最短时间: ${metrics.minTime.toFixed(2)}ms`);
      report.push(`    最长时间: ${metrics.maxTime.toFixed(2)}ms`);
      report.push(`    总请求数: ${metrics.totalCount}`);
    });
    
    // 缓存指标
    report.push('\n缓存指标:');
    report.push(`  命中率: ${this.metrics.cacheMetrics.hitRate.toFixed(2)}%`);
    report.push(`  命中次数: ${this.metrics.cacheMetrics.hits}`);
    report.push(`  未命中次数: ${this.metrics.cacheMetrics.misses}`);
    report.push(`  总请求数: ${this.metrics.cacheMetrics.totalRequests}`);
    
    // 内存指标
    report.push('\n内存指标:');
    report.push(`  已使用: ${this.metrics.memoryMetrics.used.toFixed(2)}MB`);
    report.push(`  总分配: ${this.metrics.memoryMetrics.total.toFixed(2)}MB`);
    report.push(`  使用率: ${this.metrics.memoryMetrics.percentage.toFixed(2)}%`);
    
    // 错误指标
    if (Object.keys(this.metrics.errorMetrics).length > 0) {
      report.push('\n错误统计:');
      Object.entries(this.metrics.errorMetrics).forEach(([errorType, metrics]) => {
        report.push(`  ${errorType}: ${metrics.count}次`);
      });
    }
    
    return report.join('\n');
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {
      apiResponseTime: {},
      cacheMetrics: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0
      },
      memoryMetrics: {
        used: 0,
        total: 0,
        percentage: 0
      },
      errorMetrics: {}
    };
    this.responseTimeHistory.clear();
  }

  /**
   * 启用监控
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * 禁用监控
   */
  disable(): void {
    this.enabled = false;
  }
}

// 全局监控实例
export const globalMonitor = new PerformanceMonitor();

/**
 * 性能监控装饰器（用于API路由）
 */
export function withPerformanceMonitoring(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function (...args: any[]) {
    const endpoint = propertyKey;
    const startTime = Date.now();
    
    try {
      const result = await originalMethod.apply(this, args);
      
      const duration = Date.now() - startTime;
      globalMonitor.recordApiResponse(endpoint, duration);
      
      return result;
    } catch (error) {
      globalMonitor.recordError(endpoint);
      throw error;
    }
  };
  
  return descriptor;
}
