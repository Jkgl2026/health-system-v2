import { useState, useEffect } from 'react';

/**
 * 表单数据持久化配置
 */
export interface PersistConfig<T> {
  key: string;
  defaultValue: T;
  debounceMs?: number; // 防抖时间（毫秒）
  enableLocalStorage?: boolean; // 是否启用本地存储
  enableServerSync?: boolean; // 是否启用服务器同步
}

/**
 * 持久化表单数据 Hook
 * 自动保存表单数据到 localStorage 和服务器
 */
export function useFormDataPersist<T extends Record<string, any>>(
  config: PersistConfig<T>
) {
  const {
    key,
    defaultValue,
    debounceMs = 1000,
    enableLocalStorage = true,
    enableServerSync = false,
  } = config;

  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // 从 localStorage 加载数据
  useEffect(() => {
    if (!enableLocalStorage) {
      setIsLoading(false);
      return;
    }

    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // 合并默认值和保存的数据，确保新增字段有默认值
        setData({ ...defaultValue, ...parsedData });
        console.log(`[useFormDataPersist] 从 localStorage 加载数据: ${key}`);
      }
    } catch (error) {
      console.error(`[useFormDataPersist] 加载数据失败: ${key}`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue, enableLocalStorage]);

  // 自动保存到 localStorage（带防抖）
  useEffect(() => {
    if (!enableLocalStorage || isLoading) {
      return;
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setLastSaveTime(Date.now());
        console.log(`[useFormDataPersist] 数据已保存到 localStorage: ${key}`);
      } catch (error) {
        console.error(`[useFormDataPersist] 保存数据失败: ${key}`, error);
      }
    }, debounceMs);

    setSaveTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [data, key, debounceMs, enableLocalStorage, isLoading, saveTimeout]);

  // 更新数据
  const updateData = (newData: Partial<T>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  // 重置数据
  const resetData = () => {
    setData(defaultValue);
    if (enableLocalStorage) {
      localStorage.removeItem(key);
    }
  };

  // 清除保存的数据
  const clearData = () => {
    if (enableLocalStorage) {
      localStorage.removeItem(key);
    }
    setData(defaultValue);
  };

  // 立即保存（不使用防抖）
  const saveNow = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    if (enableLocalStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setLastSaveTime(Date.now());
        console.log(`[useFormDataPersist] 数据已立即保存: ${key}`);
      } catch (error) {
        console.error(`[useFormDataPersist] 立即保存失败: ${key}`, error);
      }
    }
  };

  // 手动从 localStorage 加载数据
  const reloadFromStorage = () => {
    if (!enableLocalStorage) return;

    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setData({ ...defaultValue, ...parsedData });
        console.log(`[useFormDataPersist] 从 localStorage 重新加载数据: ${key}`);
      }
    } catch (error) {
      console.error(`[useFormDataPersist] 重新加载数据失败: ${key}`, error);
    }
  };

  return {
    data,
    setData,
    updateData,
    resetData,
    clearData,
    saveNow,
    reloadFromStorage,
    isLoading,
    isSaving,
    lastSaveTime,
  };
}

/**
 * 批量持久化多个表单数据
 */
export function useFormPersistGroup<T extends Record<string, any>>(
  configs: Record<string, PersistConfig<T>>
) {
  const hooks: Record<string, ReturnType<typeof useFormDataPersist<T>>> = {};

  Object.entries(configs).forEach(([key, config]) => {
    hooks[key] = useFormDataPersist(config);
  });

  return {
    ...hooks,
    // 清除所有表单数据
    clearAll: () => {
      Object.values(hooks).forEach(hook => hook.clearData());
    },
    // 立即保存所有表单数据
    saveAll: () => {
      Object.values(hooks).forEach(hook => hook.saveNow());
    },
  };
}
