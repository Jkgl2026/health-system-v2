import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-missing-tables - 创建所有缺失的数据库表
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

    // 1. 创建生理年龄检测记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS biological_age_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_thumbnail TEXT,
          
          -- 用户信息
          actual_age INTEGER,
          gender VARCHAR(10),
          
          -- 生理年龄数据
          biological_age INTEGER,
          age_difference INTEGER,
          aging_speed VARCHAR(20),
          aging_features JSONB DEFAULT '{}',
          organ_ages JSONB DEFAULT '{}',
          aging_prediction JSONB DEFAULT '{}',
          reversibility_assessment JSONB DEFAULT '{}',
          anti_aging_plan JSONB DEFAULT '{}',
          full_report TEXT,
          
          -- 原始数据
          raw_data JSONB DEFAULT '{}',
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('生理年龄检测记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('生理年龄检测记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 生理年龄记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS bio_age_user_id_idx ON biological_age_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS bio_age_created_at_idx ON biological_age_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS bio_age_actual_age_idx ON biological_age_records(actual_age);`);
      results.push('生理年龄记录索引创建成功');
    } catch (e) {
      results.push('生理年龄记录索引已存在或创建失败（可忽略）');
    }

    // 2. 创建声音健康检测记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS voice_health_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          audio_url TEXT NOT NULL,
          audio_duration INTEGER,
          
          -- 声学特征
          acoustic_features JSONB DEFAULT '{}',
          
          -- 心理状态
          psychological_state JSONB DEFAULT '{}',
          
          -- 身体健康
          physical_health JSONB DEFAULT '{}',
          
          -- 健康风险评估
          health_risk_assessment JSONB DEFAULT '{}',
          
          -- 建议
          recommendations JSONB DEFAULT '[]',
          improvement_plan JSONB DEFAULT '{}',
          
          full_report TEXT,
          
          -- 原始数据
          raw_data JSONB DEFAULT '{}',
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('声音健康检测记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('声音健康检测记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 声音健康记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS voice_health_user_id_idx ON voice_health_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS voice_health_created_at_idx ON voice_health_records(created_at);`);
      results.push('声音健康记录索引创建成功');
    } catch (e) {
      results.push('声音健康记录索引已存在或创建失败（可忽略）');
    }

    // 3. 创建手相检测记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS palmistry_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_type VARCHAR(20),
          
          -- 掌纹分析
          palm_lines JSONB DEFAULT '{}',
          
          -- 指纹分析
          fingerprints JSONB DEFAULT '{}',
          
          -- 手形分析
          hand_shape JSONB DEFAULT '{}',
          
          -- 体质分析
          constitution_analysis JSONB DEFAULT '{}',
          
          -- 脏腑健康
          organ_health JSONB DEFAULT '{}',
          
          -- 长寿评估
          longevity_assessment JSONB DEFAULT '{}',
          
          -- 健康趋势
          health_trends JSONB DEFAULT '{}',
          
          -- 建议
          recommendations JSONB DEFAULT '[]',
          
          full_report TEXT,
          
          -- 原始数据
          raw_data JSONB DEFAULT '{}',
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('手相检测记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('手相检测记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 手相记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS palmistry_user_id_idx ON palmistry_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS palmistry_created_at_idx ON palmistry_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS palmistry_type_idx ON palmistry_records(image_type);`);
      results.push('手相记录索引创建成功');
    } catch (e) {
      results.push('手相记录索引已存在或创建失败（可忽略）');
    }

    // 4. 创建呼吸分析记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS breathing_analysis_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          video_url TEXT NOT NULL,
          video_duration INTEGER,
          
          -- 呼吸模式
          breathing_pattern JSONB DEFAULT '{}',
          
          -- 胸廓运动
          chest_movement JSONB DEFAULT '{}',
          
          -- 呼吸系统
          respiratory_health JSONB DEFAULT '{}',
          
          -- 压力水平
          stress_level JSONB DEFAULT '{}',
          
          -- 神经系统
          nervous_system JSONB DEFAULT '{}',
          
          -- 健康风险评估
          health_risk_assessment JSONB DEFAULT '{}',
          
          -- 建议
          recommendations JSONB DEFAULT '[]',
          improvement_plan JSONB DEFAULT '{}',
          
          full_report TEXT,
          
          -- 原始数据
          raw_data JSONB DEFAULT '{}',
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('呼吸分析记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('呼吸分析记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 呼吸分析记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS breathing_user_id_idx ON breathing_analysis_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS breathing_created_at_idx ON breathing_analysis_records(created_at);`);
      results.push('呼吸分析记录索引创建成功');
    } catch (e) {
      results.push('呼吸分析记录索引已存在或创建失败（可忽略）');
    }

    // 5. 创建眼部健康检测记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS eye_health_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          image_type VARCHAR(20),
          
          -- 眼白分析
          sclera_analysis JSONB DEFAULT '{}',
          
          -- 黑眼圈
          dark_circles JSONB DEFAULT '{}',
          
          -- 眼袋
          eye_bags JSONB DEFAULT '{}',
          
          -- 眼部疲劳
          eye_fatigue JSONB DEFAULT '{}',
          
          -- 肝脏健康
          liver_health JSONB DEFAULT '{}',
          
          -- 循环健康
          circulatory_health JSONB DEFAULT '{}',
          
          -- 疲劳程度
          fatigue_level JSONB DEFAULT '{}',
          
          -- 睡眠质量
          sleep_quality JSONB DEFAULT '{}',
          
          -- 建议
          recommendations JSONB DEFAULT '[]',
          improvement_plan JSONB DEFAULT '{}',
          
          full_report TEXT,
          
          -- 原始数据
          raw_data JSONB DEFAULT '{}',
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('眼部健康检测记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('眼部健康检测记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 眼部健康记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS eye_health_user_id_idx ON eye_health_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS eye_health_created_at_idx ON eye_health_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS eye_health_type_idx ON eye_health_records(image_type);`);
      results.push('眼部健康记录索引创建成功');
    } catch (e) {
      results.push('眼部健康记录索引已存在或创建失败（可忽略）');
    }

    // 6. 创建导出历史表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS export_history (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          record_id VARCHAR(36),
          record_ids JSONB,
          export_type VARCHAR(50),
          export_format VARCHAR(20),
          file_url TEXT,
          file_size INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('导出历史表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('导出历史表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 导出历史索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS export_history_user_id_idx ON export_history(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS export_history_created_at_idx ON export_history(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS export_history_type_idx ON export_history(export_type);`);
      results.push('导出历史索引创建成功');
    } catch (e) {
      results.push('导出历史索引已存在或创建失败（可忽略）');
    }

    // 7. 创建报告模板表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS report_templates (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          category VARCHAR(50),
          template_content TEXT NOT NULL,
          version VARCHAR(20),
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      results.push('报告模板表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('报告模板表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 报告模板索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS report_templates_type_idx ON report_templates(type);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS report_templates_category_idx ON report_templates(category);`);
      results.push('报告模板索引创建成功');
    } catch (e) {
      results.push('报告模板索引已存在或创建失败（可忽略）');
    }

    return NextResponse.json({
      success: true,
      message: '数据库迁移完成',
      results,
      tables: [
        'biological_age_records',
        'voice_health_records',
        'palmistry_records',
        'breathing_analysis_records',
        'eye_health_records',
        'export_history',
        'report_templates'
      ]
    });
  } catch (error) {
    console.error('[MigrateMissingTables] 迁移失败:', error);
    return NextResponse.json(
      { error: '数据库迁移失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
