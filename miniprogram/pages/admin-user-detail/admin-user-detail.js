// pages/admin-user-detail/admin-user-detail.js
// 用户详情页 - 使用云函数

const cloudFunctions = require('../../utils/cloud-functions');
const chartUtil = require('../../utils/charts');

Page({
  data: {
    userId: '',
    user: null,
    records: [],
    latestRecord: null,
    loading: true,
    healthElementsCount: 0, // 健康要素数量
    
    // 图表画布ID
    scoreChartId: 'scoreChart',
    radarChartId: 'radarChart',
    symptomChartId: 'symptomChart',
    trendChartId: 'trendChart',
    
    // 健康七问配置
    questions: [
      { id: 'sleep', question: '睡眠时间', icon: '😴' },
      { id: 'exercise', question: '运动频率', icon: '🏃' },
      { id: 'water', question: '饮水量', icon: '💧' },
      { id: 'diet', question: '饮食习惯', icon: '🍽️' },
      { id: 'stress', question: '压力程度', icon: '😰' },
      { id: 'emotion', question: '情绪状态', icon: '😊' },
      { id: 'screen', question: '电子设备使用', icon: '📱' }
    ],
    
    // 健康要素颜色
    elementColors: {
      '气血': '#ef4444',
      '循环': '#3b82f6',
      '毒素': '#eab308',
      '血脂': '#f97316',
      '寒凉': '#06b6d4',
      '免疫': '#22c55e',
      '情绪': '#a855f7'
    },
    
    // Tab切换
    activeTab: 'overview',
    tabs: [
      { id: 'overview', name: '概览' },
      { id: 'symptoms', name: '症状详情' },
      { id: 'habits', name: '生活习惯' },
      { id: 'history', name: '历史记录' }
    ]
  },

  onLoad(options) {
    this.setData({ userId: options.id });
    this.loadUserDetail();
  },

  onReady() {
    // 初始化图表
    this.initCharts();
  },

  // 加载用户详情
  async loadUserDetail() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await cloudFunctions.getUserDetail(this.data.userId);
      
      if (result.success) {
        const { user, records } = result.data;
        const latestRecord = records.length > 0 ? records[0] : null;
        const healthElementsCount = latestRecord && latestRecord.healthElements ? latestRecord.healthElements.length : 0;
        
        this.setData({ 
          user, 
          records, 
          latestRecord,
          healthElementsCount,
          loading: false 
        });
        
        // 数据加载后绘制图表
        this.drawCharts();
      } else {
        wx.showToast({ title: '加载失败', icon: 'error' });
      }
    } catch (e) {
      console.error('加载用户详情失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  // 初始化图表
  async initCharts() {
    try {
      // 创建图表实例
      this.scoreChart = await chartUtil.createChart('scoreChart', this);
      this.radarChart = await chartUtil.createChart('radarChart', this);
      this.symptomChart = await chartUtil.createChart('symptomChart', this);
      this.trendChart = await chartUtil.createChart('trendChart', this);
    } catch (e) {
      console.error('初始化图表失败:', e);
    }
  },

  // 绘制所有图表
  drawCharts() {
    const { user, records, latestRecord } = this;
    
    if (!latestRecord) return;
    
    // 1. 绘制健康评分仪表盘
    this.drawScoreGauge(latestRecord.healthScore || 0);
    
    // 2. 绘制健康要素雷达图
    this.drawHealthRadar(latestRecord.healthElements || []);
    
    // 3. 绘制症状分布饼图
    this.drawSymptomPie(latestRecord.selectedSymptoms || []);
    
    // 4. 绘制健康评分趋势图
    this.drawScoreTrend(records);
  },

  // 绘制健康评分仪表盘
  drawScoreGauge(score) {
    if (!this.scoreChart) return;
    this.scoreChart.clear();
    this.scoreChart.drawGauge(score, { 
      title: '健康评分',
      maxValue: 100 
    });
  },

  // 绘制健康要素雷达图
  drawHealthRadar(elements) {
    if (!this.radarChart || !elements || elements.length === 0) return;
    
    this.radarChart.clear();
    
    // 准备雷达图数据
    const radarData = elements.map(el => ({
      label: el.name,
      value: el.count
    }));
    
    this.radarChart.drawRadarChart(radarData, {
      title: '健康要素分布',
      maxValue: Math.max(...elements.map(e => e.count), 10),
      color: '#3b82f6'
    });
  },

  // 绘制症状分布饼图
  drawSymptomPie(symptoms) {
    if (!this.symptomChart || !symptoms || symptoms.length === 0) return;
    
    this.symptomChart.clear();
    
    // 统计症状数量
    const pieData = [{
      label: '身体症状',
      value: symptoms.length
    }];
    
    this.symptomChart.drawPieChart(pieData, {
      title: '症状分布'
    });
  },

  // 绘制健康评分趋势图
  drawScoreTrend(records) {
    if (!this.trendChart || !records || records.length === 0) return;
    
    this.trendChart.clear();
    
    // 准备趋势数据（最多显示最近10条）
    const trendData = records.slice(0, 10).reverse().map((record, index) => ({
      label: `第${index + 1}次`,
      value: record.healthScore || 0
    }));
    
    if (trendData.length > 1) {
      this.trendChart.drawLineChart(trendData, {
        title: '健康评分趋势',
        color: '#22c55e'
      });
    } else {
      // 只有一条数据，绘制柱状图
      this.trendChart.drawBarChart(trendData, {
        title: '健康评分',
        colors: ['#3b82f6']
      });
    }
  },

  // Tab切换
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 查看历史记录详情
  viewRecordDetail(e) {
    const recordId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-record-detail/admin-record-detail?id=${recordId}`
    });
  },

  // 进入数据对比页面
  goToCompare() {
    wx.navigateTo({
      url: `/pages/admin-compare/admin-compare?userId=${this.data.userId}`
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 删除用户
  async deleteUser() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除此用户吗？此操作无法恢复！',
      confirmColor: '#ef4444'
    });
    
    if (res.confirm) {
      wx.showLoading({ title: '删除中...' });
      try {
        const result = await cloudFunctions.deleteUser(this.data.userId);
        if (result.success) {
          wx.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: '删除失败', icon: 'error' });
        }
      } catch (e) {
        wx.showToast({ title: '删除失败', icon: 'error' });
      }
      wx.hideLoading();
    }
  },

  // 复制手机号
  copyPhone() {
    if (this.data.user && this.data.user.phone) {
      wx.setClipboardData({
        data: this.data.user.phone,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' });
        }
      });
    }
  },

  // 拨打电话
  callPhone() {
    if (this.data.user && this.data.user.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.user.phone
      });
    }
  }
});
