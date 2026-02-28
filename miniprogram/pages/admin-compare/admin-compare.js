// pages/admin-compare/admin-compare.js
// 数据对比分析页 - 使用云函数

const cloudFunctions = require('../../utils/cloud-functions');
const chartUtil = require('../../utils/charts');

Page({
  data: {
    userId: '',
    user: null,
    records: [],
    selectedRecords: [],
    compareMode: 'two', // two: 两条记录对比, multi: 多条记录对比
    maxSelect: 5,
    
    // 图表ID
    scoreCompareChartId: 'scoreCompareChart',
    elementCompareChartId: 'elementCompareChart',
    symptomTrendChartId: 'symptomTrendChart',
    
    // 对比结果
    compareResult: null,
    
    // 加载状态
    loading: true,
    
    // 健康要素颜色
    elementColors: {
      '气血': '#ef4444',
      '循环': '#3b82f6',
      '毒素': '#eab308',
      '血脂': '#f97316',
      '寒凉': '#06b6d4',
      '免疫': '#22c55e',
      '情绪': '#a855f7'
    }
  },

  onLoad(options) {
    this.setData({ userId: options.userId });
    this.loadRecords();
  },

  onReady() {
    this.initCharts();
  },

  // 加载用户所有记录
  async loadRecords() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await cloudFunctions.getUserDetail(this.data.userId);
      
      if (result.success) {
        const { user, records } = result.data;
        
        this.setData({ 
          user, 
          records,
          loading: false 
        });
        
        // 默认选择最近两条记录
        if (records.length >= 2) {
          this.setData({ selectedRecords: [records[0], records[1]] });
          this.generateCompareResult();
        }
      } else {
        wx.showToast({ title: '加载失败', icon: 'error' });
      }
    } catch (e) {
      console.error('加载记录失败:', e);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
    wx.hideLoading();
  },

  // 初始化图表
  async initCharts() {
    try {
      this.scoreCompareChart = await chartUtil.createChart('scoreCompareChart', this);
      this.elementCompareChart = await chartUtil.createChart('elementCompareChart', this);
      this.symptomTrendChart = await chartUtil.createChart('symptomTrendChart', this);
    } catch (e) {
      console.error('初始化图表失败:', e);
    }
  },

  // 切换选择记录
  toggleRecord(e) {
    const recordId = e.currentTarget.dataset.id;
    let { selectedRecords, records, maxSelect } = this.data;
    
    const index = selectedRecords.findIndex(r => r._id === recordId);
    
    if (index >= 0) {
      // 取消选择
      selectedRecords.splice(index, 1);
    } else {
      // 选择记录
      if (selectedRecords.length >= maxSelect) {
        wx.showToast({ title: `最多选择${maxSelect}条记录`, icon: 'none' });
        return;
      }
      const record = records.find(r => r._id === recordId);
      if (record) {
        selectedRecords.push(record);
      }
    }
    
    // 按时间排序
    selectedRecords.sort((a, b) => b.timestamp - a.timestamp);
    
    this.setData({ selectedRecords: [...selectedRecords] });
    
    if (selectedRecords.length >= 2) {
      this.generateCompareResult();
    } else {
      this.setData({ compareResult: null });
    }
  },

  // 生成对比结果
  generateCompareResult() {
    const { selectedRecords } = this.data;
    if (selectedRecords.length < 2) return;
    
    // 计算各维度变化
    const latest = selectedRecords[0];
    const previous = selectedRecords[selectedRecords.length - 1];
    
    // 健康评分变化
    const scoreChange = latest.healthScore - previous.healthScore;
    
    // 症状数量变化
    const symptomChange = (latest.summary?.symptomCount || 0) - (previous.summary?.symptomCount || 0);
    
    // 不良习惯变化
    const habitChange = (latest.summary?.badHabitCount || 0) - (previous.summary?.badHabitCount || 0);
    
    // 健康要素变化
    const elementChange = this.calculateElementChange(latest.healthElements, previous.healthElements);
    
    // 症状变化详情
    const symptomDetail = this.calculateSymptomDetail(latest, previous);
    
    const compareResult = {
      scoreChange,
      symptomChange,
      habitChange,
      elementChange,
      symptomDetail,
      latest,
      previous
    };
    
    this.setData({ compareResult });
    this.drawCompareCharts();
  },

  // 计算健康要素变化
  calculateElementChange(latestElements, previousElements) {
    const changes = [];
    const latestMap = {};
    const previousMap = {};
    
    (latestElements || []).forEach(el => {
      latestMap[el.name] = el.count;
    });
    
    (previousElements || []).forEach(el => {
      previousMap[el.name] = el.count;
    });
    
    const allNames = new Set([...Object.keys(latestMap), ...Object.keys(previousMap)]);
    
    allNames.forEach(name => {
      const latest = latestMap[name] || 0;
      const previous = previousMap[name] || 0;
      changes.push({
        name,
        latest,
        previous,
        change: latest - previous
      });
    });
    
    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  },

  // 计算症状变化详情
  calculateSymptomDetail(latest, previous) {
    const latestSymptoms = new Set(latest.selectedSymptoms || []);
    const previousSymptoms = new Set(previous.selectedSymptoms || []);
    
    // 新增症状
    const added = (latest.selectedSymptoms || []).filter(id => !previousSymptoms.has(id));
    
    // 消失症状
    const removed = (previous.selectedSymptoms || []).filter(id => !latestSymptoms.has(id));
    
    // 持续症状
    const continued = (latest.selectedSymptoms || []).filter(id => previousSymptoms.has(id));
    
    return { added, removed, continued };
  },

  // 绘制对比图表
  drawCompareCharts() {
    const { selectedRecords } = this.data;
    if (selectedRecords.length < 2) return;
    
    // 1. 绘制评分对比柱状图
    this.drawScoreCompare();
    
    // 2. 绘制健康要素对比图
    this.drawElementCompare();
    
    // 3. 绘制趋势图
    this.drawTrend();
  },

  // 绘制评分对比
  drawScoreCompare() {
    if (!this.scoreCompareChart) return;
    
    const { selectedRecords } = this.data;
    this.scoreCompareChart.clear();
    
    const seriesData = [{
      name: '健康评分',
      data: selectedRecords.map((r, index) => ({
        label: `第${selectedRecords.length - index}次`,
        value: r.healthScore || 0
      })).reverse()
    }];
    
    this.scoreCompareChart.drawMultiBarChart(seriesData, {
      title: '健康评分对比',
      colors: ['#3b82f6', '#22c55e', '#f97316', '#eab308', '#8b5cf6']
    });
  },

  // 绘制健康要素对比
  drawElementCompare() {
    if (!this.elementCompareChart) return;
    
    const { selectedRecords, elementColors } = this.data;
    this.elementCompareChart.clear();
    
    // 获取所有要素名称
    const allElements = new Set();
    selectedRecords.forEach(r => {
      (r.healthElements || []).forEach(el => allElements.add(el.name));
    });
    
    const elementNames = Array.from(allElements);
    const colors = ['#3b82f6', '#22c55e', '#f97316', '#eab308', '#8b5cf6'];
    
    const seriesData = selectedRecords.map((r, index) => {
      const elementMap = {};
      (r.healthElements || []).forEach(el => {
        elementMap[el.name] = el.count;
      });
      
      return {
        name: `第${selectedRecords.length - index}次`,
        data: elementNames.map(name => ({
          label: name,
          value: elementMap[name] || 0
        }))
      };
    }).reverse();
    
    this.elementCompareChart.drawMultiBarChart(seriesData, {
      title: '健康要素对比',
      colors: colors.slice(0, selectedRecords.length)
    });
  },

  // 绘制趋势图
  drawTrend() {
    if (!this.symptomTrendChart) return;
    
    const { selectedRecords } = this.data;
    this.symptomTrendChart.clear();
    
    const trendData = selectedRecords.map((r, index) => ({
      label: `第${selectedRecords.length - index}次`,
      value: r.summary?.symptomCount || 0
    })).reverse();
    
    this.symptomTrendChart.drawLineChart(trendData, {
      title: '症状数量趋势',
      color: '#f97316'
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 查看记录详情
  viewRecordDetail(e) {
    const recordId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/admin-record-detail/admin-record-detail?id=${recordId}`
    });
  }
});
