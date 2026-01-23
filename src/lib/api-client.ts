// API 客户端工具函数

const API_BASE = '/api';

/**
 * 创建用户
 */
export async function createUser(userData: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: string | null;
  height?: string | null;
  bloodPressure?: string | null;
  occupation?: string | null;
  address?: string | null;
  bmi?: string | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - createUser:', error);
    throw error;
  }
}

/**
 * 获取用户信息
 */
export async function getUser(userId?: string, phone?: string) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (phone) params.append('phone', phone);

    const response = await fetch(`${API_BASE}/user?${params.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - getUser:', error);
    throw error;
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, userData: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  weight?: string | null;
  height?: string | null;
  bloodPressure?: string | null;
  occupation?: string | null;
  address?: string | null;
  bmi?: string | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/user?userId=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - updateUser:', error);
    throw error;
  }
}

/**
 * 保存症状自检结果
 */
export async function saveSymptomCheck(data: {
  userId: string;
  checkedSymptoms: string[];
  totalScore?: number | null;
  elementScores?: Record<string, number> | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/symptom-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error - saveSymptomCheck:', error);
    throw error;
  }
}

/**
 * 保存健康要素分析
 */
export async function saveHealthAnalysis(data: {
  userId: string;
  qiAndBlood?: number | null;
  circulation?: number | null;
  toxins?: number | null;
  bloodLipids?: number | null;
  coldness?: number | null;
  immunity?: number | null;
  emotions?: number | null;
  overallHealth?: number | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/health-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error - saveHealthAnalysis:', error);
    throw error;
  }
}

/**
 * 保存用户选择
 */
export async function saveUserChoice(data: {
  userId: string;
  planType: string;
  planDescription?: string | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/user-choice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error - saveUserChoice:', error);
    throw error;
  }
}

/**
 * 保存或更新四个要求完成情况
 */
export async function saveRequirements(data: {
  userId: string;
  requirement1Completed?: boolean;
  requirement2Completed?: boolean;
  requirement3Completed?: boolean;
  requirement4Completed?: boolean;
  requirement2Answers?: any | null;
}) {
  try {
    const response = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error - saveRequirements:', error);
    throw error;
  }
}

/**
 * 获取四个要求完成情况
 */
export async function getRequirements(userId: string) {
  try {
    const response = await fetch(`${API_BASE}/requirements?userId=${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - getRequirements:', error);
    throw error;
  }
}
