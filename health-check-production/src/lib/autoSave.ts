/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastResult: ReturnType<T>;

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = fn.apply(this, args);

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }

    return lastResult;
  };
}

/**
 * 自动保存配置
 */
export interface AutoSaveConfig<T> {
  /** 保存数据的函数 */
  saveFn: (data: T) => Promise<void>;
  /** 防抖延迟时间（毫秒） */
  delay?: number;
  /** 保存成功回调 */
  onSaveSuccess?: (data: T) => void;
  /** 保存失败回调 */
  onSaveError?: (error: Error) => void;
  /** 保存状态变更回调 */
  onStatusChange?: (status: 'idle' | 'saving' | 'success' | 'error') => void;
  /** 是否启用自动保存 */
  enabled?: boolean;
}

/**
 * 自动保存状态
 */
export type AutoSaveStatus = 'idle' | 'saving' | 'success' | 'error';

/**
 * 自动保存管理器类
 */
export class AutoSaveManager<T> {
  private config: AutoSaveConfig<T>;
  private debounceSave: (data: T) => void;
  private currentStatus: AutoSaveStatus = 'idle';
  private lastSavedData: T | null = null;
  private saveQueue: Map<string, T> = new Map();
  private isSaving: boolean = false;

  constructor(config: AutoSaveConfig<T>) {
    this.config = {
      delay: 1000,
      enabled: true,
      ...config,
    };

    this.debounceSave = debounce(this.performSave.bind(this), this.config.delay!);
  }

  /**
   * 触发自动保存
   */
  async save(data: T, key?: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // 使用key区分不同的数据源
    const saveKey = key || 'default';
    this.saveQueue.set(saveKey, data);

    // 如果正在保存，只更新队列
    if (this.isSaving) {
      return;
    }

    this.debounceSave(data);
  }

  /**
   * 执行保存
   */
  private async performSave(data: T): Promise<void> {
    if (!this.config.enabled || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.updateStatus('saving');

    try {
      await this.config.saveFn(data);
      this.lastSavedData = data;
      this.updateStatus('success');

      if (this.config.onSaveSuccess) {
        this.config.onSaveSuccess(data);
      }

      // 1秒后重置状态
      setTimeout(() => {
        this.updateStatus('idle');
      }, 1000);
    } catch (error) {
      this.updateStatus('error');

      if (this.config.onSaveError) {
        this.config.onSaveError(error as Error);
      }

      console.error('[AutoSaveManager] 保存失败:', error);
    } finally {
      this.isSaving = false;

      // 处理队列中的数据
      if (this.saveQueue.size > 0) {
        const nextData = Array.from(this.saveQueue.values())[this.saveQueue.size - 1];
        this.saveQueue.clear();
        this.performSave(nextData);
      }
    }
  }

  /**
   * 更新保存状态
   */
  private updateStatus(status: AutoSaveStatus): void {
    this.currentStatus = status;

    if (this.config.onStatusChange) {
      this.config.onStatusChange(status);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus(): AutoSaveStatus {
    return this.currentStatus;
  }

  /**
   * 获取最后保存的数据
   */
  getLastSavedData(): T | null {
    return this.lastSavedData;
  }

  /**
   * 取消所有待保存的数据
   */
  cancel(): void {
    this.saveQueue.clear();
    this.updateStatus('idle');
  }

  /**
   * 启用自动保存
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * 禁用自动保存
   */
  disable(): void {
    this.config.enabled = false;
    this.cancel();
  }

  /**
   * 立即保存（不防抖）
   */
  async saveImmediately(data: T): Promise<void> {
    this.saveQueue.clear();
    await this.performSave(data);
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.cancel();
  }
}

/**
 * 创建自动保存管理器
 */
export function createAutoSave<T>(
  config: AutoSaveConfig<T>
): AutoSaveManager<T> {
  return new AutoSaveManager<T>(config);
}

export default debounce;
