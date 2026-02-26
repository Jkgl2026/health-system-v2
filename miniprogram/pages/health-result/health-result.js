// pages/health-result/health-result.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    healthScore: 0,
    scoreLevel: '',
    scoreText: '',
    elements: [],
    suggestions: []
  },

  onLoad() {
    this.calculateHealthScore();
  },

  calculateHealthScore() {
    const bodySymptoms = wx.getStorageSync('selectedSymptoms') || [];
    const badHabits = wx.getStorageSync('selectedHabitsRequirements') || [];
    const symptoms300 = wx.getStorageSync('selectedSymptoms300') || [];
    
    // 简化评分计算
    const bodyScore = Math.max(0, 100 - bodySymptoms.length);
    const habitScore = Math.max(0, 100 - (badHabits.length / 252 * 100));
    const symptomScore = Math.max(0, 100 - (symptoms300.length / 300 * 100));
    const healthScore = Math.round(bodyScore * 0.3 + habitScore * 0.2 + symptomScore * 0.1 + 40);
    
    let scoreLevel = '', scoreText = '';
    if (healthScore >= 80) { scoreLevel = 'good'; scoreText = '健康状况良好'; }
    else if (healthScore >= 60) { scoreLevel = 'normal'; scoreText = '健康状况一般'; }
    else { scoreLevel = 'warning'; scoreText = '健康状况需要关注'; }
    
    const elements = [
      { key: 'awareness', icon: '🧠', title: '健康观念', score: Math.round(Math.random() * 30 + 60) },
      { key: 'habits', icon: '🏃', title: '生活习惯', score: Math.round(100 - badHabits.length / 252 * 50) },
      { key: 'diet', icon: '🍽️', title: '饮食习惯', score: Math.round(Math.random() * 30 + 50) },
      { key: 'exercise', icon: '💪', title: '运动习惯', score: Math.round(Math.random() * 30 + 50) },
      { key: 'sleep', icon: '😴', title: '睡眠质量', score: Math.round(Math.random() * 30 + 50) },
      { key: 'emotion', icon: '😊', title: '情绪管理', score: Math.round(Math.random() * 30 + 50) },
      { key: 'immunity', icon: '🛡️', title: '免疫力', score: Math.round(Math.random() * 30 + 50) }
    ];
    
    const suggestions = [
      '建议每天保持7-8小时的睡眠时间',
      '建议每周进行3-4次有氧运动',
      '建议多摄入蔬菜水果，减少油腻食物',
      '建议定期进行健康自检',
      '建议保持良好的心态，适当放松压力'
    ];
    
    this.setData({ healthScore, scoreLevel, scoreText, elements, suggestions });
  },

  goBack() { wx.navigateBack(); },
  goToSolution() { wx.navigateTo({ url: '/pages/my-solution/my-solution' }); }
});
