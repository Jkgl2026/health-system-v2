import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/migrate-posture-tables - 迁移添加体态评估相关表
// 此API用于在现有数据库中添加新的体态评估表，不会删除现有数据
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

    // 创建体态诊断记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS posture_diagnosis_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          front_image_url TEXT,
          left_side_image_url TEXT,
          right_side_image_url TEXT,
          back_image_url TEXT,
          score INTEGER,
          grade VARCHAR(2),
          body_structure JSONB,
          fascia_chain_analysis JSONB,
          muscle_analysis JSONB,
          breathing_assessment JSONB,
          alignment_assessment JSONB,
          compensation_patterns JSONB,
          health_impact JSONB,
          health_prediction JSONB,
          treatment_plan JSONB,
          full_report TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('体态诊断记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('体态诊断记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建体态诊断记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_diagnosis_records_user_id_idx ON posture_diagnosis_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_diagnosis_records_created_at_idx ON posture_diagnosis_records(created_at);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_diagnosis_records_score_idx ON posture_diagnosis_records(score);`);
      results.push('体态诊断记录索引创建成功');
    } catch (e) {
      results.push('体态诊断记录索引已存在或创建失败（可忽略）');
    }

    // 创建训练动作库表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS exercise_library (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          category VARCHAR(20) NOT NULL,
          sub_category VARCHAR(50),
          description TEXT,
          target_issues JSONB,
          contraindications JSONB,
          video_url TEXT,
          gif_url TEXT,
          image_url TEXT,
          steps JSONB,
          tips JSONB,
          common_mistakes JSONB,
          duration VARCHAR(50),
          reps INTEGER,
          sets INTEGER,
          frequency VARCHAR(50),
          rest_time VARCHAR(50),
          easier_version VARCHAR(100),
          harder_version VARCHAR(100),
          primary_muscles JSONB,
          secondary_muscles JSONB,
          stabilizer_muscles JSONB,
          related_meridians JSONB,
          related_acupoints JSONB,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE
        );
      `);
      results.push('训练动作库表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('训练动作库表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建训练动作库索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS exercise_library_category_idx ON exercise_library(category);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS exercise_library_target_issues_idx ON exercise_library(target_issues);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS exercise_library_is_active_idx ON exercise_library(is_active);`);
      results.push('训练动作库索引创建成功');
    } catch (e) {
      results.push('训练动作库索引已存在或创建失败（可忽略）');
    }

    // 创建体态历史对比表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS posture_comparisons (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
          current_record_id VARCHAR(36) REFERENCES posture_diagnosis_records(id) ON DELETE CASCADE,
          previous_record_id VARCHAR(36) REFERENCES posture_diagnosis_records(id) ON DELETE CASCADE,
          score_change INTEGER,
          improvements JSONB,
          deteriorations JSONB,
          stable_items JSONB,
          comparison_images JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('体态历史对比表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('体态历史对比表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建体态历史对比索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_comparisons_user_id_idx ON posture_comparisons(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_comparisons_current_record_idx ON posture_comparisons(current_record_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS posture_comparisons_previous_record_idx ON posture_comparisons(previous_record_id);`);
      results.push('体态历史对比索引创建成功');
    } catch (e) {
      results.push('体态历史对比索引已存在或创建失败（可忽略）');
    }

    // 创建打卡记录表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS check_in_records (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          type VARCHAR(20) NOT NULL,
          content JSONB,
          notes TEXT,
          exercise_ids JSONB,
          completed BOOLEAN DEFAULT TRUE,
          duration INTEGER,
          check_in_date TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      results.push('打卡记录表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('打卡记录表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建打卡记录索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS check_in_records_user_id_idx ON check_in_records(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS check_in_records_type_idx ON check_in_records(type);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS check_in_records_check_in_date_idx ON check_in_records(check_in_date);`);
      results.push('打卡记录索引创建成功');
    } catch (e) {
      results.push('打卡记录索引已存在或创建失败（可忽略）');
    }

    // 创建提醒设置表
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS reminders (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          type VARCHAR(20) NOT NULL,
          title VARCHAR(100) NOT NULL,
          message TEXT,
          reminder_time VARCHAR(10),
          frequency VARCHAR(20),
          days_of_week JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          last_triggered_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE
        );
      `);
      results.push('提醒设置表创建成功');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        results.push('提醒设置表已存在，跳过');
      } else {
        throw e;
      }
    }

    // 创建提醒设置索引
    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON reminders(user_id);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS reminders_type_idx ON reminders(type);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS reminders_is_active_idx ON reminders(is_active);`);
      results.push('提醒设置索引创建成功');
    } catch (e) {
      results.push('提醒设置索引已存在或创建失败（可忽略）');
    }

    return NextResponse.json({
      success: true,
      message: '数据库迁移完成',
      results,
      tables: [
        'posture_diagnosis_records',
        'exercise_library',
        'posture_comparisons',
        'check_in_records',
        'reminders'
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
