// pages/habits/habits.js
const storage = require('../../utils/storage');
const healthData = require('../../utils/health-data');

Page({
  data: {
    categories: ['饮食', '睡觉', '寒湿', '情绪', '运动', '毒素', '生活'],
    currentCategory: 0,
    habitsList: [],
    selectedHabits: [],
    searchKeyword: '',
    isSearching: false,
    filteredHabits: []
  },

  onLoad() {
    this.initData();
  },

  initData() {
    const savedHabits = storage.getSelectedHabits();
    const habitsList = healthData.BAD_HABITS_CHECKLIST;

    this.setData({
      selectedHabits: savedHabits,
      habitsList: habitsList,
      filteredHabits: habitsList['饮食'] || []
    });
  },

  // 切换分类
  onCategoryChange(e) {
    const index = e.currentTarget.dataset.index;
    const categoryName = this.data.categories[index];
    this.setData({
      currentCategory: index,
      filteredHabits: this.data.habitsList[categoryName] || [],
      searchKeyword: '',
      isSearching: false
    });
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value.trim().toLowerCase();
    if (keyword) {
      const allHabits = [];
      Object.values(this.data.habitsList).forEach(habits => {
        allHabits.push(...habits);
      });
      const filtered = allHabits.filter(h => 
        h.habit.toLowerCase().includes(keyword) || 
        h.impact.toLowerCase().includes(keyword)
      );
      this.setData({
        filteredHabits: filtered,
        isSearching: true,
        searchKeyword: keyword
      });
    } else {
      const categoryName = this.data.categories[this.data.currentCategory];
      this.setData({
        filteredHabits: this.data.habitsList[categoryName] || [],
        isSearching: false,
        searchKeyword: ''
      });
    }
  },

  // 切换习惯选择
  toggleHabit(e) {
    const id = e.currentTarget.dataset.id;
    const selectedHabits = [...this.data.selectedHabits];
    const index = selectedHabits.indexOf(id);
    
    if (index > -1) {
      selectedHabits.splice(index, 1);
    } else {
      selectedHabits.push(id);
    }

    this.setData({ selectedHabits });
  },

  // 全选
  selectAll() {
    const currentHabits = this.data.filteredHabits;
    const selectedHabits = [...this.data.selectedHabits];
    
    currentHabits.forEach(h => {
      if (!selectedHabits.includes(h.id)) {
        selectedHabits.push(h.id);
      }
    });

    this.setData({ selectedHabits });
  },

  // 清空
  clearCurrent() {
    const currentHabits = this.data.filteredHabits;
    let selectedHabits = [...this.data.selectedHabits];
    
    currentHabits.forEach(h => {
      const index = selectedHabits.indexOf(h.id);
      if (index > -1) {
        selectedHabits.splice(index, 1);
      }
    });

    this.setData({ selectedHabits });
  },

  // 下一步 - 跳转到300症状表
  onNext() {
    storage.saveSelectedHabits(this.data.selectedHabits);

    wx.showToast({
      title: `已选择${this.data.selectedHabits.length}项`,
      icon: 'success',
      duration: 1000
    });

    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/symptoms300/symptoms300'
      });
    }, 1000);
  },

  // 跳过
  onSkip() {
    storage.saveSelectedHabits(this.data.selectedHabits);
    wx.navigateTo({
      url: '/pages/symptoms300/symptoms300'
    });
  }
});
