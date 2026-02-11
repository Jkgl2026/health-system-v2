/**
 * 前端性能监控和优化工具
 */

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  // 加载性能
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTI: number; // Time to Interactive
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift

  // 自定义指标
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;

  // 资源加载
  jsLoadTime: number;
  cssLoadTime: number;
  imageLoadTime: number;
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private readonly STORAGE_KEY = 'performance_metrics';

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    this.init();
  }

  /**
   * 初始化监控
   */
  private init(): void {
    // 监听 Web Vitals
    this.observeWebVitals();

    // 监听资源加载
    this.observeResourceTiming();

    // 记录页面加载时间
    this.recordPageLoadTime();

    // 恢复历史指标
    this.loadHistoricalMetrics();
  }

  /**
   * 观察 Web Vitals
   */
  private observeWebVitals(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    // FCP (First Contentful Paint)
    this.observe('paint', (entries) => {
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        this.metrics.FCP = fcp.startTime;
      }
    });

    // LCP (Largest Contentful Paint)
    this.observe('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      if (lcp) {
        this.metrics.LCP = lcp.startTime;
      }
    });

    // FID (First Input Delay)
    this.observe('first-input', (entries) => {
      if (entries.length > 0) {
        const fid = entries[0];
        this.metrics.FID = fid.processingStart - fid.startTime;
      }
    });

    // CLS (Cumulative Layout Shift)
    this.observe('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.CLS = clsValue;
    });
  }

  /**
   * 通用观察方法
   */
  private observe(type: string, callback: (entries: any[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn('[PerformanceMonitor] 观察失败:', type, error);
    }
  }

  /**
   * 观察资源加载时间
   */
  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    this.observe('resource', (entries) => {
      entries.forEach((entry: any) => {
        if (entry.initiatorType === 'script') {
          this.metrics.jsLoadTime = entry.duration;
        } else if (entry.initiatorType === 'link' && entry.name.endsWith('.css')) {
          this.metrics.cssLoadTime = entry.duration;
        } else if (entry.initiatorType === 'img') {
          this.metrics.imageLoadTime = entry.duration;
        }
      });
    });
  }

  /**
   * 记录页面加载时间
   */
  private recordPageLoadTime(): void {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      this.metrics.pageLoadTime = pageLoadTime;

      // 保存指标
      this.saveMetrics();
    });
  }

  /**
   * 记录 API 响应时间
   */
  recordAPIResponseTime(url: string, duration: number): void {
    this.metrics.apiResponseTime = duration;
    console.log(`[PerformanceMonitor] API 响应时间: ${url} - ${duration.toFixed(2)}ms`);
  }

  /**
   * 记录渲染时间
   */
  recordRenderTime(componentName: string, duration: number): void {
    this.metrics.renderTime = duration;
    console.log(`[PerformanceMonitor] 渲染时间: ${componentName} - ${duration.toFixed(2)}ms`);
  }

  /**
   * 获取所有指标
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * 获取性能评分
   */
  getPerformanceScore(): number {
    let score = 100;

    // FCP 评分 (目标 < 1.8s)
    if (this.metrics.FCP && this.metrics.FCP > 1800) {
      score -= Math.min(20, (this.metrics.FCP - 1800) / 100);
    }

    // LCP 评分 (目标 < 2.5s)
    if (this.metrics.LCP && this.metrics.LCP > 2500) {
      score -= Math.min(25, (this.metrics.LCP - 2500) / 100);
    }

    // FID 评分 (目标 < 100ms)
    if (this.metrics.FID && this.metrics.FID > 100) {
      score -= Math.min(20, (this.metrics.FID - 100) / 10);
    }

    // CLS 评分 (目标 < 0.1)
    if (this.metrics.CLS && this.metrics.CLS > 0.1) {
      score -= Math.min(15, (this.metrics.CLS - 0.1) * 100);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * 保存指标到 localStorage
   */
  private saveMetrics(): void {
    try {
      const historical = this.loadHistoricalMetrics();
      historical.push({
        timestamp: Date.now(),
        metrics: this.metrics,
      });

      // 只保留最近 50 条记录
      const trimmed = historical.slice(-50);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('[PerformanceMonitor] 保存指标失败:', error);
    }
  }

  /**
   * 加载历史指标
   */
  private loadHistoricalMetrics(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * 获取历史指标
   */
  getHistoricalMetrics(): any[] {
    return this.loadHistoricalMetrics();
  }

  /**
   * 清除历史指标
   */
  clearHistoricalMetrics(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * 单例实例
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook：使用性能监控
 */
export function usePerformanceMonitor() {
  if (typeof window === 'undefined') {
    return {
      metrics: {},
      score: 0,
      recordAPI: () => {},
      recordRender: () => {},
    };
  }

  return {
    metrics: performanceMonitor.getMetrics(),
    score: performanceMonitor.getPerformanceScore(),
    recordAPI: (url: string, duration: number) =>
      performanceMonitor.recordAPIResponseTime(url, duration),
    recordRender: (componentName: string, duration: number) =>
      performanceMonitor.recordRenderTime(componentName, duration),
  };
}

/**
 * 性能装饰器：测量函数执行时间
 */
export function measurePerformance(componentName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      const duration = end - start;

      performanceMonitor.recordRenderTime(componentName, duration);
      console.log(`[Performance] ${componentName}.${propertyName}: ${duration.toFixed(2)}ms`);

      return result;
    };

    return descriptor;
  };
}

/**
 * 测量异步函数性能
 */
export async function measureAsync<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  return { result, duration };
}

/**
 * 检测性能瓶颈
 */
export function detectPerformanceBottlenecks(metrics: Partial<PerformanceMetrics>): string[] {
  const bottlenecks: string[] = [];

  if (metrics.FCP && metrics.FCP > 3000) {
    bottlenecks.push('FCP 超过 3 秒，考虑优化首屏加载');
  }

  if (metrics.LCP && metrics.LCP > 4000) {
    bottlenecks.push('LCP 超过 4 秒，考虑优化最大内容元素');
  }

  if (metrics.FID && metrics.FID > 300) {
    bottlenecks.push('FID 超过 300ms，考虑优化 JavaScript 执行');
  }

  if (metrics.CLS && metrics.CLS > 0.25) {
    bottlenecks.push('CLS 超过 0.25，考虑减少布局偏移');
  }

  if (metrics.apiResponseTime && metrics.apiResponseTime > 500) {
    bottlenecks.push('API 响应时间超过 500ms，考虑添加缓存');
  }

  if (metrics.renderTime && metrics.renderTime > 100) {
    bottlenecks.push('渲染时间超过 100ms，考虑优化组件');
  }

  return bottlenecks;
}

export default PerformanceMonitor;
