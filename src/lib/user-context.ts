// 用户管理工具

const USER_ID_KEY = 'health_app_user_id';

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined';

/**
 * 生成用户ID（如果没有则创建）
 */
export function getOrGenerateUserId(): string {
  // 服务端环境下返回临时ID
  if (!isBrowser) {
    return 'server-side-user';
  }
  
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * 生成UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 清除用户ID
 */
export function clearUserId(): void {
  if (isBrowser) {
    localStorage.removeItem(USER_ID_KEY);
  }
}

/**
 * 获取当前用户ID（不自动生成）
 */
export function getCurrentUserId(): string | null {
  if (!isBrowser) {
    return null;
  }
  return localStorage.getItem(USER_ID_KEY);
}
