import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDb();

    // 查询用户信息
    const userResult = await db.execute(
      sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
    );

    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 查询所有症状自检记录
    const symptomChecksResult = await db.execute(
      sql`
        SELECT * FROM symptom_checks
        WHERE user_id = ${id}
        ORDER BY checked_at DESC
      `
    );

    // 查询所有健康分析记录
    const healthAnalysisResult = await db.execute(
      sql`
        SELECT * FROM health_analysis
        WHERE user_id = ${id}
        ORDER BY analyzed_at DESC
      `
    );

    // 查询所有用户选择
    const userChoicesResult = await db.execute(
      sql`
        SELECT * FROM user_choices
        WHERE user_id = ${id}
        ORDER BY selected_at DESC
      `
    );

    // 查询要求完成情况
    const requirementsResult = await db.execute(
      sql`
        SELECT * FROM requirements
        WHERE user_id = ${id}
        LIMIT 1
      `
    );

    return NextResponse.json({
      success: true,
      data: {
        user,
        symptomChecks: symptomChecksResult.rows,
        healthAnalysis: healthAnalysisResult.rows,
        userChoices: userChoicesResult.rows,
        requirements: requirementsResult.rows[0] || null,
      },
    });
  } catch (error) {
    console.error('Fetch user detail error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
