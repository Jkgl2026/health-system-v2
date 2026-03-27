import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userInfo } = body;

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    // 模拟获取用户所有检测记录
    const records = {
      face: { count: 3, avgScore: 78, latestScore: 82 },
      tongue: { count: 2, avgScore: 75, latestScore: 80 },
      posture: { count: 1, avgScore: 72, latestScore: 72 },
      biologicalAge: { count: 2, avgScore: 76, latestScore: 78 },
      voiceHealth: { count: 1, avgScore: 85, latestScore: 85 },
    };

    // 生成综合分析
    const overallScore = Math.round(
      Object.values(records).reduce((sum, r) => sum + r.latestScore, 0) / Object.keys(records).length
    );

    const fullReport = generateComprehensiveReport(records, overallScore, userInfo);

    return NextResponse.json({
      success: true,
      data: {
        records,
        overallScore,
        healthStatus: overallScore >= 80 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 60 ? 'fair' : 'poor',
        fullReport,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ComprehensiveReport] 生成失败:', error);
    return NextResponse.json({ error: '综合报告生成失败' }, { status: 500 });
  }
}

function generateComprehensiveReport(records: any, overallScore: number, userInfo: any): string {
  const sections = [];
  
  sections.push('【综合健康评估报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`报告生成时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  // 综合评分
  sections.push('📊 综合健康评分');
  sections.push(`  综合得分：${overallScore}分`);
  sections.push(`  健康状态：${overallScore >= 80 ? '优秀' : overallScore >= 70 ? '良好' : overallScore >= 60 ? '一般' : '需关注'}`);
  sections.push('');

  // 各项检测
  sections.push('📋 各项健康检测\n');
  
  sections.push('1. 面诊检测');
  sections.push(`   检测次数：${records.face.count}`);
  sections.push(`   平均评分：${records.face.avgScore}分`);
  sections.push(`   最新评分：${records.face.latestScore}分\n`);

  sections.push('2. 舌诊检测');
  sections.push(`   检测次数：${records.tongue.count}`);
  sections.push(`   平均评分：${records.tongue.avgScore}分`);
  sections.push(`   最新评分：${records.tongue.latestScore}分\n`);

  sections.push('3. 体态评估');
  sections.push(`   检测次数：${records.posture.count}`);
  sections.push(`   平均评分：${records.posture.avgScore}分`);
  sections.push(`   最新评分：${records.posture.latestScore}分\n`);

  sections.push('4. 生理年龄评估');
  sections.push(`   检测次数：${records.biologicalAge.count}`);
  sections.push(`   平均评分：${records.biologicalAge.avgScore}分`);
  sections.push(`   最新评分：${records.biologicalAge.latestScore}分\n`);

  sections.push('5. 声音健康评估');
  sections.push(`   检测次数：${records.voiceHealth.count}`);
  sections.push(`   平均评分：${records.voiceHealth.avgScore}分`);
  sections.push(`   最新评分：${records.voiceHealth.latestScore}分\n`);

  // 综合分析
  sections.push('💡 综合建议');
  sections.push('  1. 定期进行各项健康检测，及时了解身体状况');
  sections.push('  2. 根据检测结果调整生活方式，保持良好习惯');
  sections.push('  3. 关注薄弱环节，有针对性地进行改善');
  sections.push('  4. 保持积极心态，定期复查，追踪健康变化');
  sections.push('');

  sections.push('📝 总结');
  sections.push(`  综合来看，您的健康状况${overallScore >= 80 ? '优秀' : overallScore >= 70 ? '良好' : overallScore >= 60 ? '一般' : '需要关注'}。`);
  sections.push(`  各项检测中，${overallScore >= 80 ? '大部分指标表现良好，请继续保持。' : overallScore >= 70 ? '部分指标需要关注，建议适当调整。' : '多项指标需要改善，请重视健康管理。'}`);

  return sections.join('\n');
}
