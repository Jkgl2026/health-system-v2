import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId1 = searchParams.get('userId1');
    const userId2 = searchParams.get('userId2');

    if (!userId1 || !userId2) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const escapedId1 = userId1.replace(/'/g, "''");
    const escapedId2 = userId2.replace(/'/g, "''");

    // 查询用户1的信息
    const user1Result = await db.execute(
      sql.raw(`SELECT * FROM users WHERE id = '${escapedId1}' LIMIT 1`)
    );
    const user1 = user1Result.rows[0];

    // 查询用户2的信息
    const user2Result = await db.execute(
      sql.raw(`SELECT * FROM users WHERE id = '${escapedId2}' LIMIT 1`)
    );
    const user2 = user2Result.rows[0];

    if (!user1 || !user2) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 查询用户1的最新数据
    const user1SymptomResult = await db.execute(
      sql.raw(`SELECT * FROM symptom_checks WHERE user_id = '${escapedId1}' ORDER BY checked_at DESC LIMIT 1`)
    );
    const user1AnalysisResult = await db.execute(
      sql.raw(`SELECT * FROM health_analysis WHERE user_id = '${escapedId1}' ORDER BY analyzed_at DESC LIMIT 1`)
    );

    // 查询用户2的最新数据
    const user2SymptomResult = await db.execute(
      sql.raw(`SELECT * FROM symptom_checks WHERE user_id = '${escapedId2}' ORDER BY checked_at DESC LIMIT 1`)
    );
    const user2AnalysisResult = await db.execute(
      sql.raw(`SELECT * FROM health_analysis WHERE user_id = '${escapedId2}' ORDER BY analyzed_at DESC LIMIT 1`)
    );

    return NextResponse.json({
      success: true,
      data: {
        user1: {
          ...user1,
          latestSymptomCheck: user1SymptomResult.rows[0] || null,
          latestHealthAnalysis: user1AnalysisResult.rows[0] || null,
        },
        user2: {
          ...user2,
          latestSymptomCheck: user2SymptomResult.rows[0] || null,
          latestHealthAnalysis: user2AnalysisResult.rows[0] || null,
        },
      },
    });
  } catch (error) {
    console.error('Compare users error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
