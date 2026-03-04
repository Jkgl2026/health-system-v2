// pages/admin-dashboard/admin-dashboard.js
// 后台管理仪表盘 - 优化版，使用服务端统计

const cloudFunctions = require('../../utils/cloud-functions');

Page({
  data: {
    // 统计数据
    stats: {
      totalUsers: 0,
      totalRecords: 0,
      todayUsers: 0,
      todayRecords: 0,
      avgHealthScore: '--',
      warningUsers: 0
    },
    
    // 健康要素分析
    healthElements: [
      { key: 'qiAndBlood', label: '气血', icon: '🔴', value: '--', colorClass: 'fill-red' },
      { key: 'circulation', label: '循环', icon: '🔵', value: '--', colorClass: 'fill-blue' },
      { key: 'toxins', label: '毒素', icon: '🟡', value: '--', colorClass: 'fill-yellow' },
      { key: 'bloodLipids', label: '血脂', icon: '🟠', value: '--', colorClass: 'fill-orange' },
      { key: 'coldness', label: '寒凉', icon: '🧊', value: '--', colorClass: 'fill-cyan' },
      { key: 'immunity', label: '免疫', icon: '🛡️', value: '--', colorClass: 'fill-green' },
      { key: 'emotions', label: '情绪', icon: '💜', value: '--', colorClass: 'fill-purple' }
    ],
    
    // 用户列表
    users: [],
    loading: true,
    page: 1,
    limit: 20,
    search: '',
    hasMore: true,
    currentFilter: 'all'
  },

  onLoad() {
    const isLoggedIn = wx.getStorageSync('adminLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({ url: '/pages/admin/login/login' });
      return;
    }
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载数据 - 并行加载统计和用户列表
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ loading: true });
    
    try {
      // 并行请求统计数据和用户列表
      const [statsResult, usersResult] = await Promise.all([
        cloudFunctions.getDashboardStats(),
        cloudFunctions.getUserList({
          page: this.data.page,
          limit: this.data.limit,
          search: this.data.search
        })
      ]);
      
      // 处理统计数据
      if (statsResult.success) {
        const statsData = statsResult.data;
        
        // 处理健康要素数据
        const healthElements = this.data.healthElements.map(el => {
          const serverEl = statsData.healthElements?.find(se => se.key === el.key);
          return {
            ...el,
            value: serverEl?.value ?? '--'
          };
        });
        
        this.setData({
          stats: {
            totalUsers: statsData.totalUsers || 0,
            totalRecords: statsData.totalRecords || 0,
            todayUsers: statsData.todayUsers || 0,
            todayRecords: statsData.todayRecords || 0,
            avgHealthScore: statsData.avgHealthScore || '--',
            warningUsers: statsData.warningUsers || 0
          },
          healthElements
        });
      }
      
      // 处理用户列表
      if (usersResult.success) {
        let users = this.processUsers(usersResult.data || []);
        
        // 应用筛选
        if (this.data.currentFilter === 'warning') {
          users = users.filter(u => u.healthScore < 60);
        } else if (this.data.currentFilter === 'good') {
          users = users.filter(u => u.healthScore >= 60);
        }
        
        this.setData({
          users,
          hasMore: usersResult.pagination?.hasNextPage || false
        });
      }
      
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败: ' + (e.message || '未知错误'), icon: 'none' });
    }
    
    this.setData({ loading: false });
    wx.hideLoading();
  },

  // 处理用户列表数据
  processUsers(users) {
    return users.map(user => {
      const latestRecord = user.latestRecord || {};
      const healthScore = latestRecord.healthScore ?? user.healthScore ?? '--';
      
      return {
        id: user._id,
        name: user.name || '未知用户',
        phone: this.formatPhone(user.phone),
        score: healthScore,
        healthScore: typeof healthScore === 'number' ? healthScore : 0,
        date: this.formatDate(user.lastRecordTime || user.createdAt),
        gender: user.gender || '',
        age: user.age || ''
      };
    });
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

  // 搜索输入
  onSearchInput(e) {
    this.setData({ search: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    this.setData({ page: 1 });
    this.loadData();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ search: '', page: 1 });
    this.loadData();
  },

  // 切换筛选
  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.loadData();
  },

  // 查看用户详情
  viewUser(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin/user-detail/user-detail?id=${userId}`
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

  // 下拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadMoreUsers();
    }
  },

  // 加载更多用户
  async loadMoreUsers() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const result = await cloudFunctions.getUserList({
        page: this.data.page,
        limit: this.data.limit,
        search: this.data.search
      });
      
      if (result.success) {
        const newUsers = this.processUsers(result.data || []);
        let users = [...this.data.users, ...newUsers];
        
        // 应用筛选
        if (this.data.currentFilter === 'warning') {
          users = users.filter(u => u.healthScore < 60);
        } else if (this.data.currentFilter === 'good') {
          users = users.filter(u => u.healthScore >= 60);
        }
        
        this.setData({
          users,
          hasMore: result.pagination?.hasNextPage || false
        });
      }
    } catch (e) {
      console.error('加载更多失败:', e);
    }
    
    this.setData({ loading: false });
  }
});
