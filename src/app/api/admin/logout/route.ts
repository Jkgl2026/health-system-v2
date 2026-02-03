/**
 * 管理员登出接口
 * 
 * 功能：
 * - 基础版：前端清除Token即可，此接口仅返回成功
 * - 进阶版：可添加Token黑名单，记录登出时间
 * 
 * 请求方式：POST
 * 请求路径：/api/admin/logout
 * 请求头：Authorization: Bearer <token>
 * 
 * 响应：
 * 成功：
 * {
 *   "success": true,
 *   "message": "登出成功"
 * }
 * 
 * 失败：
 * {
 *   "success": false,
 *   "error": "错误信息"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/app/lib/middleware/auth';
import { executeSQL } from '@/app/lib/db';

/**
 * POST请求处理 - 管理员登出
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 校验Token（可选，前端已清除Token，但建议校验）
    const user = await authMiddleware(request);
    
    if (!user) {
      // 即使未登录，也返回成功（前端已清除Token）
      return NextResponse.json({
        success: true,
        message: '登出成功',
      });
    }

    // 2. 记录登出时间（可选，进阶功能）
    // 如果需要记录管理员操作日志，可以在这里实现
    // 例如：await executeSQL('UPDATE admins SET last_logout_at = $1 WHERE id = $2', [new Date(), user.userId]);

    console.log('[登出] 用户登出', { 
      userId: user.userId, 
      username: user.username 
    });

    // 3. 返回成功
    return NextResponse.json({
      success: true,
      message: '登出成功',
    });

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
