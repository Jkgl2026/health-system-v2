import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { v4 as uuidv4 } from 'uuid';

// POST /api/debug/fix-user-data - 为指定用户添加测试数据
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: '请提供用户ID数组' },
        { status: 400 }
      );
    }

    const results = [];

    for (const userId of userIds) {
      // 1. 创建自检记录
      await db.execute(`
        INSERT INTO symptom_checks (id, user_id, checked_symptoms, total_score, element_scores, checked_at)
        VALUES ('${uuidv4()}', '${userId}', '["1", "2", "3", "4", "5"]', 5, '{"气血": 2, "循环": 1, "毒素": 2}', NOW())
        ON CONFLICT DO NOTHING
      `);

      // 2. 创建健康分析记录
      await db.execute(`
        INSERT INTO health_analysis (id, user_id, qi_and_blood, circulation, toxins, overall_health, analyzed_at)
        VALUES ('${uuidv4()}', '${userId}', 2, 1, 2, 5, NOW())
        ON CONFLICT DO NOTHING
      `);

      // 3. 创建用户选择记录
      await db.execute(`
        INSERT INTO user_choices (id, user_id, plan_type, plan_description, selected_at)
        VALUES ('${uuidv4()}', '${userId}', '系统调理', '按照系统调理方案进行健康管理', NOW())
        ON CONFLICT DO NOTHING
      `);

      // 4. 创建要求完成记录
      await db.execute(`
        INSERT INTO requirements (id, user_id, requirement1_completed, requirement2_completed, requirement3_completed, requirement4_completed, completed_at)
        VALUES ('${uuidv4()}', '${userId}', true, true, true, true, NOW())
        ON CONFLICT DO NOTHING
      `);

      results.push({ userId, status: 'success' });
    }

    return NextResponse.json({
      success: true,
      message: '测试数据添加成功',
      results,
    });
  } catch (error) {
    console.error('Error fixing user data:', error);
    return NextResponse.json(
      { error: '添加测试数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
