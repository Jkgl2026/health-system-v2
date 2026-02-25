import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// 默认管理员账号
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: '系统管理员',
};

// GET /api/init-admin - 自动初始化默认管理员（如果没有管理员存在）
export async function GET() {
  try {
    // 检查是否已有管理员
    const existingAdmins = await healthDataManager.getAllAdmins();
    
    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json({
        success: false,
        message: '已存在管理员账号，无法自动初始化',
        adminCount: existingAdmins.length,
      });
    }

    // 创建默认管理员
    const admin = await healthDataManager.createAdmin({
      username: DEFAULT_ADMIN.username,
      password: DEFAULT_ADMIN.password,
      name: DEFAULT_ADMIN.name,
      isActive: true,
    });

    console.log('[InitAdmin] 默认管理员创建成功:', admin.username);

    return NextResponse.json({
      success: true,
      message: '默认管理员创建成功',
      admin: {
        username: DEFAULT_ADMIN.username,
        password: DEFAULT_ADMIN.password,
        name: DEFAULT_ADMIN.name,
      },
      notice: '请登录后立即修改密码',
    }, { status: 201 });
  } catch (error) {
    console.error('[InitAdmin] 创建默认管理员失败:', error);
    return NextResponse.json(
      { error: '创建默认管理员失败' },
      { status: 500 }
    );
  }
}

// POST /api/init-admin - 手动创建管理员账号
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
