import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/admin/users/[userId] - 管理员获取指定用户的完整数据
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const fullData = await healthDataManager.getUserFullData(userId);

    if (!fullData.user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fullData,
    });
  } catch (error) {
    console.error('Error fetching user full data:', error);
    return NextResponse.json(
      { error: '获取用户数据失败' },
      { status: 500 }
    );
  }
}
