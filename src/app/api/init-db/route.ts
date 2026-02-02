import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// 初始化密钥（从环境变量获取）
const INIT_KEY = process.env.DB_INIT_KEY || 'init-health-system-2025';

// 数据库表创建 SQL
const createTablesSQL = `
-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
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
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  phone_group_id VARCHAR(36),
  is_latest_version BOOLEAN DEFAULT TRUE
);

-- 创建 admins 表
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(128),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建 symptom_checks 表
CREATE TABLE IF NOT EXISTS symptom_checks (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  checked_symptoms JSONB NOT NULL,
  total_score INTEGER,
  element_scores JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT symptom_checks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建 health_analysis 表
CREATE TABLE IF NOT EXISTS health_analysis (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  qi_and_blood INTEGER,
  circulation INTEGER,
  toxins INTEGER,
  blood_lipids INTEGER,
  coldness INTEGER,
  immunity INTEGER,
  emotions INTEGER,
  overall_health INTEGER,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT health_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建 user_choices 表
CREATE TABLE IF NOT EXISTS user_choices (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL,
  plan_type VARCHAR(50) NOT NULL,
  plan_description TEXT,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT user_choices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建 requirements 表
CREATE TABLE IF NOT EXISTS requirements (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(36) NOT NULL UNIQUE,
  requirement1_completed BOOLEAN DEFAULT FALSE,
  requirement2_completed BOOLEAN DEFAULT FALSE,
  requirement3_completed BOOLEAN DEFAULT FALSE,
  requirement4_completed BOOLEAN DEFAULT FALSE,
  requirement2_answers JSONB,
  seven_questions_answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  bad_habits_checklist JSONB,
  symptoms_300_checklist JSONB,
  CONSTRAINT requirements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建 audit_logs 表
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(20) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id VARCHAR(36) NOT NULL,
  operator_id VARCHAR(36),
  operator_name VARCHAR(128),
  operator_type VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip VARCHAR(45),
  user_agent TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 创建 courses 表
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  duration VARCHAR(50),
  module VARCHAR(100),
  related_elements JSONB,
  related_symptoms JSONB,
  related_diseases JSONB,
  priority INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT TRUE NOT NULL,
  course_number INTEGER,
  season VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建 migration_history 表
CREATE TABLE IF NOT EXISTS migration_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_id VARCHAR(64) NOT NULL UNIQUE,
  migration_type VARCHAR(20) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  backup_id VARCHAR(64),
  rollback_sql TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);
`;

// 创建索引 SQL
const createIndexesSQL = `
-- users 表索引
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS users_phone_group_idx ON users(phone_group_id);

-- admins 表索引
CREATE INDEX IF NOT EXISTS admins_username_idx ON admins(username);

-- symptom_checks 表索引
CREATE INDEX IF NOT EXISTS idx_symptom_checks_checked_at ON symptom_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_user_checked ON symptom_checks(user_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_symptom_checks_user_id ON symptom_checks(user_id);

-- health_analysis 表索引
CREATE INDEX IF NOT EXISTS idx_health_analysis_analyzed_at ON health_analysis(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_health_analysis_user_analyzed ON health_analysis(user_id, analyzed_at);
CREATE INDEX IF NOT EXISTS idx_health_analysis_user_id ON health_analysis(user_id);

-- user_choices 表索引
CREATE INDEX IF NOT EXISTS idx_user_choices_selected_at ON user_choices(selected_at);
CREATE INDEX IF NOT EXISTS idx_user_choices_user_id ON user_choices(user_id);

-- requirements 表索引
CREATE INDEX IF NOT EXISTS idx_requirements_updated_at ON requirements(updated_at);
CREATE INDEX IF NOT EXISTS idx_requirements_user_id ON requirements(user_id);

-- audit_logs 表索引
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_operator_idx ON audit_logs(operator_id);
CREATE INDEX IF NOT EXISTS audit_logs_record_idx ON audit_logs(table_name, record_id);

-- courses 表索引
CREATE INDEX IF NOT EXISTS courses_course_number_idx ON courses(course_number);
CREATE INDEX IF NOT EXISTS courses_is_hidden_idx ON courses(is_hidden);
CREATE INDEX IF NOT EXISTS courses_module_idx ON courses(module);
CREATE INDEX IF NOT EXISTS courses_priority_idx ON courses(priority);
`;

export async function POST(request: NextRequest) {
  try {
    // 验证初始化密钥
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== INIT_KEY) {
      return NextResponse.json(
        { success: false, message: '无效的初始化密钥' },
        { status: 401 }
      );
    }

    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        { success: false, message: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 创建表
    await db.execute(sql.raw(createTablesSQL));

    // 创建索引
    await db.execute(sql.raw(createIndexesSQL));

    // 检查是否已有管理员账号
    const adminCheck = await db.execute(
      sql`SELECT COUNT(*) as count FROM admins WHERE username = 'admin'`
    );

    const adminCount = adminCheck.rows[0]?.count || 0;

    if (parseInt(adminCount) === 0) {
      // 创建默认管理员账号
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db.execute(
        sql`INSERT INTO admins (username, password, name, is_active) VALUES ('admin', ${hashedPassword}, '系统管理员', true)`
      );
    }

    return NextResponse.json({
      success: true,
      message: '数据库初始化成功！',
      adminCreated: parseInt(adminCount) === 0
    });

  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '数据库初始化失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
