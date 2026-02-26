// pages/admin-login/admin-login.js
const app = getApp();

Page({
  data: {
    password: '',
    errorMsg: ''
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value, errorMsg: '' });
  },

  handleLogin() {
    const { password } = this.data;
    
    if (!password) {
      this.setData({ errorMsg: '请输入密码' });
      return;
    }
    
    if (password === app.globalData.adminPassword) {
      wx.setStorageSync('adminLoggedIn', true);
      wx.redirectTo({ url: '/pages/admin-dashboard/admin-dashboard' });
    } else {
      this.setData({ errorMsg: '密码错误，请重试' });
    }
  }
});
