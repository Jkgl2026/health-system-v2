import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, requirements } from '@/storage/database/shared/schema';
import { eq, and } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET - 获取用户详情数据
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取用户基本信息
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取症状检查记录
    const symptomCheckList = await db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .orderBy(symptomChecks.checkedAt);

    // 获取健康分析记录
    const healthAnalysisList = await db
      .select()
      .from(healthAnalysis)
      .where(eq(healthAnalysis.userId, userId))
      .orderBy(healthAnalysis.analyzedAt);

    // 获取需求完成情况
    const requirementList = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        user: user[0],
        symptomChecks: symptomCheckList,
        healthAnalysis: healthAnalysisList,
        requirements: requirementList[0] || null,
      },
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取用户详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新用户信息（包括备注）
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 只允许更新的字段
    const allowedFields = ['name', 'phone', 'email', 'age', 'gender', 'weight', 'height', 'bloodPressure', 'occupation', 'address', 'notes'];
    const filteredData: any = {};

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有要更新的数据' },
        { status: 400 }
      );
    }

    filteredData.updatedAt = new Date();

    // 更新用户信息
    await db.update(users).set(filteredData).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: '更新用户信息失败' },
      { status: 500 }
    );
  }
}

// POST - 添加备注
export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { userId, note } = body;

    if (!userId || !note) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取现有用户信息
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 添加备注（追加到notes字段）
    const existingNotes = (user[0] as any).notes || '';
    const timestamp = new Date().toLocaleString('zh-CN');
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

    await db.update(users).set({ notes: updatedNotes, updatedAt: new Date() }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: '备注添加成功',
      data: { notes: updatedNotes },
    });
  } catch (error) {
    console.error('添加备注失败:', error);
    return NextResponse.json(
      { success: false, error: '添加备注失败' },
      { status: 500 }
    );
  }
}
