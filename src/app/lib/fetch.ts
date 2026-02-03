/**
 * 前端fetch请求封装工具
 * 
 * 功能：
 * - 自动携带Token（从localStorage读取）
 * - 统一异常处理
 * - 统一返回格式
 * - 自动处理401未授权（跳转登录）
 * 
 * 使用方式：
 * import { adminFetch } from '@/app/lib/fetch';
 * 
 * // GET请求
 * const data = await adminFetch('/api/admin/users');
 * 
 * // POST请求
 * const data = await adminFetch('/api/admin/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'test' })
 * });
 */

/**
 * API响应接口
 */
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * 请求配置接口
 */
interface FetchConfig extends RequestInit {
  /** 是否携带Token（默认true） */
  withToken?: boolean;
  /** 是否在401时自动跳转登录（默认true） */
  redirectOn401?: boolean;
  /** 请求超时时间（毫秒，默认30000） */
  timeout?: number;
}

/**
 * 默认请求配置
 */
const DEFAULT_CONFIG: FetchConfig = {
  withToken: true,
  redirectOn401: true,
  timeout: 30000,
};

/**
 * 封装的fetch函数（管理员专用）
 * 
 * @param url - 请求路径
 * @param config - 请求配置
 * @returns API响应数据
 * 
 * @example
 * // GET请求
 * const users = await adminFetch('/api/admin/users');
 * 
 * // POST请求
 * const result = await adminFetch('/api/admin/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ username: 'admin' })
 * });
 * 
 * // 不携带Token
 * const data = await adminFetch('/api/public/info', {
 *   withToken: false
 * });
 */
export async function adminFetch<T = any>(
  url: string,
  config: FetchConfig = {}
): Promise<T> {
  // 合并配置
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };
    
    // 2. 自动携带Token
    if (mergedConfig.withToken) {
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        console.error('[adminFetch] 未找到Token');
        
        if (mergedConfig.redirectOn401) {
          redirectToLogin();
        }
        
        throw new Error('未登录，请先登录');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, mergedConfig.timeout);
    
    // 4. 发送请求
    const response = await fetch(url, {
      ...mergedConfig,
      headers,
      signal: controller.signal,
    });
    
    // 清除超时
    clearTimeout(timeoutId);
    
    // 5. 解析响应
    const data: APIResponse<T> = await response.json();
    
    // 6. 处理401未授权
    if (response.status === 401) {
      console.error('[adminFetch] 401未授权', { url, error: data.error });
      
      // 清除Token
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      if (mergedConfig.redirectOn401) {
        redirectToLogin();
      }
      
      throw new Error(data.error || '登录已过期，请重新登录');
    }
    
    // 7. 处理其他错误状态码
    if (!response.ok) {
      console.error('[adminFetch] 请求失败', { 
        url, 
        status: response.status, 
        error: data.error 
      });
      
      throw new Error(data.error || `请求失败：${response.status}`);
    }
    
    // 8. 处理业务错误
    if (!data.success) {
      console.error('[adminFetch] 业务错误', { url, error: data.error });
      throw new Error(data.error || '操作失败');
    }
    
    // 9. 返回数据
    console.log('[adminFetch] 请求成功', { url });
    return data.data as T;
    
  } catch (error) {
    // 处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[adminFetch] 请求超时', { url });
      throw new Error('请求超时，请检查网络连接');
    }
    
    // 抛出原始错误
    console.error('[adminFetch] 请求异常', { url, error });
    throw error;
  }
}

/**
 * 跳转到登录页面
 */
function redirectToLogin() {
  // 保存当前页面路径，登录后可以跳转回来
  const currentPath = window.location.pathname;
  if (currentPath !== '/admin/login') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  // 跳转到登录页
  window.location.href = '/admin/login';
}

/**
 * 获取当前登录用户信息
 * 
 * @returns 用户信息或null
 * 
 * @example
 * const user = getCurrentUser();
 * if (user) {
 *   console.log('当前用户:', user.username);
 * }
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('admin_user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('[getCurrentUser] 解析用户信息失败', error);
    return null;
  }
}

/**
 * 检查是否已登录
 * 
 * @returns 是否已登录
 * 
 * @example
 * if (isLoggedIn()) {
 *   console.log('已登录');
 * }
 */
export function isLoggedIn(): boolean {
  const token = localStorage.getItem('admin_token');
  return !!token;
}

/**
 * 登出
 * 
 * @param redirect - 是否跳转到登录页（默认true）
 * 
 * @example
 * await adminFetch('/api/admin/logout', { method: 'POST' });
 * logout();
 */
export function logout(redirect: boolean = true) {
  console.log('[logout] 清除登录信息');
  
  // 清除本地存储
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  
  // 跳转到登录页
  if (redirect) {
    window.location.href = '/admin/login';
  }
}

/**
 * GET请求快捷方法
 * 
 * @example
 * const users = await adminFetch.get('/api/admin/users');
 */
export const get = <T = any>(url: string, config?: Omit<FetchConfig, 'method'>) => {
  return adminFetch<T>(url, { ...config, method: 'GET' });
};

/**
 * POST请求快捷方法
 * 
 * @example
 * const result = await adminFetch.post('/api/admin/users', { username: 'admin' });
 */
export const post = <T = any>(url: string, body?: any, config?: Omit<FetchConfig, 'method' | 'body'>) => {
  return adminFetch<T>(url, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * PUT请求快捷方法
 * 
 * @example
 * const result = await adminFetch.put('/api/admin/users/1', { name: 'test' });
 */
export const put = <T = any>(url: string, body?: any, config?: Omit<FetchConfig, 'method' | 'body'>) => {
  return adminFetch<T>(url, {
    ...config,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * DELETE请求快捷方法
 * 
 * @example
 * const result = await adminFetch.delete('/api/admin/users/1');
 */
export const del = <T = any>(url: string, config?: Omit<FetchConfig, 'method'>) => {
  return adminFetch<T>(url, { ...config, method: 'DELETE' });
};

// 导出所有方法
export const adminFetchMethods = {
  get,
  post,
  put,
  delete: del,
};

// 默认导出
export default adminFetch;
