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

    // 解析JSONB字段
    const parsedSession = {
      ...session,
      personalInfo: session.personal_info ? JSON.parse(session.personal_info) : null,
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
      sessionName,
      status,
      personalInfo,
      currentStep,
      healthQuestionnaireId,
      constitutionQuestionnaireId,
      healthAnalysisId,
      riskAssessmentId,
    } = body;

    const db = await getDb();

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];

    if (sessionName !== undefined) {
      updates.push('session_name = $' + (updates.length + 1));
      values.push(sessionName);
    }
    if (status !== undefined) {
      updates.push('status = $' + (updates.length + 1));
      values.push(status);
      // 如果状态变为completed，设置完成时间
      if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }
    }
    if (personalInfo !== undefined) {
      updates.push('personal_info = $' + (updates.length + 1));
      values.push(JSON.stringify(personalInfo));
    }
    if (currentStep !== undefined) {
      updates.push('current_step = $' + (updates.length + 1));
      values.push(currentStep);
    }
    if (healthQuestionnaireId !== undefined) {
      updates.push('health_questionnaire_id = $' + (updates.length + 1));
      values.push(healthQuestionnaireId);
    }
    if (constitutionQuestionnaireId !== undefined) {
      updates.push('constitution_questionnaire_id = $' + (updates.length + 1));
      values.push(constitutionQuestionnaireId);
    }
    if (healthAnalysisId !== undefined) {
      updates.push('health_analysis_id = $' + (updates.length + 1));
      values.push(healthAnalysisId);
    }
    if (riskAssessmentId !== undefined) {
      updates.push('risk_assessment_id = $' + (updates.length + 1));
      values.push(riskAssessmentId);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有提供更新字段' },
        { status: 400 }
      );
    }

    values.push(id);

    await (db.execute as any)(
      sql`UPDATE assessment_sessions SET ${sql.raw(updates.join(', '))} WHERE id = $${values.length}`,
      values
    );

    return NextResponse.json({
      success: true,
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
