// pages/my-solution/my-solution.js
Page({
  data: {
    userInfo: {},
    healthScore: 0,
    targetSymptoms: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const bodySymptoms = wx.getStorageSync('selectedSymptoms') || [];
    const badHabits = wx.getStorageSync('selectedHabitsRequirements') || [];
    const symptoms300 = wx.getStorageSync('selectedSymptoms300') || [];
    const targetIds = wx.getStorageSync('targetSymptoms') || [];
    
    const healthScore = Math.round(Math.max(0, 100 - bodySymptoms.length * 0.5 - badHabits.length * 0.2 - symptoms300.length * 0.1));
    
    const healthData = require('../../utils/health-data');
    const targetSymptoms = targetIds.map(id => {
      const s = healthData.BODY_SYMPTOMS.find(s => s.id === id);
      return s ? s.name : '';
    }).filter(n => n);
    
    this.setData({ userInfo, healthScore, targetSymptoms });
  },

  goToStory() {
    wx.navigateTo({ url: '/pages/story/story' });
  }
});
