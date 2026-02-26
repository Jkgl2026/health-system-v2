// pages/admin-dashboard/admin-dashboard.js
const api = require('../../utils/api');

Page({
  data: {
    stats: { totalUsers: 0, todayUsers: 0, checkCount: 0, avgScore: 0 },
    users: []
  },

  onLoad() {
    const isLoggedIn = wx.getStorageSync('adminLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' });
      return;
    }
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      const stats = await api.get('/api/admin/stats');
      const users = await api.get('/api/admin/users');
      this.setData({ stats, users });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  refreshUsers() {
    this.loadData();
  },

  viewUser(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin-user-detail/admin-user-detail?id=${id}` });
  },

  handleLogout() {
    wx.removeStorageSync('adminLoggedIn');
    wx.redirectTo({ url: '/pages/index/index' });
  },

  async exportData() {
    wx.showLoading({ title: '导出中...' });
    try {
      await api.download('/api/admin/export', 'users.json');
      wx.showToast({ title: '导出成功', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  async clearAllData() {
    const res = await wx.showModal({
      title: '确认清空',
      content: '此操作将删除所有用户数据，无法恢复！',
      confirmColor: '#ef4444'
    });
    
    if (res.confirm) {
      wx.showLoading({ title: '清空中...' });
      try {
        await api.post('/api/admin/clear');
        wx.showToast({ title: '清空成功', icon: 'success' });
        this.loadData();
      } catch (e) {
        wx.showToast({ title: '清空失败', icon: 'error' });
      }
      wx.hideLoading();
    }
  }
});
