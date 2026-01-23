import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-db - 安全迁移数据库（添加缺失的列，不删除数据）
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const migrationLog: string[] = [];

    // ============ 添加 users.deleted_at 列（软删除） ============
    try {
      const columnCheck = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'deleted_at';
      `);

      if (!columnCheck.rows || columnCheck.rows.length === 0) {
        await db.execute(`
          ALTER TABLE users
          ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        `);
        migrationLog.push('✓ 已添加 users.deleted_at 列（软删除支持）');
      } else {
        migrationLog.push('ℹ users.deleted_at 列已存在，跳过');
      }
    } catch (error) {
      migrationLog.push(`✗ 添加 users.deleted_at 列失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // ============ 添加 requirements.seven_questions_answers 列 ============
    try {
      const columnCheck = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'requirements'
        AND column_name = 'seven_questions_answers';
      `);

      if (!columnCheck.rows || columnCheck.rows.length === 0) {
        await db.execute(`
          ALTER TABLE requirements
          ADD COLUMN seven_questions_answers JSONB;
        `);
        migrationLog.push('✓ 已添加 requirements.seven_questions_answers 列');
      } else {
        migrationLog.push('ℹ requirements.seven_questions_answers 列已存在，跳过');
      }
    } catch (error) {
      migrationLog.push(`✗ 添加 seven_questions_answers 列失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // ============ 创建 audit_logs 表（审计日志） ============
    try {
      const tableCheck = await db.execute(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'audit_logs';
      `);

      if (!tableCheck.rows || tableCheck.rows.length === 0) {
        await db.execute(`
          CREATE TABLE audit_logs (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
            action VARCHAR(20) NOT NULL,
            table_name VARCHAR(50) NOT NULL,
            record_id VARCHAR(36) NOT NULL,
            operator_id VARCHAR(36),
            operator_name VARCHAR(128),
            operator_type VARCHAR(20) NOT NULL,
            old_data JSONB,
            new_data JSONB,
            ip VARCHAR(45),
            user_agent TEXT,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);

        // 创建索引
        await db.execute(`
          CREATE INDEX audit_logs_record_idx ON audit_logs(table_name, record_id);
        `);
        await db.execute(`
          CREATE INDEX audit_logs_operator_idx ON audit_logs(operator_id);
        `);
        await db.execute(`
          CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);
        `);

        migrationLog.push('✓ 已创建 audit_logs 表（审计日志支持）');
      } else {
        migrationLog.push('ℹ audit_logs 表已存在，跳过');
      }
    } catch (error) {
      migrationLog.push(`✗ 创建 audit_logs 表失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    return NextResponse.json({
      success: true,
      message: '数据库迁移完成',
      details: migrationLog,
    }, { status: 200 });
  } catch (error) {
    console.error('Error migrating database:', error);
    return NextResponse.json(
      { error: '数据库迁移失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
