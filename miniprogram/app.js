// app.js
App({
  onLaunch() {
    // 初始化本地存储
    this.initStorage();
    
    // 检查登录状态
    this.checkLoginStatus();
  },

  initStorage() {
    // 初始化健康数据存储
    const healthData = wx.getStorageSync('healthData');
    if (!healthData) {
      wx.setStorageSync('healthData', {
        personalInfo: null,
        selectedSymptoms: [],
        selectedHabits: [],
        targetSymptoms: [],
        choices: null,
        requirements: null,
        analysisResult: null
      });
    }
  },

  checkLoginStatus() {
    const adminToken = wx.getStorageSync('adminToken');
    this.globalData.isAdminLoggedIn = !!adminToken;
  },

  globalData: {
    userInfo: null,
    isAdminLoggedIn: false,
    apiBaseUrl: 'http://localhost:5000/api'
  }
});
