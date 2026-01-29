import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/diagnose-db - 诊断数据库状态
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const diagnosis: any = {};

    // 检查 requirements 表结构
    const tableStructure = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'requirements'
      ORDER BY ordinal_position;
    `);
    diagnosis.requirementsStructure = tableStructure.rows || [];

    // 检查 requirements 表数据数量
    const countResult = await db.execute(`
      SELECT COUNT(*) as count FROM requirements;
    `);
    diagnosis.requirementsCount = countResult.rows?.[0]?.count || 0;

    // 检查是否有 seven_questions_answers 数据
    const dataSample = await db.execute(`
      SELECT id, user_id, seven_questions_answers 
      FROM requirements 
      LIMIT 5;
    `);
    diagnosis.requirementsSample = dataSample.rows || [];

    // 检查 users 表数据数量
    const usersCount = await db.execute(`
      SELECT COUNT(*) as count FROM users;
    `);
    diagnosis.usersCount = usersCount.rows?.[0]?.count || 0;

    return NextResponse.json({
      success: true,
      diagnosis,
    }, { status: 200 });
  } catch (error) {
    console.error('Error diagnosing database:', error);
    return NextResponse.json(
      { error: '数据库诊断失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
