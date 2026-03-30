import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// GET /api/health-questionnaire/[id] - 获取单个健康问卷详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少id参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查询健康问卷详情
    const result = await (db.execute as any)(
      sql`SELECT * FROM health_questionnaires WHERE id = ${id}`
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '健康问卷不存在' },
        { status: 404 }
      );
    }

    const record = result.rows[0];

    return NextResponse.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error('Error fetching health questionnaire detail:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取健康问卷详情失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/health-questionnaire/[id] - 删除健康问卷
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少id参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 删除健康问卷
    const result = await (db.execute as any)(
      sql`DELETE FROM health_questionnaires WHERE id = ${id} RETURNING id`
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '健康问卷不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '健康问卷删除成功'
    });

  } catch (error) {
    console.error('Error deleting health questionnaire:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '删除健康问卷失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
