import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/init-admin - 初始化管理员账号（仅用于首次设置）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { username, password, name } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 检查是否已存在
    const existing = await healthDataManager.getAdminByUsername(username);
    if (existing) {
      return NextResponse.json(
        { error: '该用户名已存在' },
        { status: 400 }
      );
    }

    // 创建管理员
    const admin = await healthDataManager.createAdmin({
      username,
      password, // 注意：实际生产环境应该使用加密（如 bcrypt）
      name: name || username,
      isActive: true,
    });

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = admin;
    return NextResponse.json({
      success: true,
      message: '管理员账号创建成功',
      admin: adminInfo,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: '创建管理员账号失败' },
      { status: 500 }
    );
  }
}
