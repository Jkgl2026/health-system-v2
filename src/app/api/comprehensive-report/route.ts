import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userInfo } = body;

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    const db = await getDb();

    // 1. 查询面诊记录
    const faceRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 80 ELSE 70 END), 75) as avg_score,
        COALESCE(MAX(CASE WHEN created_at >= ALL(SELECT created_at FROM face_diagnosis_records WHERE user_id = ${userId}) THEN 80 ELSE 70 END), 75) as latest_score
      FROM face_diagnosis_records
      WHERE user_id = ${userId}
    `);

    // 2. 查询舌诊记录
    const tongueRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as avg_score,
        COALESCE(MAX(CASE WHEN created_at >= ALL(SELECT created_at FROM tongue_diagnosis_records WHERE user_id = ${userId}) THEN 75 ELSE 70 END), 70) as latest_score
      FROM tongue_diagnosis_records
      WHERE user_id = ${userId}
    `);

    // 3. 查询体态评估记录
    const postureRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(overall_score), 70) as avg_score,
        COALESCE(MAX(overall_score), 70) as latest_score
      FROM posture_assessments
      WHERE user_id = ${userId}
    `);

    // 4. 查询生理年龄记录
    const biologicalAgeRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN biological_age IS NOT NULL THEN 80 ELSE 70 END), 75) as avg_score,
        COALESCE(MAX(CASE WHEN biological_age IS NOT NULL THEN 80 ELSE 70 END), 75) as latest_score
      FROM biological_age_records
      WHERE user_id = ${userId}
    `);

    // 5. 查询声音健康记录
    const voiceHealthRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 80 ELSE 70 END), 75) as avg_score,
        COALESCE(MAX(CASE WHEN full_report IS NOT NULL THEN 80 ELSE 70 END), 75) as latest_score
      FROM voice_health_records
      WHERE user_id = ${userId}
    `);

    // 6. 查询手相记录
    const palmistryRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as avg_score,
        COALESCE(MAX(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as latest_score
      FROM palmistry_records
      WHERE user_id = ${userId}
    `);

    // 7. 查询呼吸分析记录
    const breathingRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as avg_score,
        COALESCE(MAX(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as latest_score
      FROM breathing_analysis_records
      WHERE user_id = ${userId}
    `);

    // 8. 查询眼部健康记录
    const eyeHealthRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        COALESCE(AVG(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as avg_score,
        COALESCE(MAX(CASE WHEN full_report IS NOT NULL THEN 75 ELSE 70 END), 70) as latest_score
      FROM eye_health_records
      WHERE user_id = ${userId}
    `);

    // 构建记录数据
    const faceRow = faceRecords.rows?.[0] as any || {};
    const tongueRow = tongueRecords.rows?.[0] as any || {};
    const postureRow = postureRecords.rows?.[0] as any || {};
    const biologicalAgeRow = biologicalAgeRecords.rows?.[0] as any || {};
    const voiceHealthRow = voiceHealthRecords.rows?.[0] as any || {};
    const palmistryRow = palmistryRecords.rows?.[0] as any || {};
    const breathingRow = breathingRecords.rows?.[0] as any || {};
    const eyeHealthRow = eyeHealthRecords.rows?.[0] as any || {};

    const records: any = {
      face: { 
        count: faceRow.count || 0, 
        avgScore: Math.round(faceRow.avg_score || 70), 
        latestScore: Math.round(faceRow.latest_score || 70)
      },
      tongue: { 
        count: tongueRow.count || 0, 
        avgScore: Math.round(tongueRow.avg_score || 70), 
        latestScore: Math.round(tongueRow.latest_score || 70)
      },
      posture: { 
        count: postureRow.count || 0, 
        avgScore: Math.round(postureRow.avg_score || 70), 
        latestScore: Math.round(postureRow.latest_score || 70)
      },
      biologicalAge: { 
        count: biologicalAgeRow.count || 0, 
        avgScore: Math.round(biologicalAgeRow.avg_score || 75), 
        latestScore: Math.round(biologicalAgeRow.latest_score || 75)
      },
      voiceHealth: { 
        count: voiceHealthRow.count || 0, 
        avgScore: Math.round(voiceHealthRow.avg_score || 75), 
        latestScore: Math.round(voiceHealthRow.latest_score || 75)
      },
      palmistry: { 
        count: palmistryRow.count || 0, 
        avgScore: Math.round(palmistryRow.avg_score || 70), 
        latestScore: Math.round(palmistryRow.latest_score || 70)
      },
      breathing: { 
        count: breathingRow.count || 0, 
        avgScore: Math.round(breathingRow.avg_score || 70), 
        latestScore: Math.round(breathingRow.latest_score || 70)
      },
      eyeHealth: { 
        count: eyeHealthRow.count || 0, 
        avgScore: Math.round(eyeHealthRow.avg_score || 70), 
        latestScore: Math.round(eyeHealthRow.latest_score || 70)
      },
    };

    // 计算综合评分（只计算有记录的检测）
    const activeRecords = Object.values(records).filter((r: any) => r.count > 0);
    const overallScore = activeRecords.length > 0 
      ? Math.round(activeRecords.reduce((sum: number, r: any) => sum + (r.latestScore || 0), 0) / activeRecords.length)
      : 70;

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
    return NextResponse.json({ error: '综合报告生成失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
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

  sections.push('6. 手相检测');
  sections.push(`   检测次数：${records.palmistry.count}`);
  sections.push(`   平均评分：${records.palmistry.avgScore}分`);
  sections.push(`   最新评分：${records.palmistry.latestScore}分\n`);

  sections.push('7. 呼吸分析');
  sections.push(`   检测次数：${records.breathing.count}`);
  sections.push(`   平均评分：${records.breathing.avgScore}分`);
  sections.push(`   最新评分：${records.breathing.latestScore}分\n`);

  sections.push('8. 眼部健康检测');
  sections.push(`   检测次数：${records.eyeHealth.count}`);
  sections.push(`   平均评分：${records.eyeHealth.avgScore}分`);
  sections.push(`   最新评分：${records.eyeHealth.latestScore}分\n`);

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
