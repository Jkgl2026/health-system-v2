// API 配置 - Supabase Edge Functions
// 将所有 API 调用指向 Supabase Edge Functions

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase Edge Functions 端点
export const API_ENDPOINTS = {
  // 数据库初始化
  initDb: `${SUPABASE_URL}/functions/v1/init-db`,

  // 后台管理
  adminLogin: `${SUPABASE_URL}/functions/v1/admin-login`,
  adminUsers: `${SUPABASE_URL}/functions/v1/admin-users`,
  adminCompare: `${SUPABASE_URL}/functions/v1/admin-compare`,
  adminExport: `${SUPABASE_URL}/functions/v1/admin-export`,

  // 用户相关
  userHistory: `${SUPABASE_URL}/functions/v1/user-history`,
  saveHealthRecord: `${SUPABASE_URL}/functions/v1/save-health-record`,
};

/**
 * 通用 API 请求函数
 */
export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = new URL(endpoint);

  // 如果是 GET 请求，将 params 添加到 URL
  if (options.method === 'GET' && (options as any).params) {
    Object.entries((options as any).params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${error}`);
  }

  return await response.json();
}

/**
 * 初始化数据库
 */
export async function initDatabase() {
  return apiRequest(`${API_ENDPOINTS.initDb}?key=init-health-system-2025`);
}

/**
 * 后台登录
 */
export async function adminLogin(username: string, password: string) {
  return apiRequest(API_ENDPOINTS.adminLogin, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * 获取用户列表
 */
export async function getUserList(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  return apiRequest(API_ENDPOINTS.adminUsers, {
    method: 'GET',
    params,
  });
}

/**
 * 获取用户历史记录
 */
export async function getUserHistory(userId: string) {
  return apiRequest(API_ENDPOINTS.userHistory, {
    method: 'GET',
    params: { userId },
  });
}

/**
 * 数据对比
 */
export async function compareRecords(recordIds: string[]) {
  return apiRequest(API_ENDPOINTS.adminCompare, {
    method: 'POST',
    body: JSON.stringify({ recordIds }),
  });
}

/**
 * 导出数据
 */
export async function exportData(params?: {
  format?: 'json' | 'csv';
  startDate?: string;
  endDate?: string;
}) {
  const url = new URL(API_ENDPOINTS.adminExport);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response;
}
