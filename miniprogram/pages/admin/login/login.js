// pages/admin/login/login.js
const { adminAPI } = require('../../utils/api');

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
      // 尝试调用真实API
      const result = await adminAPI.login(username, password);
      
      if (result && result.success) {
        // 保存登录状态
        wx.setStorageSync('adminLoggedIn', true);
        wx.setStorageSync('adminInfo', JSON.stringify(result.admin || {}));
        
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
      }
    } catch (error) {
      console.error('登录失败:', error);
      
      // 离线模式：使用默认管理员账号
      if (username === 'admin' && password === 'admin123') {
        wx.setStorageSync('adminLoggedIn', true);
        wx.setStorageSync('adminInfo', JSON.stringify({ username: 'admin', role: 'admin' }));
        
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
      } else {
        wx.showToast({
          title: error.message || '用户名或密码错误',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    }
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
