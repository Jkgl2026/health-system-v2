// pages/target/target.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    allSymptoms: [],
    selectedIds: [],
    selectedSymptoms: [],
    selectedCount: 0
  },

  onLoad() {
    const bodySymptoms = wx.getStorageSync('selectedSymptoms') || [];
    const symptoms300 = wx.getStorageSync('selectedSymptoms300') || [];
    const allSymptomIds = [...bodySymptoms, ...symptoms300];
    const allSymptoms = [
      ...healthData.BODY_SYMPTOMS.filter(s => bodySymptoms.includes(s.id)),
      ...healthData.BODY_SYMPTOMS_300.filter(s => symptoms300.includes(s.id))
    ];
    const savedTarget = wx.getStorageSync('targetSymptoms') || [];
    const selectedSymptoms = allSymptoms.filter(s => savedTarget.includes(s.id));
    this.setData({ allSymptoms, selectedIds: savedTarget, selectedSymptoms, selectedCount: savedTarget.length });
  },

  toggleSymptom(e) {
    const id = e.currentTarget.dataset.id;
    let { selectedIds, allSymptoms } = this.data;
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else if (selectedIds.length < 3) {
      selectedIds.push(id);
    } else {
      wx.showToast({ title: '最多选择3个', icon: 'none' });
      return;
    }
    const selectedSymptoms = allSymptoms.filter(s => selectedIds.includes(s.id));
    this.setData({ selectedIds, selectedSymptoms, selectedCount: selectedIds.length });
    wx.setStorageSync('targetSymptoms', selectedIds);
  },

  goBack() { wx.navigateBack(); },
  goNext() { wx.navigateTo({ url: '/pages/choices/choices' }); }
});
