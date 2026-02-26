// app.js
App({
  onLaunch() {
    // 初始化
    console.log('健康自检小程序启动');
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  globalData: {
    userInfo: null,
    // API基础地址 - 部署时修改为实际域名
    baseUrl: 'https://your-domain.com',
    // 本地开发时可以使用
    // baseUrl: 'http://localhost:5000',
  }
});
