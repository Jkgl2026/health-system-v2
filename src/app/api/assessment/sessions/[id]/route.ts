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

    // 构建更新语句 - 简化版本，每次只更新一个字段
    if (constitutionQuestionnaireId !== undefined && currentStep !== undefined) {
      await (db.execute as any)(
        sql`
          UPDATE assessment_sessions
          SET current_step = ${currentStep},
              constitution_questionnaire_id = ${constitutionQuestionnaireId}
          WHERE id = ${id}
        `
      );
    } else if (currentStep !== undefined) {
      await (db.execute as any)(
        sql`
          UPDATE assessment_sessions
          SET current_step = ${currentStep}
          WHERE id = ${id}
        `
      );
    } else if (constitutionQuestionnaireId !== undefined) {
      await (db.execute as any)(
        sql`
          UPDATE assessment_sessions
          SET constitution_questionnaire_id = ${constitutionQuestionnaireId}
          WHERE id = ${id}
        `
      );
    } else {
      return NextResponse.json(
        { success: false, error: '没有提供有效的更新字段' },
        { status: 400 }
      );
    }

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
