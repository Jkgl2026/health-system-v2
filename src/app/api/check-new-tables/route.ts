import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

export async function GET() {
  try {
    const db = await getDb();
    
    // 检查新创建的表
    const tables = [
      'biological_age_records',
      'voice_health_records',
      'palmistry_records',
      'breathing_analysis_records',
      'eye_health_records',
      'export_history',
      'report_templates'
    ];
    
    const results: any = {};
    
    for (const table of tables) {
      try {
        const result = await db.execute(`
          SELECT COUNT(*) as count FROM ${table}
        `);
        results[table] = {
          exists: true,
          count: result.rows?.[0]?.count || 0
        };
      } catch (e: any) {
        results[table] = {
          exists: false,
          error: e.message
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    return NextResponse.json(
      { error: '查询失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
