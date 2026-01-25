import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/session-manager';
import { healthDataManager } from '@/storage/database';

// GET /api/admin/verify - 验证管理员会话
export async function GET(request: NextRequest) {
  try {
    // 验证会话
    const session = await SessionManager.validateSession();

    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          message: '未登录',
          authenticated: false 
        },
        { status: 401 }
      );
    }

    // 获取管理员详细信息
    const admins = await healthDataManager.getAllAdmins();
    const admin = admins.find(a => a.id === session.adminId);

    if (!admin) {
      // 会话有效但管理员不存在，清除cookie
      await SessionManager.clearAuthCookies();
      
      return NextResponse.json(
        { 
          success: false, 
          message: '管理员不存在',
          authenticated: false 
        },
        { status: 401 }
      );
    }

    // 检查token是否即将过期
    const isExpiringSoon = await SessionManager.isTokenExpiringSoon();

    const response = NextResponse.json({
      success: true,
      message: '会话有效',
      authenticated: true,
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt,
      },
      isExpiringSoon,
    });

    // 如果token即将过期，添加刷新提示
    if (isExpiringSoon) {
      response.headers.set('X-Token-Expiring-Soon', 'true');
    }

    return response;
  } catch (error) {
    console.error('[AdminVerify] 验证会话失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '验证失败',
        authenticated: false 
      },
      { status: 500 }
    );
  }
}
