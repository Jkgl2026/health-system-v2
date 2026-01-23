import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/admin/users - 管理员获取所有用户数据（含概要信息）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const usersSummary = await healthDataManager.getAllUsersSummary({
      skip,
      limit,
      search,
    });

    return NextResponse.json({
      success: true,
      users: usersSummary,
      pagination: {
        page,
        limit,
        total: usersSummary.length,
      },
    });
  } catch (error) {
    console.error('Error fetching users summary:', error);
    return NextResponse.json(
      { error: '获取用户数据失败' },
      { status: 500 }
    );
  }
}
