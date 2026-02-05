'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AutoSaveManager, AutoSaveConfig, AutoSaveStatus } from '@/lib/autoSave';

/**
 * 自动保存Hook配置
 */
export interface UseAutoSaveConfig<T> extends Omit<AutoSaveConfig<T>, 'onStatusChange'> {
  /** 初始数据 */
  initialData?: T;
  /** 是否在组件卸载时立即保存 */
  saveOnUnmount?: boolean;
}

/**
 * 自动保存Hook返回值
 */
export interface UseAutoSaveReturn<T> {
  /** 保存状态 */
  status: AutoSaveStatus;
  /** 触发自动保存 */
  save: (data: T, key?: string) => Promise<void>;
  /** 立即保存 */
  saveImmediately: (data: T) => Promise<void>;
  /** 取消保存 */
  cancel: () => void;
  /** 启用自动保存 */
  enable: () => void;
  /** 禁用自动保存 */
  disable: () => void;
  /** 最后保存的数据 */
  lastSavedData: T | null;
  /** 是否正在保存 */
  isSaving: boolean;
  /** 是否保存成功 */
  isSuccess: boolean;
  /** 是否保存失败 */
  isError: boolean;
}

/**
 * 自动保存Hook
 * @param config 自动保存配置
 * @returns 自动保存方法和状态
 */
export function useAutoSave<T>(config: UseAutoSaveConfig<T>): UseAutoSaveReturn<T> {
  const { initialData, saveOnUnmount = false, ...autoSaveConfig } = config;
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedData, setLastSavedData] = useState<T | null>(initialData || null);
  
  const autoSaveManagerRef = useRef<AutoSaveManager<T> | null>(null);
  const pendingDataRef = useRef<T | null>(null);

  // 初始化自动保存管理器
  useEffect(() => {
    const manager = new AutoSaveManager<T>({
      ...autoSaveConfig,
      onStatusChange: setStatus,
      onSaveSuccess: (data) => {
        setLastSavedData(data);
      },
    });
    autoSaveManagerRef.current = manager;

    return () => {
      // 如果有待保存的数据且启用了卸载保存，立即保存
      if (saveOnUnmount && pendingDataRef.current && autoSaveConfig.enabled) {
        manager.saveImmediately(pendingDataRef.current);
      }
      manager.destroy();
    };
  }, []); // 只在组件挂载时初始化

  // 触发自动保存
  const save = useCallback(async (data: T, key?: string) => {
    if (!autoSaveManagerRef.current) return;
    
    pendingDataRef.current = data;
    await autoSaveManagerRef.current.save(data, key);
  }, []);

  // 立即保存
  const saveImmediately = useCallback(async (data: T) => {
    if (!autoSaveManagerRef.current) return;
    
    pendingDataRef.current = data;
    await autoSaveManagerRef.current.saveImmediately(data);
  }, []);

  // 取消保存
  const cancel = useCallback(() => {
    autoSaveManagerRef.current?.cancel();
    pendingDataRef.current = null;
  }, []);

  // 启用自动保存
  const enable = useCallback(() => {
    autoSaveManagerRef.current?.enable();
  }, []);

  // 禁用自动保存
  const disable = useCallback(() => {
    autoSaveManagerRef.current?.disable();
    pendingDataRef.current = null;
  }, []);

  return {
    status,
    save,
    saveImmediately,
    cancel,
    enable,
    disable,
    lastSavedData,
    isSaving: status === 'saving',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * 表单自动保存Hook
 * 专门用于表单数据的自动保存
 */
export function useFormAutoSave<T extends Record<string, any>>(
  config: UseAutoSaveConfig<T>
) {
  const autoSave = useAutoSave<T>(config);
  const [formData, setFormData] = useState<T>(config.initialData || ({} as T));
  const [hasChanges, setHasChanges] = useState(false);

  // 更新表单数据并触发自动保存
  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      setHasChanges(true);
      autoSave.save(newData, field as string);
    },
    [formData, autoSave]
  );

  // 批量更新表单数据
  const updateFields = useCallback(
    (updates: Partial<T>) => {
      const newData = { ...formData, ...updates };
      setFormData(newData);
      setHasChanges(true);
      autoSave.save(newData);
    },
    [formData, autoSave]
  );

  // 重置表单
  const resetForm = useCallback(() => {
    if (config.initialData) {
      setFormData(config.initialData);
      setHasChanges(false);
      autoSave.cancel();
    }
  }, [config.initialData, autoSave]);

  // 提交表单（立即保存）
  const submitForm = useCallback(async () => {
    await autoSave.saveImmediately(formData);
    setHasChanges(false);
  }, [autoSave, formData]);

  return {
    ...autoSave,
    formData,
    updateField,
    updateFields,
    resetForm,
    submitForm,
    hasChanges,
  };
}

export default useAutoSave;
