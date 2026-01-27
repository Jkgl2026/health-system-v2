import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, requirements } from '@/storage/database/shared/schema';
import { eq, desc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');

    console.log('[查询七问数据] 开始查询，name:', name);

    if (!name) {
      console.log('[查询七问数据] 缺少 name 参数');
      return NextResponse.json(
        { error: '必须提供 name 参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    console.log('[查询七问数据] 数据库连接成功');

    // 查找用户
    const userList = await db
      .select()
      .from(users)
      .where(like(users.name, `%${name}%`))
      .orderBy(desc(users.createdAt))
      .limit(5);

    console.log('[查询七问数据] 找到用户数:', userList.length);

    if (userList.length === 0) {
      return NextResponse.json(
        {
          message: '未找到匹配的用户',
          searchName: name
        },
        { status: 404 }
      );
    }

    // 获取每个用户的七问数据
    const results = [];
    for (const user of userList) {
      const requirementList = await db
        .select()
        .from(requirements)
        .where(eq(requirements.userId, user.id))
        .orderBy(desc(requirements.updatedAt))
        .limit(3);

      results.push({
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        requirementCount: requirementList.length,
        requirements: requirementList.map(req => ({
          id: req.id,
          updatedAt: req.updatedAt,
          hasSevenQuestionsAnswers: !!req.sevenQuestionsAnswers,
          sevenQuestionsAnswersType: typeof req.sevenQuestionsAnswers,
          sevenQuestionsAnswers: req.sevenQuestionsAnswers
        }))
      });
    }

    console.log('[查询七问数据] 查询成功，结果数:', results.length);

    return NextResponse.json({
      searchName: name,
      userCount: userList.length,
      results
    });

  } catch (error) {
    console.error('[查询七问数据] 错误:', error);
    return NextResponse.json(
      {
        error: '查询失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
