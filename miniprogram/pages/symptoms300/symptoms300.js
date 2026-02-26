// pages/symptoms300/symptoms300.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    symptoms: [],
    filteredSymptoms: [],
    searchQuery: '',
    selectedIds: [],
    selectedCount: 0,
    progress: 0
  },

  onLoad() {
    this.setData({ symptoms: healthData.BODY_SYMPTOMS_300, filteredSymptoms: healthData.BODY_SYMPTOMS_300 });
    const saved = wx.getStorageSync('selectedSymptoms300') || [];
    this.setData({ selectedIds: saved, selectedCount: saved.length, progress: (saved.length / 300) * 100 });
  },

  onSearch(e) {
    const query = e.detail.value.toLowerCase();
    this.setData({ searchQuery: query, filteredSymptoms: this.data.symptoms.filter(s => s.name.toLowerCase().includes(query)) });
  },

  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    const { selectedIds } = this.data;
    const index = selectedIds.indexOf(id);
    if (index > -1) { selectedIds.splice(index, 1); } else { selectedIds.push(id); }
    this.setData({ selectedIds, selectedCount: selectedIds.length, progress: (selectedIds.length / 300) * 100 });
    wx.setStorageSync('selectedSymptoms300', selectedIds);
  },

  goBack() { wx.navigateBack(); },
  goNext() { wx.navigateTo({ url: '/pages/target/target' }); }
});
