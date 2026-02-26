// pages/admin-user-detail/admin-user-detail.js
const api = require('../../utils/api');

Page({
  data: {
    id: '',
    user: null,
    questions: [
      { id: 'sleep', question: '睡眠时间' },
      { id: 'exercise', question: '运动频率' },
      { id: 'water', question: '饮水量' },
      { id: 'diet', question: '饮食习惯' },
      { id: 'stress', question: '压力程度' },
      { id: 'emotion', question: '情绪状态' },
      { id: 'screen', question: '电子设备使用时间' }
    ]
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.loadUser();
  },

  async loadUser() {
    wx.showLoading({ title: '加载中...' });
    try {
      const user = await api.get(`/api/admin/users/${this.data.id}`);
      this.setData({ user });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  goBack() {
    wx.navigateBack();
  },

  async deleteUser() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除此用户吗？此操作无法恢复！',
      confirmColor: '#ef4444'
    });
    
    if (res.confirm) {
      wx.showLoading({ title: '删除中...' });
      try {
        await api.delete(`/api/admin/users/${this.data.id}`);
        wx.showToast({ title: '删除成功', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 1500);
      } catch (e) {
        wx.showToast({ title: '删除失败', icon: 'error' });
      }
      wx.hideLoading();
    }
  }
});
