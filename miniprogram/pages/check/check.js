// pages/check/check.js
const storage = require('../../utils/storage');
const healthData = require('../../utils/health-data');

Page({
  data: {
    categories: [],
    selectedSymptoms: [],
    currentCategory: 0,
    searchKeyword: '',
    filteredSymptoms: [],
    isSearching: false
  },

  onLoad() {
    this.initData();
  },

  initData() {
    // 获取分类
    const categoryNames = Object.keys(healthData.BODY_SYMPTOMS_BY_CATEGORY);
    const categories = categoryNames.map(name => ({
      name: name,
      symptoms: healthData.BODY_SYMPTOMS_BY_CATEGORY[name]
    }));

    // 获取已选择的症状
    const savedSymptoms = storage.getSelectedSymptoms();

    this.setData({
      categories: categories,
      selectedSymptoms: savedSymptoms,
      filteredSymptoms: categories[0]?.symptoms || []
    });
  },

  // 切换分类
  onCategoryChange(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentCategory: index,
      filteredSymptoms: this.data.categories[index].symptoms,
      searchKeyword: '',
      isSearching: false
    });
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value.trim().toLowerCase();
    if (keyword) {
      const allSymptoms = healthData.BODY_SYMPTOMS;
      const filtered = allSymptoms.filter(s => 
        s.name.toLowerCase().includes(keyword) || 
        s.description.toLowerCase().includes(keyword)
      );
      this.setData({
        filteredSymptoms: filtered,
        isSearching: true,
        searchKeyword: keyword
      });
    } else {
      this.setData({
        filteredSymptoms: this.data.categories[this.data.currentCategory].symptoms,
        isSearching: false,
        searchKeyword: ''
      });
    }
  },

  // 切换症状选择
  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const selectedSymptoms = [...this.data.selectedSymptoms];
    const index = selectedSymptoms.indexOf(id);
    
    if (index > -1) {
      selectedSymptoms.splice(index, 1);
    } else {
      selectedSymptoms.push(id);
    }

    this.setData({ selectedSymptoms });
  },

  // 检查是否选中
  isSelected(id) {
    return this.data.selectedSymptoms.includes(id);
  },

  // 全选当前分类
  selectAll() {
    const currentSymptoms = this.data.filteredSymptoms;
    const selectedSymptoms = [...this.data.selectedSymptoms];
    
    currentSymptoms.forEach(s => {
      if (!selectedSymptoms.includes(s.id)) {
        selectedSymptoms.push(s.id);
      }
    });

    this.setData({ selectedSymptoms });
  },

  // 清空当前分类
  clearCurrent() {
    const currentSymptoms = this.data.filteredSymptoms;
    let selectedSymptoms = [...this.data.selectedSymptoms];
    
    currentSymptoms.forEach(s => {
      const index = selectedSymptoms.indexOf(s.id);
      if (index > -1) {
        selectedSymptoms.splice(index, 1);
      }
    });

    this.setData({ selectedSymptoms });
  },

  // 下一步
  onNext() {
    // 保存选择
    storage.saveSelectedSymptoms(this.data.selectedSymptoms);

    wx.showToast({
      title: `已选择${this.data.selectedSymptoms.length}项`,
      icon: 'success',
      duration: 1000
    });

    // 跳转到不良生活习惯页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/habits/habits'
      });
    }, 1000);
  },

  // 跳过
  onSkip() {
    storage.saveSelectedSymptoms(this.data.selectedSymptoms);
    wx.navigateTo({
      url: '/pages/habits/habits'
    });
  }
});
