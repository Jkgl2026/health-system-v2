import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 重置管理员账号（删除后重新创建）
 * POST /api/admin/reset
 *
 * 请求体格式：
 * {
 *   "username": "admin",
 *   "password": "admin123"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: '缺少用户名或密码'
      }, { status: 400 });
    }

    // 连接数据库
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: process.env.PGDATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await client.connect();

    try {
      // 删除旧的管理员（如果存在）
      await client.query('DELETE FROM admins WHERE username = $1', [username]);

      // 使用 init API 重新创建
      const initUrl = `${request.nextUrl.origin}/api/admin/init`;
      const initResponse = await fetch(initUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const initData = await initResponse.json();

      return NextResponse.json(initData);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('重置管理员失败:', error);
    return NextResponse.json({
      success: false,
      message: '重置管理员失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
