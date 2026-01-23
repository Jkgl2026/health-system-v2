import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { getDb } from 'coze-coding-dev-sdk';
import { eq } from 'drizzle-orm';

// POST /api/admin/init-admin - 初始化默认管理员账号
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { admins } = await import('@/storage/database/shared/schema');

    // 检查是否已存在管理员
    const existingAdmins = await db.select().from(admins);
    
    if (existingAdmins.length > 0) {
      return NextResponse.json({
        success: false,
        message: '管理员账号已存在，无需重复初始化',
        existingAdmins: existingAdmins.map(a => ({ id: a.id, username: a.username, name: a.name })),
      }, { status: 400 });
    }

    // 创建默认管理员账号
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    const hashedPassword = await hashPassword(defaultPassword);

    const [newAdmin] = await db.insert(admins).values({
      username: defaultUsername,
      password: hashedPassword,
      name: '系统管理员',
      isActive: true,
      createdAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: '默认管理员账号创建成功',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        isActive: newAdmin.isActive,
      },
      credentials: {
        username: defaultUsername,
        password: defaultPassword,
        note: '请立即登录后修改密码',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return NextResponse.json(
      { error: '管理员初始化失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
