/**
 * 数据库结构检查 API
 *
 * 用途：对比 schema 定义与实际数据库结构
 * 返回：兼容性状态、缺失的列、额外的列、完整的表结构
 */

import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// 从 schema 定义中提取必需的列
const REQUIRED_COLUMNS = {
  users: [
    'id', 'name', 'phone', 'email', 'age', 'gender', 'weight', 'height',
    'blood_pressure', 'occupation', 'address', 'bmi', 'created_at',
    'updated_at', 'deleted_at',
  ],
  requirements: [
    'id', 'user_id', 'requirement1_completed', 'requirement2_completed',
    'requirement3_completed', 'requirement4_completed', 'requirement2_answers',
    'seven_questions_answers', 'bad_habits_checklist', 'symptoms_300_checklist',
    'completed_at', 'updated_at',
  ],
  symptom_checks: [
    'id', 'user_id', 'checked_symptoms', 'total_score', 'element_scores', 'checked_at',
  ],
  health_analysis: [
    'id', 'user_id', 'qi_and_blood', 'circulation', 'toxins', 'blood_lipids',
    'coldness', 'immunity', 'emotions', 'overall_health', 'analyzed_at',
  ],
  user_choices: [
    'id', 'user_id', 'plan_type', 'plan_description', 'selected_at',
  ],
};

export async function GET() {
  try {
    const db = await getDb();
    const tables = ['users', 'requirements', 'symptom_checks', 'health_analysis', 'user_choices'];

    const missingColumns: string[] = [];
    const extraColumns: string[] = [];
    const tableSchemas: any[] = [];

    for (const tableName of tables) {
      // 获取实际表结构
      const result = await db.execute(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);

      const actualColumns = result.rows.map((row: any) => row.column_name);
      const requiredColumns = REQUIRED_COLUMNS[tableName as keyof typeof REQUIRED_COLUMNS] || [];

      // 检查缺失的列
      for (const requiredCol of requiredColumns) {
        if (!actualColumns.includes(requiredCol)) {
          missingColumns.push(`${tableName}.${requiredCol}`);
        }
      }

      // 检查额外的列
      for (const actualCol of actualColumns) {
        if (!requiredColumns.includes(actualCol)) {
          extraColumns.push(`${tableName}.${actualCol}`);
        }
      }

      // 保存完整的表结构
      tableSchemas.push({
        tableName,
        columns: result.rows,
      });
    }

    return NextResponse.json({
      success: true,
      isCompatible: missingColumns.length === 0,
      missingColumns,
      extraColumns,
      tables: tableSchemas,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Schema check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
