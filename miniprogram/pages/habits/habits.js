// pages/habits/habits.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    habits: [],
    categories: [],
    currentCategory: 'all',
    searchQuery: '',
    filteredHabits: [],
    selectedIds: [],
    selectedCount: 0,
    progress: 0
  },

  onLoad() {
    this.initData();
    this.loadSavedData();
  },

  initData() {
    const categories = healthData.getHabitCategories();
    const habits = healthData.getAllHabits();
    this.setData({ categories, habits, filteredHabits: habits });
  },

  loadSavedData() {
    const savedHabits = wx.getStorageSync('selectedHabitsRequirements') || [];
    this.setData({ 
      selectedIds: savedHabits, 
      selectedCount: savedHabits.length,
      progress: (savedHabits.length / 252) * 100
    });
  },

  onSearch(e) {
    const query = e.detail.value.toLowerCase();
    this.setData({ searchQuery: query });
    this.filterHabits();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    this.filterHabits();
  },

  filterHabits() {
    const { habits, currentCategory, searchQuery } = this.data;
    let filtered = habits;
    if (currentCategory !== 'all') {
      filtered = healthData.getHabitsByCategory(currentCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(h => h.habit.toLowerCase().includes(searchQuery));
    }
    this.setData({ filteredHabits: filtered });
  },

  toggleHabit(e) {
    const id = e.currentTarget.dataset.id;
    const { selectedIds } = this.data;
    const index = selectedIds.indexOf(id);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(id);
    }
    this.setData({
      selectedIds,
      selectedCount: selectedIds.length,
      progress: (selectedIds.length / 252) * 100
    });
    wx.setStorageSync('selectedHabitsRequirements', selectedIds);
  },

  goBack() { wx.navigateBack(); },
  goNext() { wx.navigateTo({ url: '/pages/symptoms300/symptoms300' }); }
});
