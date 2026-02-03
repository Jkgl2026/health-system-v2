/**
 * 管理员登出接口
 * 
 * 功能：
 * - 清除Cookie中的Token
 * - 返回成功响应
 * 
 * 请求方式：POST
 * 请求路径：/api/admin/logout
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST请求处理 - 管理员登出
 */
export async function POST(request: NextRequest) {
  try {
    // 创建响应对象
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除Cookie
    response.cookies.delete('admin_token');

    return response;

  } catch (error) {
    console.error('[登出] 服务器错误', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器错误，请稍后再试',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET请求处理 - 不允许
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: '请使用POST方式登出' },
    { status: 405 }
  );
}
