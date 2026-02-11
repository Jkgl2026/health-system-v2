import { NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * GET /api/migration/fix-health-analysis
 * 检查 health_analysis 表结构，如果不匹配则提示修复
 */
export async function GET() {
  try {
    console.log('[迁移] 检查 health_analysis 表结构...');

    // 检查表是否存在
    const tableExists = await exec_sql(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'health_analysis'
      );
    `);

    if (!tableExists[0].exists) {
      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表不存在，请使用 POST 方法创建',
        needsFix: true,
      });
    }

    // 检查 id 列的类型
    const columnInfo = await exec_sql(`
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'health_analysis' AND column_name = 'id';
    `);

    if (columnInfo.length === 0) {
      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表结构异常：缺少 id 列',
        needsFix: true,
      });
    }

    const currentType = columnInfo[0].data_type;
    const maxLength = columnInfo[0].character_maximum_length;

    // 检查是否需要修复（id 应该是 VARCHAR(36)）
    const needsFix = currentType !== 'character varying' || maxLength !== 36;

    if (needsFix) {
      return NextResponse.json({
        code: 200,
        message: `health_analysis 表的 id 列类型不匹配（当前: ${currentType}${maxLength ? `(${maxLength})` : ''}，需要: VARCHAR(36)）`,
        needsFix: true,
        currentType,
        currentLength: maxLength,
      });
    }

    // 检查是否缺少 check_id 字段
    const checkIdExists = await exec_sql(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'health_analysis' AND column_name = 'check_id'
      );
    `);

    if (!checkIdExists[0].exists) {
      return NextResponse.json({
        code: 200,
        message: 'health_analysis 表缺少 check_id 字段',
        needsFix: true,
      });
    }

    console.log('[迁移] health_analysis 表结构正确');

    return NextResponse.json({
      code: 200,
      message: 'health_analysis 表结构正确',
      needsFix: false,
    });

  } catch (error: any) {
    console.error('[迁移] 检查失败:', error);

    return NextResponse.json({
      code: 500,
      message: '检查失败',
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * POST /api/migration/fix-health-analysis
 * 强制重建 health_analysis 表以匹配 Drizzle Schema
 */
export async function POST() {
  try {
    console.log('[迁移] 开始重建 health_analysis 表...');

    // 删除旧表（包括 symptom_checks 表，因为它们有外键关系）
    await exec_sql('DROP TABLE IF EXISTS health_analysis CASCADE');
    await exec_sql('DROP TABLE IF EXISTS symptom_checks CASCADE');

    // 创建 symptom_checks 表
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS symptom_checks (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        checked_symptoms JSONB NOT NULL,
        total_score INTEGER,
        element_scores JSONB,
        checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // 创建 health_analysis 表（与 Drizzle Schema 完全一致）
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS health_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        check_id VARCHAR(36),
        qi_and_blood INTEGER,
        circulation INTEGER,
        toxins INTEGER,
        blood_lipids INTEGER,
        coldness INTEGER,
        immunity INTEGER,
        emotions INTEGER,
        overall_health INTEGER,
        analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_health_analysis_user_id FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_health_analysis_check_id FOREIGN KEY (check_id)
          REFERENCES symptom_checks(id) ON DELETE CASCADE
      )
    `);

    // 创建 symptom_checks 索引
    await exec_sql('CREATE INDEX IF NOT EXISTS symptom_checks_user_id_idx ON symptom_checks(user_id)');
    await exec_sql('CREATE INDEX IF NOT EXISTS symptom_checks_user_id_checked_at_idx ON symptom_checks(user_id, checked_at)');
    await exec_sql('CREATE INDEX IF NOT EXISTS symptom_checks_checked_at_idx ON symptom_checks(checked_at)');

    // 创建 health_analysis 索引（与 Drizzle Schema 一致的索引名）
    await exec_sql('CREATE INDEX IF NOT EXISTS health_analysis_user_id_idx ON health_analysis(user_id)');
    await exec_sql('CREATE INDEX IF NOT EXISTS health_analysis_user_id_analyzed_at_idx ON health_analysis(user_id, analyzed_at)');
    await exec_sql('CREATE INDEX IF NOT EXISTS health_analysis_analyzed_at_idx ON health_analysis(analyzed_at)');
    await exec_sql('CREATE INDEX IF NOT EXISTS health_analysis_check_id_idx ON health_analysis(check_id)');

    console.log('[迁移] health_analysis 和 symptom_checks 表重建完成');

    return NextResponse.json({
      code: 200,
      message: 'health_analysis 和 symptom_checks 表已成功重建，结构与 Drizzle Schema 一致',
      tables: ['symptom_checks', 'health_analysis'],
      schema: {
        health_analysis: {
          id: 'VARCHAR(36) UUID',
          user_id: 'VARCHAR(36)',
          check_id: 'VARCHAR(36)',
          fields: ['qi_and_blood', 'circulation', 'toxins', 'blood_lipids', 'coldness', 'immunity', 'emotions', 'overall_health', 'analyzed_at']
        },
        symptom_checks: {
          id: 'VARCHAR(36) UUID',
          user_id: 'VARCHAR(36)',
          fields: ['checked_symptoms', 'total_score', 'element_scores', 'checked_at']
        }
      }
    });

  } catch (error: any) {
    console.error('[迁移] 重建失败:', error);

    return NextResponse.json({
      code: 500,
      message: '重建失败',
      error: error.message,
    }, { status: 500 });
  }
}
