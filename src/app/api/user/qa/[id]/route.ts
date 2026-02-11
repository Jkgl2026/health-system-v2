import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    if (isNaN(questionId)) {
      return NextResponse.json(
        { code: 400, message: '无效的问题ID' },
        { status: 400 }
      );
    }

    // 删除问题
    const result = await exec_sql(
      `DELETE FROM health_questions WHERE id = $1 RETURNING *`,
      [questionId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { code: 404, message: '问题不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: '删除成功',
      data: result[0],
    });
  } catch (error) {
    console.error('删除七问失败:', error);
    return NextResponse.json(
      { code: 500, message: '删除七问失败', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = parseInt(params.id);
    if (isNaN(questionId)) {
      return NextResponse.json(
        { code: 400, message: '无效的问题ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { question, category, order, description, importance, tips } = body;

    // 更新问题
    const result = await exec_sql(
      `UPDATE health_questions
       SET question = COALESCE($1, question),
           category = COALESCE($2, category),
           "order" = COALESCE($3, "order"),
           description = COALESCE($4, description),
           importance = COALESCE($5, importance),
           tips = COALESCE($6, tips),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        question ? question.trim() : null,
        category || null,
        order || null,
        description || null,
        importance || null,
        tips ? JSON.stringify(tips) : null,
        questionId,
      ]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { code: 404, message: '问题不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      message: '更新成功',
      data: result[0],
    });
  } catch (error) {
    console.error('更新七问失败:', error);
    return NextResponse.json(
      { code: 500, message: '更新七问失败', error: String(error) },
      { status: 500 }
    );
  }
}
