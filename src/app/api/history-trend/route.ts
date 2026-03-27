import { NextRequest, NextResponse } from 'next/server';

interface TrendRequest {
  userId: string;
  type: 'face' | 'tongue' | 'posture' | 'biological-age' | 'voice-health';
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

interface TrendResult {
  trend: {
    scores: number[];
    dates: string[];
    direction: 'up' | 'down' | 'stable';
    changeRate: number;
    averageScore: number;
    maxScore: number;
    minScore: number;
    stdDev: number;
  };
  analysis: {
    overallTrend: string;
    scoreAnalysis: string;
    stability: string;
    recommendations: string[];
  };
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  summary: string;
  fullReport: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as any;
    const period = (searchParams.get('period') || 'all') as any;

    if (!userId) {
      return NextResponse.json(
        { error: '请提供用户ID' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: '请指定记录类型' },
        { status: 400 }
      );
    }

    console.log('[HistoryTrend] 开始趋势分析:', { userId, type, period });

    // 根据类型和时间范围查询记录
    const tableName = getTableName(type);
    const startDate = getStartDate(period);
    const records = await fetchRecords(tableName, userId, startDate);

    if (!records || records.length < 2) {
      return NextResponse.json(
        { error: '记录数量不足，无法进行趋势分析（至少需要2条记录）' },
        { status: 400 }
      );
    }

    // 按时间排序
    records.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // 生成趋势分析
    const trendResult = generateTrendAnalysis(records, type, period);

    console.log('[HistoryTrend] 趋势分析完成');

    return NextResponse.json({
      success: true,
      data: trendResult,
    });
  } catch (error) {
    console.error('[HistoryTrend] 分析失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '历史趋势分析失败', details: errorMessage },
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

// 获取开始日期
function getStartDate(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'quarter':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

// 获取记录（模拟，实际应该从数据库查询）
async function fetchRecords(tableName: string, userId: string, startDate: Date | null): Promise<any[]> {
  // 这里应该从数据库查询记录
  // 由于这是一个演示，我们返回模拟数据
  // 实际实现需要根据你的数据库配置进行调整
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      const mockRecords: any[] = [];
      const count = Math.floor(Math.random() * 5) + 5; // 5-10条记录
      
      for (let i = 0; i < count; i++) {
        const recordDate = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        if (startDate && recordDate < startDate) continue;
        
        mockRecords.push({
          id: `record-${i}`,
          user_id: userId,
          score: 70 + Math.floor(Math.random() * 25),
          created_at: recordDate.toISOString(),
        });
      }
      
      resolve(mockRecords.reverse());
    }, 100);
  });
}

// 生成趋势分析
function generateTrendAnalysis(records: any[], type: string, period: string): TrendResult {
  // 提取数据和日期
  const scores = records.map(r => r.score || 0);
  const dates = records.map(r => new Date(r.created_at).toLocaleDateString('zh-CN'));

  // 计算统计指标
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  // 计算标准差
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // 判断趋势方向
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
  
  let direction: 'up' | 'down' | 'stable';
  const changeRate = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (changeRate > 5) direction = 'up';
  else if (changeRate < -5) direction = 'down';
  else direction = 'stable';

  // 生成分析
  const analysis = generateAnalysis(scores, averageScore, maxScore, minScore, stdDev, direction, changeRate, type, period);

  // 生成图表数据
  const chartData = {
    labels: dates,
    datasets: [{
      label: getTypeName(type) + '评分',
      data: scores,
      borderColor: direction === 'up' ? 'rgb(34, 197, 94)' : direction === 'down' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)',
      backgroundColor: direction === 'up' ? 'rgba(34, 197, 94, 0.1)' : direction === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    }],
  };

  // 生成总结
  const summary = `在过去${getPeriodName(period)}内，共进行了${records.length}次${getTypeName(type)}检测。平均评分为${averageScore.toFixed(1)}分，最高${maxScore}分，最低${minScore}分，整体呈现${direction === 'up' ? '上升' : direction === 'down' ? '下降' : '稳定'}趋势（变化率${changeRate.toFixed(1)}%）。${direction === 'up' ? '健康管理效果显著，继续保持。' : direction === 'down' ? '需要调整健康管理措施。' : '健康状况平稳，保持当前状态。'}`;

  // 生成完整报告
  const fullReport = generateTrendReport(records, scores, dates, direction, changeRate, averageScore, maxScore, minScore, stdDev, analysis, summary, type, period);

  return {
    trend: {
      scores,
      dates,
      direction,
      changeRate,
      averageScore,
      maxScore,
      minScore,
      stdDev,
    },
    analysis,
    chartData,
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

// 获取时间段名称
function getPeriodName(period: string): string {
  const nameMap: Record<string, string> = {
    'week': '一周',
    'month': '一个月',
    'quarter': '三个月',
    'year': '一年',
    'all': '全部',
  };
  return nameMap[period] || period;
}

// 生成分析文本
function generateAnalysis(
  scores: number[],
  averageScore: number,
  maxScore: number,
  minScore: number,
  stdDev: number,
  direction: 'up' | 'down' | 'stable',
  changeRate: number,
  type: string,
  period: string
): TrendResult['analysis'] {
  let overallTrend = '';
  let scoreAnalysis = '';
  let stability = '';
  const recommendations: string[] = [];

  // 整体趋势
  if (direction === 'up') {
    overallTrend = '整体呈现上升趋势，健康状况持续改善';
    recommendations.push('继续保持当前的健康管理措施');
    recommendations.push('可以适当增加锻炼强度，进一步提升健康水平');
  } else if (direction === 'down') {
    overallTrend = '整体呈现下降趋势，需要关注健康指标变化';
    recommendations.push('及时调整生活习惯，特别是饮食和作息');
    recommendations.push('增加运动量，提高身体机能');
    recommendations.push('保持良好心态，减少压力');
  } else {
    overallTrend = '整体保持稳定，健康状况平稳';
    recommendations.push('保持当前的健康管理方式');
    recommendations.push('定期监测健康指标，及时发现变化');
  }

  // 评分分析
  scoreAnalysis = `平均评分为${averageScore.toFixed(1)}分，最高${maxScore}分，最低${minScore}分。`;
  if (maxScore - minScore > 20) {
    scoreAnalysis += '评分波动较大，建议关注健康指标的稳定性。';
    stability = '波动较大';
  } else if (maxScore - minScore > 10) {
    scoreAnalysis += '评分有一定波动，建议保持健康管理的一致性。';
    stability = '中度波动';
  } else {
    scoreAnalysis += '评分较为稳定，健康状况保持良好。';
    stability = '稳定';
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

  return {
    overallTrend,
    scoreAnalysis,
    stability,
    recommendations,
  };
}

// 生成趋势报告
function generateTrendReport(
  records: any[],
  scores: number[],
  dates: string[],
  direction: 'up' | 'down' | 'stable',
  changeRate: number,
  averageScore: number,
  maxScore: number,
  minScore: number,
  stdDev: number,
  analysis: any,
  summary: string,
  type: string,
  period: string
): string {
  const sections: string[] = [];
  
  sections.push('【历史趋势分析报告】\n');
  sections.push(`分析时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push(`分析类型：${getTypeName(type)}`);
  sections.push(`时间范围：${getPeriodName(period)}`);
  sections.push('');

  // 趋势概述
  sections.push('📈 趋势概述');
  sections.push(`  整体趋势：${direction === 'up' ? '上升' : direction === 'down' ? '下降' : '稳定'}`);
  sections.push(`  变化率：${changeRate.toFixed(1)}%`);
  sections.push(`  ${analysis.overallTrend}`);
  sections.push('');

  // 评分统计
  sections.push('📊 评分统计');
  sections.push(`  平均评分：${averageScore.toFixed(1)}分`);
  sections.push(`  最高评分：${maxScore}分`);
  sections.push(`  最低评分：${minScore}分`);
  sections.push(`  标准差：${stdDev.toFixed(2)}`);
  sections.push(`  稳定性：${analysis.stability}`);
  sections.push(`  ${analysis.scoreAnalysis}`);
  sections.push('');

  // 记录详情
  sections.push('📋 检测记录详情');
  records.forEach((record, index) => {
    const date = new Date(record.created_at).toLocaleDateString('zh-CN');
    sections.push(`  ${index + 1}. ${date} - 评分：${record.score}分`);
  });
  sections.push('');

  // 建议
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    sections.push('💡 建议');
    analysis.recommendations.forEach((rec: string, index: number) => {
      sections.push(`  ${index + 1}. ${rec}`);
    });
    sections.push('');
  }

  // 总结
  sections.push(`📝 总结：${summary}`);

  return sections.join('\n');
}
