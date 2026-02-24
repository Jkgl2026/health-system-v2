import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, requirements } from '@/storage/database/shared/schema';
import { eq, and, isNull } from 'drizzle-orm';

// POST /api/user/requirements - 保存或更新用户requirements数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, badHabitsChecklist, symptoms300Checklist } = body;

    // 从请求头获取userId（如果没有在body中提供）
    const requestUserId = userId || request.headers.get('x-user-id');

    if (!requestUserId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查用户是否存在
    const userCheck = await db.select().from(users).where(eq(users.id, requestUserId)).limit(1);

    if (!userCheck || userCheck.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查是否已存在requirements记录
    const existingReq = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, requestUserId))
      .limit(1);

    if (existingReq && existingReq.length > 0) {
      // 更新现有记录
      await db
        .update(requirements)
        .set({
          badHabitsChecklist: badHabitsChecklist || null,
          symptoms300Checklist: symptoms300Checklist || null,
          updatedAt: new Date(),
        })
        .where(eq(requirements.userId, requestUserId));

      console.log('✓ 已更新用户requirements数据:', requestUserId);
    } else {
      // 创建新记录
      await db.insert(requirements).values({
        userId: requestUserId,
        badHabitsChecklist: badHabitsChecklist || null,
        symptoms300Checklist: symptoms300Checklist || null,
        requirement1Completed: false,
        requirement2Completed: false,
        requirement3Completed: false,
        requirement4Completed: false,
        updatedAt: new Date(),
      });

      console.log('✓ 已创建用户requirements数据:', requestUserId);
    }

    return NextResponse.json({
      success: true,
      message: '保存成功',
    }, { status: 200 });

  } catch (error) {
    console.error('Error saving requirements:', error);
    return NextResponse.json(
      { error: '保存失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/user/requirements - 获取用户requirements数据
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '用户ID不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const reqData = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, userId))
      .limit(1);

    if (!reqData || reqData.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      data: reqData[0],
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: '获取失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
