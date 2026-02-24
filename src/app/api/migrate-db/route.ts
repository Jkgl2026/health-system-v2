import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-db - 数据库迁移：添加手机号分组字段
// 此操作会添加新字段并更新现有数据，不会删除任何数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { confirm } = body;

    // 安全保护：必须传入 confirm=true 才能执行
    if (confirm !== true) {
      return NextResponse.json(
        {
          error: '操作被拒绝',
          message: '此操作会修改数据库结构！请传入 confirm=true 参数确认执行。'
        },
        { status: 403 }
      );
    }

    const db = await getDb();

    console.log('[Migration] 开始执行数据库迁移...');

    // 检查 phone_group_id 字段是否已存在
    const columnCheckResult = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone_group_id';
    `);

    const phoneGroupExists = columnCheckResult.rows.length > 0;
    console.log('[Migration] phone_group_id 字段是否存在:', phoneGroupExists);

    // 添加 phone_group_id 字段（如果不存在）
    if (!phoneGroupExists) {
      console.log('[Migration] 添加 phone_group_id 字段...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN phone_group_id VARCHAR(36);
      `);
      console.log('[Migration] phone_group_id 字段添加成功');
    }

    // 检查 is_latest_version 字段是否已存在
    const versionCheckResult = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_latest_version';
    `);

    const versionExists = versionCheckResult.rows.length > 0;
    console.log('[Migration] is_latest_version 字段是否存在:', versionExists);

    // 添加 is_latest_version 字段（如果不存在）
    if (!versionExists) {
      console.log('[Migration] 添加 is_latest_version 字段...');
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN is_latest_version BOOLEAN DEFAULT true;
      `);
      console.log('[Migration] is_latest_version 字段添加成功');
    }

    // 检查 users_phone_group_idx 索引是否已存在
    const indexCheckResult = await db.execute(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'users_phone_group_idx';
    `);

    const indexExists = indexCheckResult.rows.length > 0;
    console.log('[Migration] users_phone_group_idx 索引是否存在:', indexExists);

    // 添加索引（如果不存在）
    if (!indexExists) {
      console.log('[Migration] 添加 users_phone_group_idx 索引...');
      await db.execute(`
        CREATE INDEX users_phone_group_idx ON users(phone_group_id);
      `);
      console.log('[Migration] users_phone_group_idx 索引添加成功');
    }

    // 更新现有数据：为有手机号的记录设置 phone_group_id
    console.log('[Migration] 更新现有数据的 phone_group_id...');
    const updateResult = await db.execute(`
      UPDATE users 
      SET phone_group_id = id 
      WHERE phone IS NOT NULL 
        AND phone_group_id IS NULL;
    `);
    console.log('[Migration] 更新了', updateResult.rowCount, '条记录');

    // 更新 requirements 表，添加缺失字段
    console.log('[Migration] 检查 requirements 表字段...');

    // 检查 bad_habits_checklist 字段
    const badHabitsCheck = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'requirements' AND column_name = 'bad_habits_checklist';
    `);

    if (badHabitsCheck.rows.length === 0) {
      console.log('[Migration] 添加 bad_habits_checklist 字段...');
      await db.execute(`
        ALTER TABLE requirements 
        ADD COLUMN bad_habits_checklist JSONB;
      `);
      console.log('[Migration] bad_habits_checklist 字段添加成功');
    }

    // 检查 symptoms_300_checklist 字段
    const symptoms300Check = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'requirements' AND column_name = 'symptoms_300_checklist';
    `);

    if (symptoms300Check.rows.length === 0) {
      console.log('[Migration] 添加 symptoms_300_checklist 字段...');
      await db.execute(`
        ALTER TABLE requirements 
        ADD COLUMN symptoms_300_checklist JSONB;
      `);
      console.log('[Migration] symptoms_300_checklist 字段添加成功');
    }

    // 检查 admins 表字段
    console.log('[Migration] 检查 admins 表字段...');

    // 检查 name 字段
    const adminNameCheck = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'name';
    `);

    if (adminNameCheck.rows.length === 0) {
      console.log('[Migration] 添加 admins.name 字段...');
      await db.execute(`
        ALTER TABLE admins 
        ADD COLUMN name VARCHAR(128);
      `);
      console.log('[Migration] admins.name 字段添加成功');
    }

    // 检查 is_active 字段
    const adminActiveCheck = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'is_active';
    `);

    if (adminActiveCheck.rows.length === 0) {
      console.log('[Migration] 添加 admins.is_active 字段...');
      await db.execute(`
        ALTER TABLE admins 
        ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
      `);
      console.log('[Migration] admins.is_active 字段添加成功');
    }

    // 检查 updated_at 字段
    const adminUpdatedCheck = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'admins' AND column_name = 'updated_at';
    `);

    if (adminUpdatedCheck.rows.length === 0) {
      console.log('[Migration] 添加 admins.updated_at 字段...');
      await db.execute(`
        ALTER TABLE admins 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
      `);
      console.log('[Migration] admins.updated_at 字段添加成功');
    }

    // 检查 audit_logs 表字段
    console.log('[Migration] 检查 audit_logs 表字段...');

    // 检查 deleted_at 字段
    const auditDeletedCheck = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs' AND column_name = 'deleted_at';
    `);

    if (auditDeletedCheck.rows.length === 0) {
      console.log('[Migration] 添加 audit_logs.deleted_at 字段...');
      await db.execute(`
        ALTER TABLE audit_logs 
        ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
      `);
      console.log('[Migration] audit_logs.deleted_at 字段添加成功');
    }

    console.log('[Migration] 数据库迁移完成');

    return NextResponse.json({
      success: true,
      message: '数据库迁移完成',
      changes: [
        '添加 users.phone_group_id 字段',
        '添加 users.is_latest_version 字段',
        '添加 users_phone_group_idx 索引',
        '更新现有用户的 phone_group_id',
        '添加 requirements.bad_habits_checklist 字段',
        '添加 requirements.symptoms_300_checklist 字段',
        '添加 admins.name 字段',
        '添加 admins.is_active 字段',
        '添加 admins.updated_at 字段',
      ]
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: '数据库迁移失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
