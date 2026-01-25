import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET /api/admin/users - 管理员获取所有用户数据（含概要信息）
export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const result = await healthDataManager.getAllUsersSummary({
      skip,
      limit,
      search,
    });

    const totalPages = Math.ceil(result.total / limit);

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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
