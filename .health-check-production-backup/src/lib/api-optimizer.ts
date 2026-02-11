/**
 * API 请求优化工具
 * 提供请求缓存、重试、并发控制等功能
 */

import { performanceMonitor } from './performance-monitor';

/**
 * 请求配置
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

/**
 * 请求响应
 */
export interface RequestResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  duration: number;
  fromCache: boolean;
}

/**
 * 缓存条目
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

/**
 * API 请求优化器
 */
export class APIRequestOptimizer {
  private cache: Map<string, CacheEntry>;
  private pendingRequests: Map<string, Promise<any>>;

  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * 发送优化的请求
   */
  async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<RequestResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      cache = false,
      cacheKey,
      cacheTTL = 5 * 60 * 1000, // 5分钟
    } = options;

    const startTime = performance.now();

    // 检查缓存
    if (cache && method === 'GET') {
      const cached = this.getFromCache(cacheKey || url);
      if (cached) {
        const duration = performance.now() - startTime;
        performanceMonitor.recordAPIResponseTime(url, duration);
        return {
          data: cached,
          status: 200,
          headers: new Headers(),
          duration,
          fromCache: true,
        };
      }
    }

    // 检查是否有相同的请求正在进行（请求去重）
    const requestKey = `${method}:${url}:${JSON.stringify(body)}`;
    if (this.pendingRequests.has(requestKey)) {
      console.log(`[API] 请求去重: ${requestKey}`);
      return this.pendingRequests.get(requestKey);
    }

    // 创建请求 Promise
    const requestPromise = this.executeRequest<T>(
      url,
      method,
      headers,
      body,
      timeout,
      retries,
      retryDelay,
      startTime,
      cache,
      cacheKey || url,
      cacheTTL
    );

    // 存储待处理请求
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // 清理待处理请求
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * 执行请求（带重试）
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: any,
    timeout: number,
    retries: number,
    retryDelay: number,
    startTime: number,
    cache: boolean,
    cacheKey: string,
    cacheTTL: number
  ): Promise<RequestResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout<T>(
          url,
          method,
          headers,
          body,
          timeout
        );

        // 缓存响应
        if (cache && method === 'GET' && response.status === 200) {
          this.setToCache(cacheKey, response.data, cacheTTL);
        }

        const duration = performance.now() - startTime;
        performanceMonitor.recordAPIResponseTime(url, duration);

        return {
          data: response.data,
          status: response.status,
          headers: response.headers,
          duration,
          fromCache: false,
        };
      } catch (error: any) {
        lastError = error;

        // 如果是网络错误或服务器错误，且还有重试次数，则重试
        if (
          attempt < retries &&
          (error.message.includes('fetch failed') ||
            error.status >= 500 ||
            error.status === 429)
        ) {
          console.log(
            `[API] 请求失败，${retryDelay}ms 后重试 (${attempt + 1}/${retries}): ${url}`
          );
          await this.sleep(retryDelay * (attempt + 1)); // 指数退避
          continue;
        }

        // 不再重试，抛出错误
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * 带超时的 fetch
   */
  private async fetchWithTimeout<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: any,
    timeout: number
  ): Promise<{ data: T; status: number; headers: Headers }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`请求超时 (${timeout}ms)`);
      }

      throw error;
    }
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 存入缓存
   */
  private setToCache(key: string, data: any, ttl: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * 清除缓存
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 休眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 单例实例
 */
export const apiOptimizer = new APIRequestOptimizer();

/**
 * 便捷方法：发送 GET 请求
 */
export async function get<T>(url: string, options?: RequestOptions): Promise<RequestResponse<T>> {
  return apiOptimizer.request<T>(url, { ...options, method: 'GET' });
}

/**
 * 便捷方法：发送 POST 请求
 */
export async function post<T>(
  url: string,
  data: any,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return apiOptimizer.request<T>(url, { ...options, method: 'POST', body: data });
}

/**
 * 便捷方法：发送 PUT 请求
 */
export async function put<T>(
  url: string,
  data: any,
  options?: RequestOptions
): Promise<RequestResponse<T>> {
  return apiOptimizer.request<T>(url, { ...options, method: 'PUT', body: data });
}

/**
 * 便捷方法：发送 DELETE 请求
 */
export async function del<T>(url: string, options?: RequestOptions): Promise<RequestResponse<T>> {
  return apiOptimizer.request<T>(url, { ...options, method: 'DELETE' });
}

export default APIRequestOptimizer;
