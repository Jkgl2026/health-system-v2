// pages/admin/login/login.js
// 管理员登录页面 - 使用云函数

const cloudFunctions = require('../../../utils/cloud-functions');

Page({
  data: {
    password: '',
    showPassword: false,
    loading: false
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
    const { password } = this.data;

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 调用云函数验证密码
      const result = await cloudFunctions.adminLogin(password);
      
      if (result.success) {
        // 保存登录状态
        wx.setStorageSync('adminLoggedIn', true);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000
        });

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/admin-dashboard/admin-dashboard'
          });
        }, 1000);
      } else {
        wx.showToast({
          title: result.error || '密码错误',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
