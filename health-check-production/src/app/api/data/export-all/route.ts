import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 导出所有数据
 * POST /api/data/export-all
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
      // 导出所有表数据
      const tables = ['users', 'admins', 'symptom_checks', 'health_analysis', 'user_choices', 'requirements', 'courses', 'audit_logs', 'migration_history'];

      const data: Record<string, any[]> = {};
      const statistics: Record<string, number> = {};

      for (const table of tables) {
        try {
          const result = await client.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
          data[table] = result.rows;
          statistics[table] = result.rows.length;
        } catch (error) {
          console.error(`导出表 ${table} 失败:`, error);
          data[table] = [];
          statistics[table] = 0;
        }
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        statistics: statistics,
        totalUsers: statistics.users || 0,
        data: data
      };

      return NextResponse.json({
        success: true,
        message: '数据导出成功',
        data: exportData
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '导出数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
