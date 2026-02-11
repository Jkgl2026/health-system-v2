import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /api/setup/drop-symptom-check-tables
 * 删除自检数据相关表（用于重建）
 */
export async function POST() {
  try {
    // 删除健康分析表
    await exec_sql('DROP TABLE IF EXISTS health_analysis CASCADE');

    // 删除自检数据表
    await exec_sql('DROP TABLE IF EXISTS symptom_checks CASCADE');

    return NextResponse.json({
      code: 200,
      msg: '自检数据表删除成功',
      data: {
        dropped_tables: ['health_analysis', 'symptom_checks']
      }
    });
  } catch (error) {
    console.error('[删除表错误]', error);
    return NextResponse.json({
      code: 500,
      msg: '删除表失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
