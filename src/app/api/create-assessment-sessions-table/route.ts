import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// POST /api/create-assessment-sessions-table - 创建健康评估会话表
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 创建表
    await (db.execute as any)(sql`
      CREATE TABLE IF NOT EXISTS assessment_sessions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_name VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
        personal_info JSONB,
        health_questionnaire_id VARCHAR(36),
        constitution_questionnaire_id VARCHAR(36),
        health_analysis_id VARCHAR(36),
        risk_assessment_id VARCHAR(36),
        current_step VARCHAR(50) DEFAULT 'personal_info',
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 创建索引
    await (db.execute as any)(sql`
      CREATE INDEX IF NOT EXISTS assessment_sessions_user_id_idx ON assessment_sessions(user_id)
    `);
    await (db.execute as any)(sql`
      CREATE INDEX IF NOT EXISTS assessment_sessions_user_id_status_idx ON assessment_sessions(user_id, status)
    `);
    await (db.execute as any)(sql`
      CREATE INDEX IF NOT EXISTS assessment_sessions_created_at_idx ON assessment_sessions(created_at)
    `);

    // 创建更新时间触发器函数（如果不存在）
    await (db.execute as any)(sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 创建触发器
    await (db.execute as any)(sql`
      DROP TRIGGER IF EXISTS update_assessment_sessions_updated_at ON assessment_sessions
    `);
    await (db.execute as any)(sql`
      CREATE TRIGGER update_assessment_sessions_updated_at
        BEFORE UPDATE ON assessment_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    return NextResponse.json({
      success: true,
      message: '健康评估会话表创建成功'
    });

  } catch (error) {
    console.error('Error creating assessment_sessions table:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建表失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
