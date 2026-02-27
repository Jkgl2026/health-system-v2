// pages/index/index.js
// 首页逻辑 - 基于Web版page.tsx精确转换

const storage = require('../../utils/storage');
const healthDataUtil = require('../../utils/health-data');

Page({
  data: {
    // 页面状态
    currentPage: 1, // 1 = 健康评分页，2 = 介绍页
    expandedCard: null, // 展开的卡片
    isLoading: true,
    
    // 健康数据
    hasHealthData: false,
    isDemoMode: false,
    healthData: {
      userInfo: null,
      totalSymptoms: 0,
      targetSymptoms: 0,
      targetSymptomNames: [],
      choice: '',
      healthScore: 0,
      bodySymptomsCount: 0,
      badHabitsCount: 0,
      symptoms300Count: 0,
      bodySymptomNames: [],
      badHabitNames: [],
      symptoms300Names: []
    },
    
    // 功能特点
    features: [
      {
        icon: '📊',
        title: '症状自检',
        description: '通过100项身体语言简表，全面了解您的健康状况'
      },
      {
        icon: '📖',
        title: '系统解析',
        description: '深入了解症状背后的健康要素和原因'
      },
      {
        icon: '❤️',
        title: '持续跟进',
        description: '通过七问体系，持续跟踪和改善健康'
      },
      {
        icon: '🛡️',
        title: '科学方案',
        description: '基于科学原理，提供个性化的健康管理方案'
      }
    ],
    
    // 自检流程
    steps: [
      {
        icon: '✅',
        title: '填简表',
        description: '勾选半年内出现的症状'
      },
      {
        icon: '🎯',
        title: '针对症状',
        description: '深入分析最困扰的症状'
      },
      {
        icon: '📖',
        title: '了解原理',
        description: '学习健康要素的科学原理'
      },
      {
        icon: '✓',
        title: '获得方案',
        description: '获得个性化的健康管理方案'
      }
    ]
  },

  onLoad() {
    this.checkHealthData();
  },

  onShow() {
    // 每次显示页面时重新检查数据
    this.checkHealthData();
  },

  // 检查健康数据
  checkHealthData() {
    this.setData({ isLoading: true });
    
    try {
      // 读取本地存储的健康数据
      const savedUserInfo = wx.getStorageSync('userInfo');
      const savedSymptoms = wx.getStorageSync('selectedSymptoms') || [];
      const savedBadHabits = wx.getStorageSync('selectedHabitsRequirements') || [];
      const savedSymptoms300 = wx.getStorageSync('selectedSymptoms300') || [];
      const savedTarget = wx.getStorageSync('targetSymptoms') || wx.getStorageSync('targetSymptom') || [];
      const savedChoice = wx.getStorageSync('selectedChoice') || '';
      
      // 计算症状总数
      const totalSymptoms = savedSymptoms.length + savedBadHabits.length + savedSymptoms300.length;
      
      // 计算健康评分（简化版本，实际应该使用统一的计算器）
      const healthScore = this.calculateHealthScore(savedSymptoms, savedBadHabits, savedSymptoms300);
      
      // 获取症状名称
      const bodySymptomNames = savedSymptoms.map(id => {
        const symptom = healthDataUtil.BODY_SYMPTOMS.find(s => s.id === id);
        return symptom ? symptom.name : '';
      }).filter(name => name);
      
      // 获取习惯名称
      const badHabitNames = savedBadHabits.map(id => {
        for (const category of Object.keys(healthDataUtil.BAD_HABITS_CHECKLIST)) {
          const habits = healthDataUtil.BAD_HABITS_CHECKLIST[category];
          const habit = habits.find(h => h.id === id);
          if (habit) return habit.habit;
        }
        return '';
      }).filter(name => name);
      
      // 获取300症状名称
      const symptoms300Names = savedSymptoms300.map(id => {
        const symptom = healthDataUtil.BODY_SYMPTOMS_300.find(s => s.id === id);
        return symptom ? symptom.name : '';
      }).filter(name => name);
      
      // 获取重点症状名称
      const targetSymptomNames = savedTarget.map(id => {
        const symptom = healthDataUtil.BODY_SYMPTOMS.find(s => s.id === id);
        return symptom ? symptom.name : '';
      }).filter(name => name);
      
      // 只要有任何数据就显示概览
      const hasData = savedSymptoms.length > 0 || savedBadHabits.length > 0 || savedSymptoms300.length > 0;
      
      this.setData({
        hasHealthData: hasData,
        isLoading: false,
        healthData: {
          userInfo: savedUserInfo,
          totalSymptoms,
          targetSymptoms: Array.isArray(savedTarget) ? savedTarget.length : 0,
          targetSymptomNames,
          choice: savedChoice,
          healthScore,
          bodySymptomsCount: savedSymptoms.length,
          badHabitsCount: savedBadHabits.length,
          symptoms300Count: savedSymptoms300.length,
          bodySymptomNames,
          badHabitNames,
          symptoms300Names
        }
      });
    } catch (error) {
      console.error('Failed to check health data:', error);
      this.setData({
        hasHealthData: false,
        isLoading: false
      });
    }
  },

  // 计算健康评分
  calculateHealthScore(bodySymptoms, badHabits, symptoms300) {
    // 简化版健康评分计算
    // 权重：身体语言简表30%、不良生活习惯20%、300症状表10%
    const bodyScore = Math.max(0, 100 - (bodySymptoms.length / 100) * 100);
    const habitScore = Math.max(0, 100 - (badHabits.length / 252) * 100);
    const symptomScore = Math.max(0, 100 - (symptoms300.length / 300) * 100);
    
    const score = bodyScore * 0.3 + habitScore * 0.2 + symptomScore * 0.1 + 40;
    return Math.round(Math.min(100, Math.max(0, score)));
  },

  // 加载演示数据
  loadDemoData() {
    const demoUserInfo = {
      name: '演示用户',
      age: 35,
      gender: '男',
      height: 175,
      weight: 70,
      bmi: 22.86
    };
    
    const demoSymptoms = [1, 5, 10, 15, 20];
    const demoBadHabits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const demoSymptoms300 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const demoTarget = [1, 5, 10];
    
    // 保存演示数据到本地存储
    wx.setStorageSync('userInfo', demoUserInfo);
    wx.setStorageSync('selectedSymptoms', demoSymptoms);
    wx.setStorageSync('selectedHabitsRequirements', demoBadHabits);
    wx.setStorageSync('selectedSymptoms300', demoSymptoms300);
    wx.setStorageSync('targetSymptoms', demoTarget);
    wx.setStorageSync('selectedChoice', '调理方案A');
    
    // 重新检查数据
    this.checkHealthData();
    
    wx.showToast({
      title: '演示数据已加载',
      icon: 'success'
    });
  },

  // 切换卡片展开状态
  toggleCard(e) {
    const card = e.currentTarget.dataset.card;
    this.setData({
      expandedCard: this.data.expandedCard === card ? null : card
    });
  },

  // 跳转到个人信息页
  goToPersonalInfo() {
    wx.navigateTo({
      url: '/pages/personal-info/personal-info'
    });
  },

  // 跳转到我的方案页
  goToMySolution() {
    wx.switchTab({
      url: '/pages/my-solution/my-solution'
    });
  },

  // 跳转到安装指南页
  goToInstallGuide() {
    wx.navigateTo({
      url: '/pages/install-guide/install-guide'
    });
  },

  // 切换到第一页
  goToPage1() {
    this.setData({ currentPage: 1 });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 切换到第二页
  goToPage2() {
    this.setData({ currentPage: 2 });
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '健康自我管理 - 把健康把握在自己手里',
      path: '/pages/index/index'
    };
  }
});
