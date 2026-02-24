import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/test-db - 测试数据库连接
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 测试查询
    const result = await db.execute(`SELECT NOW() as current_time;`);

    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      data: result,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        error: '数据库连接失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
