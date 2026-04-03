import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// GET /api/assessment/sessions/[id] - 获取会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDb();

    const result = await (db.execute as any)(
      sql`SELECT * FROM assessment_sessions WHERE id = ${id}`
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '评估会话不存在' },
        { status: 404 }
      );
    }

    const session = result.rows[0];

    // 解析JSONB字段并转换字段名（snake_case → camelCase）
    const parsedSession = {
      id: session.id,
      sessionName: session.session_name,
      status: session.status,
      currentStep: session.current_step,
      userId: session.user_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
      healthQuestionnaireId: session.health_questionnaire_id,
      constitutionQuestionnaireId: session.constitution_questionnaire_id,
      healthAnalysisId: session.health_analysis_id,
      riskAssessmentId: session.risk_assessment_id,
      personalInfo: typeof session.personal_info === 'string'
        ? JSON.parse(session.personal_info)
        : session.personal_info,
    };

    return NextResponse.json({
      success: true,
      data: parsedSession
    });

  } catch (error) {
    console.error('Error fetching assessment session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取评估会话详情失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/assessment/sessions/[id] - 更新会话
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      status,
      personalInfo,
      healthQuestionnaireId,
      constitutionQuestionnaireId,
      healthAnalysisId,
      riskAssessmentId,
      sessionName,
    } = body;

    const db = await getDb();

    // 验证 session 是否存在
    const existingSession = await (db.execute as any)(
      sql`SELECT id FROM assessment_sessions WHERE id = ${id}`
    );

    if (existingSession.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '评估会话不存在' },
        { status: 404 }
      );
    }

    // 动态构建更新字段
    const updateFields: string[] = [];

    if (status !== undefined) {
      updateFields.push(`status = '${status}'`);
    }

    if (personalInfo !== undefined) {
      updateFields.push(`personal_info = '${JSON.stringify(personalInfo).replace(/'/g, "''")}'`);
    }

    if (healthQuestionnaireId !== undefined) {
      updateFields.push(`health_questionnaire_id = '${healthQuestionnaireId}'`);
    }

    if (constitutionQuestionnaireId !== undefined) {
      updateFields.push(`constitution_questionnaire_id = '${constitutionQuestionnaireId}'`);
    }

    if (healthAnalysisId !== undefined) {
      updateFields.push(`health_analysis_id = '${healthAnalysisId}'`);
    }

    if (riskAssessmentId !== undefined) {
      updateFields.push(`risk_assessment_id = '${riskAssessmentId}'`);
    }

    if (sessionName !== undefined) {
      updateFields.push(`session_name = '${sessionName.replace(/'/g, "''")}'`);
    }

    // 如果有状态更新为 completed，设置 completedAt
    if (status === 'completed') {
      updateFields.push(`completed_at = NOW()`);
    }

    // 添加 updatedAt
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有提供有效的更新字段' },
        { status: 400 }
      );
    }

    // 执行更新
    const query = sql`
      UPDATE assessment_sessions
      SET ${sql.raw(updateFields.join(', '))}
      WHERE id = ${id}
      RETURNING *
    `;

    const result = await (db.execute as any)(query);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '更新评估会话失败' },
        { status: 500 }
      );
    }

    const session = result.rows[0];

    // 解析JSONB字段（PostgreSQL的JSONB已经自动解析，如果是字符串才需要parse）
    const parsedSession = {
      ...session,
      personalInfo: typeof session.personal_info === 'string'
        ? JSON.parse(session.personal_info)
        : session.personal_info,
    };

    return NextResponse.json({
      success: true,
      data: parsedSession,
      message: '评估会话更新成功'
    });

  } catch (error) {
    console.error('Error updating assessment session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '更新评估会话失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/assessment/sessions/[id] - 删除会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = await getDb();

    await (db.execute as any)(
      sql`DELETE FROM assessment_sessions WHERE id = ${id}`
    );

    return NextResponse.json({
      success: true,
      message: '评估会话删除成功'
    });

  } catch (error) {
    console.error('Error deleting assessment session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '删除评估会话失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
