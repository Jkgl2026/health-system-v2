import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 初始化管理员账号
 * POST /api/admin/init
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
      // 检查管理员是否已存在
      const existingAdmin = await client.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      );

      if (existingAdmin.rows.length > 0) {
        return NextResponse.json({
          success: false,
          message: '管理员已存在'
        }, { status: 400 });
      }

      // 使用 bcrypt 哈希密码
      const hash = await hashPassword(password);

      // 插入管理员
      await client.query(
        `INSERT INTO admins (username, password, name, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [username, hash, '系统管理员', true, new Date(), new Date()]
      );

      return NextResponse.json({
        success: true,
        message: '管理员初始化成功',
        data: {
          username: username
        }
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('初始化管理员失败:', error);
    return NextResponse.json({
      success: false,
      message: '初始化管理员失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
