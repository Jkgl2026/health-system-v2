// pages/admin/login/login.js
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
  onLogin() {
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

    // 模拟登录验证
    setTimeout(() => {
      // 默认管理员账号：admin / admin123
      if (username === 'admin' && password === 'admin123') {
        // 保存登录状态
        wx.setStorageSync('adminLoggedIn', true);
        
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
          title: '用户名或密码错误',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    }, 1000);
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
