import { NextRequest, NextResponse } from 'next/server';

interface CompareRequest {
  recordIds: string[];
  type: 'face' | 'tongue' | 'posture' | 'biological-age' | 'voice-health';
}

interface ComparisonResult {
  records: any[];
  comparison: {
    scoreChange: number;
    scoreTrend: 'improving' | 'stable' | 'declining';
    riskLevelChange: string;
    constitutionChange: string;
    keyChanges: Array<{
      category: string;
      before: any;
      after: any;
      change: string;
    }>;
  };
  trendAnalysis: {
    period: string;
    trend: string;
    analysis: string;
    recommendations: string[];
  };
  summary: string;
  fullReport: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json();
    const { recordIds, type } = body;

    if (!recordIds || recordIds.length < 2) {
      return NextResponse.json(
        { error: '请提供至少两条记录进行对比' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: '请指定记录类型' },
        { status: 400 }
      );
    }

    console.log('[HistoryCompare] 开始对比分析:', { recordIds, type });

    // 根据类型查询记录
    const tableName = getTableName(type);
    const records = await fetchRecords(tableName, recordIds);

    if (!records || records.length < 2) {
      return NextResponse.json(
        { error: '未找到足够的记录进行对比' },
        { status: 404 }
      );
    }

    // 按时间排序（最早的在前）
    records.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // 生成对比分析
    const comparisonResult = generateComparison(records, type);

    console.log('[HistoryCompare] 对比分析完成');

    return NextResponse.json({
      success: true,
      data: comparisonResult,
    });
  } catch (error) {
    console.error('[HistoryCompare] 对比失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '历史记录对比失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// 获取表名
function getTableName(type: string): string {
  const tableMap: Record<string, string> = {
    'face': 'face_diagnosis_records',
    'tongue': 'tongue_diagnosis_records',
    'posture': 'posture_diagnosis_records',
    'biological-age': 'biological_age_records',
    'voice-health': 'voice_health_records',
  };
  return tableMap[type] || type + '_records';
}

// 获取记录（模拟，实际应该从数据库查询）
async function fetchRecords(tableName: string, recordIds: string[]): Promise<any[]> {
  // 这里应该从数据库查询记录
  // 由于这是一个演示，我们返回模拟数据
  // 实际实现需要根据你的数据库配置进行调整
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(recordIds.map((id, index) => ({
        id,
        created_at: new Date(Date.now() - (recordIds.length - index) * 7 * 24 * 60 * 60 * 1000).toISOString(),
        score: 70 + Math.floor(Math.random() * 20),
        raw_data: {},
      })));
    }, 100);
  });
}

// 生成对比分析
function generateComparison(records: any[], type: string): ComparisonResult {
  const firstRecord = records[0];
  const lastRecord = records[records.length - 1];

  // 计算评分变化
  const scoreChange = (lastRecord.score || 0) - (firstRecord.score || 0);
  let scoreTrend: 'improving' | 'stable' | 'declining';
  if (scoreChange > 5) scoreTrend = 'improving';
  else if (scoreChange < -5) scoreTrend = 'declining';
  else scoreTrend = 'stable';

  // 生成关键变化
  const keyChanges: Array<{
    category: string;
    before: any;
    after: any;
    change: string;
  }> = [];

  keyChanges.push({
    category: '健康评分',
    before: firstRecord.score,
    after: lastRecord.score,
    change: scoreChange > 0 ? '提升' : scoreChange < 0 ? '下降' : '稳定',
  });

  // 计算时间跨度
  const startDate = new Date(firstRecord.created_at);
  const endDate = new Date(lastRecord.created_at);
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 分析趋势
  let trend = '平稳';
  if (scoreTrend === 'improving') trend = '稳步改善';
  else if (scoreTrend === 'declining') trend = '逐渐下降';

  // 生成趋势分析
  const trendAnalysis = {
    period: `${daysDiff}天`,
    trend,
    analysis: generateTrendAnalysis(records, scoreTrend),
    recommendations: generateTrendRecommendations(records, scoreTrend, type),
  };

  // 生成总结
  const summary = `在过去${daysDiff}天内，共进行了${records.length}次${getTypeName(type)}检测。健康评分从${firstRecord.score}分${scoreChange > 0 ? '提升' : scoreChange < 0 ? '下降' : '持平'}到${lastRecord.score}分，整体呈现${trend}趋势。${scoreTrend === 'improving' ? '继续保持良好习惯，持续关注健康。' : scoreTrend === 'declining' ? '建议调整生活习惯，关注健康指标变化。' : '保持当前状态，定期监测健康。'}`;

  // 生成完整报告
  const fullReport = generateComparisonReport(
    records,
    {
      scoreChange,
      scoreTrend,
      riskLevelChange: '无明显变化',
      constitutionChange: '无明显变化',
      keyChanges,
    },
    trendAnalysis,
    summary
  );

  return {
    records,
    comparison: {
      scoreChange,
      scoreTrend,
      riskLevelChange: '无明显变化',
      constitutionChange: '无明显变化',
      keyChanges,
    },
    trendAnalysis,
    summary,
    fullReport,
  };
}

// 获取类型名称
function getTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    'face': '面诊',
    'tongue': '舌诊',
    'posture': '体态评估',
    'biological-age': '生理年龄评估',
    'voice-health': '声音健康评估',
  };
  return nameMap[type] || type;
}

// 生成趋势分析文本
function generateTrendAnalysis(records: any[], scoreTrend: string): string {
  const scores = records.map(r => r.score);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  let analysis = `平均评分为${avgScore.toFixed(1)}分，最高${maxScore}分，最低${minScore}分。`;
  
  if (scoreTrend === 'improving') {
    analysis += ' 整体呈现稳步上升趋势，说明健康管理措施有效。';
  } else if (scoreTrend === 'declining') {
    analysis += ' 整体呈现下降趋势，建议及时调整生活习惯，关注健康指标。';
  } else {
    analysis += ' 整体保持稳定，说明当前健康状况平稳。';
  }

  return analysis;
}

// 生成趋势建议
function generateTrendRecommendations(records: any[], scoreTrend: string, type: string): string[] {
  const recommendations: string[] = [];

  if (scoreTrend === 'improving') {
    recommendations.push('继续保持当前的健康管理措施');
    recommendations.push('定期进行健康监测，及时发现变化');
    recommendations.push('可以适当增加运动量，进一步改善健康');
  } else if (scoreTrend === 'declining') {
    recommendations.push('及时调整生活习惯，关注饮食和作息');
    recommendations.push('增加体育锻炼，提高身体机能');
    recommendations.push('保持良好心态，减少压力');
    recommendations.push('如有明显不适，建议及时就医检查');
  } else {
    recommendations.push('保持当前的健康管理方式');
    recommendations.push('定期进行健康检测，监测变化');
  }

  // 根据类型添加特定建议
  if (type === 'face' || type === 'tongue') {
    recommendations.push('关注中医调理，平衡五脏六腑');
  } else if (type === 'posture') {
    recommendations.push('注意体态矫正，避免不良姿势');
  } else if (type === 'biological-age') {
    recommendations.push('加强抗衰老护理，延缓老化进程');
  } else if (type === 'voice-health') {
    recommendations.push('注意用嗓卫生，保护声带健康');
  }

  return recommendations;
}

// 生成对比报告
function generateComparisonReport(
  records: any[],
  comparison: any,
  trendAnalysis: any,
  summary: string
): string {
  const sections: string[] = [];
  
  sections.push('【历史记录对比报告】\n');
  sections.push(`报告生成时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  // 记录列表
  sections.push('📋 对比记录列表');
  records.forEach((record, index) => {
    const date = new Date(record.created_at).toLocaleDateString('zh-CN');
    sections.push(`  ${index + 1}. ${date} - 评分：${record.score}分`);
  });
  sections.push('');

  // 对比分析
  sections.push('📊 对比分析');
  sections.push(`  评分变化：${comparison.scoreChange > 0 ? '+' : ''}${comparison.scoreChange}分`);
  sections.push(`  变化趋势：${comparison.scoreTrend === 'improving' ? '改善' : comparison.scoreTrend === 'declining' ? '下降' : '稳定'}`);
  sections.push('');

  // 关键变化
  if (comparison.keyChanges && comparison.keyChanges.length > 0) {
    sections.push('🔍 关键变化');
    comparison.keyChanges.forEach((change: any) => {
      sections.push(`  ${change.category}：${change.before} → ${change.after}（${change.change}）`);
    });
    sections.push('');
  }

  // 趋势分析
  sections.push('📈 趋势分析');
  sections.push(`  时间跨度：${trendAnalysis.period}`);
  sections.push(`  整体趋势：${trendAnalysis.trend}`);
  sections.push(`  详细分析：${trendAnalysis.analysis}`);
  sections.push('');

  // 建议
  if (trendAnalysis.recommendations && trendAnalysis.recommendations.length > 0) {
    sections.push('💡 建议');
    trendAnalysis.recommendations.forEach((rec: string, index: number) => {
      sections.push(`  ${index + 1}. ${rec}`);
    });
    sections.push('');
  }

  // 总结
  sections.push(`📝 总结：${summary}`);

  return sections.join('\n');
}
