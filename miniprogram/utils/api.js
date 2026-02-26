// utils/api.js
// API请求封装模块 - 小程序与Web端数据同步

// API基础配置
const API_BASE_URL = 'https://your-domain.com'; // 替换为实际域名

// 本地存储键名
const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_DATA: 'userData',
  ADMIN_TOKEN: 'adminToken',
  ADMIN_INFO: 'adminInfo',
  SELECTED_SYMPTOMS: 'selectedSymptoms',
  SELECTED_HABITS: 'selectedHabits',
  CHOICE_DATA: 'choiceData',
  REQUIREMENTS_DATA: 'requirementsData',
  SEVEN_QUESTIONS_ANSWERS: 'sevenQuestionsAnswers',
};

/**
 * 通用请求封装
 * @param {string} url - 请求路径
 * @param {Object} options - 请求选项
 * @returns {Promise} 响应数据
 */
function request(url, options = {}) {
  const {
    method = 'GET',
    data = null,
    header = {},
    needAuth = false,
  } = options;

  return new Promise((resolve, reject) => {
    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header,
    };

    // 如果需要认证，添加token
    if (needAuth) {
      const token = wx.getStorageSync(STORAGE_KEYS.ADMIN_TOKEN);
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`;
      }
    }

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    wx.request({
      url: fullUrl,
      method,
      data,
      header: requestHeader,
      timeout: 30000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除登录状态
          wx.removeStorageSync(STORAGE_KEYS.ADMIN_TOKEN);
          wx.removeStorageSync(STORAGE_KEYS.ADMIN_INFO);
          reject(new Error('登录已过期，请重新登录'));
        } else {
          const errorMsg = res.data?.error || res.data?.message || `请求失败(${res.statusCode})`;
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        console.error('[API] 请求失败:', url, err);
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

// ==================== 用户相关API ====================
const userAPI = {
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   */
  createUser(userData) {
    return request('/api/user', {
      method: 'POST',
      data: userData,
    });
  },

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} userData - 更新数据
   */
  updateUser(userId, userData) {
    return request(`/api/user?userId=${userId}`, {
      method: 'PATCH',
      data: userData,
    });
  },

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   */
  getUser(userId) {
    return request(`/api/user?userId=${userId}`, {
      method: 'GET',
    });
  },

  /**
   * 通过手机号获取用户
   * @param {string} phone - 手机号
   */
  getUserByPhone(phone) {
    return request(`/api/user?phone=${phone}`, {
      method: 'GET',
    });
  },

  /**
   * 获取用户历史记录
   * @param {string} userId - 用户ID
   */
  getUserHistory(userId) {
    return request(`/api/user/history?userId=${userId}`, {
      method: 'GET',
    });
  },

  /**
   * 提交症状检查
   * @param {Object} data - 症状数据
   */
  submitSymptoms(data) {
    return request('/api/symptom-check', {
      method: 'POST',
      data,
    });
  },

  /**
   * 提交健康分析
   * @param {Object} data - 分析数据
   */
  submitHealthAnalysis(data) {
    return request('/api/health-analysis', {
      method: 'POST',
      data,
    });
  },
};

// ==================== 管理员相关API ====================
const adminAPI = {
  /**
   * 管理员登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  login(username, password) {
    return request('/api/admin/login', {
      method: 'POST',
      data: { username, password },
    });
  },

  /**
   * 管理员登出
   */
  logout() {
    return request('/api/admin/logout', {
      method: 'POST',
      needAuth: true,
    });
  },

  /**
   * 验证登录状态
   */
  verifyAuth() {
    return request('/api/admin/verify', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   */
  getUsers(params = {}) {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return request(`/api/admin/users${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 获取用户详情
   * @param {string} userId - 用户ID
   */
  getUserDetail(userId) {
    return request(`/api/admin/users/${userId}`, {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   */
  deleteUser(userId) {
    return request(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      needAuth: true,
    });
  },

  /**
   * 获取统计数据
   */
  getStatistics() {
    return request('/api/admin/users', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 获取告警信息
   */
  getAlerts() {
    return request('/api/admin/alerts', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 数据库连接池状态
   */
  getPoolStats() {
    return request('/api/admin/pool-stats', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 执行维护操作
   * @param {string} action - 操作类型
   */
  executeMaintenance(action) {
    return request('/api/admin/maintenance', {
      method: 'POST',
      data: { action },
      needAuth: true,
    });
  },
};

// ==================== 选择与要求API ====================
const choiceAPI = {
  /**
   * 提交用户选择
   * @param {Object} data - 选择数据
   */
  submitChoice(data) {
    return request('/api/user-choice', {
      method: 'POST',
      data,
    });
  },

  /**
   * 获取用户选择
   * @param {string} userId - 用户ID
   */
  getChoice(userId) {
    return request(`/api/user-choice?userId=${userId}`, {
      method: 'GET',
    });
  },
};

const requirementsAPI = {
  /**
   * 提交四个要求
   * @param {Object} data - 要求数据
   */
  submitRequirements(data) {
    return request('/api/requirements', {
      method: 'POST',
      data,
    });
  },

  /**
   * 获取四个要求
   * @param {string} userId - 用户ID
   */
  getRequirements(userId) {
    return request(`/api/requirements?userId=${userId}`, {
      method: 'GET',
    });
  },

  /**
   * 提交用户要求（带用户ID）
   * @param {string} userId - 用户ID
   * @param {Object} data - 要求数据
   */
  submitUserRequirements(userId, data) {
    return request('/api/user/requirements', {
      method: 'POST',
      data: { userId, ...data },
    });
  },
};

// ==================== 健康七问API ====================
const sevenQuestionsAPI = {
  /**
   * 提交健康七问答案
   * @param {Object} data - 答案数据
   */
  submitAnswers(data) {
    return request('/api/user/seven-questions', {
      method: 'POST',
      data,
    });
  },

  /**
   * 获取健康七问答案
   * @param {string} userId - 用户ID
   */
  getAnswers(userId) {
    return request(`/api/user/seven-questions?userId=${userId}`, {
      method: 'GET',
    });
  },

  /**
   * 检查用户健康七问
   * @param {string} userId - 用户ID
   */
  checkUserQuestions(userId) {
    return request(`/api/check-user-seven-questions?userId=${userId}`, {
      method: 'GET',
    });
  },
};

// ==================== 课程相关API ====================
const courseAPI = {
  /**
   * 获取推荐课程
   * @param {string} userId - 用户ID
   */
  getRecommendedCourses(userId) {
    return request(`/api/courses/recommend?userId=${userId}`, {
      method: 'GET',
    });
  },

  /**
   * 匹配课程
   * @param {Object} data - 匹配数据
   */
  matchCourses(data) {
    return request('/api/courses/match', {
      method: 'POST',
      data,
    });
  },
};

// ==================== 备份相关API ====================
const backupAPI = {
  /**
   * 创建备份
   */
  createBackup() {
    return request('/api/backup/create', {
      method: 'POST',
      needAuth: true,
    });
  },

  /**
   * 获取备份列表
   */
  getBackupList() {
    return request('/api/backup/list', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 恢复备份
   * @param {string} backupId - 备份ID
   */
  restoreBackup(backupId) {
    return request('/api/backup/restore', {
      method: 'POST',
      data: { backupId },
      needAuth: true,
    });
  },

  /**
   * 删除备份
   * @param {string} backupId - 备份ID
   */
  deleteBackup(backupId) {
    return request('/api/backup/delete', {
      method: 'POST',
      data: { backupId },
      needAuth: true,
    });
  },

  /**
   * 验证备份
   * @param {string} backupId - 备份ID
   */
  verifyBackup(backupId) {
    return request('/api/backup/verify', {
      method: 'POST',
      data: { backupId },
      needAuth: true,
    });
  },
};

// ==================== 调试工具API ====================
const debugAPI = {
  /**
   * 检查数据完整性
   * @param {string} userId - 用户ID
   */
  checkDataIntegrity(userId) {
    return request(`/api/check-data-integrity?userId=${userId}`, {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 诊断数据库
   */
  diagnoseDB() {
    return request('/api/diagnose-db', {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 修复用户数据
   * @param {string} userId - 用户ID
   */
  fixUserData(userId) {
    return request('/api/debug/fix-user-data', {
      method: 'POST',
      data: { userId },
      needAuth: true,
    });
  },

  /**
   * 恢复本地数据
   * @param {Object} data - 本地数据
   */
  recoverLocalData(data) {
    return request('/api/recover-local-data', {
      method: 'POST',
      data,
    });
  },
};

// ==================== 数据导入导出API ====================
const dataAPI = {
  /**
   * 导出数据
   * @param {Object} params - 导出参数
   */
  exportData(params = {}) {
    const queryString = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return request(`/api/data/export${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      needAuth: true,
    });
  },

  /**
   * 导入数据
   * @param {Object} data - 导入数据
   */
  importData(data) {
    return request('/api/data/import', {
      method: 'POST',
      data,
      needAuth: true,
    });
  },
};

// ==================== 本地存储辅助函数 ====================
const storage = {
  /**
   * 保存用户ID
   */
  saveUserId(userId) {
    wx.setStorageSync(STORAGE_KEYS.USER_ID, userId);
  },

  /**
   * 获取用户ID
   */
  getUserId() {
    return wx.getStorageSync(STORAGE_KEYS.USER_ID);
  },

  /**
   * 保存用户数据
   */
  saveUserData(data) {
    wx.setStorageSync(STORAGE_KEYS.USER_DATA, data);
  },

  /**
   * 获取用户数据
   */
  getUserData() {
    return wx.getStorageSync(STORAGE_KEYS.USER_DATA) || {};
  },

  /**
   * 清除所有用户数据
   */
  clearUserData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.ADMIN_TOKEN && key !== STORAGE_KEYS.ADMIN_INFO) {
        wx.removeStorageSync(key);
      }
    });
  },

  /**
   * 保存管理员Token
   */
  saveAdminToken(token) {
    wx.setStorageSync(STORAGE_KEYS.ADMIN_TOKEN, token);
  },

  /**
   * 获取管理员Token
   */
  getAdminToken() {
    return wx.getStorageSync(STORAGE_KEYS.ADMIN_TOKEN);
  },

  /**
   * 保存管理员信息
   */
  saveAdminInfo(info) {
    wx.setStorageSync(STORAGE_KEYS.ADMIN_INFO, info);
  },

  /**
   * 获取管理员信息
   */
  getAdminInfo() {
    return wx.getStorageSync(STORAGE_KEYS.ADMIN_INFO) || {};
  },

  /**
   * 清除管理员登录状态
   */
  clearAdminAuth() {
    wx.removeStorageSync(STORAGE_KEYS.ADMIN_TOKEN);
    wx.removeStorageSync(STORAGE_KEYS.ADMIN_INFO);
  },

  /**
   * 检查管理员是否已登录
   */
  isAdminLoggedIn() {
    return !!wx.getStorageSync(STORAGE_KEYS.ADMIN_TOKEN);
  },
};

// ==================== 同步函数（本地+远程） ====================
const sync = {
  /**
   * 同步用户数据到服务器
   * @param {Object} userData - 用户数据
   */
  async syncUserData(userData) {
    try {
      // 保存到本地
      storage.saveUserData(userData);

      // 如果有userId，同步到服务器
      const userId = storage.getUserId();
      if (userId) {
        await userAPI.updateUser(userId, userData);
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步用户数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 同步症状数据
   * @param {Array} symptoms - 症状列表
   */
  async syncSymptoms(symptoms) {
    try {
      wx.setStorageSync(STORAGE_KEYS.SELECTED_SYMPTOMS, symptoms);

      const userId = storage.getUserId();
      if (userId) {
        await userAPI.submitSymptoms({
          userId,
          symptoms,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步症状数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 同步习惯数据
   * @param {Array} habits - 习惯列表
   */
  async syncHabits(habits) {
    try {
      wx.setStorageSync(STORAGE_KEYS.SELECTED_HABITS, habits);

      const userId = storage.getUserId();
      if (userId) {
        await userAPI.submitSymptoms({
          userId,
          badHabitsChecklist: habits,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步习惯数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 同步选择数据
   * @param {Object} choiceData - 选择数据
   */
  async syncChoice(choiceData) {
    try {
      wx.setStorageSync(STORAGE_KEYS.CHOICE_DATA, choiceData);

      const userId = storage.getUserId();
      if (userId) {
        await choiceAPI.submitChoice({
          userId,
          ...choiceData,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步选择数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 同步四个要求数据
   * @param {Object} requirementsData - 要求数据
   */
  async syncRequirements(requirementsData) {
    try {
      wx.setStorageSync(STORAGE_KEYS.REQUIREMENTS_DATA, requirementsData);

      const userId = storage.getUserId();
      if (userId) {
        await requirementsAPI.submitRequirements({
          userId,
          ...requirementsData,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步要求数据失败:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * 同步健康七问答案
   * @param {Object} answers - 答案数据
   */
  async syncSevenQuestions(answers) {
    try {
      wx.setStorageSync(STORAGE_KEYS.SEVEN_QUESTIONS_ANSWERS, answers);

      const userId = storage.getUserId();
      if (userId) {
        await sevenQuestionsAPI.submitAnswers({
          userId,
          answers,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('[Sync] 同步七问答案失败:', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = {
  // 常量
  API_BASE_URL,
  STORAGE_KEYS,

  // 请求方法
  request,

  // API模块
  userAPI,
  adminAPI,
  choiceAPI,
  requirementsAPI,
  sevenQuestionsAPI,
  courseAPI,
  backupAPI,
  debugAPI,
  dataAPI,

  // 存储模块
  storage,

  // 同步模块
  sync,
};
