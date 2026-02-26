// pages/choices/choices.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    choices: healthData.THREE_CHOICES.choices,
    selectedChoices: ['', '', ''],
    isComplete: false
  },

  onLoad() {
    const saved = wx.getStorageSync('selectedChoices');
    if (saved && saved.length === 3) {
      this.setData({ selectedChoices: saved, isComplete: saved.every(c => c) });
    }
  },

  selectOption(e) {
    const { choice, value } = e.currentTarget.dataset;
    const selectedChoices = [...this.data.selectedChoices];
    selectedChoices[choice - 1] = value;
    this.setData({ selectedChoices, isComplete: selectedChoices.every(c => c) });
    wx.setStorageSync('selectedChoices', selectedChoices);
  },

  goBack() { wx.navigateBack(); },
  goNext() { wx.navigateTo({ url: '/pages/requirements/requirements' }); }
});
