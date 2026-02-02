// API 客户端工具函数
// 为了支持 Cloudflare Pages 静态导出，使用客户端数据管理器替代 API 调用

import { clientDataManager } from './client-data-manager';

const API_BASE = '/api';

/**
 * 创建用户
 */
export async function createUser(userData: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  age?: string | null;
  gender?: string | null;
  weight?: string | null;
  height?: string | null;
  bloodPressure?: string | null;
  occupation?: string | null;
  address?: string | null;
  bmi?: string | null;
}) {
  try {
    // 使用客户端数据管理器
    const user = clientDataManager.saveUserData({
      name: userData.name ?? null,
      phone: userData.phone ?? null,
      email: userData.email ?? null,
      age: userData.age ? parseInt(userData.age) : null,
      gender: userData.gender ?? null,
      weight: userData.weight ?? null,
      height: userData.height ?? null,
      bloodPressure: userData.bloodPressure ?? null,
      occupation: userData.occupation ?? null,
      address: userData.address ?? null,
      bmi: userData.bmi ?? null,
    });

    return { success: true, user };
  } catch (error) {
    console.error('Error - createUser:', error);
    throw error;
  }
}

/**
 * 获取用户信息
 */
export async function getUser(userId?: string, phone?: string) {
  try {
    // 使用客户端数据管理器
    const user = clientDataManager.getUserData();

    if (!user) {
      return { success: false, error: '用户不存在', user: null };
    }

    // 如果提供了 userId，检查是否匹配
    if (userId && user.id !== userId) {
      return { success: false, error: '用户不存在', user: null };
    }

    // 如果提供了 phone，检查是否匹配
    if (phone && user.phone !== phone) {
      return { success: false, error: '用户不存在', user: null };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error - getUser:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: errorMessage, user: null };
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(userId: string, userData: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  age?: string | null;
  gender?: string | null;
  weight?: string | null;
  height?: string | null;
  bloodPressure?: string | null;
  occupation?: string | null;
  address?: string | null;
  bmi?: string | null;
}) {
  try {
    // 使用客户端数据管理器
    const existingUser = clientDataManager.getUserData();

    if (!existingUser || existingUser.id !== userId) {
      return { success: false, error: '用户不存在', user: null };
    }

    const updatedUser = clientDataManager.saveUserData({
      name: userData.name ?? null,
      phone: userData.phone ?? null,
      email: userData.email ?? null,
      age: userData.age ? parseInt(userData.age) : null,
      gender: userData.gender ?? null,
      weight: userData.weight ?? null,
      height: userData.height ?? null,
      bloodPressure: userData.bloodPressure ?? null,
      occupation: userData.occupation ?? null,
      address: userData.address ?? null,
      bmi: userData.bmi ?? null,
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error - updateUser:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: errorMessage, user: null };
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
    // 使用客户端数据管理器
    const symptomCheck = clientDataManager.saveSymptomCheck(
      data.userId,
      data.checkedSymptoms.map(id => parseInt(id))
    );

    return { success: true, symptomCheck };
  } catch (error) {
    console.error('Error - saveSymptomCheck:', error);
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
    // 使用客户端数据管理器
    // 计算健康评分（取所有指标的平均值）
    const scores = [
      data.qiAndBlood,
      data.circulation,
      data.toxins,
      data.bloodLipids,
      data.coldness,
      data.immunity,
      data.emotions,
      data.overallHealth,
    ].filter((s): s is number => s !== null && s !== undefined);

    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    const healthAnalysis = clientDataManager.saveHealthAnalysis(
      data.userId,
      [], // 症状列表暂时为空
      averageScore
    );

    return { success: true, healthAnalysis };
  } catch (error) {
    console.error('Error - saveHealthAnalysis:', error);
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
    // 使用客户端数据管理器
    const userChoice = clientDataManager.saveUserChoice(data.userId, data.planType);

    return { success: true, userChoice };
  } catch (error) {
    console.error('Error - saveUserChoice:', error);
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
  sevenQuestionsAnswers?: Record<string, any> | null;
  badHabitsChecklist?: number[] | null;
  symptoms300Checklist?: number[] | null;
}) {
  try {
    // 使用客户端数据管理器
    // 将所有需求数据合并保存
    const requirements = clientDataManager.saveRequirements(
      data.userId,
      'bodySymptoms',
      data.badHabitsChecklist || []
    );

    return { success: true, requirements };
  } catch (error) {
    console.error('Error - saveRequirements:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: errorMessage };
  }
}

/**
 * 获取四个要求完成情况
 */
export async function getRequirements(userId: string) {
  try {
    // 使用客户端数据管理器
    const requirements = clientDataManager.getRequirements(userId);

    if (!requirements) {
      return { success: false, error: '未找到数据', requirements: null };
    }

    return { success: true, requirements };
  } catch (error) {
    console.error('Error - getRequirements:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: errorMessage, requirements: null };
  }
}
