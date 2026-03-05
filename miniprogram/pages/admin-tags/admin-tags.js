// pages/admin-tags/admin-tags.js
// 用户画像标签页面

const cloudFunctions = require('../../utils/cloud-functions');

Page({
  data: {
    loading: true,
    
    // 标签统计
    tagStats: {
      auto: [], // 自动标签
      manual: [] // 手动标签
    },
    
    // 用户列表
    users: [],
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
    
    // 当前选中的标签
    selectedTag: null,
    
    // 标签颜色
    tagColors: {
      '新用户': '#3b82f6',
      '老用户': '#22c55e',
      '高危': '#ef4444',
      '中危': '#f97316',
      '低危': '#22c55e',
      '气虚质': '#ef4444',
      '阳虚质': '#3b82f6',
      '阴虚质': '#8b5cf6',
      '痰湿质': '#f97316',
      '湿热质': '#eab308',
      '血瘀质': '#ec4899',
      '气郁质': '#06b6d4',
      '特禀质': '#84cc16',
      '平和质': '#22c55e'
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
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && this.data.selectedTag) {
      this.loadMoreUsers();
    }
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 获取所有用户来统计标签
      const result = await cloudFunctions.getUserList({ limit: 500 });
      
      if (result.success) {
        // 统计标签
        const tagCounts = this.calculateTagStats(result.data);
        
        this.setData({
          tagStats: tagCounts,
          loading: false
        });
      }
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    
    this.setData({ loading: false });
  },

  // 计算标签统计
  calculateTagStats(users) {
    const autoTags = {};
    const manualTags = {};
    
    users.forEach(user => {
      // 自动标签
      // 1. 新/老用户
      const isNew = this.isNewUser(user);
      const userTag = isNew ? '新用户' : '老用户';
      autoTags[userTag] = (autoTags[userTag] || 0) + 1;
      
      // 2. 风险等级
      const score = user.latestRecord?.healthScore || 50;
      let riskTag = '低危';
      if (score < 40) riskTag = '高危';
      else if (score < 60) riskTag = '中危';
      autoTags[riskTag] = (autoTags[riskTag] || 0) + 1;
      
      // 3. 体质类型（根据健康要素推断）
      const elements = user.latestRecord?.healthElements || [];
      if (elements.length > 0) {
        const topElement = elements[0].name;
        const constitutionMap = {
          '气血': '气虚质',
          '寒凉': '阳虚质',
          '毒素': '湿热质',
          '血脂': '痰湿质',
          '情绪': '气郁质',
          '循环': '血瘀质',
          '免疫': '阴虚质'
        };
        const constitution = constitutionMap[topElement] || '平和质';
        autoTags[constitution] = (autoTags[constitution] || 0) + 1;
      }
      
      // 4. 性别
      if (user.gender) {
        autoTags[user.gender] = (autoTags[user.gender] || 0) + 1;
      }
      
      // 5. 年龄段
      if (user.age) {
        let ageGroup = '60岁以上';
        if (user.age < 30) ageGroup = '30岁以下';
        else if (user.age < 40) ageGroup = '30-40岁';
        else if (user.age < 50) ageGroup = '40-50岁';
        else if (user.age < 60) ageGroup = '50-60岁';
        autoTags[ageGroup] = (autoTags[ageGroup] || 0) + 1;
      }
    });
    
    // 转换为数组
    const autoArray = Object.entries(autoTags).map(([name, count]) => ({
      name,
      count,
      color: this.getTagColor(name)
    })).sort((a, b) => b.count - a.count);
    
    const manualArray = Object.entries(manualTags).map(([name, count]) => ({
      name,
      count,
      color: this.getTagColor(name)
    }));
    
    return { auto: autoArray, manual: manualArray };
  },

  // 判断是否新用户（7天内）
  isNewUser(user) {
    if (!user.createdAt) return false;
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  },

  // 获取标签颜色
  getTagColor(tagName) {
    return this.data.tagColors[tagName] || '#64748b';
  },

  // 选择标签查看用户
  async selectTag(e) {
    const tag = e.currentTarget.dataset.tag;
    
    if (this.data.selectedTag === tag) {
      // 取消选择
      this.setData({ selectedTag: null, users: [] });
      return;
    }
    
    this.setData({ selectedTag: tag, users: [], page: 1, loading: true });
    
    try {
      const result = await cloudFunctions.getUserList({ limit: 500 });
      
      if (result.success) {
        // 筛选有该标签的用户
        const filteredUsers = result.data.filter(user => this.userHasTag(user, tag)).map(user => ({
          id: user._id,
          name: user.name || '未知',
          phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '--',
          healthScore: user.latestRecord?.healthScore || '--',
          scoreColor: this.getScoreColor(user.latestRecord?.healthScore || 50)
        }));
        
        this.setData({
          users: filteredUsers,
          total: filteredUsers.length,
          hasMore: false
        });
      }
    } catch (e) {
      console.error('加载用户失败:', e);
    }
    
    this.setData({ loading: false });
  },

  // 判断用户是否有某个标签
  userHasTag(user, tag) {
    // 新/老用户
    if (tag === '新用户') return this.isNewUser(user);
    if (tag === '老用户') return !this.isNewUser(user);
    
    // 风险等级
    const score = user.latestRecord?.healthScore || 50;
    if (tag === '高危') return score < 40;
    if (tag === '中危') return score >= 40 && score < 60;
    if (tag === '低危') return score >= 60;
    
    // 性别
    if (tag === '男' || tag === '女') return user.gender === tag;
    
    // 年龄段
    if (user.age) {
      if (tag === '30岁以下') return user.age < 30;
      if (tag === '30-40岁') return user.age >= 30 && user.age < 40;
      if (tag === '40-50岁') return user.age >= 40 && user.age < 50;
      if (tag === '50-60岁') return user.age >= 50 && user.age < 60;
      if (tag === '60岁以上') return user.age >= 60;
    }
    
    // 体质
    const elements = user.latestRecord?.healthElements || [];
    if (elements.length > 0) {
      const constitutionMap = {
        '气虚质': '气血',
        '阳虚质': '寒凉',
        '湿热质': '毒素',
        '痰湿质': '血脂',
        '气郁质': '情绪',
        '血瘀质': '循环',
        '阴虚质': '免疫'
      };
      const element = constitutionMap[tag];
      return elements[0].name === element;
    }
    
    return false;
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

  loadMoreUsers() {
    // 简化版，一次加载全部
  }
});
