// pages/admin-dashboard/admin-dashboard.js
// 后台管理仪表盘 - 从云数据库读取数据

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
    // 每次显示页面时刷新数据
    this.loadData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载数据 - 从云数据库读取
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    this.setData({ loading: true });
    
    try {
      // 调用云函数获取用户列表
      const result = await cloudFunctions.getUserList({
        page: this.data.page,
        limit: this.data.limit,
        search: this.data.search
      });
      
      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }
      
      const allUsers = result.data || [];
      
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
      
      this.setData({
        stats,
        healthElements,
        constitutionStats,
        users,
        loading: false,
        hasMore: result.pagination ? result.pagination.hasNextPage : false
      });
      
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败: ' + (e.message || '未知错误'), icon: 'none' });
      this.setData({ loading: false });
    }
    
    wx.hideLoading();
  },

  // 计算统计数据
  calculateStats(users) {
    const today = new Date().toDateString();
    let todayUsers = 0;
    let todayRecords = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let warningUsers = 0;
    
    users.forEach(user => {
      // 今日新增
      const userDate = user.createdAt || user.lastRecordTime;
      if (userDate && new Date(userDate).toDateString() === today) {
        todayUsers++;
        todayRecords++;
      }
      
      // 计算评分 - 优先从最新记录获取
      const score = user.latestRecord?.healthScore ?? user.healthScore;
      if (score !== undefined && score !== null) {
        totalScore += score;
        scoreCount++;
        if (score < 60) {
          warningUsers++;
        }
      }
    });
    
    return {
      totalUsers: users.length,
      totalRecords: users.length,
      todayUsers,
      todayRecords,
      avgHealthScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : '--',
      warningUsers
    };
  },

  // 计算健康要素平均值
  calculateHealthElements(users) {
    const elements = this.data.healthElements.map(e => ({ ...e, total: 0, count: 0 }));
    
    const elementMapping = {
      'qiAndBlood': '气血',
      'circulation': '循环',
      'toxins': '毒素',
      'bloodLipids': '血脂',
      'coldness': '寒凉',
      'immunity': '免疫',
      'emotions': '情绪'
    };
    
    users.forEach(user => {
      const healthEls = user.latestRecord?.healthElements ?? user.healthElements ?? [];
      healthEls.forEach(el => {
        const key = Object.keys(elementMapping).find(k => elementMapping[k] === el.name);
        if (key) {
          const element = elements.find(e => e.key === key);
          if (element && el.count !== undefined) {
            element.total += el.count;
            element.count++;
          }
        }
      });
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
      const summary = user.latestRecord?.summary ?? user.summary ?? {};
      const symptoms = (summary.symptomCount || 0) + (summary.badHabitCount || 0);
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
      // 获取健康评分 - 优先从最新记录获取
      const healthScore = user.latestRecord?.healthScore ?? user.healthScore ?? 50;
      
      // 获取健康状态
      const healthStatus = this.getHealthStatus(healthScore);
      
      // 格式化日期
      const dateStr = (user.latestRecord?.dateStr || user.dateStr) || 
        (user.lastRecordTime ? this.formatDate(user.lastRecordTime) : 
         (user.createdAt ? this.formatDate(user.createdAt) : '未知'));
      
      return {
        ...user,
        healthScore,
        healthLabel: healthStatus.label,
        healthClass: healthStatus.className,
        healthColor: healthStatus.color,
        dateStr,
        name: user.name || '未知',
        phone: user.phone || '--'
      };
    }).sort((a, b) => {
      const timeA = a.lastRecordTime || a.createdAt || 0;
      const timeB = b.lastRecordTime || b.createdAt || 0;
      return new Date(timeB) - new Date(timeA);
    });
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
    this.setData({ page: 1 });
    this.loadData();
  },

  // 清除搜索
  clearSearch() {
    this.setData({ search: '', page: 1 });
    this.loadData();
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter, page: 1 });
    this.loadData();
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ page: this.data.page + 1 });
    this.loadData();
  },

  // 刷新数据
  refreshUsers() {
    this.setData({ page: 1 });
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

  // 退出登录
  logout() {
    wx.showModal({
      title: '退出确认',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminLoggedIn');
          wx.redirectTo({ url: '/pages/admin/login/login' });
        }
      }
    });
  },

  // 导出数据
  exportData() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
