import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, requirements } from '@/storage/database/shared/schema';
import { eq, desc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const userId = searchParams.get('userId');

    if (!name && !userId) {
      return NextResponse.json(
        { error: '必须提供 name 或 userId 参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查找用户
    let userResult;
    if (userId) {
      userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    } else {
      userResult = await db
        .select()
        .from(users)
        .where(like(users.name, `%${name}%`))
        .orderBy(desc(users.createdAt))
        .limit(1);
    }

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { error: '未找到该用户' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // 直接从数据库查询 requirements
    const reqResult = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, user.id))
      .orderBy(desc(requirements.updatedAt))
      .limit(5);

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
      requirements: reqResult.map(req => ({
        id: req.id,
        userId: req.userId,
        requirement1Completed: req.requirement1Completed,
        requirement2Completed: req.requirement2Completed,
        requirement3Completed: req.requirement3Completed,
        requirement4Completed: req.requirement4Completed,
        sevenQuestionsAnswers: req.sevenQuestionsAnswers,
        sevenQuestionsAnswersType: typeof req.sevenQuestionsAnswers,
        sevenQuestionsAnswersKeys: req.sevenQuestionsAnswers
          ? Object.keys(req.sevenQuestionsAnswers)
          : [],
        completedAt: req.completedAt,
        updatedAt: req.updatedAt,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('Error diagnosing seven questions:', error);
    return NextResponse.json(
      { 
        error: '诊断失败', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
