import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
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
        AVG(overall_score) as avg_score,
        MAX(overall_score) as latest_score,
        (SELECT full_report FROM face_diagnosis_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM face_diagnosis_records
      WHERE user_id = ${userId}
    `);

    // 2. 查询舌诊记录
    const tongueRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(overall_score) as avg_score,
        MAX(overall_score) as latest_score,
        (SELECT full_report FROM tongue_diagnosis_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM tongue_diagnosis_records
      WHERE user_id = ${userId}
    `);

    // 3. 查询体态评估记录
    const postureRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(overall_score) as avg_score,
        MAX(overall_score) as latest_score,
        (SELECT full_report FROM posture_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM posture_assessments
      WHERE user_id = ${userId}
    `);

    // 4. 查询生理年龄记录
    const biologicalAgeRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(100 - age_difference) as avg_score,
        MAX(100 - age_difference) as latest_score,
        (SELECT full_report FROM biological_age_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM biological_age_records
      WHERE user_id = ${userId}
    `);

    // 5. 查询声音健康记录
    const voiceHealthRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(overall_score) as avg_score,
        MAX(overall_score) as latest_score,
        (SELECT full_report FROM voice_health_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM voice_health_records
      WHERE user_id = ${userId}
    `);

    // 6. 查询手相记录
    const palmistryRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(score) as latest_score,
        (SELECT full_report FROM palmistry_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM palmistry_records
      WHERE user_id = ${userId}
    `);

    // 7. 查询呼吸分析记录
    const breathingRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(score) as latest_score,
        (SELECT full_report FROM breathing_analysis_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
      FROM breathing_analysis_records
      WHERE user_id = ${userId}
    `);

    // 8. 查询眼部健康记录
    const eyeHealthRecords = await db.execute(sql`
      SELECT 
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(score) as latest_score,
        (SELECT full_report FROM eye_health_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1) as latest_report
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
        avgScore: Math.round(faceRow.avg_score || 75), 
        latestScore: Math.round(faceRow.latest_score || 75),
        latestReport: faceRow.latest_report || ''
      },
      tongue: { 
        count: tongueRow.count || 0, 
        avgScore: Math.round(tongueRow.avg_score || 75), 
        latestScore: Math.round(tongueRow.latest_score || 75),
        latestReport: tongueRow.latest_report || ''
      },
      posture: { 
        count: postureRow.count || 0, 
        avgScore: Math.round(postureRow.avg_score || 75), 
        latestScore: Math.round(postureRow.latest_score || 75),
        latestReport: postureRow.latest_report || ''
      },
      biologicalAge: { 
        count: biologicalAgeRow.count || 0, 
        avgScore: Math.round(biologicalAgeRow.avg_score || 75), 
        latestScore: Math.round(biologicalAgeRow.latest_score || 75),
        latestReport: biologicalAgeRow.latest_report || ''
      },
      voiceHealth: { 
        count: voiceHealthRow.count || 0, 
        avgScore: Math.round(voiceHealthRow.avg_score || 75), 
        latestScore: Math.round(voiceHealthRow.latest_score || 75),
        latestReport: voiceHealthRow.latest_report || ''
      },
      palmistry: { 
        count: palmistryRow.count || 0, 
        avgScore: Math.round(palmistryRow.avg_score || 70), 
        latestScore: Math.round(palmistryRow.latest_score || 70),
        latestReport: palmistryRow.latest_report || ''
      },
      breathing: { 
        count: breathingRow.count || 0, 
        avgScore: Math.round(breathingRow.avg_score || 72), 
        latestScore: Math.round(breathingRow.latest_score || 72),
        latestReport: breathingRow.latest_report || ''
      },
      eyeHealth: { 
        count: eyeHealthRow.count || 0, 
        avgScore: Math.round(eyeHealthRow.avg_score || 72), 
        latestScore: Math.round(eyeHealthRow.latest_score || 72),
        latestReport: eyeHealthRow.latest_report || ''
      },
    };

    // 计算综合评分（只计算有记录的检测）
    const activeRecords = Object.values(records).filter((r: any) => r.count > 0);
    const overallScore = activeRecords.length > 0 
      ? Math.round(activeRecords.reduce((sum: number, r: any) => sum + (r.latestScore || 0), 0) / activeRecords.length)
      : 75;

    // 使用LLM进行深度综合分析
    const comprehensiveAnalysis = await analyzeComprehensiveData(records, overallScore, userInfo, request);

    const fullReport = generateComprehensiveReport(records, overallScore, comprehensiveAnalysis, userInfo);

    return NextResponse.json({
      success: true,
      data: {
        records,
        overallScore,
        healthStatus: overallScore >= 80 ? 'excellent' : overallScore >= 70 ? 'good' : overallScore >= 60 ? 'fair' : 'poor',
        comprehensiveAnalysis,
        fullReport,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ComprehensiveReport] 生成失败:', error);
    return NextResponse.json({ error: '综合报告生成失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// 使用LLM进行深度综合分析
async function analyzeComprehensiveData(records: any, overallScore: number, userInfo: any, request: NextRequest): Promise<any> {
  // 构建检测数据摘要
  let dataSummary = '各检测模块数据：\n';
  
  if (records.face.count > 0) {
    dataSummary += `• 面诊检测：${records.face.count}次，最新评分${records.face.latestScore}分，平均评分${records.face.avgScore}分\n`;
  }
  if (records.tongue.count > 0) {
    dataSummary += `• 舌诊检测：${records.tongue.count}次，最新评分${records.tongue.latestScore}分，平均评分${records.tongue.avgScore}分\n`;
  }
  if (records.posture.count > 0) {
    dataSummary += `• 体态评估：${records.posture.count}次，最新评分${records.posture.latestScore}分，平均评分${records.posture.avgScore}分\n`;
  }
  if (records.biologicalAge.count > 0) {
    dataSummary += `• 生理年龄评估：${records.biologicalAge.count}次，最新评分${records.biologicalAge.latestScore}分，平均评分${records.biologicalAge.avgScore}分\n`;
  }
  if (records.voiceHealth.count > 0) {
    dataSummary += `• 声音健康评估：${records.voiceHealth.count}次，最新评分${records.voiceHealth.latestScore}分，平均评分${records.voiceHealth.avgScore}分\n`;
  }
  if (records.palmistry.count > 0) {
    dataSummary += `• 手相检测：${records.palmistry.count}次，最新评分${records.palmistry.latestScore}分，平均评分${records.palmistry.avgScore}分\n`;
  }
  if (records.breathing.count > 0) {
    dataSummary += `• 呼吸分析：${records.breathing.count}次，最新评分${records.breathing.latestScore}分，平均评分${records.breathing.avgScore}分\n`;
  }
  if (records.eyeHealth.count > 0) {
    dataSummary += `• 眼部健康检测：${records.eyeHealth.count}次，最新评分${records.eyeHealth.latestScore}分，平均评分${records.eyeHealth.avgScore}分\n`;
  }

  const systemPrompt = `你是一位专业的健康管理专家，擅长多维度综合健康评估。

请基于提供的各项检测数据，进行全面综合分析，识别健康优势与风险，提供优先级排序的改善建议。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "healthPortrait": {
    "overallStatus": "优秀/良好/一般/需关注",
    "strengths": ["健康优势1", "健康优势2"],
    "weaknesses": ["健康短板1", "健康短板2"],
    "keyRisks": ["主要健康风险1", "主要健康风险2"],
    "overallConfidence": 0-100的置信度
  },
  "systemHealthScores": {
    "cardiovascular": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]},
    "respiratory": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]},
    "digestive": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]},
    "nervous": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]},
    "endocrine": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]},
    "musculoskeletal": {"score": 0-100, "status": "良好/一般/需关注", "evidence": ["证据1", "证据2"]}
  },
  "trendAnalysis": {
    "overallTrend": "改善/稳定/下降",
    "improvingAreas": ["改善领域1", "改善领域2"],
    "stableAreas": ["稳定领域1", "稳定领域2"],
    "decliningAreas": ["下降领域1", "下降领域2"],
    "confidence": 0-100的置信度
  },
  "priorityRecommendations": [
    {
      "priority": 1-5的优先级（1最高）,
      "category": "类别",
      "issue": "问题描述",
      "recommendation": "具体建议",
      "expectedBenefit": "预期收益",
      "timeFrame": "见效时间",
      "urgency": "紧急/高/中/低"
    }
  ],
  "personalizedPlan": {
    "immediateActions": ["立即行动1", "立即行动2"],
    "shortTermGoals": ["短期目标1", "短期目标2"],
    "midTermGoals": ["中期目标1", "中期目标2"],
    "longTermVision": "长期健康愿景"
  },
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "departments": ["科室1", "科室2"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "综合分析总结"
}

综合分析要点：
1. 整体健康画像：识别健康优势、短板、主要风险
2. 系统健康评分：评估心血管、呼吸、消化、神经、内分泌、肌肉骨骼系统
3. 趋势分析：识别改善、稳定、下降的领域
4. 优先级建议：按重要性排序改善建议
5. 个性化方案：制定立即行动、短期目标、中期计划、长期愿景
6. 就医建议：提供医疗干预建议`;

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      { 
        role: 'user' as const, 
        content: `${dataSummary}\n\n综合健康评分：${overallScore}分\n\n请进行深度综合分析并生成报告。` 
      },
    ], { model: 'doubao-seed-1-6-vision-250815', temperature: 0.3 });

    if (!response || !response.content) {
      throw new Error('LLM返回空响应');
    }

    let result: any;
    try {
      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[ComprehensiveReport] JSON解析失败:', response.content);
      // 返回默认结果
      result = {
        healthPortrait: {
          overallStatus: overallScore >= 80 ? '优秀' : overallScore >= 70 ? '良好' : overallScore >= 60 ? '一般' : '需关注',
          strengths: ['已完成多项健康检测'],
          weaknesses: [],
          keyRisks: [],
          overallConfidence: 70
        },
        summary: `综合健康评分为${overallScore}分，建议继续关注各项健康指标。`
      };
    }

    return result;
  } catch (error) {
    console.error('[ComprehensiveReport] LLM分析失败:', error);
    return {
      healthPortrait: {
        overallStatus: overallScore >= 80 ? '优秀' : overallScore >= 70 ? '良好' : overallScore >= 60 ? '一般' : '需关注',
        strengths: ['已完成多项健康检测'],
        weaknesses: [],
        keyRisks: [],
        overallConfidence: 70
      },
      summary: `综合健康评分为${overallScore}分，建议继续关注各项健康指标。`
    };
  }
}

function generateComprehensiveReport(records: any, overallScore: number, comprehensiveAnalysis: any, userInfo: any): string {
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

  // 健康画像
  if (comprehensiveAnalysis.healthPortrait) {
    sections.push('🎨 健康画像');
    const portrait = comprehensiveAnalysis.healthPortrait;
    sections.push(`  整体状态：${portrait.overallStatus}`);
    
    if (portrait.strengths && portrait.strengths.length > 0) {
      sections.push(`  健康优势：${portrait.strengths.join('、')}`);
    }
    if (portrait.weaknesses && portrait.weaknesses.length > 0) {
      sections.push(`  健康短板：${portrait.weaknesses.join('、')}`);
    }
    if (portrait.keyRisks && portrait.keyRisks.length > 0) {
      sections.push(`  主要风险：${portrait.keyRisks.join('、')}`);
    }
    sections.push('');
  }

  // 各项检测
  sections.push('📋 各项健康检测\n');
  
  if (records.face.count > 0) {
    sections.push('1. 面诊检测');
    sections.push(`   检测次数：${records.face.count}`);
    sections.push(`   平均评分：${records.face.avgScore}分`);
    sections.push(`   最新评分：${records.face.latestScore}分\n`);
  }

  if (records.tongue.count > 0) {
    sections.push('2. 舌诊检测');
    sections.push(`   检测次数：${records.tongue.count}`);
    sections.push(`   平均评分：${records.tongue.avgScore}分`);
    sections.push(`   最新评分：${records.tongue.latestScore}分\n`);
  }

  if (records.posture.count > 0) {
    sections.push('3. 体态评估');
    sections.push(`   检测次数：${records.posture.count}`);
    sections.push(`   平均评分：${records.posture.avgScore}分`);
    sections.push(`   最新评分：${records.posture.latestScore}分\n`);
  }

  if (records.biologicalAge.count > 0) {
    sections.push('4. 生理年龄评估');
    sections.push(`   检测次数：${records.biologicalAge.count}`);
    sections.push(`   平均评分：${records.biologicalAge.avgScore}分`);
    sections.push(`   最新评分：${records.biologicalAge.latestScore}分\n`);
  }

  if (records.voiceHealth.count > 0) {
    sections.push('5. 声音健康评估');
    sections.push(`   检测次数：${records.voiceHealth.count}`);
    sections.push(`   平均评分：${records.voiceHealth.avgScore}分`);
    sections.push(`   最新评分：${records.voiceHealth.latestScore}分\n`);
  }

  if (records.palmistry.count > 0) {
    sections.push('6. 手相检测');
    sections.push(`   检测次数：${records.palmistry.count}`);
    sections.push(`   平均评分：${records.palmistry.avgScore}分`);
    sections.push(`   最新评分：${records.palmistry.latestScore}分\n`);
  }

  if (records.breathing.count > 0) {
    sections.push('7. 呼吸分析');
    sections.push(`   检测次数：${records.breathing.count}`);
    sections.push(`   平均评分：${records.breathing.avgScore}分`);
    sections.push(`   最新评分：${records.breathing.latestScore}分\n`);
  }

  if (records.eyeHealth.count > 0) {
    sections.push('8. 眼部健康检测');
    sections.push(`   检测次数：${records.eyeHealth.count}`);
    sections.push(`   平均评分：${records.eyeHealth.avgScore}分`);
    sections.push(`   最新评分：${records.eyeHealth.latestScore}分\n`);
  }

  // 系统健康评分
  if (comprehensiveAnalysis.systemHealthScores) {
    sections.push('🏥 系统健康评分\n');
    const scores = comprehensiveAnalysis.systemHealthScores;
    
    if (scores.cardiovascular) {
      sections.push(`  心血管系统：${scores.cardiovascular.score}分（${scores.cardiovascular.status}）`);
    }
    if (scores.respiratory) {
      sections.push(`  呼吸系统：${scores.respiratory.score}分（${scores.respiratory.status}）`);
    }
    if (scores.digestive) {
      sections.push(`  消化系统：${scores.digestive.score}分（${scores.digestive.status}）`);
    }
    if (scores.nervous) {
      sections.push(`  神经系统：${scores.nervous.score}分（${scores.nervous.status}）`);
    }
    if (scores.endocrine) {
      sections.push(`  内分泌系统：${scores.endocrine.score}分（${scores.endocrine.status}）`);
    }
    if (scores.musculoskeletal) {
      sections.push(`  肌肉骨骼系统：${scores.musculoskeletal.score}分（${scores.musculoskeletal.status}）`);
    }
    sections.push('');
  }

  // 趋势分析
  if (comprehensiveAnalysis.trendAnalysis) {
    sections.push('📈 趋势分析\n');
    const trend = comprehensiveAnalysis.trendAnalysis;
    sections.push(`  整体趋势：${trend.overallTrend}`);
    
    if (trend.improvingAreas && trend.improvingAreas.length > 0) {
      sections.push(`  改善领域：${trend.improvingAreas.join('、')}`);
    }
    if (trend.decliningAreas && trend.decliningAreas.length > 0) {
      sections.push(`  下降领域：${trend.decliningAreas.join('、')}`);
    }
    sections.push('');
  }

  // 优先级建议
  if (comprehensiveAnalysis.priorityRecommendations && comprehensiveAnalysis.priorityRecommendations.length > 0) {
    sections.push('🎯 优先级改善建议\n');
    comprehensiveAnalysis.priorityRecommendations.forEach((rec: any, index: number) => {
      sections.push(`  优先级${rec.priority}：【${rec.category}】${rec.issue}`);
      sections.push(`    建议：${rec.recommendation}`);
      if (rec.expectedBenefit) sections.push(`    预期收益：${rec.expectedBenefit}`);
      if (rec.timeFrame) sections.push(`    见效时间：${rec.timeFrame}`);
      sections.push(`    紧急程度：${rec.urgency}`);
      sections.push('');
    });
  }

  // 个性化方案
  if (comprehensiveAnalysis.personalizedPlan) {
    sections.push('📋 个性化健康方案\n');
    const plan = comprehensiveAnalysis.personalizedPlan;
    
    if (plan.immediateActions && plan.immediateActions.length > 0) {
      sections.push('  立即行动：');
      plan.immediateActions.forEach((action: string) => {
        sections.push(`    • ${action}`);
      });
      sections.push('');
    }
    
    if (plan.shortTermGoals && plan.shortTermGoals.length > 0) {
      sections.push('  短期目标：');
      plan.shortTermGoals.forEach((goal: string) => {
        sections.push(`    • ${goal}`);
      });
      sections.push('');
    }
    
    if (plan.midTermGoals && plan.midTermGoals.length > 0) {
      sections.push('  中期计划：');
      plan.midTermGoals.forEach((goal: string) => {
        sections.push(`    • ${goal}`);
      });
      sections.push('');
    }
    
    if (plan.longTermVision) {
      sections.push(`  长期愿景：${plan.longTermVision}`);
      sections.push('');
    }
  }

  // 综合建议
  sections.push('💡 综合建议');
  sections.push('  1. 定期进行各项健康检测，及时了解身体状况');
  sections.push('  2. 根据检测结果调整生活方式，坚持良好习惯');
  sections.push('  3. 关注薄弱环节，有针对性地进行改善');
  sections.push('  4. 保持积极心态，定期复查，追踪健康变化');
  sections.push('');

  // 总结
  if (comprehensiveAnalysis.summary) {
    sections.push(`📝 总结\n  ${comprehensiveAnalysis.summary}`);
  }

  return sections.join('\n');
}
