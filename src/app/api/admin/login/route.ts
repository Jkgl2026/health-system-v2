import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/admin/login - 管理员登录
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const admin = await healthDataManager.verifyAdmin(username, password);

    if (!admin) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = admin;
    return NextResponse.json({
      success: true,
      admin: adminInfo,
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
