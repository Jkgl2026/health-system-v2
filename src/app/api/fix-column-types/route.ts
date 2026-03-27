import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/fix-column-types - 修正列类型
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

    // 1. 修正 breathing_analysis_records 表的列类型
    try {
      // 删除旧的列
      await db.execute(`ALTER TABLE breathing_analysis_records DROP COLUMN IF EXISTS breathing_pattern;`);
      await db.execute(`ALTER TABLE breathing_analysis_records DROP COLUMN IF EXISTS breathing_quality;`);

      // 重新创建为正确的类型
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN breathing_pattern VARCHAR(20);`);
      await db.execute(`ALTER TABLE breathing_analysis_records ADD COLUMN breathing_quality VARCHAR(20);`);

      results.push('breathing_analysis_records 列类型修正成功');
    } catch (e: any) {
      results.push(`breathing_analysis_records 列类型修正失败: ${e.message}`);
    }

    // 2. 修正 voice_health_records 表的列类型
    try {
      // overall_score 应该是 INTEGER
      await db.execute(`ALTER TABLE voice_health_records ALTER COLUMN overall_score TYPE INTEGER USING CASE WHEN overall_score ~ '^[0-9]+$' THEN overall_score::INTEGER ELSE 50 END;`);
      results.push('voice_health_records 列类型修正成功');
    } catch (e: any) {
      results.push(`voice_health_records 列类型修正失败: ${e.message}`);
    }

    // 3. 修正 palmistry_records 表的列类型
    try {
      // score 应该是 INTEGER
      await db.execute(`ALTER TABLE palmistry_records ALTER COLUMN score TYPE INTEGER USING CASE WHEN score ~ '^[0-9]+$' THEN score::INTEGER ELSE 50 END;`);
      results.push('palmistry_records 列类型修正成功');
    } catch (e: any) {
      results.push(`palmistry_records 列类型修正失败: ${e.message}`);
    }

    // 4. 修正 eye_health_records 表的列类型
    try {
      // score 应该是 INTEGER
      await db.execute(`ALTER TABLE eye_health_records ALTER COLUMN score TYPE INTEGER USING CASE WHEN score ~ '^[0-9]+$' THEN score::INTEGER ELSE 50 END;`);
      results.push('eye_health_records 列类型修正成功');
    } catch (e: any) {
      results.push(`eye_health_records 列类型修正失败: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '列类型修正完成',
      results
    });
  } catch (error) {
    console.error('[FixColumnTypes] 修正失败:', error);
    return NextResponse.json(
      { error: '列类型修正失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
