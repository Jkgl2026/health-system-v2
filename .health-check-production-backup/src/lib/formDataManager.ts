/**
 * 表单数据管理工具
 * 提供统一的本地存储管理接口
 */

/**
 * 本地存储键名常量
 */
export const STORAGE_KEYS = {
  // 个人信息
  USER_INFO: 'userInfo',
  // 症状检查
  SELECTED_SYMPTOMS: 'selectedSymptoms',
  TARGET_SYMPTOM: 'targetSymptom',
  // 选择方案
  SELECTED_CHOICE: 'selectedChoice',
  ACCEPTED_REQUIREMENTS: 'acceptedRequirements',
  // 四个要求
  SELECTED_HABITS_REQUIREMENTS: 'selectedHabitsRequirements',
  SELECTED_SYMPTOMS_300: 'selectedSymptoms300',
} as const;

/**
 * 保存数据到 localStorage
 */
export function saveToStorage(key: string, data: any): void {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[FormDataManager] 保存数据: ${key}`);
  } catch (error) {
    console.error(`[FormDataManager] 保存失败: ${key}`, error);
  }
}

/**
 * 从 localStorage 加载数据
 */
export function loadFromStorage<T>(key: string, defaultValue?: T): T | null {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return defaultValue || null;
  }

  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return defaultValue || null;
  } catch (error) {
    console.error(`[FormDataManager] 加载失败: ${key}`, error);
    return defaultValue || null;
  }
}

/**
 * 从 localStorage 删除数据
 */
export function removeFromStorage(key: string): void {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
    console.log(`[FormDataManager] 删除数据: ${key}`);
  } catch (error) {
    console.error(`[FormDataManager] 删除失败: ${key}`, error);
  }
}

/**
 * 清除所有表单数据
 */
export function clearAllFormData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
  console.log('[FormDataManager] 已清除所有表单数据');
}

/**
 * 获取所有表单数据的摘要
 */
export function getFormDataSummary(): Record<string, any> {
  const summary: Record<string, any> = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const data = loadFromStorage(key);
    if (data) {
      summary[name] = {
        exists: true,
        size: JSON.stringify(data).length,
        type: Array.isArray(data) ? 'array' : typeof data,
      };
    } else {
      summary[name] = { exists: false };
    }
  });

  return summary;
}

/**
 * 检查是否有任何已保存的表单数据
 */
export function hasAnyFormData(): boolean {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    return false;
  }

  return Object.values(STORAGE_KEYS).some(key => {
    const data = localStorage.getItem(key);
    return data !== null && data !== '';
  });
}

/**
 * 导出所有表单数据（用于备份）
 */
export function exportAllFormData(): string {
  const data: Record<string, any> = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = loadFromStorage(key);
    if (value !== null) {
      data[name] = value;
    }
  });

  return JSON.stringify(data, null, 2);
}

/**
 * 导入表单数据（用于恢复）
 */
export function importFormData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name] !== undefined) {
        saveToStorage(key, data[name]);
      }
    });

    console.log('[FormDataManager] 数据导入成功');
    return true;
  } catch (error) {
    console.error('[FormDataManager] 数据导入失败:', error);
    return false;
  }
}
