/**
 * localStorage 缓存管理工具
 * 提供统一的 localStorage 操作接口，支持过期时间和类型安全
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number | undefined; // 过期时间戳，undefined 表示永不过期
}

export interface StorageOptions {
  expiry?: number; // 过期时间（毫秒），默认不过期
  prefix?: string; // 键前缀
}

const DEFAULT_OPTIONS: StorageOptions = {
  expiry: undefined,
  prefix: 'health_app_',
};

class StorageManager {
  /**
   * 获取完整的键名
   */
  private getFullKey(key: string, prefix?: string): string {
    return `${prefix || DEFAULT_OPTIONS.prefix}${key}`;
  }

  /**
   * 设置数据
   */
  set<T>(key: string, data: T, options?: StorageOptions): void {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      const now = Date.now();
      const expiry = options?.expiry ? now + options.expiry : undefined;

      const item: CacheItem<T> = {
        data,
        timestamp: now,
        expiry,
      };

      localStorage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error('[StorageManager] 设置数据失败:', key, error);
    }
  }

  /**
   * 获取数据
   */
  get<T>(key: string, defaultValue: T, options?: StorageOptions): T {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      const raw = localStorage.getItem(fullKey);

      if (!raw) {
        return defaultValue;
      }

      const item: CacheItem<T> = JSON.parse(raw);

      // 检查是否过期
      if (item.expiry && item.expiry < Date.now()) {
        this.remove(key, options?.prefix);
        return defaultValue;
      }

      return item.data;
    } catch (error) {
      console.error('[StorageManager] 获取数据失败:', key, error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   */
  remove(key: string, prefix?: string): void {
    try {
      const fullKey = this.getFullKey(key, prefix);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('[StorageManager] 删除数据失败:', key, error);
    }
  }

  /**
   * 清空所有带前缀的数据
   */
  clear(prefix?: string): void {
    try {
      const actualPrefix = this.getFullKey('', prefix);
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(actualPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[StorageManager] 清空数据失败:', error);
    }
  }

  /**
   * 检查数据是否存在且未过期
   */
  has(key: string, options?: StorageOptions): boolean {
    try {
      const fullKey = this.getFullKey(key, options?.prefix);
      const raw = localStorage.getItem(fullKey);

      if (!raw) {
        return false;
      }

      const item: CacheItem<any> = JSON.parse(raw);

      // 检查是否过期
      if (item.expiry && item.expiry < Date.now()) {
        this.remove(key, options?.prefix);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[StorageManager] 检查数据失败:', key, error);
      return false;
    }
  }

  /**
   * 获取数据大小（字节）
   */
  getSize(key: string, prefix?: string): number {
    try {
      const fullKey = this.getFullKey(key, prefix);
      const raw = localStorage.getItem(fullKey);
      return raw ? new Blob([raw]).size : 0;
    } catch (error) {
      console.error('[StorageManager] 获取数据大小失败:', key, error);
      return 0;
    }
  }

  /**
   * 获取所有数据的大小
   */
  getTotalSize(prefix?: string): number {
    try {
      const actualPrefix = this.getFullKey('', prefix);
      const keys = Object.keys(localStorage);
      let totalSize = 0;

      keys.forEach((key) => {
        if (key.startsWith(actualPrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            totalSize += new Blob([raw]).size;
          }
        }
      });

      return totalSize;
    } catch (error) {
      console.error('[StorageManager] 获取总大小失败:', error);
      return 0;
    }
  }

  /**
   * 清理过期的数据
   */
  cleanExpired(prefix?: string): number {
    try {
      const actualPrefix = this.getFullKey('', prefix);
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;

      keys.forEach((key) => {
        if (key.startsWith(actualPrefix)) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const item: CacheItem<any> = JSON.parse(raw);
              if (item.expiry && item.expiry < Date.now()) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            }
          } catch (error) {
            // 解析失败，删除该数据
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      });

      return cleanedCount;
    } catch (error) {
      console.error('[StorageManager] 清理过期数据失败:', error);
      return 0;
    }
  }
}

// 导出单例
export const storageManager = new StorageManager();

// 便捷方法
export const storage = {
  set: <T>(key: string, data: T, options?: StorageOptions) =>
    storageManager.set(key, data, options),

  get: <T>(key: string, defaultValue: T, options?: StorageOptions) =>
    storageManager.get(key, defaultValue, options),

  remove: (key: string, prefix?: string) =>
    storageManager.remove(key, prefix),

  clear: (prefix?: string) =>
    storageManager.clear(prefix),

  has: (key: string, options?: StorageOptions) =>
    storageManager.has(key, options),

  getSize: (key: string, prefix?: string) =>
    storageManager.getSize(key, prefix),

  getTotalSize: (prefix?: string) =>
    storageManager.getTotalSize(prefix),

  cleanExpired: (prefix?: string) =>
    storageManager.cleanExpired(prefix),
};
