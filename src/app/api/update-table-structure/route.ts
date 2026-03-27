import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/update-table-structure - 添加缺失的表字段
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { confirm } = body;

    // 安全保护：必须传入 confirm=true 才能执行
    if (confirm !== true) {
      return NextResponse.json(
        {
          error: '操作被拒绝',
          message: '请传入 confirm=true 参数确认执行迁移操作。'
        },
        { status: 403 }
      );
    }

    const db = await getDb();
    const results: string[] = [];

    // 1. 为 voice_health_records 表添加缺失字段
    try {
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS name VARCHAR(100);`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS gender VARCHAR(10);`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS age INTEGER;`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS overall_score INTEGER;`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS health_status VARCHAR(20);`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS voice_care_tips JSONB DEFAULT '[]';`);
      await db.execute(`ALTER TABLE voice_health_records ADD COLUMN IF NOT EXISTS summary TEXT;`);
      results.push('voice_health_records 字段添加成功');
    } catch (e: any) {
      results.push(`voice_health_records 字段添加失败: ${e.message}`);
    }

    // 2. 为 breathing_analysis_records 表添加缺失字段
    try {
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS name VARCHAR(100);`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS gender VARCHAR(10);`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS score INTEGER;`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS breathing_quality VARCHAR(20);`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN IF NOT EXISTS summary TEXT;`);
      results.push('breathing_analysis_records 字段添加成功');
    } catch (e: any) {
      results.push(`breathing_analysis_records 字段添加失败: ${e.message}`);
    }

    // 3. 为 palmistry_records 表添加缺失字段
    try {
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS name VARCHAR(100);`);
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS gender VARCHAR(10);`);
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`);
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS score INTEGER;`);
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS health_status VARCHAR(20);`);
      await db.execute(`ALTER TABLE palmistry_records ADD COLUMN IF NOT EXISTS summary TEXT;`);
      results.push('palmistry_records 字段添加成功');
    } catch (e: any) {
      results.push(`palmistry_records 字段添加失败: ${e.message}`);
    }

    // 4. 为 eye_health_records 表添加缺失字段
    try {
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS name VARCHAR(100);`);
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS gender VARCHAR(10);`);
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS phone VARCHAR(20);`);
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS score INTEGER;`);
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS health_status VARCHAR(20);`);
      await db.execute(`ALTER TABLE eye_health_records ADD COLUMN IF NOT EXISTS summary TEXT;`);
      results.push('eye_health_records 字段添加成功');
    } catch (e: any) {
      results.push(`eye_health_records 字段添加失败: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '表结构更新完成',
      results
    });
  } catch (error) {
    console.error('[UpdateTableStructure] 更新失败:', error);
    return NextResponse.json(
      { error: '表结构更新失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
