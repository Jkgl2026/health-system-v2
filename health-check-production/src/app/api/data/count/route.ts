import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 获取用户数量
 * GET /api/data/count
 */
export async function GET(request: NextRequest) {
  try {
    // 连接数据库
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: process.env.PGDATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await client.connect();

    try {
      // 获取用户数量
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');

      // 获取所有用户列表
      const users = await client.query('SELECT id, name, phone, age, gender, created_at FROM users ORDER BY created_at DESC');

      return NextResponse.json({
        success: true,
        message: '用户数据获取成功',
        data: {
          userCount: parseInt(userCount.rows[0].count),
          users: users.rows
        }
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
