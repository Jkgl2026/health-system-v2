import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /user/delete
 * 删除用户接口
 * 严格遵循需求文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({
        code: 400,
        msg: 'userId不能为空',
        data: null
      });
    }

    // 删除用户
    await exec_sql(
      'DELETE FROM sys_user WHERE user_id = $1',
      [userId]
    );

    return NextResponse.json({
      code: 200,
      msg: '删除成功',
      data: null
    });

  } catch (error) {
    console.error('[User Delete API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
