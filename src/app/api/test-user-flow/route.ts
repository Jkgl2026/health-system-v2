import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { v4 as uuidv4 } from 'uuid';

// GET /api/test-user-flow - 测试完整用户流程
export async function GET(request: NextRequest) {
  try {
    const userId = uuidv4();
    const db = await getDb();

    console.log('[测试流程] 开始创建测试用户:', userId);

    // 1. 创建用户
    const [user] = await db.execute(`
      INSERT INTO users (id, name, gender, age, weight, height, bmi, created_at)
      VALUES ('${userId}', '测试流程用户', '男', 30, 70, 175, '22.9', NOW())
      RETURNING *
    `);
    console.log('[测试流程] 创建用户成功');

    // 2. 创建自检记录
    await db.execute(`
      INSERT INTO symptom_checks (id, user_id, checked_symptoms, total_score, element_scores, checked_at)
      VALUES ('${uuidv4()}', '${userId}', '["1", "2", "3", "4", "5"]', 5, '{"气血": 2, "循环": 1, "毒素": 2}', NOW())
    `);
    console.log('[测试流程] 创建自检记录成功');

    // 3. 创建健康分析记录
    await db.execute(`
      INSERT INTO health_analysis (id, user_id, qi_and_blood, circulation, toxins, overall_health, analyzed_at)
      VALUES ('${uuidv4()}', '${userId}', 2, 1, 2, 5, NOW())
    `);
    console.log('[测试流程] 创建健康分析记录成功');

    // 4. 创建用户选择记录
    await db.execute(`
      INSERT INTO user_choices (id, user_id, plan_type, plan_description, selected_at)
      VALUES ('${uuidv4()}', '${userId}', '系统调理', '按照系统调理方案进行健康管理', NOW())
    `);
    console.log('[测试流程] 创建用户选择记录成功');

    // 5. 创建要求完成记录
    await db.execute(`
      INSERT INTO requirements (id, user_id, requirement1_completed, requirement2_completed, requirement3_completed, requirement4_completed, completed_at)
      VALUES ('${uuidv4()}', '${userId}', true, true, true, true, NOW())
    `);
    console.log('[测试流程] 创建要求记录成功');

    return NextResponse.json({
      success: true,
      message: '测试用户流程成功',
      userId,
      steps: ['创建用户', '创建自检记录', '创建健康分析记录', '创建用户选择记录', '创建要求记录']
    });
  } catch (error) {
    console.error('[测试流程] 失败:', error);
    return NextResponse.json(
      { error: '测试流程失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
