import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/health - 健康检查，检查数据库连接和表是否存在
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 检查数据库连接
    const result = await db.execute(`
      SELECT NOW() as current_time;
    `);

    // 检查表是否存在
    const tablesResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);

    // 检查用户数量
    let userCount = 0;
    try {
      const countResult = await db.execute(`
        SELECT COUNT(*) as count FROM users;
      `);
      const firstRow = countResult.rows[0] as any;
      userCount = parseInt(String(firstRow?.count || '0'));
    } catch (error) {
      console.error('Error counting users:', error);
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        currentTime: result.rows[0].current_time,
        tables: tables,
        userCount: userCount,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        database: {
          connected: false,
        },
      },
      { status: 500 }
    );
  }
}
