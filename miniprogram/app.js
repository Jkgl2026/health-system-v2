// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-5g8sp1s7313ea0db', // 云开发环境ID
        traceUser: true
      });
      console.log('云开发初始化成功');
    } else {
      console.warn('请使用 2.2.3 或以上的基础库以使用云能力');
    }
    
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
    cloudEnvId: 'cloud1-5g8sp1s7313ea0db'
  }
});
