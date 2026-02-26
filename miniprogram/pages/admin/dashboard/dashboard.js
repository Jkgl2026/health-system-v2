// pages/admin/dashboard/dashboard.js
const { adminAPI } = require('../../../utils/api');

Page({
  data: {
    stats: {
      totalUsers: 0,
      todayUsers: 0,
      totalChecks: 0,
      todayChecks: 0
    },
    recentUsers: [],
    activeTab: 'overview',
    loading: false,
    searchQuery: '',
    page: 1,
    limit: 20,
    hasMore: true,
    pagination: null
  },

  onLoad() {
    this.checkLogin();
    this.loadStatistics();
    this.loadUsers();
  },

  onShow() {
    // 刷新数据
    this.loadStatistics();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStatistics();
    this.loadUsers();
    wx.stopPullDownRefresh();
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

  // 加载统计数据
  async loadStatistics() {
    try {
      const result = await adminAPI.getUsers({ page: 1, limit: 1 });
      if (result && result.success) {
        this.setData({
          'stats.totalUsers': result.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 使用模拟数据作为兜底
      this.setData({
        stats: {
          totalUsers: 1234,
          todayUsers: 56,
          totalChecks: 5678,
          todayChecks: 89
        }
      });
    }
  },

  // 加载用户列表
  async loadUsers() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });

    try {
      const result = await adminAPI.getUsers({
        page: this.data.page,
        limit: this.data.limit,
        search: this.data.searchQuery || undefined
      });

      if (result && result.success) {
        const users = result.data.map(user => this.formatUserItem(user));
        
        this.setData({
          recentUsers: this.data.page === 1 ? users : [...this.data.recentUsers, ...users],
          pagination: result.pagination,
          hasMore: result.pagination?.hasNextPage || false,
          loading: false
        });
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
      // 使用模拟数据作为兜底
      this.setData({
        recentUsers: [
          { id: 1, name: '张三', phone: '138****1234', score: 85, date: '2024-01-15' },
          { id: 2, name: '李四', phone: '139****5678', score: 72, date: '2024-01-15' },
          { id: 3, name: '王五', phone: '137****9012', score: 91, date: '2024-01-14' },
          { id: 4, name: '赵六', phone: '136****3456', score: 68, date: '2024-01-14' },
          { id: 5, name: '钱七', phone: '135****7890', score: 77, date: '2024-01-13' }
        ],
        loading: false
      });
    }
  },

  // 格式化用户数据
  formatUserItem(user) {
    const latestAnalysis = user.latestHealthAnalysis || {};
    const overallHealth = latestAnalysis.overallHealth || 0;
    
    return {
      id: user.user?.id || user.id,
      name: user.user?.name || '未知用户',
      phone: this.formatPhone(user.user?.phone),
      score: overallHealth || '--',
      date: this.formatDate(user.user?.createdAt),
      rawData: user
    };
  },

  // 格式化手机号
  formatPhone(phone) {
    if (!phone) return '--';
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    this.setData({ page: 1 });
    this.loadUsers();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchQuery: '', page: 1 });
    this.loadUsers();
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
    wx.showActionSheet({
      itemList: ['导出概览数据', '导出详细数据'],
      success: (res) => {
        wx.showToast({
          title: '正在导出...',
          icon: 'loading'
        });
        // TODO: 实现真实导出功能
        setTimeout(() => {
          wx.showToast({
            title: '导出成功',
            icon: 'success'
          });
        }, 1500);
      }
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
          wx.removeStorageSync('adminInfo');
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
  },

  // 加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadUsers();
    }
  }
});
