import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-diagnosis-tables - 迁移添加诊断相关表
// 此API用于在现有数据库中添加新的诊断表，不会删除现有数据
// 注意：诊断表使用专用的用户表（face_diagnosis_users, tongue_diagnosis_users）
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

    // 创建面诊用户表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS face_diagnosis_users (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          age INTEGER,
          gender VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(name, phone)
        );
      `);
      results.push('面诊用户表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('面诊用户表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建面诊用户索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_face_users_name ON face_diagnosis_users(name);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_face_users_phone ON face_diagnosis_users(phone);`);
      results.push('面诊用户索引创建成功');
    } catch (e) {
      results.push('面诊用户索引已存在或创建失败（可忽略）');
    }

    // 创建面诊记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS face_diagnosis_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES face_diagnosis_users(id) ON DELETE CASCADE,
          image_url TEXT,
          score INTEGER,
          face_color JSONB,
          face_luster JSONB,
          facial_features JSONB,
          facial_characteristics JSONB,
          constitution JSONB,
          organ_status JSONB,
          suggestions JSONB,
          full_report TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('面诊记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('面诊记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建面诊记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS face_diagnosis_records_user_id_idx ON face_diagnosis_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS face_diagnosis_records_created_at_idx ON face_diagnosis_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS face_diagnosis_records_score_idx ON face_diagnosis_records(score);`);
      results.push('面诊记录索引创建成功');
    } catch (e) {
      results.push('面诊记录索引已存在或创建失败（可忽略）');
    }

    // 创建舌诊用户表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tongue_diagnosis_users (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          age INTEGER,
          gender VARCHAR(10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(name, phone)
        );
      `);
      results.push('舌诊用户表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('舌诊用户表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建舌诊用户索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_tongue_users_name ON tongue_diagnosis_users(name);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_tongue_users_phone ON tongue_diagnosis_users(phone);`);
      results.push('舌诊用户索引创建成功');
    } catch (e) {
      results.push('舌诊用户索引已存在或创建失败（可忽略）');
    }

    // 创建舌诊记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tongue_diagnosis_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES tongue_diagnosis_users(id) ON DELETE CASCADE,
          image_url TEXT,
          score INTEGER,
          tongue_body JSONB,
          tongue_coating JSONB,
          constitution JSONB,
          organ_status JSONB,
          suggestions JSONB,
          full_report TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('舌诊记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('舌诊记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建舌诊记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS tongue_diagnosis_records_user_id_idx ON tongue_diagnosis_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS tongue_diagnosis_records_created_at_idx ON tongue_diagnosis_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS tongue_diagnosis_records_score_idx ON tongue_diagnosis_records(score);`);
      results.push('舌诊记录索引创建成功');
    } catch (e) {
      results.push('舌诊记录索引已存在或创建失败（可忽略）');
    }

    // 创建健康档案表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS health_profiles (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
          latest_score INTEGER,
          constitution VARCHAR(50),
          constitution_confidence INTEGER,
          latest_face_score INTEGER,
          face_diagnosis_count INTEGER DEFAULT 0,
          last_face_diagnosis_at TIMESTAMP WITH TIME ZONE,
          latest_tongue_score INTEGER,
          tongue_diagnosis_count INTEGER DEFAULT 0,
          last_tongue_diagnosis_at TIMESTAMP WITH TIME ZONE,
          organ_status_trend JSONB,
          comprehensive_conclusion JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('健康档案表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('健康档案表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建健康档案索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS health_profiles_user_id_idx ON health_profiles(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS health_profiles_latest_score_idx ON health_profiles(latest_score);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS health_profiles_updated_at_idx ON health_profiles(updated_at);`);
      results.push('健康档案索引创建成功');
    } catch (e) {
      results.push('健康档案索引已存在或创建失败（可忽略）');
    }

    return NextResponse.json({
      success: true,
      message: '数据库迁移完成',
      results,
      tables: [
        'face_diagnosis_users',
        'face_diagnosis_records',
        'tongue_diagnosis_users',
        'tongue_diagnosis_records',
        'health_profiles'
      ]
    });
  } catch (error) {
    console.error('Error migrating database:', error);
    return NextResponse.json(
      { error: '数据库迁移失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
