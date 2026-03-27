import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/debug-table-structure - 调试表结构
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 检查 breathing_analysis_records 表的列
    const breathingColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'breathing_analysis_records'
      ORDER BY ordinal_position;
    `);

    // 检查 voice_health_records 表的列
    const voiceColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'voice_health_records'
      ORDER BY ordinal_position;
    `);

    // 检查 palmistry_records 表的列
    const palmistryColumns = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'palmistry_records'
      ORDER BY ordinal_position;
    `);

    return NextResponse.json({
      success: true,
      tables: {
        breathing_analysis_records: breathingColumns.rows,
        voice_health_records: voiceColumns.rows,
        palmistry_records: palmistryColumns.rows,
      },
    });
  } catch (error) {
    console.error('[DebugTableStructure] 查询失败:', error);
    return NextResponse.json(
      { error: '查询失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
