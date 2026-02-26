// pages/my-solution/my-solution.js
const storage = require('../../utils/storage');

Page({
  data: {
    hasData: false,
    personalInfo: null,
    analysisResult: null,
    loading: true
  },

  onLoad() {
    this.loadSolution();
  },

  onShow() {
    this.loadSolution();
  },

  loadSolution() {
    const personalInfo = storage.getPersonalInfo();
    const selectedSymptoms = storage.getSelectedSymptoms();
    const selectedHabits = storage.getSelectedHabits();

    const hasData = personalInfo && Object.keys(personalInfo).length > 0;

    if (hasData) {
      // 生成方案
      const healthScore = this.calculateHealthScore(selectedSymptoms, selectedHabits);
      
      this.setData({
        hasData: true,
        personalInfo,
        analysisResult: {
          healthScore,
          riskLevel: healthScore >= 70 ? '低风险' : healthScore >= 50 ? '中风险' : '高风险',
          riskColor: healthScore >= 70 ? '#27ae60' : healthScore >= 50 ? '#f39c12' : '#e74c3c',
          updateDate: new Date().toLocaleDateString()
        },
        loading: false
      });
    } else {
      this.setData({
        hasData: false,
        loading: false
      });
    }
  },

  calculateHealthScore(symptoms, habits) {
    let score = 85;
    score -= symptoms.length * 2;
    score -= habits.length;
    return Math.max(30, Math.min(100, score));
  },

  // 开始检测
  startCheck() {
    wx.navigateTo({
      url: '/pages/personal-info/personal-info'
    });
  },

  // 查看详情
  viewDetail() {
    wx.navigateTo({
      url: '/pages/health-result/health-result'
    });
  },

  // 分享
  onShare() {
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  // 下载报告
  downloadReport() {
    wx.showToast({
      title: '报告生成中...',
      icon: 'loading'
    });

    setTimeout(() => {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }, 1500);
  },

  // 重新检测
  recheck() {
    wx.showModal({
      title: '重新检测',
      content: '确定要重新进行健康自检吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData();
          this.setData({ hasData: false, personalInfo: null, analysisResult: null });
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});
