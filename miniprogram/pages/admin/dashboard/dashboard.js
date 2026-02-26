// pages/admin/dashboard/dashboard.js
Page({
  data: {
    stats: {
      totalUsers: 1234,
      todayUsers: 56,
      totalChecks: 5678,
      todayChecks: 89
    },
    recentUsers: [],
    activeTab: 'overview'
  },

  onLoad() {
    this.checkLogin();
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 检查登录状态
  checkLogin() {
    const isLoggedIn = wx.getStorageSync('adminLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({
        url: '/pages/admin/login/login'
      });
    }
  },

  // 加载数据
  loadData() {
    // 模拟最近用户数据
    const recentUsers = [
      { id: 1, name: '张三', phone: '138****1234', score: 85, date: '2024-01-15' },
      { id: 2, name: '李四', phone: '139****5678', score: 72, date: '2024-01-15' },
      { id: 3, name: '王五', phone: '137****9012', score: 91, date: '2024-01-14' },
      { id: 4, name: '赵六', phone: '136****3456', score: 68, date: '2024-01-14' },
      { id: 5, name: '钱七', phone: '135****7890', score: 77, date: '2024-01-13' }
    ];

    this.setData({ recentUsers });
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 查看用户详情
  viewUser(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/user-detail/user-detail?id=${userId}`
    });
  },

  // 导出数据
  exportData() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminLoggedIn');
          wx.redirectTo({
            url: '/pages/admin/login/login'
          });
        }
      }
    });
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
});
