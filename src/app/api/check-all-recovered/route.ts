import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const userId = request.nextUrl.searchParams.get('userId');

    if (userId) {
      // 查询指定用户
      const userResult = await db.execute(
        `SELECT id, name, phone, created_at, updated_at FROM users WHERE id = '${userId}'`
      );
      const symptomResult = await db.execute(
        `SELECT id, checked_symptoms, checked_at FROM symptom_checks WHERE user_id = '${userId}'`
      );
      const choiceResult = await db.execute(
        `SELECT id, plan_type, plan_description, selected_at FROM user_choices WHERE user_id = '${userId}'`
      );
      const reqResult = await db.execute(
        `SELECT id, requirement1_completed, requirement2_completed, requirement3_completed, requirement4_completed, updated_at FROM requirements WHERE user_id = '${userId}'`
      );

      return NextResponse.json({
        success: true,
        user: userResult.rows[0] || null,
        symptomCheck: symptomResult.rows[0] || null,
        userChoice: choiceResult.rows[0] || null,
        requirements: reqResult.rows[0] || null,
      });
    } else {
      // 查询所有最近创建的用户（最近1小时）
      const userResult = await db.execute(
        `SELECT id, name, phone, created_at FROM users WHERE created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC`
      );

      return NextResponse.json({
        success: true,
        recentUsers: userResult.rows,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
