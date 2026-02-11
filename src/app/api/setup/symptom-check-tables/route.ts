import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /api/setup/symptom-check-tables
 * 创建自检数据相关表
 */
export async function POST() {
  try {
    // 创建症状自检结果表（与 Drizzle Schema 一致）
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS symptom_checks (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        checked_symptoms JSONB NOT NULL,
        total_score INTEGER,
        element_scores JSONB,
        checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_symptom_checks_user_id FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建健康分析表（与 Drizzle Schema 一致）
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

    // 创建索引
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS symptom_checks_user_id_idx ON symptom_checks(user_id)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS symptom_checks_user_id_checked_at_idx ON symptom_checks(user_id, checked_at)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS symptom_checks_checked_at_idx ON symptom_checks(checked_at)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS health_analysis_user_id_idx ON health_analysis(user_id)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS health_analysis_user_id_analyzed_at_idx ON health_analysis(user_id, analyzed_at)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS health_analysis_analyzed_at_idx ON health_analysis(analyzed_at)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS health_analysis_check_id_idx ON health_analysis(check_id)
    `);

    // 创建触发器自动更新 update_time
    await exec_sql(`
      CREATE OR REPLACE FUNCTION update_update_time()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.update_time = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await exec_sql(`
      DROP TRIGGER IF EXISTS trigger_update_symptom_checks_update_time ON symptom_checks
    `);
    await exec_sql(`
      CREATE TRIGGER trigger_update_symptom_checks_update_time
      BEFORE UPDATE ON symptom_checks
      FOR EACH ROW
      EXECUTE FUNCTION update_update_time()
    `);

    // health_analysis 表不再需要 update_time 触发器，因为只有一个时间戳字段

    return NextResponse.json({
      code: 200,
      msg: '自检数据表创建成功',
      data: {
        tables: ['symptom_checks', 'health_analysis'],
        indexes: [
          'symptom_checks_user_id_idx',
          'symptom_checks_user_id_checked_at_idx',
          'symptom_checks_checked_at_idx',
          'health_analysis_user_id_idx',
          'health_analysis_user_id_analyzed_at_idx',
          'health_analysis_analyzed_at_idx',
          'health_analysis_check_id_idx'
        ],
        triggers: [
          'trigger_update_symptom_checks_update_time'
        ]
      }
    });
  } catch (error) {
    console.error('[创建表错误]', error);
    return NextResponse.json({
      code: 500,
      msg: '创建表失败',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
