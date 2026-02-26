// pages/requirements/requirements.js
// 四个要求详细任务页逻辑 - Web版精确复刻

const { FOUR_REQUIREMENTS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS_300 } = require('../../utils/health-data');

Page({
  data: {
    activeStep: 'overview',
    visitedSteps: ['overview'],
    requirements: FOUR_REQUIREMENTS,
    
    // 不良习惯表
    badHabitsChecklist: BAD_HABITS_CHECKLIST,
    habitCategories: Object.keys(BAD_HABITS_CHECKLIST),
    selectedHabits: {},
    selectedHabitsCount: 0,
    
    // 300症状表
    symptomsByCategory: {},
    symptomCategories: [],
    selectedSymptoms: {},
    selectedSymptomsCount: 0,
    
    canContinue: false,
    isSaving: false
  },

  onLoad() {
    // 处理300症状按分类分组
    const symptomsByCategory = {};
    BODY_SYMPTOMS_300.forEach(symptom => {
      if (!symptomsByCategory[symptom.category]) {
        symptomsByCategory[symptom.category] = [];
      }
      symptomsByCategory[symptom.category].push(symptom);
    });

    const symptomCategories = Object.keys(symptomsByCategory);

    // 尝试从本地存储恢复数据
    let selectedHabits = {};
    let selectedSymptoms = {};
    
    try {
      const savedHabits = wx.getStorageSync('selectedHabitsRequirements');
      const savedSymptoms = wx.getStorageSync('selectedSymptoms300');
      
      if (savedHabits && Array.isArray(savedHabits)) {
        savedHabits.forEach(id => {
          selectedHabits[id] = true;
        });
      }
      
      if (savedSymptoms && Array.isArray(savedSymptoms)) {
        savedSymptoms.forEach(id => {
          selectedSymptoms[id] = true;
        });
      }
    } catch (e) {
      console.error('恢复数据失败', e);
    }

    this.setData({
      symptomsByCategory,
      symptomCategories,
      selectedHabits,
      selectedSymptoms,
      selectedHabitsCount: Object.keys(selectedHabits).filter(k => selectedHabits[k]).length,
      selectedSymptomsCount: Object.keys(selectedSymptoms).filter(k => selectedSymptoms[k]).length
    });
  },

  // 切换步骤
  handleStepChange(e) {
    const step = e.currentTarget.dataset.step;
    const currentSteps = this.data.visitedSteps;
    
    // 检查是否可以访问该步骤
    if (step === 'overview') {
      // 总览总是可访问
    } else if (step === 'req1-2') {
      if (!currentSteps.includes('overview')) {
        return;
      }
    } else if (step === 'req3') {
      if (!currentSteps.includes('req1-2')) {
        return;
      }
    } else if (step === 'req4') {
      if (!currentSteps.includes('req3')) {
        return;
      }
    }
    
    // 添加到已访问
    if (!currentSteps.includes(step)) {
      currentSteps.push(step);
    }
    
    // 更新是否可以继续
    const canContinue = currentSteps.includes('req1-2') && 
                        currentSteps.includes('req3') && 
                        currentSteps.includes('req4');
    
    this.setData({
      activeStep: step,
      visitedSteps: currentSteps,
      canContinue
    });
  },

  // 切换习惯选择
  toggleHabit(e) {
    const id = e.currentTarget.dataset.id;
    const selectedHabits = { ...this.data.selectedHabits };
    
    if (selectedHabits[id]) {
      delete selectedHabits[id];
    } else {
      selectedHabits[id] = true;
    }
    
    const count = Object.keys(selectedHabits).filter(k => selectedHabits[k]).length;
    
    this.setData({
      selectedHabits,
      selectedHabitsCount: count
    });
    
    // 保存到本地存储
    wx.setStorageSync('selectedHabitsRequirements', Object.keys(selectedHabits).map(Number));
  },

  // 全选习惯
  selectAllHabits() {
    const selectedHabits = {};
    Object.values(BAD_HABITS_CHECKLIST).flat().forEach(habit => {
      selectedHabits[habit.id] = true;
    });
    
    this.setData({
      selectedHabits,
      selectedHabitsCount: Object.keys(selectedHabits).length
    });
    
    wx.setStorageSync('selectedHabitsRequirements', Object.keys(selectedHabits).map(Number));
  },

  // 清空习惯
  clearAllHabits() {
    this.setData({
      selectedHabits: {},
      selectedHabitsCount: 0
    });
    
    wx.setStorageSync('selectedHabitsRequirements', []);
  },

  // 切换症状选择
  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const selectedSymptoms = { ...this.data.selectedSymptoms };
    
    if (selectedSymptoms[id]) {
      delete selectedSymptoms[id];
    } else {
      selectedSymptoms[id] = true;
    }
    
    const count = Object.keys(selectedSymptoms).filter(k => selectedSymptoms[k]).length;
    
    this.setData({
      selectedSymptoms,
      selectedSymptomsCount: count
    });
    
    // 保存到本地存储
    wx.setStorageSync('selectedSymptoms300', Object.keys(selectedSymptoms).map(Number));
  },

  // 全选症状
  selectAllSymptoms() {
    const selectedSymptoms = {};
    BODY_SYMPTOMS_300.forEach(symptom => {
      selectedSymptoms[symptom.id] = true;
    });
    
    this.setData({
      selectedSymptoms,
      selectedSymptomsCount: Object.keys(selectedSymptoms).length
    });
    
    wx.setStorageSync('selectedSymptoms300', Object.keys(selectedSymptoms).map(Number));
  },

  // 清空症状
  clearAllSymptoms() {
    this.setData({
      selectedSymptoms: {},
      selectedSymptomsCount: 0
    });
    
    wx.setStorageSync('selectedSymptoms300', []);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 处理继续按钮
  handleContinue() {
    if (!this.data.canContinue || this.data.isSaving) {
      return;
    }

    this.setData({ isSaving: true });

    // 获取全局数据
    const app = getApp();
    
    // 保存数据到全局
    app.globalData.requirementsData = {
      selectedHabits: Object.keys(this.data.selectedHabits).map(Number),
      selectedSymptoms: Object.keys(this.data.selectedSymptoms).map(Number),
      completedAt: new Date().toISOString()
    };

    // 保存完成状态
    wx.setStorageSync('requirementsCompleted', true);

    setTimeout(() => {
      this.setData({ isSaving: false });
      
      // 跳转到好转反应页面
      wx.redirectTo({
        url: '/pages/healing/healing'
      });
    }, 300);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '健康自检 - 四个要求',
      path: '/pages/index/index'
    };
  }
});
