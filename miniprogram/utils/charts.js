// utils/charts.js
// 图表绘制工具类 - 微信小程序原生Canvas绘制

/**
 * 图表绘制类
 */
class Chart {
  constructor(canvasId, ctx, width, height) {
    this.canvasId = canvasId;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.padding = { top: 40, right: 20, bottom: 40, left: 50 };
    this.colors = [
      '#3b82f6', '#22c55e', '#f97316', '#eab308', 
      '#8b5cf6', '#06b6d4', '#ef4444', '#ec4899'
    ];
  }

  /**
   * 清空画布
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * 绘制柱状图
   * @param {Array} data 数据数组 [{label, value}]
   * @param {Object} options 配置项
   */
  drawBarChart(data, options = {}) {
    if (!data || data.length === 0) return;
    
    const { title = '', showValue = true, colors = this.colors } = options;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    
    // 计算最大值
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2 || 100;
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 绘制Y轴刻度
    this.ctx.setFontSize(10);
    this.ctx.setFillStyle('#6b7280');
    this.ctx.setTextAlign('right');
    for (let i = 0; i <= 5; i++) {
      const y = this.padding.top + chartHeight - (chartHeight / 5) * i;
      const value = Math.round((maxValue / 5) * i);
      this.ctx.fillText(value.toString(), this.padding.left - 8, y + 4);
      
      // 绘制网格线
      this.ctx.setStrokeStyle('#e5e7eb');
      this.ctx.setLineWidth(0.5);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.width - this.padding.right, y);
      this.ctx.stroke();
    }
    
    // 计算柱子宽度
    const barCount = data.length;
    const barWidth = Math.min(40, (chartWidth - (barCount - 1) * 10) / barCount);
    const startX = this.padding.left + (chartWidth - barCount * barWidth - (barCount - 1) * 10) / 2;
    
    // 绘制柱子
    data.forEach((item, index) => {
      const x = startX + index * (barWidth + 10);
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = this.padding.top + chartHeight - barHeight;
      
      // 绘制柱子
      const gradient = this.ctx.createLinearGradient(x, y, x, this.padding.top + chartHeight);
      gradient.addColorStop(0, colors[index % colors.length]);
      gradient.addColorStop(1, this.lightenColor(colors[index % colors.length], 30));
      
      this.ctx.setFillStyle(gradient);
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      this.ctx.fill();
      
      // 绘制数值
      if (showValue) {
        this.ctx.setFontSize(10);
        this.ctx.setFillStyle('#374151');
        this.ctx.setTextAlign('center');
        this.ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
      }
      
      // 绘制标签
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#6b7280');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(item.label, x + barWidth / 2, this.height - this.padding.bottom + 15);
    });
  }

  /**
   * 绘制折线图
   * @param {Array} data 数据数组 [{label, value}]
   * @param {Object} options 配置项
   */
  drawLineChart(data, options = {}) {
    if (!data || data.length === 0) return;
    
    const { title = '', color = '#3b82f6', showDot = true, showArea = true } = options;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value)) * 1.2 || 100;
    const minValue = Math.min(...data.map(d => d.value));
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 绘制Y轴刻度
    this.ctx.setFontSize(10);
    this.ctx.setFillStyle('#6b7280');
    this.ctx.setTextAlign('right');
    for (let i = 0; i <= 5; i++) {
      const y = this.padding.top + chartHeight - (chartHeight / 5) * i;
      const value = Math.round((maxValue / 5) * i);
      this.ctx.fillText(value.toString(), this.padding.left - 8, y + 4);
      
      this.ctx.setStrokeStyle('#e5e7eb');
      this.ctx.setLineWidth(0.5);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.width - this.padding.right, y);
      this.ctx.stroke();
    }
    
    // 计算点位置
    const points = data.map((item, index) => {
      const x = this.padding.left + (chartWidth / (data.length - 1 || 1)) * index;
      const y = this.padding.top + chartHeight - (item.value / maxValue) * chartHeight;
      return { x, y, value: item.value, label: item.label };
    });
    
    // 绘制填充区域
    if (showArea && points.length > 1) {
      const gradient = this.ctx.createLinearGradient(0, this.padding.top, 0, this.padding.top + chartHeight);
      gradient.addColorStop(0, this.hexToRgba(color, 0.3));
      gradient.addColorStop(1, this.hexToRgba(color, 0.05));
      
      this.ctx.setFillStyle(gradient);
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, this.padding.top + chartHeight);
      points.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.lineTo(points[points.length - 1].x, this.padding.top + chartHeight);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // 绘制折线
    if (points.length > 1) {
      this.ctx.setStrokeStyle(color);
      this.ctx.setLineWidth(2);
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    }
    
    // 绘制点和标签
    points.forEach((p, index) => {
      if (showDot) {
        this.ctx.setFillStyle('#ffffff');
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.setFillStyle(color);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        this.ctx.fill();
      }
      
      // 绘制数值
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#374151');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(p.value.toString(), p.x, p.y - 10);
      
      // 绘制X轴标签
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#6b7280');
      this.ctx.fillText(p.label, p.x, this.height - this.padding.bottom + 15);
    });
  }

  /**
   * 绘制饼图
   * @param {Array} data 数据数组 [{label, value}]
   * @param {Object} options 配置项
   */
  drawPieChart(data, options = {}) {
    if (!data || data.length === 0) return;
    
    const { title = '', colors = this.colors, showLabel = true } = options;
    const centerX = this.width / 2;
    const centerY = this.height / 2 + (title ? 15 : 0);
    const radius = Math.min(this.width, this.height) / 2 - 60;
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 计算总值
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;
    
    // 绘制扇形
    data.forEach((item, index) => {
      const angle = (item.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // 绘制扇形
      this.ctx.setFillStyle(colors[index % colors.length]);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fill();
      
      // 绘制白色边框
      this.ctx.setStrokeStyle('#ffffff');
      this.ctx.setLineWidth(2);
      this.ctx.stroke();
      
      // 绘制标签
      if (showLabel && item.value > 0) {
        const midAngle = startAngle + angle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;
        
        this.ctx.setFontSize(10);
        this.ctx.setFillStyle('#ffffff');
        this.ctx.setTextAlign('center');
        this.ctx.setTextBaseline('middle');
        const percent = Math.round((item.value / total) * 100);
        if (percent >= 5) {
          this.ctx.fillText(`${percent}%`, labelX, labelY);
        }
      }
      
      startAngle = endAngle;
    });
    
    // 绘制图例
    const legendY = this.height - 30;
    const legendSpacing = this.width / data.length;
    data.forEach((item, index) => {
      const x = legendSpacing / 2 + legendSpacing * index;
      
      // 绘制色块
      this.ctx.setFillStyle(colors[index % colors.length]);
      this.ctx.beginPath();
      this.ctx.roundRect(x - 30, legendY, 12, 12, 2);
      this.ctx.fill();
      
      // 绘制文字
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#374151');
      this.ctx.setTextAlign('left');
      this.ctx.fillText(item.label, x - 14, legendY + 10);
    });
  }

  /**
   * 绘制雷达图
   * @param {Array} data 数据数组 [{label, value}]
   * @param {Object} options 配置项
   */
  drawRadarChart(data, options = {}) {
    if (!data || data.length === 0) return;
    
    const { title = '', color = '#3b82f6', maxValue = 100 } = options;
    const centerX = this.width / 2;
    const centerY = this.height / 2 + (title ? 15 : 0);
    const radius = Math.min(this.width, this.height) / 2 - 60;
    const sides = data.length;
    const angleStep = (2 * Math.PI) / sides;
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 绘制背景网格
    for (let level = 5; level >= 1; level--) {
      const levelRadius = (radius / 5) * level;
      this.ctx.setStrokeStyle('#e5e7eb');
      this.ctx.setLineWidth(0.5);
      this.ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }
    
    // 绘制轴线
    for (let i = 0; i < sides; i++) {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      this.ctx.setStrokeStyle('#e5e7eb');
      this.ctx.setLineWidth(0.5);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      
      // 绘制标签
      const labelRadius = radius + 20;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;
      
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#374151');
      this.ctx.setTextAlign('center');
      this.ctx.setTextBaseline('middle');
      this.ctx.fillText(data[i].label, labelX, labelY);
    }
    
    // 绘制数据区域
    this.ctx.setFillStyle(this.hexToRgba(color, 0.3));
    this.ctx.setStrokeStyle(color);
    this.ctx.setLineWidth(2);
    this.ctx.beginPath();
    data.forEach((item, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const value = Math.min(item.value, maxValue);
      const r = (value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // 绘制数据点
    data.forEach((item, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const value = Math.min(item.value, maxValue);
      const r = (value / maxValue) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      
      this.ctx.setFillStyle('#ffffff');
      this.ctx.beginPath();
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
      this.ctx.fill();
      
      this.ctx.setFillStyle(color);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }

  /**
   * 绘制仪表盘
   * @param {number} value 当前值
   * @param {Object} options 配置项
   */
  drawGauge(value, options = {}) {
    const { title = '', maxValue = 100, colors = null } = options;
    const centerX = this.width / 2;
    const centerY = this.height / 2 + 20;
    const radius = Math.min(this.width, this.height) / 2 - 40;
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 确定颜色
    let color = '#22c55e'; // 绿色
    let status = '优秀';
    if (value < 40) {
      color = '#ef4444'; // 红色
      status = '较差';
    } else if (value < 60) {
      color = '#f97316'; // 橙色
      status = '一般';
    } else if (value < 80) {
      color = '#eab308'; // 黄色
      status = '良好';
    }
    
    // 绘制背景弧
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;
    
    // 背景弧
    this.ctx.setStrokeStyle('#e5e7eb');
    this.ctx.setLineWidth(20);
    this.ctx.setLineCap('round');
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    this.ctx.stroke();
    
    // 进度弧
    const progressAngle = startAngle + (value / maxValue) * totalAngle;
    const gradient = this.ctx.createLinearGradient(
      centerX - radius, centerY,
      centerX + radius, centerY
    );
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color);
    
    this.ctx.setStrokeStyle(gradient);
    this.ctx.setLineWidth(20);
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, startAngle, progressAngle);
    this.ctx.stroke();
    
    // 绘制刻度
    this.ctx.setFontSize(10);
    this.ctx.setFillStyle('#6b7280');
    this.ctx.setTextAlign('center');
    for (let i = 0; i <= 10; i++) {
      const angle = startAngle + (totalAngle / 10) * i;
      const tickRadius = radius + 15;
      const x = centerX + Math.cos(angle) * tickRadius;
      const y = centerY + Math.sin(angle) * tickRadius;
      this.ctx.fillText((i * 10).toString(), x, y);
    }
    
    // 绘制中心数值
    this.ctx.setFontSize(36);
    this.ctx.setFillStyle(color);
    this.ctx.setTextAlign('center');
    this.ctx.setTextBaseline('middle');
    this.ctx.fillText(value.toString(), centerX, centerY - 10);
    
    // 绘制状态文字
    this.ctx.setFontSize(14);
    this.ctx.setFillStyle('#374151');
    this.ctx.fillText(status, centerX, centerY + 25);
    
    // 绘制单位
    this.ctx.setFontSize(12);
    this.ctx.setFillStyle('#6b7280');
    this.ctx.fillText('分', centerX + 25, centerY - 10);
  }

  /**
   * 绘制多系列柱状图（用于对比）
   * @param {Array} seriesData 多系列数据 [{name, data: [{label, value}]}]
   * @param {Object} options 配置项
   */
  drawMultiBarChart(seriesData, options = {}) {
    if (!seriesData || seriesData.length === 0) return;
    
    const { title = '', colors = this.colors } = options;
    const chartWidth = this.width - this.padding.left - this.padding.right;
    const chartHeight = this.height - this.padding.top - this.padding.bottom;
    
    // 获取所有标签和最大值
    const labels = seriesData[0].data.map(d => d.label);
    const allValues = seriesData.flatMap(s => s.data.map(d => d.value));
    const maxValue = Math.max(...allValues) * 1.2 || 100;
    
    // 绘制标题
    if (title) {
      this.ctx.setFontSize(14);
      this.ctx.setFillStyle('#1f2937');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(title, this.width / 2, 25);
    }
    
    // 绘制Y轴刻度
    this.ctx.setFontSize(10);
    this.ctx.setFillStyle('#6b7280');
    this.ctx.setTextAlign('right');
    for (let i = 0; i <= 5; i++) {
      const y = this.padding.top + chartHeight - (chartHeight / 5) * i;
      const value = Math.round((maxValue / 5) * i);
      this.ctx.fillText(value.toString(), this.padding.left - 8, y + 4);
      
      this.ctx.setStrokeStyle('#e5e7eb');
      this.ctx.setLineWidth(0.5);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding.left, y);
      this.ctx.lineTo(this.width - this.padding.right, y);
      this.ctx.stroke();
    }
    
    // 计算柱子尺寸
    const groupCount = labels.length;
    const seriesCount = seriesData.length;
    const groupWidth = chartWidth / groupCount;
    const barWidth = Math.min(20, (groupWidth - 10) / seriesCount);
    const barGap = 4;
    
    // 绘制柱子
    labels.forEach((label, groupIndex) => {
      const groupStartX = this.padding.left + groupIndex * groupWidth;
      
      seriesData.forEach((series, seriesIndex) => {
        const item = series.data[groupIndex];
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = groupStartX + (groupWidth - seriesCount * barWidth - (seriesCount - 1) * barGap) / 2 + seriesIndex * (barWidth + barGap);
        const y = this.padding.top + chartHeight - barHeight;
        
        this.ctx.setFillStyle(colors[seriesIndex % colors.length]);
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        this.ctx.fill();
      });
      
      // 绘制X轴标签
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#6b7280');
      this.ctx.setTextAlign('center');
      this.ctx.fillText(label, groupStartX + groupWidth / 2, this.height - this.padding.bottom + 15);
    });
    
    // 绘制图例
    const legendY = this.height - 15;
    const legendSpacing = this.width / seriesData.length;
    seriesData.forEach((series, index) => {
      const x = legendSpacing / 2 + legendSpacing * index;
      
      this.ctx.setFillStyle(colors[index % colors.length]);
      this.ctx.beginPath();
      this.ctx.roundRect(x - 35, legendY, 12, 12, 2);
      this.ctx.fill();
      
      this.ctx.setFontSize(10);
      this.ctx.setFillStyle('#374151');
      this.ctx.setTextAlign('left');
      this.ctx.fillText(series.name, x - 19, legendY + 10);
    });
  }

  // 辅助方法：颜色变亮
  lightenColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  // 辅助方法：hex转rgba
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

/**
 * 创建图表实例
 * @param {string} canvasId canvas的id
 * @param {Object} component 组件实例(this)
 * @returns {Promise<Chart>} 图表实例
 */
function createChart(canvasId, component) {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery().in(component);
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          reject(new Error('找不到canvas节点'));
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const width = res[0].width;
        const height = res[0].height;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        resolve(new Chart(canvasId, ctx, width, height));
      });
  });
}

module.exports = {
  Chart,
  createChart
};
