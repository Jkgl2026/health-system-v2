// pages/admin/login/login.js
// 管理员登录页面

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
      // 检查云开发是否可用
      if (wx.cloud) {
        // 尝试调用云函数
        const result = await this.callCloudLogin(password);
        
        if (result.success) {
          this.loginSuccess();
        } else {
          this.loginFailed(result.error || '密码错误');
        }
      } else {
        // 云开发不可用，使用本地验证
        this.localLogin(password);
      }
    } catch (error) {
      console.error('登录失败:', error);
      // 云函数调用失败，降级到本地验证
      this.localLogin(password);
    }
  },

  // 调用云函数登录
  callCloudLogin(password) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'adminAuth',
        data: { password },
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

  // 本地验证登录（备选方案）
  localLogin(password) {
    // 默认密码 admin123
    if (password === 'admin123') {
      this.loginSuccess();
    } else {
      this.loginFailed('密码错误，默认密码: admin123');
    }
  },

  // 登录成功
  loginSuccess() {
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
