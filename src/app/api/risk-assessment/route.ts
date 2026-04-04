import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import { AnalysisEngine } from '@/lib/analysis-engine';

// POST /api/risk-assessment - 创建风险评估或执行风险分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[RiskAssessment POST] Received request body:', JSON.stringify(body, null, 2));

    // 支持两种模式：
    // 1. 分析模式：接收 { userId, userInfo } 执行分析
    // 2. 保存模式：接收 { userId, sessionId, overallRiskLevel, healthScore, riskFactors, recommendations, notes } 保存结果
    const { userId, userInfo, sessionId, overallRiskLevel, healthScore, riskFactors, recommendations, notes } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 确保用户存在
    try {
      await (db.execute as any)(
        sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO UPDATE SET id = ${userId}`
      );
    } catch (userError) {
      console.error('[RiskAssessment POST] 确保用户存在失败:', userError);
    }

    // 分析模式：根据userId查询数据并执行分析
    if (userInfo && !sessionId) {
      console.log('[RiskAssessment POST] 进入分析模式');
      try {
        // 查询用户最近的会话
        const sessionResult = await (db.execute as any)(
          sql`
            SELECT 
              id,
              user_id,
              personal_info,
              health_questionnaire_id,
              constitution_questionnaire_id,
              status
            FROM assessment_sessions
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
            LIMIT 1
          `
        );

        if (!sessionResult.rows || sessionResult.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: '请先完成健康评估（包含健康问卷和体质问卷）' },
            { status: 400 }
          );
        }

        const session = sessionResult.rows[0];

        // 检查是否已完成健康问卷和体质问卷
        if (!session.health_questionnaire_id || !session.constitution_questionnaire_id) {
          return NextResponse.json(
            { success: false, error: '请先完成健康评估（包含健康问卷和体质问卷）' },
            { status: 400 }
          );
        }

        // 查询健康问卷
        const healthResult = await (db.execute as any)(
          sql`
            SELECT *
            FROM health_questionnaires
            WHERE id = ${session.health_questionnaire_id}
          `
        );

        // 查询体质问卷
        const constitutionResult = await (db.execute as any)(
          sql`
            SELECT *
            FROM constitution_questionnaires
            WHERE id = ${session.constitution_questionnaire_id}
          `
        );

        if (!healthResult.rows || healthResult.rows.length === 0 ||
            !constitutionResult.rows || constitutionResult.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: '问卷数据不存在' },
            { status: 404 }
          );
        }

        const healthQuestionnaire = healthResult.rows[0];
        const constitutionQuestionnaire = constitutionResult.rows[0];

        // 转换体质问卷字段名
        const formattedConstitutionQuestionnaire = {
          ...constitutionQuestionnaire,
          primaryConstitution: constitutionQuestionnaire.primary_constitution,
          secondaryConstitutions: constitutionQuestionnaire.secondary_constituents
        };

        const personalInfo = session.personal_info || {};

        // 创建分析引擎实例
        const engine = new AnalysisEngine({
          healthQuestionnaire,
          constitutionQuestionnaire: formattedConstitutionQuestionnaire,
          personalInfo
        });

        // 执行分析
        const healthScores = await engine.calculateHealthScores();
        const riskAssessment = await engine.calculateRiskAssessment();
        const constitutionAnalysis = await engine.analyzeConstitution();
        const qualityOfLife = await engine.assessQualityOfLife();
        const lifeExpectancy = await engine.calculateLifeExpectancy();
        const tcmDiagnosis = await engine.performTCMDiagnosis();
        const recommendations = await engine.generateRecommendations();

        const analysisResult = await engine.integrateResults({
          healthScores,
          riskAssessment,
          constitutionAnalysis,
          qualityOfLife,
          lifeExpectancy,
          tcmDiagnosis,
          recommendations
        });

        // 保存风险评估记录
        const assessmentId = crypto.randomUUID();
        await db.execute(sql`
          INSERT INTO risk_assessments (
            id, user_id, session_id, overall_risk_level, health_score,
            risk_factors, recommendations, notes
          )
          VALUES (
            ${assessmentId}, ${userId}, ${session.id}, ${(riskAssessment as any).overallRiskLevel || 'medium'},
            ${healthScores.overallHealth}, ${JSON.stringify(riskAssessment)},
            ${JSON.stringify(recommendations)}, ${''}
          )
        `);

        // 更新会话
        await (db.execute as any)(sql`
          UPDATE assessment_sessions
          SET risk_assessment_id = ${assessmentId},
              updated_at = NOW()
          WHERE id = ${session.id}
        `);

        // 格式化返回数据以符合前端期望
        const formattedResult = {
          overallRisk: {
            score: Math.round(healthScores.overallHealth),
            level: (riskAssessment as any).overallRiskLevel || 'medium',
            summary: `您的健康评分为${Math.round(healthScores.overallHealth)}分，${(riskAssessment as any).overallRiskLevel === 'low' ? '健康状况良好' : '需要注意健康问题'}`
          },
          systemRisks: {
            cardiovascular: {
              score: Math.round(healthScores.circulation),
              level: getSystemRiskLevel(healthScores.circulation),
              factors: ((riskAssessment as any).riskFactors?.cardiovascular?.factors) || []
            },
            respiratory: {
              score: Math.round(healthScores.immunity),
              level: getSystemRiskLevel(healthScores.immunity),
              factors: ((riskAssessment as any).riskFactors?.immunity?.factors) || []
            },
            digestive: {
              score: Math.round(healthScores.toxins),
              level: getSystemRiskLevel(100 - healthScores.toxins),
              factors: ((riskAssessment as any).riskFactors?.toxins?.factors) || []
            },
            endocrine: {
              score: Math.round(healthScores.bloodLipids),
              level: getSystemRiskLevel(100 - healthScores.bloodLipids),
              factors: ((riskAssessment as any).riskFactors?.bloodLipids?.factors) || []
            },
            nervous: {
              score: Math.round(healthScores.emotions),
              level: getSystemRiskLevel(healthScores.emotions),
              factors: ((riskAssessment as any).riskFactors?.emotions?.factors) || []
            },
            musculoskeletal: {
              score: Math.round(healthScores.qiAndBlood),
              level: getSystemRiskLevel(healthScores.qiAndBlood),
              factors: ((riskAssessment as any).riskFactors?.qiAndBlood?.factors) || []
            }
          },
          riskFactors: extractRiskFactors(riskAssessment),
          priorityRecommendations: ((recommendations as any).priority) || ['建议定期进行健康检查', '保持良好的生活习惯'],
          lifestyleRecommendations: ((recommendations as any).lifestyle) || ['保持规律作息', '适量运动', '均衡饮食'],
          medicalRecommendations: ((recommendations as any).medical) || ['如有不适及时就医'],
          disclaimer: '本评估结果仅供参考，不能替代专业医疗建议。如有健康问题，请咨询专业医生。'
        };

        return NextResponse.json({
          success: true,
          data: formattedResult
        });

      } catch (analyzeError) {
        console.error('[RiskAssessment POST] 分析失败:', analyzeError);
        return NextResponse.json(
          { success: false, error: '分析失败: ' + (analyzeError instanceof Error ? analyzeError.message : '未知错误') },
          { status: 500 }
        );
      }
    }

    // 保存模式：直接保存已有的评估结果
    if (sessionId && overallRiskLevel !== undefined) {
      console.log('[RiskAssessment POST] 进入保存模式');
      const assessmentId = crypto.randomUUID();
      console.log('[RiskAssessment POST] 生成评估ID:', assessmentId);

      await db.execute(sql`
        INSERT INTO risk_assessments (
          id, user_id, session_id, overall_risk_level, health_score,
          risk_factors, recommendations, notes
        )
        VALUES (
          ${assessmentId}, ${userId}, ${sessionId}, ${overallRiskLevel || null},
          ${healthScore || null}, ${JSON.stringify(riskFactors || {})},
          ${JSON.stringify(recommendations || [])}, ${notes || null}
        )
      `);
      console.log('[RiskAssessment POST] 风险评估保存成功');

      if (sessionId) {
        try {
          await (db.execute as any)(sql`
            UPDATE assessment_sessions
            SET risk_assessment_id = ${assessmentId},
                updated_at = NOW()
            WHERE id = ${sessionId}
          `);
          console.log('[RiskAssessment POST] 会话已更新:', sessionId);
        } catch (sessionError) {
          console.error('[RiskAssessment POST] 更新会话失败:', sessionError);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          id: assessmentId,
          userId,
          sessionId,
          overallRiskLevel,
          healthScore,
          message: '风险评估保存成功'
        }
      });
    }

    return NextResponse.json(
      { success: false, error: '参数不正确，请提供 userInfo 或 sessionId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[RiskAssessment POST] 处理失败:', error);
    return NextResponse.json(
      { success: false, error: '处理失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 辅助函数：根据分数获取风险等级
function getSystemRiskLevel(score: number): string {
  if (score >= 80) return '低风险';
  if (score >= 60) return '中等风险';
  if (score >= 40) return '高风险';
  return '极高风险';
}

// 辅助函数：提取风险因子
function extractRiskFactors(riskAssessment: any) {
  const factors = [];
  const riskFactors = (riskAssessment as any).riskFactors || {};
  
  if (riskFactors.cardiovascular?.level !== 'low') {
    factors.push({
      category: '心血管系统',
      riskName: '心血管风险',
      severity: riskFactors.cardiovascular?.level === 'medium' ? 'medium' : 'high',
      description: riskFactors.cardiovascular?.description || '心血管系统存在风险因素',
      recommendation: '建议定期检查血压、血脂，保持健康饮食'
    });
  }
  
  if (riskFactors.bloodLipids?.level !== 'low') {
    factors.push({
      category: '代谢系统',
      riskName: '血脂代谢风险',
      severity: riskFactors.bloodLipids?.level === 'medium' ? 'medium' : 'high',
      description: riskFactors.bloodLipids?.description || '血脂代谢存在异常',
      recommendation: '建议控制饮食脂肪摄入，适量运动'
    });
  }
  
  if (riskFactors.toxins?.level !== 'low') {
    factors.push({
      category: '消化系统',
      riskName: '毒素堆积风险',
      severity: riskFactors.toxins?.level === 'medium' ? 'medium' : 'high',
      description: riskFactors.toxins?.description || '体内毒素堆积',
      recommendation: '建议多喝水，保持规律排便'
    });
  }

  if (factors.length === 0) {
    factors.push({
      category: '整体健康',
      riskName: '健康状况良好',
      severity: 'low',
      description: '各项指标正常',
      recommendation: '继续保持健康的生活方式'
    });
  }
  
  return factors;
}

// GET /api/risk-assessment?userId=xxx - 获取用户的风险评估记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    let whereClause = sql`WHERE user_id = ${userId}`;
    if (sessionId) {
      whereClause = sql`WHERE user_id = ${userId} AND session_id = ${sessionId}`;
    }

    // 查询风险评估历史
    const recordsResult = await (db.execute as any)(
      sql`
        SELECT * FROM risk_assessments
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );

    const records = recordsResult.rows;

    // 查询总数
    const countResult = await (db.execute as any)(
      sql`SELECT COUNT(*) as count FROM risk_assessments ${whereClause}`
    );

    const total = Number(countResult.rows[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      }
    });
  } catch (error) {
    console.error('[RiskAssessment GET] 获取失败:', error);
    return NextResponse.json(
      { success: false, error: '获取风险评估记录失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
