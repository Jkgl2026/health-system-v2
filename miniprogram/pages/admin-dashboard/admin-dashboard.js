// pages/admin-dashboard/admin-dashboard.js
// 后台管理仪表盘 - 使用云数据库

const cloudDb = require('../../utils/cloud-db');

Page({
  data: {
    stats: {
      totalUsers: 0,
      totalRecords: 0,
      todayUsers: 0,
      todayRecords: 0
    },
    users: [],
    loading: true,
    page: 1,
    limit: 20,
    search: '',
    hasMore: true
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

  // 加载数据
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      // 并行加载统计数据和用户列表
      const [statsResult, usersResult] = await Promise.all([
        cloudDb.getStatistics(),
        cloudDb.getUserList({ page: 1, limit: this.data.limit })
      ]);
      
      if (statsResult.success && usersResult.success) {
        this.setData({
          stats: statsResult.data,
          users: usersResult.data,
          loading: false,
          page: 1,
          hasMore: usersResult.pagination.hasNextPage
        });
      } else {
        wx.showToast({ title: '加载失败', icon: 'error' });
      }
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  // 搜索用户
  async searchUser(e) {
    const search = e.detail.value;
    this.setData({ search, page: 1 });
    
    if (!search) {
      this.loadData();
      return;
    }
    
    wx.showLoading({ title: '搜索中...' });
    try {
      const result = await cloudDb.getUserList({ page: 1, limit: this.data.limit, search });
      if (result.success) {
        this.setData({
          users: result.data,
          hasMore: result.pagination.hasNextPage
        });
      }
    } catch (e) {
      wx.showToast({ title: '搜索失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  // 加载更多
  async loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    
    const nextPage = this.data.page + 1;
    this.setData({ loading: true });
    
    try {
      const result = await cloudDb.getUserList({
        page: nextPage,
        limit: this.data.limit,
        search: this.data.search
      });
      
      if (result.success) {
        this.setData({
          users: [...this.data.users, ...result.data],
          page: nextPage,
          hasMore: result.pagination.hasNextPage,
          loading: false
        });
      }
    } catch (e) {
      console.error('加载更多失败:', e);
    }
    this.setData({ loading: false });
  },

  // 刷新数据
  refreshUsers() {
    this.loadData();
  },

  // 查看用户详情
  viewUser(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin-user-detail/admin-user-detail?id=${id}` });
  },

  // 进入数据对比页面（选择用户）
  goToCompareSelect() {
    wx.navigateTo({ url: '/pages/admin-compare-select/admin-compare-select' });
  },

  // 退出登录
  handleLogout() {
    wx.removeStorageSync('adminLoggedIn');
    wx.redirectTo({ url: '/pages/index/index' });
  },

  // 清空所有数据
  async clearAllData() {
    const res = await wx.showModal({
      title: '确认清空',
      content: '此操作将删除所有用户数据，无法恢复！',
      confirmColor: '#ef4444'
    });
    
    if (res.confirm) {
      wx.showLoading({ title: '清空中...' });
      // TODO: 实现清空云端数据
      wx.showToast({ title: '暂不支持', icon: 'none' });
      wx.hideLoading();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 触底加载更多
  onReachBottom() {
    this.loadMore();
  },

  // 复制手机号
  copyPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.setClipboardData({
        data: phone,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' });
        }
      });
    }
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      });
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
