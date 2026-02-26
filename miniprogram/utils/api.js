// utils/api.js
// API请求封装 - 与Web版后端API对接

const app = getApp();

// API基础配置 - 小程序需要使用后端服务器的实际地址
// 开发环境使用本地地址，生产环境需要替换为实际服务器地址
const API_BASE_URL = 'http://localhost:5000';

/**
 * 封装请求方法
 * @param {string} url - 请求路径
 * @param {object} options - 请求选项
 * @returns {Promise}
 */
const request = (url, options = {}) => {
  const {
    method = 'GET',
    data = {},
    header = {},
    showLoading = false,
    showError = true
  } = options;

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('adminToken');
          if (showError) {
            wx.showToast({ title: '请重新登录', icon: 'none' });
          }
          reject(res);
        } else {
          if (showError) {
            wx.showToast({ title: res.data?.error || '请求失败', icon: 'none' });
          }
          reject(res);
        }
      },
      fail: (err) => {
        if (showLoading) {
          wx.hideLoading();
        }
        if (showError) {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
        reject(err);
      }
    });
  });
};

// GET请求
const get = (url, options = {}) => {
  return request(url, { ...options, method: 'GET' });
};

// POST请求
const post = (url, data, options = {}) => {
  return request(url, { ...options, method: 'POST', data });
};

// PUT请求
const put = (url, data, options = {}) => {
  return request(url, { ...options, method: 'PUT', data });
};

// DELETE请求
const del = (url, options = {}) => {
  return request(url, { ...options, method: 'DELETE' });
};

// 下载文件
const download = (url, filename) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: `${API_BASE_URL}${url}`,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              wx.showToast({ title: '下载成功', icon: 'success' });
              resolve(saveRes.savedFilePath);
            },
            fail: reject
          });
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
};

// API接口封装
const api = {
  // ========== 用户相关 ==========
  
  // 创建/更新用户信息
  saveUser(data) {
    return post('/api/user', data);
  },

  // 获取当前用户信息
  getCurrentUser() {
    return get('/api/user');
  },

  // 获取用户历史记录
  getUserHistory() {
    return get('/api/user/history');
  },

  // ========== 健康数据相关 ==========

  // 提交健康分析
  submitHealthAnalysis(data) {
    return post('/api/health-analysis', data);
  },

  // 获取症状匹配
  symptomCheck(data) {
    return post('/api/symptom-check', data);
  },

  // ========== 三个选择相关 ==========

  // 保存三个选择
  saveChoice(data) {
    return post('/api/user-choice', data);
  },

  // ========== 四个要求相关 ==========

  // 获取四个要求
  getRequirements(userId) {
    return get(`/api/requirements?userId=${userId}`);
  },

  // 保存四个要求
  saveRequirements(data) {
    return post('/api/requirements', data);
  },

  // ========== 后台管理相关 ==========

  // 管理员登录
  adminLogin(password) {
    return post('/api/admin/login', { password });
  },

  // 获取统计数据
  getAdminStats() {
    return get('/api/admin/users');
  },

  // 获取用户列表
  getUsers() {
    return get('/api/admin/users');
  },

  // 获取用户详情
  getUserDetail(userId) {
    return get(`/api/admin/users/${userId}`);
  },

  // 删除用户
  deleteUser(userId) {
    return del(`/api/admin/users/${userId}`);
  },

  // 导出数据
  exportData() {
    return download('/api/admin/export', 'users.json');
  },

  // 清空数据
  clearData() {
    return post('/api/admin/maintenance', { action: 'clear_all' });
  },

  // ========== 课程推荐 ==========

  // 获取推荐课程
  getRecommendedCourses(symptoms) {
    return post('/api/courses/recommend', { symptoms });
  }
};

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  download,
  api,
  API_BASE_URL
};
