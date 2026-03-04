// pages/admin-login/admin-login.js
// 管理员登录页面 - 安全版本

Page({
  data: {
    username: '',
    password: '',
    errorMsg: '',
    loading: false
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value, errorMsg: '' });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value, errorMsg: '' });
  },

  async handleLogin() {
    const { username, password } = this.data;
    
    if (!username.trim()) {
      this.setData({ errorMsg: '请输入用户名' });
      return;
    }
    
    if (!password.trim()) {
      this.setData({ errorMsg: '请输入密码' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const result = await this.callCloudLogin(username, password);
      
      if (result.success) {
        wx.setStorageSync('adminLoggedIn', true);
        wx.setStorageSync('adminInfo', result.adminInfo);
        wx.redirectTo({ url: '/pages/admin-dashboard/admin-dashboard' });
      } else {
        this.setData({ errorMsg: result.error || '登录失败', loading: false });
      }
    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ errorMsg: '登录失败，请检查网络连接', loading: false });
    }
  },

  callCloudLogin(username, password) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminAuth',
        data: { username, password },
        success: (res) => resolve(res.result),
        fail: (err) => reject(err)
      });
    });
  }
});
