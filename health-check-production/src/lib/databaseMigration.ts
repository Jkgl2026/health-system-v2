/**
 * 数据库自动迁移工具
 *
 * 用途：在应用启动时自动检查并执行必要的数据库迁移
 * 防止：因 schema 修改与数据库结构不一致导致的数据访问失败
 *
 * 使用方式：
 * 1. 在应用启动时调用 `ensureDatabaseSchema()`（如 middleware 或初始化脚本）
 * 2. 添加新字段后，在此文件的 MIGRATION_STEPS 中添加对应的迁移步骤
 * 3. 迁移会自动检测字段是否存在，避免重复执行
 */

import { getDb } from 'coze-coding-dev-sdk';

export interface MigrationStep {
  name: string;
  description: string;
  check: () => Promise<boolean>; // 检查是否需要执行此迁移
  execute: () => Promise<void>; // 执行迁移
}

/**
 * 迁移步骤定义
 *
 * ⚠️ 重要：每次修改 schema 后，必须在此添加对应的迁移步骤
 */
const MIGRATION_STEPS: MigrationStep[] = [
  {
    name: 'users_deleted_at',
    description: '添加 users.deleted_at 列（软删除支持）',
    check: async () => {
      const db = await getDb();
      const result = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'deleted_at';
      `);
      return !result.rows || result.rows.length === 0;
    },
    execute: async () => {
      const db = await getDb();
      await db.execute(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
      `);
      console.log('✓ 已添加 users.deleted_at 列');
    },
  },
  {
    name: 'requirements_seven_questions_answers',
    description: '添加 requirements.seven_questions_answers 列（七问答案）',
    check: async () => {
      const db = await getDb();
      const result = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'requirements'
        AND column_name = 'seven_questions_answers';
      `);
      return !result.rows || result.rows.length === 0;
    },
    execute: async () => {
      const db = await getDb();
      await db.execute(`
        ALTER TABLE requirements
        ADD COLUMN IF NOT EXISTS seven_questions_answers JSONB;
      `);
      console.log('✓ 已添加 requirements.seven_questions_answers 列');
    },
  },
  {
    name: 'requirements_bad_habits_checklist',
    description: '添加 requirements.bad_habits_checklist 列（不良生活习惯表）',
    check: async () => {
      const db = await getDb();
      const result = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'requirements'
        AND column_name = 'bad_habits_checklist';
      `);
      return !result.rows || result.rows.length === 0;
    },
    execute: async () => {
      const db = await getDb();
      await db.execute(`
        ALTER TABLE requirements
        ADD COLUMN IF NOT EXISTS bad_habits_checklist JSONB;
      `);
      console.log('✓ 已添加 requirements.bad_habits_checklist 列');
    },
  },
  {
    name: 'requirements_symptoms_300_checklist',
    description: '添加 requirements.symptoms_300_checklist 列（300症状表）',
    check: async () => {
      const db = await getDb();
      const result = await db.execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'requirements'
        AND column_name = 'symptoms_300_checklist';
      `);
      return !result.rows || result.rows.length === 0;
    },
    execute: async () => {
      const db = await getDb();
      await db.execute(`
        ALTER TABLE requirements
        ADD COLUMN IF NOT EXISTS symptoms_300_checklist JSONB;
      `);
      console.log('✓ 已添加 requirements.symptoms_300_checklist 列');
    },
  },
];

/**
 * 执行所有需要的数据库迁移
 *
 * @returns {Promise<{success: boolean, executed: string[], errors: string[]}>}
 */
export async function ensureDatabaseSchema(): Promise<{
  success: boolean;
  executed: string[];
  errors: string[];
}> {
  const result = {
    success: true,
    executed: [] as string[],
    errors: [] as string[],
  };

  console.log('[DatabaseMigration] 开始检查数据库结构...');

  for (const step of MIGRATION_STEPS) {
    try {
      const needsMigration = await step.check();

      if (needsMigration) {
        console.log(`[DatabaseMigration] 执行迁移: ${step.name} - ${step.description}`);
        await step.execute();
        result.executed.push(step.name);
      } else {
        console.log(`[DatabaseMigration] 跳过: ${step.name} (已存在)`);
      }
    } catch (error) {
      console.error(`[DatabaseMigration] 迁移失败: ${step.name}`, error);
      result.errors.push(`${step.name}: ${error}`);
      result.success = false;
    }
  }

  if (result.success) {
    console.log(`[DatabaseMigration] ✓ 数据库结构检查完成，执行了 ${result.executed.length} 个迁移`);
  } else {
    console.error(`[DatabaseMigration] ✗ 迁移失败: ${result.errors.join(', ')}`);
  }

  return result;
}

/**
 * 快速检查函数（用于 API 路由中轻量级检查）
 */
export async function checkDatabaseSchema(): Promise<{
  isCompatible: boolean;
  missingColumns: string[];
}> {
  const db = await getDb();
  const missingColumns: string[] = [];

  // 检查 requirements 表的关键列
  const requiredColumns = [
    { table: 'users', column: 'deleted_at' },
    { table: 'requirements', column: 'seven_questions_answers' },
    { table: 'requirements', column: 'bad_habits_checklist' },
    { table: 'requirements', column: 'symptoms_300_checklist' },
  ];

  for (const { table, column } of requiredColumns) {
    const result = await db.execute(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${table}'
      AND column_name = '${column}';
    `);

    if (!result.rows || result.rows.length === 0) {
      missingColumns.push(`${table}.${column}`);
    }
  }

  return {
    isCompatible: missingColumns.length === 0,
    missingColumns,
  };
}
