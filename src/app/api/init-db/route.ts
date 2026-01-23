import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/init-db - 初始化数据库表结构（仅用于首次设置）
export async function POST(request: NextRequest) {
  try {
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
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await db.execute(`
      CREATE INDEX requirements_user_id_idx ON requirements(user_id);
    `);

    await db.execute(`
      CREATE TABLE admins (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(128),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await db.execute(`
      CREATE INDEX admins_username_idx ON admins(username);
    `);

    return NextResponse.json({
      success: true,
      message: '数据库表结构初始化成功',
    }, { status: 201 });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: '数据库初始化失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
