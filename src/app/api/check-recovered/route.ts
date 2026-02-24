import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const userId = '733b9393-efe2-47be-a8c1-fa1a1bec6477';

    // 查询用户
    const userResult = await db.execute(
      `SELECT id, name, phone, created_at, updated_at FROM users WHERE id = '${userId}'`
    );

    // 查询症状自检
    const symptomResult = await db.execute(
      `SELECT id, checked_symptoms, checked_at FROM symptom_checks WHERE user_id = '${userId}'`
    );

    return NextResponse.json({
      success: true,
      user: userResult.rows[0] || null,
      symptomCheck: symptomResult.rows[0] || null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
