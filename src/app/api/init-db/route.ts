import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/init-db - 初始化数据库表结构（仅用于首次设置或开发环境）
// ⚠️ 警告：此操作会删除所有数据！请谨慎使用！
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { confirm } = body;

    // 安全保护：必须传入 confirm=true 才能执行
    if (confirm !== true) {
      return NextResponse.json(
        {
          error: '操作被拒绝',
          message: '此操作会删除所有数据！请传入 confirm=true 参数确认执行。'
        },
        { status: 403 }
      );
    }

    const db = await getDb();

    // 删除旧表（如果存在）
    await db.execute(`DROP TABLE IF EXISTS admins CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS requirements CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS user_choices CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS health_analysis CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS symptom_checks CASCADE;`);
    await db.execute(`DROP TABLE IF EXISTS users CASCADE;`);

    // 创建所有表
    await db.execute(`
      CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(128),
        phone VARCHAR(20),
        email VARCHAR(255),
        age INTEGER,
        gender VARCHAR(10),
        weight VARCHAR(20),
        height VARCHAR(20),
        blood_pressure VARCHAR(50),
        occupation VARCHAR(100),
        address TEXT,
        bmi VARCHAR(20),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await db.execute(`
      CREATE INDEX users_phone_idx ON users(phone);
    `);

    await db.execute(`
      CREATE TABLE symptom_checks (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        checked_symptoms JSONB NOT NULL,
        total_score INTEGER,
        element_scores JSONB,
        checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE INDEX symptom_checks_user_id_idx ON symptom_checks(user_id);
    `);

    await db.execute(`
      CREATE TABLE health_analysis (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        qi_and_blood INTEGER,
        circulation INTEGER,
        toxins INTEGER,
        blood_lipids INTEGER,
        coldness INTEGER,
        immunity INTEGER,
        emotions INTEGER,
        overall_health INTEGER,
        analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE INDEX health_analysis_user_id_idx ON health_analysis(user_id);
    `);

    await db.execute(`
      CREATE TABLE user_choices (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        plan_description TEXT,
        selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE INDEX user_choices_user_id_idx ON user_choices(user_id);
    `);

    await db.execute(`
      CREATE TABLE requirements (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        requirement1_completed BOOLEAN DEFAULT FALSE,
        requirement2_completed BOOLEAN DEFAULT FALSE,
        requirement3_completed BOOLEAN DEFAULT FALSE,
        requirement4_completed BOOLEAN DEFAULT FALSE,
        requirement2_answers JSONB,
        seven_questions_answers JSONB,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await db.execute(`
      CREATE INDEX requirements_user_id_idx ON requirements(user_id);
    `);

    await db.execute(`
      CREATE TABLE admins (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE audit_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(50) NOT NULL,
        record_id VARCHAR(36) NOT NULL,
        action VARCHAR(20) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        operator_id VARCHAR(36),
        operator_name VARCHAR(128),
        operator_type VARCHAR(20),
        ip VARCHAR(45),
        user_agent TEXT,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(`
      CREATE INDEX audit_logs_table_idx ON audit_logs(table_name);
      CREATE INDEX audit_logs_record_idx ON audit_logs(record_id);
      CREATE INDEX audit_logs_action_idx ON audit_logs(action);
      CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);
    `);

    return NextResponse.json({
      success: true,
      message: '数据库表结构初始化成功',
      tables: [
        'users',
        'symptom_checks',
        'health_analysis',
        'user_choices',
        'requirements',
        'admins',
        'audit_logs'
      ]
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: '数据库初始化失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
