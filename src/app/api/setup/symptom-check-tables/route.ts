import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /api/setup/symptom-check-tables
 * 创建自检数据相关表
 */
export async function POST() {
  try {
    // 创建自检数据表
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS symptom_check (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        check_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        selected_symptoms JSONB NOT NULL,
        target_symptoms JSONB NOT NULL,
        total_score INTEGER NOT NULL DEFAULT 0,
        qi_blood_score INTEGER DEFAULT 0,
        circulation_score INTEGER DEFAULT 0,
        toxins_score INTEGER DEFAULT 0,
        blood_lipids_score INTEGER DEFAULT 0,
        coldness_score INTEGER DEFAULT 0,
        immunity_score INTEGER DEFAULT 0,
        emotions_score INTEGER DEFAULT 0,
        create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建健康分析表（先不创建外键约束）
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS health_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL,
        check_id INTEGER NOT NULL,
        qi_and_blood INTEGER,
        circulation INTEGER,
        toxins INTEGER,
        blood_lipids INTEGER,
        coldness INTEGER,
        immunity INTEGER,
        emotions INTEGER,
        overall_health INTEGER,
        analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // 创建索引
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS idx_symptom_check_user_id ON symptom_check(user_id)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS idx_symptom_check_date ON symptom_check(check_date)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS idx_health_analysis_user_id ON health_analysis(user_id)
    `);
    await exec_sql(`
      CREATE INDEX IF NOT EXISTS idx_health_analysis_check_id ON health_analysis(check_id)
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
      DROP TRIGGER IF EXISTS trigger_update_symptom_check_update_time ON symptom_check
    `);
    await exec_sql(`
      CREATE TRIGGER trigger_update_symptom_check_update_time
      BEFORE UPDATE ON symptom_check
      FOR EACH ROW
      EXECUTE FUNCTION update_update_time()
    `);

    // health_analysis 表不再需要 update_time 触发器，因为只有一个时间戳字段

    return NextResponse.json({
      code: 200,
      msg: '自检数据表创建成功',
      data: {
        tables: ['symptom_check', 'health_analysis'],
        indexes: [
          'idx_symptom_check_user_id',
          'idx_symptom_check_date',
          'idx_health_analysis_user_id',
          'idx_health_analysis_check_id'
        ],
        triggers: [
          'trigger_update_symptom_check_update_time'
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
