import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /api/symptom-check
 * 保存自检数据到数据库
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      checkedSymptoms = [], // 选中的症状ID列表
      targetSymptoms = [], // 目标改善症状ID列表
      totalScore = 0, // 总分
      elementScores = {}, // 各维度得分
    } = body;

    // 验证必填字段
    if (!userId) {
      return NextResponse.json({
        code: 400,
        msg: '缺少userId参数',
      }, { status: 400 });
    }

    // 计算综合健康分数
    const scores = [
      elementScores.气血 || 0,
      elementScores.循环 || 0,
      elementScores.毒素 || 0,
      elementScores.血脂 || 0,
      elementScores.寒凉 || 0,
      elementScores.免疫 || 0,
      elementScores.情绪 || 0,
    ];
    const overallHealth = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    // 计算健康状态
    let healthStatus = '一般';
    if (overallHealth >= 85) healthStatus = '优秀';
    else if (overallHealth >= 70) healthStatus = '良好';
    else if (overallHealth < 50) healthStatus = '异常';

    // 插入症状自检数据并获取生成的 UUID
    const checkResult = await exec_sql(`
      INSERT INTO symptom_checks (
        id,
        user_id,
        checked_symptoms,
        total_score,
        element_scores,
        checked_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
      RETURNING id
    `, [
      userId,
      JSON.stringify(checkedSymptoms.map((id: string) => parseInt(id))),
      totalScore || 0,
      JSON.stringify(elementScores),
    ]);

    const checkId = checkResult[0].id;

    // 插入健康分析数据，关联到具体的自检记录
    await exec_sql(`
      INSERT INTO health_analysis (
        id,
        user_id,
        check_id,
        qi_and_blood,
        circulation,
        toxins,
        blood_lipids,
        coldness,
        immunity,
        emotions,
        overall_health,
        analyzed_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      userId,
      checkId,
      elementScores.气血 || 0,
      elementScores.循环 || 0,
      elementScores.毒素 || 0,
      elementScores.血脂 || 0,
      elementScores.寒凉 || 0,
      elementScores.免疫 || 0,
      elementScores.情绪 || 0,
      overallHealth,
    ]);

    // 更新用户的健康分数和状态
    await exec_sql(`
      UPDATE sys_user
      SET health_score = $1,
          health_status = $2,
          self_check_completed = TRUE,
          update_time = NOW()
      WHERE user_id = $3
    `, [overallHealth, healthStatus, userId]);

    return NextResponse.json({
      code: 200,
      msg: '自检数据保存成功',
      data: {
        checkId,
        userId,
        overallHealth,
        healthStatus,
      },
    });
  } catch (error) {
    console.error('[保存自检数据错误]', error);
    return NextResponse.json({
      code: 500,
      msg: '保存失败',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

/**
 * GET /api/symptom-check
 * 获取用户的自检历史记录
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        code: 400,
        msg: '缺少userId参数',
      }, { status: 400 });
    }

    // 查询自检历史记录
    const records = await exec_sql(`
      SELECT
        sc.id as check_id,
        sc.checked_at,
        sc.checked_symptoms,
        sc.total_score,
        sc.element_scores,
        ha.qi_and_blood,
        ha.circulation,
        ha.toxins,
        ha.blood_lipids,
        ha.coldness,
        ha.immunity,
        ha.emotions,
        ha.overall_health
      FROM symptom_checks sc
      LEFT JOIN health_analysis ha ON sc.id = ha.check_id
      WHERE sc.user_id = $1
      ORDER BY sc.checked_at DESC
      LIMIT 20
    `, [userId]);

    return NextResponse.json({
      code: 200,
      msg: '成功',
      data: {
        records,
        total: records.length,
      },
    });
  } catch (error) {
    console.error('[获取自检历史错误]', error);
    return NextResponse.json({
      code: 500,
      msg: '获取失败',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

/**
 * 生成健康分析报告
 */
function generateHealthAnalysis(elementScores: Record<string, number>, checkedSymptoms: string[]): string {
  const { 气血 = 0, 循环 = 0, 毒素 = 0, 血脂 = 0, 寒凉 = 0, 免疫 = 0, 情绪 = 0 } = elementScores;

  let analysis = '## 综合健康评价\n\n';

  // 综合评分
  const scores = [气血, 循环, 毒素, 血脂, 寒凉, 免疫, 情绪];
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  analysis += `根据您的自检结果，综合健康评分为 **${averageScore}分**。\n\n`;

  // 风险等级
  analysis += '## 风险等级与预警\n\n';
  if (averageScore >= 85) {
    analysis += '您的健康状况**优秀**，继续保持良好的生活习惯。\n\n';
  } else if (averageScore >= 70) {
    analysis += '您的健康状况**良好**，但仍有提升空间。\n\n';
  } else if (averageScore >= 50) {
    analysis += '您的健康状况**一般**，需要引起重视，建议改善生活习惯。\n\n';
  } else {
    analysis += '您的健康状况**异常**，建议及时就医检查。\n\n';
  }

  // 异常指标提示
  analysis += '## 异常指标提示\n\n';
  if (气血 < 60) analysis += '- 气血不足：建议调理脾胃，补充营养\n';
  if (循环 < 60) analysis += '- 循环系统：建议适当运动，促进血液循环\n';
  if (毒素 < 60) analysis += '- 毒素堆积：建议多喝水，促进排毒\n';
  if (血脂 < 60) analysis += '- 血脂偏高：建议低脂饮食，控制体重\n';
  if (寒凉 < 60) analysis += '- 体质寒凉：建议注意保暖，适当进补\n';
  if (免疫 < 60) analysis += '- 免疫力低：建议补充维生素，增强抵抗力\n';
  if (情绪 < 60) analysis += '- 情绪管理：建议学会放松，保持心态平和\n';
  analysis += '\n';

  // 生活习惯改善建议
  analysis += '## 生活习惯改善建议\n\n';
  analysis += '### 作息安排\n';
  analysis += '- 建议保持规律的作息时间，早睡早起\n';
  analysis += '- 睡眠时间建议保持在7-8小时\n\n';

  analysis += '### 饮食建议\n';
  analysis += '- 均衡饮食，多吃蔬菜水果\n';
  analysis += '- 减少油腻、辛辣食物的摄入\n';
  analysis += '- 适量补充蛋白质和维生素\n\n';

  analysis += '### 运动建议\n';
  analysis += '- 每周至少3-5次有氧运动\n';
  analysis += '- 运动强度以中等为宜，每次30-60分钟\n\n';

  // 复查与就医提醒
  analysis += '## 复查与就医提醒\n\n';
  analysis += '建议定期进行健康体检，及时发现潜在的健康问题。如有异常症状，请及时就医。\n\n';

  // 个性化健康改善方案
  analysis += '## 个性化健康改善方案\n\n';
  analysis += '### 第一阶段（1-2周）\n';
  analysis += '- 调整作息时间，保证充足睡眠\n';
  analysis += '- 调整饮食结构，减少不健康食物\n\n';

  analysis += '### 第二阶段（3-4周）\n';
  analysis += '- 开始规律运动，逐步增加运动量\n';
  analysis += '- 建立健康的生活习惯\n\n';

  analysis += '### 第三阶段（5-8周）\n';
  analysis += '- 巩固健康习惯，持续改善\n';
  analysis += '- 定期评估健康状况，调整方案\n\n';

  // 总结与鼓励
  analysis += '## 总结与鼓励\n\n';
  analysis += '健康是一个长期的过程，需要持续的努力和坚持。希望您能够认真落实健康改善方案，逐步提升健康水平。\n\n';
  analysis += '如有任何疑问，欢迎随时咨询健康顾问。\n\n';

  return analysis;
}
