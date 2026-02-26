// pages/index/index.js
const storage = require('../../utils/storage');
const healthData = require('../../utils/health-data');

Page({
  data: {
    hasHealthData: false,
    healthData: null,
    isLoading: true,
    expandedCard: null
  },

  onLoad() {
    this.loadHealthData();
  },

  onShow() {
    // 每次显示时重新加载数据
    this.loadHealthData();
  },

  loadHealthData() {
    this.setData({ isLoading: true });

    try {
      // 读取存储的健康数据
      const userInfo = storage.getUserInfo();
      const bodySymptoms = storage.getSelectedSymptoms();
      const badHabits = storage.getSelectedHabits();
      const symptoms300 = storage.getSelectedSymptoms300();
      const targetSymptoms = storage.getTargetSymptoms();
      const selectedChoice = storage.getSelectedChoice();

      // 计算健康评分
      const scoreResult = healthData.calculateHealthScore(bodySymptoms, badHabits, symptoms300);

      // 获取症状名称
      const bodySymptomNames = bodySymptoms.map(id => healthData.getSymptomNameById(id)).filter(name => name);
      const badHabitNames = badHabits.map(id => healthData.getHabitNameById(id)).filter(name => name);
      const targetSymptomNames = targetSymptoms.map(id => healthData.getSymptomNameById(id)).filter(name => name);

      // 计算总数
      const totalSymptoms = bodySymptoms.length + badHabits.length + symptoms300.length;

      const hasData = bodySymptoms.length > 0 || badHabits.length > 0 || symptoms300.length > 0;

      this.setData({
        hasHealthData: hasData,
        healthData: {
          userInfo: userInfo,
          healthScore: scoreResult.score,
          bodySymptomsCount: bodySymptoms.length,
          badHabitsCount: badHabits.length,
          symptoms300Count: symptoms300.length,
          targetSymptomsCount: targetSymptoms.length,
          totalSymptoms: totalSymptoms,
          bodySymptomNames: bodySymptomNames.slice(0, 10),
          badHabitNames: badHabitNames.slice(0, 10),
          targetSymptomNames: targetSymptomNames
        },
        isLoading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      this.setData({
        hasHealthData: false,
        isLoading: false
      });
    }
  },

  // 切换卡片展开状态
  toggleCard(e) {
    const card = e.currentTarget.dataset.card;
    this.setData({
      expandedCard: this.data.expandedCard === card ? null : card
    });
  },

  // 开始自检
  startCheck() {
    wx.navigateTo({
      url: '/pages/personal-info/personal-info'
    });
  },

  // 查看完整方案
  viewSolution() {
    wx.switchTab({
      url: '/pages/my-solution/my-solution'
    });
  },

  // 查看健康分析结果
  viewHealthResult() {
    wx.navigateTo({
      url: '/pages/health-result/health-result'
    });
  },

  // 演示模式
  loadDemoData() {
    const demoUserInfo = {
      name: "演示用户",
      age: 35,
      gender: "男",
      height: 175,
      weight: 70,
      bmi: 22.86
    };

    const demoBodySymptoms = [1, 5, 10, 15, 20];
    const demoBadHabits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const demoSymptoms300 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    const demoTargetSymptoms = [1, 5, 10];

    // 保存演示数据
    storage.saveUserInfo(demoUserInfo);
    storage.saveSelectedSymptoms(demoBodySymptoms);
    storage.saveSelectedHabits(demoBadHabits);
    storage.saveSelectedSymptoms300(demoSymptoms300);
    storage.saveTargetSymptoms(demoTargetSymptoms);

    // 重新加载
    this.loadHealthData();

    wx.showToast({
      title: '演示数据已加载',
      icon: 'success'
    });
  },

  // 清除数据
  clearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有健康数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.clearHealthData();
          this.loadHealthData();
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },

// 底部导航
  goHome() {
    // 当前已在首页
  },

  goSolution() {
    wx.navigateTo({
      url: '/pages/my-solution/my-solution'
    });
  },

  goAdmin() {
    wx.navigateTo({
      url: '/pages/admin/login/login'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '健康自检 - 把健康把握在自己手里',
      path: '/pages/index/index'
    };
  }
});
