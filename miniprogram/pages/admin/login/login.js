// pages/admin/login/login.js
// 管理员登录页面 - 安全版本

Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    loading: false
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 登录
  async onLogin() {
    const { username, password } = this.data;

    // 参数校验
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 必须通过云函数验证，不提供本地降级
      const result = await this.callCloudLogin(username, password);
      
      if (result.success) {
        this.loginSuccess(result.adminInfo);
      } else {
        this.loginFailed(result.error || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      this.loginFailed('登录失败，请检查网络连接后重试');
    }
  },

  // 调用云函数登录
  callCloudLogin(username, password) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminAuth',
        data: { username, password },
        success: (res) => {
          resolve(res.result);
        },
        fail: (err) => {
          console.error('云函数调用失败:', err);
          reject(err);
        }
      });
    });
  },

  // 登录成功
  loginSuccess(adminInfo) {
    // 保存登录状态和管理员信息
    wx.setStorageSync('adminLoggedIn', true);
    wx.setStorageSync('adminInfo', adminInfo);
    
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/admin/dashboard/dashboard'
      });
    }, 1000);
  },

  // 登录失败
  loginFailed(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
    this.setData({ loading: false });
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
