import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// 预定义标签
const PREDEFINED_TAGS = {
  health: [
    { id: 'high-risk', name: '高风险用户', color: '#ef4444', description: '健康评分低于40分' },
    { id: 'needs-attention', name: '需关注', color: '#f97316', description: '健康评分40-60分' },
    { id: 'good-health', name: '健康良好', color: '#10b981', description: '健康评分60分以上' },
    { id: 'chronic', name: '慢性问题', color: '#8b5cf6', description: '长期存在健康问题' },
    { id: 'improving', name: '持续改善', color: '#06b6d4', description: '健康评分持续上升' },
  ],
  behavior: [
    { id: 'active', name: '活跃用户', color: '#3b82f6', description: '近7天有登录' },
    { id: 'inactive', name: '不活跃', color: '#6b7280', description: '30天未登录' },
    { id: 'new', name: '新用户', color: '#84cc16', description: '注册7天内' },
    { id: 'vip', name: 'VIP用户', color: '#f59e0b', description: '付费用户' },
  ],
  custom: [] as any[],
};

// GET - 获取所有标签或用户的标签
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // 获取标签统计
    if (action === 'stats') {
      const db = await getDb();
      const allUsers = await db.select({ tags: users.tags }).from(users);
      
      const tagStats: Record<string, number> = {};
      for (const user of allUsers) {
        const tags = (user.tags as string[]) || [];
        for (const tag of tags) {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          predefinedTags: PREDEFINED_TAGS,
          tagStats,
        },
      });
    }

    // 获取用户标签
    if (userId) {
      const db = await getDb();
      const user = await db.select({ tags: users.tags }).from(users).where(eq(users.id, userId)).limit(1);
      
      return NextResponse.json({
        success: true,
        data: {
          tags: (user[0]?.tags as string[]) || [],
          predefinedTags: PREDEFINED_TAGS,
        },
      });
    }

    // 返回所有预定义标签
    return NextResponse.json({
      success: true,
      data: PREDEFINED_TAGS,
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { success: false, error: '获取标签失败' },
      { status: 500 }
    );
  }
}

// POST - 添加标签到用户
export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { userId, tagIds } = body;

    if (!userId || !Array.isArray(tagIds)) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取现有标签
    const user = await db.select({ tags: users.tags }).from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const existingTags = (user[0].tags as string[]) || [];
    const newTags = [...new Set([...existingTags, ...tagIds])];

    // 更新标签
    await db.update(users).set({ tags: newTags, updatedAt: new Date() }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: '标签添加成功',
      data: { tags: newTags },
    });
  } catch (error) {
    console.error('添加标签失败:', error);
    return NextResponse.json(
      { success: false, error: '添加标签失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新用户标签（覆盖）
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { userId, tagIds } = body;

    if (!userId || !Array.isArray(tagIds)) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 更新标签
    await db.update(users).set({ tags: tagIds, updatedAt: new Date() }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: '标签更新成功',
      data: { tags: tagIds },
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    return NextResponse.json(
      { success: false, error: '更新标签失败' },
      { status: 500 }
    );
  }
}

// DELETE - 移除用户标签
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tagId = searchParams.get('tagId');

    if (!userId || !tagId) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 获取现有标签
    const user = await db.select({ tags: users.tags }).from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const existingTags = (user[0].tags as string[]) || [];
    const newTags = existingTags.filter(t => t !== tagId);

    // 更新标签
    await db.update(users).set({ tags: newTags, updatedAt: new Date() }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: '标签移除成功',
      data: { tags: newTags },
    });
  } catch (error) {
    console.error('移除标签失败:', error);
    return NextResponse.json(
      { success: false, error: '移除标签失败' },
      { status: 500 }
    );
  }
}
