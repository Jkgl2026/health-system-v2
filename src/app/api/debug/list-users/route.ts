import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';

// GET /api/debug/list-users - 调试：列出所有用户
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 查询所有用户
    const allUsers = await db
      .select()
      .from(users)
      .limit(10);

    console.log('调试查询所有用户:', allUsers.length, '条记录');

    return NextResponse.json({
      success: true,
      总用户数: allUsers.length,
      用户列表: allUsers.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        phoneGroupId: r.phoneGroupId,
        isLatestVersion: r.isLatestVersion,
        createdAt: r.createdAt,
      }))
    });
  } catch (error) {
    console.error('调试查询失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '调试查询失败', details: errorMessage },
      { status: 500 }
    );
  }
}
