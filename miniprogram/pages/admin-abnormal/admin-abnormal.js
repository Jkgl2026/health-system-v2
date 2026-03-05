// pages/admin-abnormal/admin-abnormal.js
// 异常用户筛选页面

const cloudFunctions = require('../../utils/cloud-functions');

Page({
  data: {
    loading: true,
    
    // 阈值设置
    scoreThreshold: 60,
    thresholdOptions: [80, 70, 60, 50, 40],
    
    // 用户列表
    users: [],
    
    // 分页
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
    
    // 统计
    stats: {
      totalAbnormal: 0,
      avgScore: 0
    }
  },

  onLoad() {
    const isLoggedIn = wx.getStorageSync('adminLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' });
      return;
    }
    this.loadData();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, users: [] });
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const result = await cloudFunctions.getAbnormalUsers({
        page: this.data.page,
        limit: this.data.limit,
        scoreThreshold: this.data.scoreThreshold
      });
      
      if (result.success) {
        const users = result.data.map(user => ({
          ...user,
          scoreColor: this.getScoreColor(user.healthScore),
          lastRecordTimeStr: this.formatTime(user.lastRecordTime)
        }));
        
        // 计算统计
        const totalScore = users.reduce((sum, u) => sum + u.healthScore, 0);
        const avgScore = users.length > 0 ? Math.round(totalScore / users.length) : 0;
        
        this.setData({
          users,
          total: result.pagination.total,
          hasMore: result.pagination.hasNextPage,
          stats: {
            totalAbnormal: result.pagination.total,
            avgScore
          }
        });
      }
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    
    this.setData({ loading: false });
  },

  // 加载更多
  async loadMore() {
    this.setData({ page: this.data.page + 1, loading: true });
    
    try {
      const result = await cloudFunctions.getAbnormalUsers({
        page: this.data.page,
        limit: this.data.limit,
        scoreThreshold: this.data.scoreThreshold
      });
      
      if (result.success) {
        const newUsers = result.data.map(user => ({
          ...user,
          scoreColor: this.getScoreColor(user.healthScore),
          lastRecordTimeStr: this.formatTime(user.lastRecordTime)
        }));
        
        this.setData({
          users: [...this.data.users, ...newUsers],
          hasMore: result.pagination.hasNextPage
        });
      }
    } catch (e) {
      console.error('加载更多失败:', e);
    }
    
    this.setData({ loading: false });
  },

  // 阈值变化
  onThresholdChange(e) {
    const threshold = this.data.thresholdOptions[e.detail.value];
    this.setData({ 
      scoreThreshold: threshold, 
      page: 1, 
      users: [] 
    });
    this.loadData();
  },

  // 查看用户详情
  viewUser(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin-user-detail/admin-user-detail?id=${userId}` });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 工具函数
  getScoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  },

  formatTime(time) {
    if (!time) return '--';
    const date = new Date(time);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
});
