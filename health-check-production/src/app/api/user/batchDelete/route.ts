import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /user/batchDelete
 * 批量删除用户接口
 * 严格遵循需求文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({
        code: 400,
        msg: 'userIds不能为空',
        data: null
      });
    }

    // 批量删除用户
    await exec_sql(
      'DELETE FROM sys_user WHERE user_id = ANY($1::bigint[])',
      [userIds]
    );

    return NextResponse.json({
      code: 200,
      msg: '批量删除成功',
      data: {
        deletedCount: userIds.length
      }
    });

  } catch (error) {
    console.error('[User Batch Delete API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
