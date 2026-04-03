import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// POST /api/assessment/sessions - 创建评估会话
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionName, personalInfo } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 确保用户存在
    await (db.execute as any)(
      sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO UPDATE SET id = ${userId}`
    );

    // 创建会话
    const sessionId = crypto.randomUUID();
    await (db.execute as any)(
      sql`
        INSERT INTO assessment_sessions (id, user_id, session_name, personal_info, status, current_step)
        VALUES (${sessionId}, ${userId}, ${sessionName || null}, ${personalInfo ? JSON.stringify(personalInfo) : null}, 'in_progress', 'personal_info')
      `
    );

    return NextResponse.json({
      success: true,
      data: {
        id: sessionId,
        userId,
        sessionName,
        status: 'in_progress',
        currentStep: 'personal_info',
        message: '评估会话创建成功'
      }
    });

  } catch (error) {
    console.error('Error creating assessment session:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建评估会话失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/assessment/sessions?userId=xxx&status=xxx - 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
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
    if (status === 'completed' || status === 'in_progress') {
      whereClause = sql`WHERE user_id = ${userId} AND status = ${status}`;
    }

    // 查询会话列表
    const recordsResult = await (db.execute as any)(
      sql`
        SELECT * FROM assessment_sessions
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );

    const records = recordsResult.rows.map((row: any) => ({
      ...row,
      personalInfo: typeof row.personal_info === 'string'
        ? JSON.parse(row.personal_info)
        : row.personal_info,
    }));

    // 查询总数
    const countResult = await (db.execute as any)(
      sql`SELECT COUNT(*) as count FROM assessment_sessions ${whereClause}`
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
    console.error('Error fetching assessment sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取评估会话列表失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
