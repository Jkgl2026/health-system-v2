// utils/api.js - API请求工具

const app = getApp();

/**
 * 封装请求方法
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const baseUrl = app.globalData.baseUrl;
    const url = options.url.startsWith('http') ? options.url : baseUrl + options.url;
    
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，清除登录状态
          wx.removeStorageSync('admin_access_token');
          wx.removeStorageSync('admin_refresh_token');
          reject(new Error('未授权，请重新登录'));
        } else {
          reject(new Error(res.data?.error || '请求失败'));
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络错误'));
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}) {
  return request({
    url: url,
    method: 'GET',
    data: data
  });
}

/**
 * POST请求
 */
function post(url, data = {}) {
  return request({
    url: url,
    method: 'POST',
    data: data
  });
}

/**
 * 用户相关API
 */
const userApi = {
  // 保存用户信息
  saveUserInfo(data) {
    return post('/api/user', data);
  },
  
  // 获取用户信息
  getUserInfo(userId) {
    return get(`/api/user/${userId}`);
  },
  
  // 获取用户历史记录
  getUserHistory(phone) {
    return get('/api/user/history', { phone });
  }
};

/**
 * 健康检查相关API
 */
const healthApi = {
  // 提交症状检查
  submitSymptomCheck(data) {
    return post('/api/symptom-check', data);
  },
  
  // 获取健康分析结果
  getHealthResult(userId) {
    return get(`/api/health-result/${userId}`);
  }
};

/**
 * 管理员相关API
 */
const adminApi = {
  // 登录
  login(username, password) {
    return post('/api/admin/login', { username, password });
  },
  
  // 验证登录状态
  verify() {
    return get('/api/admin/verify');
  },
  
  // 登出
  logout() {
    return post('/api/admin/logout');
  },
  
  // 获取用户列表
  getUsers(page = 1, limit = 20, search = '') {
    return get('/api/admin/users', { page, limit, search });
  },
  
  // 获取用户详情
  getUserDetail(userId) {
    return get(`/api/admin/users/${userId}`);
  },
  
  // 导出数据
  exportData() {
    return get('/api/admin/export');
  }
};

module.exports = {
  request,
  get,
  post,
  userApi,
  healthApi,
  adminApi
};
