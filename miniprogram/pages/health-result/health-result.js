// pages/health-result/health-result.js
const storage = require('../../utils/storage');

Page({
  data: {
    personalInfo: {},
    selectedSymptoms: [],
    selectedHabits: [],
    targetSymptoms: [],
    threeChoices: [],
    fourRequirements: [],
    analysisResult: null,
    activeTab: 'overview',
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  loadData() {
    // 加载所有数据
    const personalInfo = storage.getPersonalInfo() || {};
    const selectedSymptoms = storage.getSelectedSymptoms() || [];
    const selectedHabits = storage.getSelectedHabits() || [];
    const targetSymptoms = storage.getTargetSymptoms() || [];
    const threeChoices = storage.getThreeChoices() || [];
    const fourRequirements = storage.getFourRequirements() || [];

    this.setData({
      personalInfo,
      selectedSymptoms,
      selectedHabits,
      targetSymptoms,
      threeChoices,
      fourRequirements
    });

    // 生成分析结果
    this.generateAnalysis();
  },

  generateAnalysis() {
    // 模拟生成分析结果
    const { personalInfo, selectedSymptoms, selectedHabits, targetSymptoms } = this.data;

    // 计算健康评分
    let healthScore = 85;
    healthScore -= selectedSymptoms.length * 2;
    healthScore -= selectedHabits.length;
    healthScore = Math.max(30, Math.min(100, healthScore));

    // 分析结果
    const analysisResult = {
      healthScore,
      riskLevel: healthScore >= 70 ? '低风险' : healthScore >= 50 ? '中风险' : '高风险',
      riskColor: healthScore >= 70 ? '#27ae60' : healthScore >= 50 ? '#f39c12' : '#e74c3c',
      
      // 主要问题
      mainIssues: [
        { name: '睡眠质量', score: 65, suggestion: '建议22:30前入睡' },
        { name: '饮食规律', score: 70, suggestion: '定时定量进餐' },
        { name: '运动量', score: 55, suggestion: '每天运动30分钟' },
        { name: '压力管理', score: 60, suggestion: '学习放松技巧' }
      ],

      // 改善建议
      suggestions: [
        { icon: '🌙', title: '睡眠改善', content: '建立规律作息，睡前1小时不看手机' },
        { icon: '🥗', title: '饮食调整', content: '多吃蔬果，减少油腻和甜食' },
        { icon: '🏃', title: '运动计划', content: '每周至少3次中等强度运动' },
        { icon: '🧘', title: '心理调节', content: '学习冥想，保持良好心态' }
      ],

      // 中医分析
      tcmAnalysis: {
        constitution: '气虚质',
        qiStatus: '气虚',
        organFunction: '脾胃功能偏弱',
        meridian: '脾经、胃经需调理',
        yinYang: '阳气不足',
        dampHeat: '无明显湿热'
      }
    };

    this.setData({
      analysisResult,
      loading: false
    });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 保存方案
  savePlan() {
    wx.showToast({
      title: '方案已保存',
      icon: 'success'
    });
  },

  // 分享结果
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 查看详情
  viewDetail(e) {
    const type = e.currentTarget.dataset.type;
    wx.showToast({
      title: '详情开发中',
      icon: 'none'
    });
  },

  // 重新检测
  recheck() {
    wx.showModal({
      title: '重新检测',
      content: '确定要重新进行健康自检吗？这将清除当前数据。',
      success: (res) => {
        if (res.confirm) {
          storage.clearAllData();
          wx.reLaunch({
            url: '/pages/index/index'
          });
        }
      }
    });
  }
});
