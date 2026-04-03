import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// POST /api/risk-assessment - 创建风险评估
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[RiskAssessment POST] Received request body:', JSON.stringify(body, null, 2));

    const { userId, sessionId, overallRiskLevel, healthScore, riskFactors, recommendations, notes } = body;

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
      // 不阻止主流程，可能用户已存在
    }

    const assessmentId = crypto.randomUUID();
    console.log('[RiskAssessment POST] 生成评估ID:', assessmentId);

    // 插入风险评估记录
    await db.execute(sql`
      INSERT INTO risk_assessments (
        id, user_id, session_id, overall_risk_level, health_score,
        risk_factors, recommendations, notes
      )
      VALUES (
        ${assessmentId}, ${userId}, ${sessionId || null}, ${overallRiskLevel || null},
        ${healthScore || null}, ${JSON.stringify(riskFactors || {})},
        ${JSON.stringify(recommendations || [])}, ${notes || null}
      )
    `);
    console.log('[RiskAssessment POST] 风险评估保存成功');

    // 如果有 sessionId，更新评估会话
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
        // 不阻止主流程
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
  } catch (error) {
    console.error('[RiskAssessment POST] 保存失败:', error);
    return NextResponse.json(
      { success: false, error: '保存风险评估失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
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
