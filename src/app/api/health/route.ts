import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { checkDatabaseSchema, ensureDatabaseSchema } from '@/lib/databaseMigration';

// GET /api/health - 健康检查，检查数据库连接和表是否存在
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // ⚠️ 重要：首先检查数据库结构，如果发现不兼容就自动修复
    // 这样可以防止因 schema 变更导致的数据访问失败
    console.log('[Health] 检查数据库结构兼容性...');
    const schemaCheck = await checkDatabaseSchema();

    if (!schemaCheck.isCompatible) {
      console.warn(`[Health] 数据库结构不兼容，缺失列: ${schemaCheck.missingColumns.join(', ')}`);
      console.log('[Health] 自动执行数据库迁移修复...');

      const migrationResult = await ensureDatabaseSchema();

      if (!migrationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: '数据库结构不兼容且自动修复失败',
            missingColumns: schemaCheck.missingColumns,
            migrationErrors: migrationResult.errors,
            database: {
              connected: true,
              isCompatible: false,
            },
          },
          { status: 500 }
        );
      }

      console.log('[Health] 数据库结构已自动修复');
    }

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
