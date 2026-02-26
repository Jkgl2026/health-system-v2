// pages/requirements/requirements.js
const healthData = require('../../utils/health-data');

Page({
  data: {
    requirements: healthData.FOUR_REQUIREMENTS.requirements,
    agreed: [false, false, false, false],
    allAgreed: false
  },

  onLoad() {
    const saved = wx.getStorageSync('requirementsAgreed');
    if (saved && saved.length === 4) {
      this.setData({ agreed: saved, allAgreed: saved.every(a => a) });
    }
  },

  toggleAgree(e) {
    const index = e.currentTarget.dataset.index;
    const agreed = [...this.data.agreed];
    agreed[index] = !agreed[index];
    this.setData({ agreed, allAgreed: agreed.every(a => a) });
    wx.setStorageSync('requirementsAgreed', agreed);
  },

  toggleAllAgree() {
    const allAgreed = !this.data.allAgreed;
    const agreed = [allAgreed, allAgreed, allAgreed, allAgreed];
    this.setData({ agreed, allAgreed });
    wx.setStorageSync('requirementsAgreed', agreed);
  },

  goBack() { wx.navigateBack(); },
  goNext() { wx.navigateTo({ url: '/pages/health-result/health-result' }); }
});
