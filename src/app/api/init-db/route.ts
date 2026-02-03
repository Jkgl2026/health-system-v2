import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 初始化数据库
 * POST /api/init-db
 */
export async function POST(request: NextRequest) {
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
      // 读取schema.sql文件
      const fs = await import('fs');
      const path = await import('path');
      const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf-8');

      // 执行schema.sql
      await client.query(schema);

      return NextResponse.json({
        success: true,
        message: '数据库初始化成功'
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('初始化数据库失败:', error);
    return NextResponse.json({
      success: false,
      message: '初始化数据库失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * GET /api/init-db
 * 检查数据库状态
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
      // 检查表是否存在
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      return NextResponse.json({
        success: true,
        message: '数据库状态检查成功',
        data: {
          tables: result.rows.map(row => row.table_name),
          tableCount: result.rows.length
        }
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('检查数据库状态失败:', error);
    return NextResponse.json({
      success: false,
      message: '检查数据库状态失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
