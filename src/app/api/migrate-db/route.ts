import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-db - 安全迁移数据库（添加缺失的列，不删除数据）
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const migrationLog: string[] = [];

    // 检查并添加 requirements.seven_questions_answers 列
    try {
      // 检查列是否存在
      const columnCheck = await db.execute(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'requirements' 
        AND column_name = 'seven_questions_answers';
      `);

      if (!columnCheck.rows || columnCheck.rows.length === 0) {
        // 列不存在，添加列
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

    // 可以在这里添加更多的迁移逻辑
    // 例如：检查其他表或列，添加索引等

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
