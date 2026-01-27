import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, requirements } from '@/storage/database/shared/schema';
import { eq, desc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: '必须提供 name 参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查找用户
    const userResult = await db
      .select()
      .from(users)
      .where(like(users.name, `%${name}%`))
      .orderBy(desc(users.createdAt))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: '未找到该用户' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // 查找用户的 requirements
    const reqResult = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, user.id))
      .orderBy(desc(requirements.completedAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: user.age,
        gender: user.gender,
        createdAt: user.createdAt,
      },
      requirement: reqResult && reqResult.length > 0 ? {
        id: reqResult[0].id,
        userId: reqResult[0].userId,
        requirement1Completed: reqResult[0].requirement1Completed,
        requirement2Completed: reqResult[0].requirement2Completed,
        requirement3Completed: reqResult[0].requirement3Completed,
        requirement4Completed: reqResult[0].requirement4Completed,
        sevenQuestionsAnswers: reqResult[0].sevenQuestionsAnswers,
        sevenQuestionsAnswersType: typeof reqResult[0]?.sevenQuestionsAnswers,
        sevenQuestionsAnswersKeys: reqResult[0]?.sevenQuestionsAnswers
          ? Object.keys(reqResult[0].sevenQuestionsAnswers)
          : [],
        completedAt: reqResult[0].completedAt,
      } : null,
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking user seven questions:', error);
    return NextResponse.json(
      { error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
