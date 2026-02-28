// pages/admin-dashboard/admin-dashboard.js
// 后台管理仪表盘 - 增强版

const healthDataUtil = require('../../utils/health-data');

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
    
    // 体质统计
    constitutionStats: [
      { type: '平和质', count: 0 },
      { type: '气虚质', count: 0 },
      { type: '阳虚质', count: 0 },
      { type: '阴虚质', count: 0 },
      { type: '血瘀质', count: 0 },
      { type: '痰湿质', count: 0 }
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

  // 加载数据
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ loading: true });
    
    try {
      // 从本地存储读取用户数据
      const allUsers = this.getLocalUsers();
      
      // 计算统计数据
      const stats = this.calculateStats(allUsers);
      
      // 计算健康要素
      const healthElements = this.calculateHealthElements(allUsers);
      
      // 计算体质分布
      const constitutionStats = this.calculateConstitution(allUsers);
      
      // 处理用户列表
      let users = this.processUsers(allUsers);
      
      // 应用筛选
      if (this.data.currentFilter === 'warning') {
        users = users.filter(u => u.healthScore < 60);
      } else if (this.data.currentFilter === 'good') {
        users = users.filter(u => u.healthScore >= 60);
      }
      
      // 应用搜索
      if (this.data.search) {
        const keyword = this.data.search.toLowerCase();
        users = users.filter(u => 
          (u.name && u.name.toLowerCase().includes(keyword)) ||
          (u.phone && u.phone.includes(keyword))
        );
      }
      
      this.setData({
        stats,
        healthElements,
        constitutionStats,
        users,
        loading: false,
        hasMore: false
      });
      
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    
    wx.hideLoading();
  },

  // 获取本地用户数据
  getLocalUsers() {
    // 从本地存储获取所有用户记录
    const users = wx.getStorageSync('adminUsers') || [];
    return users;
  },

  // 计算统计数据
  calculateStats(users) {
    const today = new Date().toDateString();
    let todayUsers = 0;
    let todayRecords = 0;
    let totalScore = 0;
    let warningUsers = 0;
    
    users.forEach(user => {
      // 今日新增
      if (new Date(user.updatedAt).toDateString() === today) {
        todayUsers++;
        todayRecords++;
      }
      
      // 计算评分
      if (user.healthScore !== undefined) {
        totalScore += user.healthScore;
        if (user.healthScore < 60) {
          warningUsers++;
        }
      }
    });
    
    return {
      totalUsers: users.length,
      totalRecords: users.length, // 每个用户一条记录
      todayUsers,
      todayRecords,
      avgHealthScore: users.length > 0 ? Math.round(totalScore / users.length) : '--',
      warningUsers
    };
  },

  // 计算健康要素平均值
  calculateHealthElements(users) {
    const elements = this.data.healthElements.map(e => ({ ...e, total: 0, count: 0 }));
    
    users.forEach(user => {
      if (user.healthAnalysis) {
        elements.forEach(el => {
          if (user.healthAnalysis[el.key] !== undefined) {
            el.total += user.healthAnalysis[el.key];
            el.count++;
          }
        });
      }
    });
    
    return elements.map(el => ({
      ...el,
      value: el.count > 0 ? Math.round(el.total / el.count) : '--'
    }));
  },

  // 计算体质分布
  calculateConstitution(users) {
    const constitutions = [
      { type: '平和质', min: 0, max: 5, count: 0 },
      { type: '气虚质', min: 6, max: 10, count: 0 },
      { type: '阳虚质', min: 11, max: 15, count: 0 },
      { type: '阴虚质', min: 16, max: 20, count: 0 },
      { type: '血瘀质', min: 21, max: 25, count: 0 },
      { type: '痰湿质', min: 26, max: 999, count: 0 }
    ];
    
    users.forEach(user => {
      const symptoms = (user.symptomCount || 0) + (user.habitCount || 0);
      for (const c of constitutions) {
        if (symptoms >= c.min && symptoms <= c.max) {
          c.count++;
          break;
        }
      }
    });
    
    return constitutions.map(c => ({ type: c.type, count: c.count }));
  },

  // 处理用户数据
  processUsers(users) {
    return users.map(user => {
      // 计算健康评分
      const healthScore = user.healthScore || this.calculateUserHealthScore(user);
      
      // 获取健康状态
      const healthStatus = this.getHealthStatus(healthScore);
      
      // 格式化日期
      const dateStr = user.updatedAt ? this.formatDate(user.updatedAt) : '未知';
      
      return {
        ...user,
        healthScore,
        healthLabel: healthStatus.label,
        healthClass: healthStatus.className,
        healthColor: healthStatus.color,
        dateStr
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // 计算用户健康评分
  calculateUserHealthScore(user) {
    const bodySymptoms = user.bodySymptoms || [];
    const habits = user.badHabits || [];
    const symptoms300 = user.symptoms300 || [];
    
    const bodyScore = Math.max(0, 100 - (bodySymptoms.length / 100) * 100);
    const habitScore = Math.max(0, 100 - (habits.length / 252) * 100);
    const symptomScore = Math.max(0, 100 - (symptoms300.length / 300) * 100);
    
    return Math.round(bodyScore * 0.3 + habitScore * 0.2 + symptomScore * 0.1 + 40);
  },

  // 获取健康状态
  getHealthStatus(score) {
    if (score >= 80) return { label: '优秀', className: 'status-excellent', color: '#22c55e' };
    if (score >= 60) return { label: '良好', className: 'status-good', color: '#3b82f6' };
    if (score >= 40) return { label: '一般', className: 'status-normal', color: '#eab308' };
    if (score >= 20) return { label: '需关注', className: 'status-warning', color: '#f97316' };
    return { label: '需改善', className: 'status-danger', color: '#ef4444' };
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ search: e.detail.value });
  },

  // 搜索用户
  searchUser() {
    this.loadData();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ search: '' });
    this.loadData();
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.loadData();
  },

  // 加载更多
  loadMore() {
    // 本地数据暂不需要分页
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

  // 进入数据对比页面
  goToCompareSelect() {
    wx.navigateTo({ url: '/pages/admin-compare/admin-compare?mode=select' });
  },

  // 导出数据
  exportData() {
    wx.showToast({ title: '导出功能开发中', icon: 'none' });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminLoggedIn');
          wx.redirectTo({ url: '/pages/index/index' });
        }
      }
    });
  },

  // 清空所有数据
  async clearAllData() {
    const res = await wx.showModal({
      title: '⚠️ 危险操作',
      content: '此操作将删除所有用户数据，无法恢复！确定继续吗？',
      confirmColor: '#ef4444',
      confirmText: '确定清空'
    });
    
    if (res.confirm) {
      wx.showLoading({ title: '清空中...' });
      wx.removeStorageSync('adminUsers');
      this.loadData();
      wx.hideLoading();
      wx.showToast({ title: '已清空', icon: 'success' });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  }
});
