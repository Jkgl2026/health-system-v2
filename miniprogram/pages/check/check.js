// pages/check/check.js
// 身体语言简表页逻辑

const healthData = require('../../utils/health-data');

Page({
  data: {
    // 所有症状
    symptoms: [],
    // 分类列表
    categories: [],
    // 当前分类
    currentCategory: 'all',
    // 搜索关键词
    searchQuery: '',
    // 过滤后的症状
    filteredSymptoms: [],
    // 已选症状ID列表
    selectedIds: [],
    // 已选症状详情
    selectedSymptoms: [],
    // 已选数量
    selectedCount: 0,
    // 进度
    progress: 0
  },

  onLoad() {
    this.initData();
    this.loadSavedData();
  },

  // 初始化数据
  initData() {
    const symptoms = healthData.BODY_SYMPTOMS;
    const categories = healthData.getSymptomCategories();
    
    this.setData({
      symptoms,
      categories,
      filteredSymptoms: symptoms
    });
  },

  // 加载已保存的数据 - 不再自动加载历史数据
  loadSavedData() {
    // 清除历史数据，确保每次填写都是新的开始
    try {
      wx.removeStorageSync('selectedSymptoms');
      wx.removeStorageSync('targetSymptoms');
      console.log('已清除症状历史数据');
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  },

  // 搜索
  onSearch(e) {
    const query = e.detail.value.toLowerCase();
    this.setData({ searchQuery: query });
    this.filterSymptoms();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchQuery: '' });
    this.filterSymptoms();
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.filterSymptoms();
  },

  // 过滤症状
  filterSymptoms() {
    const { symptoms, currentCategory, searchQuery } = this.data;
    let filtered = symptoms;
    
    // 按分类过滤
    if (currentCategory !== 'all') {
      filtered = filtered.filter(s => s.category === currentCategory);
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery)
      );
    }
    
    this.setData({ filteredSymptoms: filtered });
  },

  // 判断是否选中
  isSelected(id) {
    return this.data.selectedIds.includes(id);
  },

  // 切换选中状态
  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const { selectedIds, symptoms } = this.data;
    const index = selectedIds.indexOf(id);
    
    if (index > -1) {
      // 取消选中
      selectedIds.splice(index, 1);
    } else {
      // 选中
      selectedIds.push(id);
    }
    
    const selectedSymptoms = selectedIds.map(id => 
      symptoms.find(s => s.id === id)
    ).filter(s => s);
    
    this.setData({
      selectedIds,
      selectedSymptoms,
      selectedCount: selectedIds.length,
      progress: (selectedIds.length / 100) * 100
    });
    
    // 自动保存
    wx.setStorageSync('selectedSymptoms', selectedIds);
  },

  // 移除症状
  removeSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const { selectedIds, symptoms } = this.data;
    const index = selectedIds.indexOf(id);
    
    if (index > -1) {
      selectedIds.splice(index, 1);
      
      const selectedSymptoms = selectedIds.map(id => 
        symptoms.find(s => s.id === id)
      ).filter(s => s);
      
      this.setData({
        selectedIds,
        selectedSymptoms,
        selectedCount: selectedIds.length,
        progress: (selectedIds.length / 100) * 100
      });
      
      wx.setStorageSync('selectedSymptoms', selectedIds);
    }
  },

  // 上一步
  goBack() {
    wx.navigateBack();
  },

  // 下一步 - 跳过不良生活习惯和300症状，直接进入健康七问
  goNext() {
    // 保存选择的症状
    wx.setStorageSync('selectedSymptoms', this.data.selectedIds);
    
    // 跳转到健康七问页面
    wx.navigateTo({
      url: '/pages/seven-questions/seven-questions'
    });
  }
});
