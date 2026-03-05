// pages/admin-analytics/admin-analytics.js
// 数据分析页面 - 症状/体质/方案统计

const cloudFunctions = require('../../utils/cloud-functions');
const chartUtil = require('../../utils/charts');

Page({
  data: {
    loading: true,
    activeTab: 'symptom',
    tabs: [
      { id: 'symptom', name: '症状统计', icon: '🩺' },
      { id: 'constitution', name: '体质分布', icon: '🧘' },
      { id: 'plan', name: '方案统计', icon: '📋' },
      { id: 'trend', name: '趋势分析', icon: '📈' }
    ],
    
    // 时间筛选
    dateRange: '30',
    dateOptions: ['7', '30', '90', '365'],
    
    // 症状统计
    symptomData: null,
    
    // 体质统计
    constitutionData: null,
    
    // 方案统计
    planData: null,
    
    // 趋势数据
    trendData: null,
    
    // 图表实例
    charts: {}
  },

  onLoad() {
    const isLoggedIn = wx.getStorageSync('adminLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({ url: '/pages/admin-login/admin-login' });
      return;
    }
    this.loadData();
  },

  onReady() {
    // 图表初始化
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    
    try {
      // 根据当前Tab加载数据
      await this.loadTabData(this.data.activeTab);
    } catch (e) {
      console.error('加载数据失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    
    this.setData({ loading: false });
  },

  // 切换Tab
  async switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab, loading: true });
    
    try {
      await this.loadTabData(tab);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    
    this.setData({ loading: false });
  },

  // 加载Tab数据
  async loadTabData(tab) {
    const days = parseInt(this.data.dateRange);
    const startDate = this.getDateBefore(days);
    const endDate = this.getToday();
    
    switch (tab) {
      case 'symptom':
        await this.loadSymptomData(startDate, endDate);
        break;
      case 'constitution':
        await this.loadConstitutionData(startDate, endDate);
        break;
      case 'plan':
        await this.loadPlanData(startDate, endDate);
        break;
      case 'trend':
        await this.loadTrendData(days);
        break;
    }
  },

  // 加载症状统计
  async loadSymptomData(startDate, endDate) {
    try {
      const result = await cloudFunctions.getSymptomStats({ startDate, endDate, limit: 20 });
      if (result.success) {
        this.setData({ symptomData: result.data });
        // 延迟绘制图表
        setTimeout(() => this.drawSymptomChart(), 300);
      }
    } catch (e) {
      console.error('加载症状统计失败:', e);
    }
  },

  // 加载体质统计
  async loadConstitutionData(startDate, endDate) {
    try {
      const result = await cloudFunctions.getConstitutionStats({ startDate, endDate });
      if (result.success) {
        this.setData({ constitutionData: result.data });
        setTimeout(() => this.drawConstitutionChart(), 300);
      }
    } catch (e) {
      console.error('加载体质统计失败:', e);
    }
  },

  // 加载方案统计
  async loadPlanData(startDate, endDate) {
    try {
      const result = await cloudFunctions.getPlanStats({ startDate, endDate });
      if (result.success) {
        this.setData({ planData: result.data });
        setTimeout(() => this.drawPlanChart(), 300);
      }
    } catch (e) {
      console.error('加载方案统计失败:', e);
    }
  },

  // 加载趋势数据
  async loadTrendData(days) {
    try {
      const result = await cloudFunctions.getTrendData({ days });
      if (result.success) {
        this.setData({ trendData: result.data });
        setTimeout(() => this.drawTrendChart(), 300);
      }
    } catch (e) {
      console.error('加载趋势数据失败:', e);
    }
  },

  // 绘制症状统计图表
  async drawSymptomChart() {
    try {
      if (!this.data.symptomData) return;
      
      const chart = await chartUtil.createChart('symptomChart', this);
      if (!chart) return;
      
      const data = this.data.symptomData.topSymptoms.slice(0, 10).map(s => ({
        label: s.name,
        value: s.count
      }));
      
      chart.clear();
      chart.drawBarChart(data, {
        title: 'TOP10 症状分布',
        color: '#3b82f6'
      });
    } catch (e) {
      console.error('绘制症状图表失败:', e);
    }
  },

  // 绘制体质分布图表
  async drawConstitutionChart() {
    try {
      if (!this.data.constitutionData) return;
      
      const chart = await chartUtil.createChart('constitutionChart', this);
      if (!chart) return;
      
      const counts = this.data.constitutionData.constitutionCounts;
      const data = Object.entries(counts)
        .filter(([_, v]) => v > 0)
        .map(([label, value]) => ({ label, value }));
      
      chart.clear();
      chart.drawPieChart(data, {
        title: '体质分布'
      });
    } catch (e) {
      console.error('绘体质图表失败:', e);
    }
  },

  // 绘制方案统计图表
  async drawPlanChart() {
    try {
      if (!this.data.planData) return;
      
      const chart = await chartUtil.createChart('planChart', this);
      if (!chart) return;
      
      const data = this.data.planData.choiceDetails.map(c => ({
        label: c.label,
        value: c.count
      }));
      
      chart.clear();
      chart.drawBarChart(data, {
        title: '方案选择分布',
        color: '#22c55e'
      });
    } catch (e) {
      console.error('绘制方案图表失败:', e);
    }
  },

  // 绘制趋势图表
  async drawTrendChart() {
    try {
      if (!this.data.trendData) return;
      
      const chart = await chartUtil.createChart('trendChart', this);
      if (!chart) return;
      
      const data = this.data.trendData.trend.map(t => ({
        label: t.date,
        value: t.newUsers,
        value2: t.newRecords
      }));
      
      chart.clear();
      chart.drawLineChart(data, {
        title: '用户增长趋势',
        series: ['新增用户', '检测次数'],
        colors: ['#3b82f6', '#22c55e']
      });
    } catch (e) {
      console.error('绘制趋势图表失败:', e);
    }
  },

  // 时间范围切换
  onDateRangeChange(e) {
    this.setData({ dateRange: e.detail.value });
    this.loadTabData(this.data.activeTab);
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 工具函数
  getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },

  getToday() {
    return new Date().toISOString().split('T')[0];
  }
});
