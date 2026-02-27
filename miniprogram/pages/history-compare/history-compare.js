// pages/history-compare/history-compare.js
// 历史记录对比分析页面

const historyManager = require('../../utils/history-manager');

Page({
  data: {
    records: [],
    selectedIds: [],
    isLoading: true,
    
    // 对比数据
    compareData: {
      basicData: [], // 基础数据表格
      symptomsChange: null, // 症状变化分析
      elementsChange: [], // 健康要素变化
      chartData: {} // 图表数据
    },
    
    // AI建议
    aiSuggestion: '',
    isGeneratingSuggestion: false
  },

  onLoad(options) {
    if (options.ids) {
      const ids = options.ids.split(',').map(id => parseInt(id));
      this.setData({ selectedIds: ids });
      this.loadCompareData(ids);
    }
  },

  // 加载对比数据
  loadCompareData(ids) {
    this.setData({ isLoading: true });

    const records = ids.map(id => historyManager.getHistoryById(id)).filter(r => r);
    
    // 按时间排序（最早的在前）
    records.sort((a, b) => a.timestamp - b.timestamp);

    // 生成对比数据
    const compareData = this.generateCompareData(records);

    this.setData({
      records,
      compareData,
      isLoading: false
    });
  },

  // 生成对比数据
  generateCompareData(records) {
    // 基础数据表格
    const basicData = records.map((r, index) => ({
      index: index + 1,
      date: r.dateStr,
      score: r.healthScore || r.summary?.score || 0,
      symptomCount: r.summary?.symptomCount || r.selectedSymptoms?.length || 0,
      badHabitCount: r.summary?.badHabitCount || r.badHabits?.length || 0,
      symptoms300Count: r.summary?.symptoms300Count || r.symptoms300?.length || 0,
      targetCount: r.summary?.targetCount || r.targetSymptoms?.length || 0
    }));

    // 症状变化分析
    const symptomsChange = this.analyzeSymptomsChange(records);

    // 健康要素变化
    const elementsChange = this.analyzeElementsChange(records);

    // 图表数据
    const chartData = {
      scores: basicData.map(d => d.score),
      symptomCounts: basicData.map(d => d.symptomCount),
      dates: basicData.map(d => d.date)
    };

    return {
      basicData,
      symptomsChange,
      elementsChange,
      chartData
    };
  },

  // 分析症状变化
  analyzeSymptomsChange(records) {
    if (records.length < 2) return null;

    const result = {
      newSymptoms: [],
      disappearedSymptoms: [],
      persistentSymptoms: [],
      improvedSymptoms: []
    };

    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];

    const firstSymptomIds = new Set(firstRecord.selectedSymptoms || []);
    const lastSymptomIds = new Set(lastRecord.selectedSymptoms || []);

    // 新增症状
    lastRecord.symptomNames?.forEach(s => {
      if (!firstSymptomIds.has(s.id)) {
        result.newSymptoms.push(s.name);
      }
    });

    // 消失症状
    firstRecord.symptomNames?.forEach(s => {
      if (!lastSymptomIds.has(s.id)) {
        result.disappearedSymptoms.push(s.name);
      }
    });

    // 持续症状
    lastRecord.symptomNames?.forEach(s => {
      if (firstSymptomIds.has(s.id)) {
        result.persistentSymptoms.push(s.name);
      }
    });

    return result;
  },

  // 分析健康要素变化
  analyzeElementsChange(records) {
    if (records.length < 2) return [];

    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];

    const allElements = ['气血', '循环', '毒素', '血脂', '寒凉', '免疫', '情绪'];
    
    return allElements.map(name => {
      const firstCount = firstRecord.healthElements?.find(e => e.name === name)?.count || 0;
      const lastCount = lastRecord.healthElements?.find(e => e.name === name)?.count || 0;
      
      let trend = 'stable';
      if (lastCount < firstCount) trend = 'improved';
      else if (lastCount > firstCount) trend = 'worsened';

      return {
        name,
        firstCount,
        lastCount,
        trend
      };
    }).filter(e => e.firstCount > 0 || e.lastCount > 0);
  },

  // 生成AI改善建议
  generateAISuggestion() {
    this.setData({ isGeneratingSuggestion: true });

    // 构建提示词
    const records = this.data.records;
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    
    const prompt = this.buildSuggestionPrompt(firstRecord, lastRecord);

    // 调用LLM生成建议（这里使用模拟数据，实际需要调用后端API）
    setTimeout(() => {
      const suggestion = this.generateRuleBasedSuggestion(firstRecord, lastRecord);
      this.setData({
        aiSuggestion: suggestion,
        isGeneratingSuggestion: false
      });
    }, 1500);
  },

  // 构建建议提示词
  buildSuggestionPrompt(first, last) {
    return `作为健康管理专家，请根据以下数据对比，给出专业的改善建议：

第一次记录（${first.dateStr}）：
- 健康评分：${first.healthScore || first.summary?.score}
- 症状数量：${first.summary?.symptomCount}
- 主要症状：${first.symptomNames?.slice(0, 5).map(s => s.name).join('、')}
- 不良习惯：${first.badHabitNames?.slice(0, 5).map(h => h.name).join('、')}
- 健康要素：${first.healthElements?.map(e => `${e.name}(${e.count})`).join('、')}

最近一次记录（${last.dateStr}）：
- 健康评分：${last.healthScore || last.summary?.score}
- 症状数量：${last.summary?.symptomCount}
- 主要症状：${last.symptomNames?.slice(0, 5).map(s => s.name).join('、')}
- 不良习惯：${last.badHabitNames?.slice(0, 5).map(h => h.name).join('、')}
- 健康要素：${last.healthElements?.map(e => `${e.name}(${e.count})`).join('、')}

请给出：
1. 改善亮点分析
2. 需要关注的问题
3. 具体改善建议
4. 推荐课程或调理方法`;
  },

  // 基于规则生成建议（备选方案）
  generateRuleBasedSuggestion(first, last) {
    const suggestions = [];
    
    // 计算变化
    const scoreChange = (last.healthScore || last.summary?.score || 0) - (first.healthScore || first.summary?.score || 0);
    const symptomChange = (first.summary?.symptomCount || 0) - (last.summary?.symptomCount || 0);

    // 总体评价
    suggestions.push('【健康趋势分析】');
    if (scoreChange > 0) {
      suggestions.push(`\n✅ 您的健康状况正在改善！评分提升了${scoreChange}分。`);
    } else if (scoreChange < 0) {
      suggestions.push(`\n⚠️ 健康评分下降了${Math.abs(scoreChange)}分，需要引起重视。`);
    } else {
      suggestions.push(`\n📊 健康评分保持稳定，建议继续坚持当前调理方案。`);
    }

    // 症状分析
    suggestions.push('\n\n【症状变化分析】');
    if (symptomChange > 0) {
      suggestions.push(`\n✅ 症状减少了${symptomChange}项，身体状况明显改善。`);
    } else if (symptomChange < 0) {
      suggestions.push(`\n⚠️ 症状增加了${Math.abs(symptomChange)}项，建议排查原因。`);
    }

    // 消失症状
    const disappeared = this.data.compareData.symptomsChange?.disappearedSymptoms || [];
    if (disappeared.length > 0) {
      suggestions.push(`\n\n🎉 改善最明显的症状：${disappeared.slice(0, 3).join('、')}`);
    }

    // 持续症状
    const persistent = this.data.compareData.symptomsChange?.persistentSymptoms || [];
    if (persistent.length > 0) {
      suggestions.push(`\n\n📌 需要持续关注：${persistent.slice(0, 3).join('、')}`);
      suggestions.push('\n建议：');
      suggestions.push('• 保持规律作息，充足睡眠');
      suggestions.push('• 适度运动，增强体质');
      suggestions.push('• 注意饮食均衡，避免刺激性食物');
    }

    // 健康要素建议
    const elements = this.data.compareData.elementsChange || [];
    const worsened = elements.filter(e => e.trend === 'worsened');
    if (worsened.length > 0) {
      suggestions.push('\n\n【重点关注要素】');
      worsened.forEach(e => {
        suggestions.push(`\n• ${e.name}问题有所加重（${e.firstCount}→${e.lastCount}）`);
      });
    }

    // 个性化建议
    suggestions.push('\n\n【改善建议】');
    suggestions.push('\n1. 生活方式调整');
    suggestions.push('   • 保持每天7-8小时睡眠');
    suggestions.push('   • 每周运动3-5次，每次30分钟以上');
    suggestions.push('   • 减少电子产品使用时间');

    suggestions.push('\n\n2. 饮食建议');
    suggestions.push('   • 多吃新鲜蔬菜水果');
    suggestions.push('   • 减少油腻、辛辣食物');
    suggestions.push('   • 保持充足饮水（每天2000ml以上）');

    suggestions.push('\n\n3. 推荐课程');
    suggestions.push('   • 第1季第1课《人不是死于疾病，而是死于无知》');
    suggestions.push('   • 第1季第2课《疾病为什么会反复》');

    suggestions.push('\n\n💡 温馨提示：以上建议仅供参考，如有严重不适请及时就医。');

    return suggestions.join('');
  },

  // 返回
  goBack() {
    wx.navigateBack();
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '健康数据对比分析',
      path: '/pages/index/index'
    };
  }
});
