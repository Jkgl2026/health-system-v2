// pages/check/check.js
// 身体语言简表页逻辑 - 1:1复刻Web版check/page.tsx

const healthData = require('../../utils/health-data');

Page({
  data: {
    // 当前步骤：intro / select / confirm
    currentStep: 'intro',
    
    // 所有症状数据
    allSymptoms: [],
    totalSymptoms: 100,
    
    // 分类数据
    categories: [],
    
    // 已选症状（数组形式，存储ID）
    selectedSymptoms: [],
    selectedCount: 0,
    progress: 0,
    
    // 目标症状（重点改善的症状，1-3个）
    targetSymptoms: [],
    targetSymptomList: [],
    
    // 已选症状详情列表（用于confirm页面展示）
    selectedSymptomList: [],
    
    // 状态
    isSaving: false,
    saveError: null,
    lastSaveTime: null
  },

  onLoad() {
    this.initData();
    this.loadSavedData();
  },

  // 初始化数据
  initData() {
    const allSymptoms = healthData.BODY_SYMPTOMS || [];
    
    // 按类别分组
    const symptomsByCategory = {};
    allSymptoms.forEach(symptom => {
      if (!symptomsByCategory[symptom.category]) {
        symptomsByCategory[symptom.category] = [];
      }
      symptomsByCategory[symptom.category].push(symptom);
    });
    
    // 构建分类数组
    const categories = Object.keys(symptomsByCategory).map(name => ({
      name,
      symptoms: symptomsByCategory[name],
      totalCount: symptomsByCategory[name].length,
      selectedCount: 0,
      isAllSelected: false
    }));
    
    this.setData({
      allSymptoms,
      categories,
      totalSymptoms: allSymptoms.length
    });
  },

  // 加载已保存的数据 - 清除历史数据，确保每次都是新开始
  loadSavedData() {
    try {
      wx.removeStorageSync('selectedSymptoms');
      wx.removeStorageSync('targetSymptoms');
      console.log('已清除症状历史数据，开始新的填写');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  },

  // 处理继续按钮
  handleContinue() {
    const { currentStep, selectedCount, targetSymptoms } = this.data;
    
    if (currentStep === 'intro') {
      // 从介绍页进入选择页
      this.setData({ currentStep: 'select' });
    } else if (currentStep === 'select') {
      // 从选择页进入确认页
      if (selectedCount === 0) {
        wx.showToast({
          title: '请至少选择一项症状',
          icon: 'none'
        });
        return;
      }
      
      // 构建已选症状详情列表
      const selectedSymptomList = this.data.selectedSymptoms.map(id => {
        return this.data.allSymptoms.find(s => s.id === id);
      }).filter(s => s);
      
      this.setData({ 
        currentStep: 'confirm',
        selectedSymptomList
      });
    } else if (currentStep === 'confirm') {
      // 从确认页提交数据
      if (targetSymptoms.length === 0) {
        wx.showToast({
          title: '请至少选择一个最想改善的症状',
          icon: 'none'
        });
        return;
      }
      
      this.saveAndNavigate();
    }
  },

  // 保存数据并跳转
  async saveAndNavigate() {
    this.setData({ isSaving: true, saveError: null });
    
    try {
      // 保存到本地存储
      wx.setStorageSync('selectedSymptoms', this.data.selectedSymptoms);
      wx.setStorageSync('targetSymptoms', this.data.targetSymptoms);
      
      // 更新最后保存时间
      this.setData({ 
        lastSaveTime: Date.now(),
        isSaving: false 
      });
      
      // 跳转到健康七问页面
      wx.navigateTo({
        url: '/pages/seven-questions/seven-questions'
      });
    } catch (error) {
      console.error('保存数据失败:', error);
      this.setData({ 
        isSaving: false,
        saveError: {
          message: error.message || '保存失败，请重试'
        }
      });
    }
  },

  // 重试保存
  handleRetry() {
    this.handleContinue();
  },

  // 切换症状选中状态
  handleSymptomToggle(e) {
    const id = e.currentTarget.dataset.id;
    const selectedSymptoms = this.data.selectedSymptoms.slice();
    const index = selectedSymptoms.indexOf(id);
    
    if (index > -1) {
      selectedSymptoms.splice(index, 1);
    } else {
      selectedSymptoms.push(id);
    }
    
    this.updateSelectedData(selectedSymptoms);
    
    // 自动保存
    wx.setStorageSync('selectedSymptoms', selectedSymptoms);
    this.setData({ lastSaveTime: Date.now() });
  },

  // 全选某个分类
  handleSelectCategory(e) {
    const categoryName = e.currentTarget.dataset.category;
    const category = this.data.categories.find(c => c.name === categoryName);
    
    if (category) {
      const selectedSymptoms = this.data.selectedSymptoms.slice();
      category.symptoms.forEach(symptom => {
        if (!selectedSymptoms.includes(symptom.id)) {
          selectedSymptoms.push(symptom.id);
        }
      });
      this.updateSelectedData(selectedSymptoms);
    }
  },

  // 清空某个分类
  handleDeselectCategory(e) {
    const categoryName = e.currentTarget.dataset.category;
    const category = this.data.categories.find(c => c.name === categoryName);
    
    if (category) {
      const categoryIds = category.symptoms.map(s => s.id);
      const selectedSymptoms = this.data.selectedSymptoms.filter(id => 
        !categoryIds.includes(id)
      );
      this.updateSelectedData(selectedSymptoms);
    }
  },

  // 更新选中数据和相关统计
  updateSelectedData(selectedSymptoms) {
    const selectedCount = selectedSymptoms.length;
    const progress = (selectedCount / this.data.totalSymptoms) * 100;
    
    // 更新分类统计
    const categories = this.data.categories.map(category => {
      const categoryIds = category.symptoms.map(s => s.id);
      const selectedInCategory = selectedSymptoms.filter(id => 
        categoryIds.includes(id)
      ).length;
      
      return {
        ...category,
        selectedCount: selectedInCategory,
        isAllSelected: selectedInCategory === category.totalCount
      };
    });
    
    this.setData({
      selectedSymptoms,
      selectedCount,
      progress,
      categories
    });
  },

  // 选择重点改善的症状
  handleTargetToggle(e) {
    const id = e.currentTarget.dataset.id;
    const targetSymptoms = this.data.targetSymptoms.slice();
    const index = targetSymptoms.indexOf(id);
    
    // 如果已经选中，则取消选中
    if (index > -1) {
      targetSymptoms.splice(index, 1);
    } else {
      // 如果未选中且未超过3个，则选中
      if (targetSymptoms.length >= 3) {
        wx.showToast({
          title: '最多只能选择3个重点改善的症状',
          icon: 'none'
        });
        return;
      }
      targetSymptoms.push(id);
    }
    
    // 构建目标症状详情列表
    const targetSymptomList = targetSymptoms.map(id => {
      return this.data.allSymptoms.find(s => s.id === id);
    }).filter(s => s);
    
    this.setData({ 
      targetSymptoms,
      targetSymptomList
    });
    
    // 自动保存
    wx.setStorageSync('targetSymptoms', targetSymptoms);
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
