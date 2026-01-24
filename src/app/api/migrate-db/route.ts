import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { migrationManager } from '@/storage/database/migrationManager';

// POST /api/migrate-db - 安全迁移数据库（添加缺失的列，不删除数据）
// 支持自动备份和回滚
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { autoBackup = true, createdBy = 'ADMIN' } = body;

    console.log('[Migration API] 开始数据库迁移...');

    // 定义迁移步骤
    const steps = [
      {
        description: '添加 users.deleted_at 列（软删除支持）',
        execute: async () => {
          const db = await getDb();
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
            console.log('✓ 已添加 users.deleted_at 列');
          } else {
            console.log('ℹ users.deleted_at 列已存在，跳过');
          }
        },
        rollback: async () => {
          // 删除列的回滚操作
          const db = await getDb();
          try {
            await db.execute(`ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;`);
            console.log('✓ 已回滚 users.deleted_at 列');
          } catch (error) {
            console.error('回滚 users.deleted_at 列失败:', error);
          }
        },
      },
      {
        description: '添加 requirements.seven_questions_answers 列',
        execute: async () => {
          const db = await getDb();
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
            console.log('✓ 已添加 requirements.seven_questions_answers 列');
          } else {
            console.log('ℹ requirements.seven_questions_answers 列已存在，跳过');
          }
        },
        rollback: async () => {
          // 删除列的回滚操作
          const db = await getDb();
          try {
            await db.execute(`ALTER TABLE requirements DROP COLUMN IF EXISTS seven_questions_answers;`);
            console.log('✓ 已回滚 requirements.seven_questions_answers 列');
          } catch (error) {
            console.error('回滚 requirements.seven_questions_answers 列失败:', error);
          }
        },
      },
      {
        description: '添加 requirements.bad_habits_checklist 列（不良生活习惯自检表）',
        execute: async () => {
          const db = await getDb();
          const columnCheck = await db.execute(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'requirements'
            AND column_name = 'bad_habits_checklist';
          `);

          if (!columnCheck.rows || columnCheck.rows.length === 0) {
            await db.execute(`
              ALTER TABLE requirements
              ADD COLUMN bad_habits_checklist JSONB;
            `);
            console.log('✓ 已添加 requirements.bad_habits_checklist 列');
          } else {
            console.log('ℹ requirements.bad_habits_checklist 列已存在，跳过');
          }
        },
        rollback: async () => {
          // 删除列的回滚操作
          const db = await getDb();
          try {
            await db.execute(`ALTER TABLE requirements DROP COLUMN IF EXISTS bad_habits_checklist;`);
            console.log('✓ 已回滚 requirements.bad_habits_checklist 列');
          } catch (error) {
            console.error('回滚 requirements.bad_habits_checklist 列失败:', error);
          }
        },
      },
      {
        description: '添加 requirements.symptoms_300_checklist 列（300项症状自检表）',
        execute: async () => {
          const db = await getDb();
          const columnCheck = await db.execute(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'requirements'
            AND column_name = 'symptoms_300_checklist';
          `);

          if (!columnCheck.rows || columnCheck.rows.length === 0) {
            await db.execute(`
              ALTER TABLE requirements
              ADD COLUMN symptoms_300_checklist JSONB;
            `);
            console.log('✓ 已添加 requirements.symptoms_300_checklist 列');
          } else {
            console.log('ℹ requirements.symptoms_300_checklist 列已存在，跳过');
          }
        },
        rollback: async () => {
          // 删除列的回滚操作
          const db = await getDb();
          try {
            await db.execute(`ALTER TABLE requirements DROP COLUMN IF EXISTS symptoms_300_checklist;`);
            console.log('✓ 已回滚 requirements.symptoms_300_checklist 列');
          } catch (error) {
            console.error('回滚 requirements.symptoms_300_checklist 列失败:', error);
          }
        },
      },
      {
        description: '创建 audit_logs 表（审计日志支持）',
        execute: async () => {
          const db = await getDb();
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
            await db.execute(`CREATE INDEX audit_logs_record_idx ON audit_logs(table_name, record_id);`);
            await db.execute(`CREATE INDEX audit_logs_operator_idx ON audit_logs(operator_id);`);
            await db.execute(`CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);`);

            console.log('✓ 已创建 audit_logs 表');
          } else {
            console.log('ℹ audit_logs 表已存在，跳过');
          }
        },
        rollback: async () => {
          // 删除表的回滚操作
          const db = await getDb();
          try {
            await db.execute(`DROP TABLE IF EXISTS audit_logs;`);
            console.log('✓ 已回滚 audit_logs 表');
          } catch (error) {
            console.error('回滚 audit_logs 表失败:', error);
          }
        },
      },
    ];

    // 执行迁移（带自动备份和回滚）
    const result = await migrationManager.executeMigration(steps, {
      autoBackup,
      createdBy,
      description: '数据库迁移 - 添加软删除和审计日志支持',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          migrationId: result.migrationId,
          backupId: result.backupId,
          note: '如果迁移出现问题，可以使用迁移ID进行回滚',
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        data: {
          migrationId: result.migrationId,
          backupId: result.backupId,
          note: '迁移失败，系统已自动创建备份，可以尝试回滚',
        },
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error migrating database:', error);
    return NextResponse.json(
      { error: '数据库迁移失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
