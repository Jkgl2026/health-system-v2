import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { getDb } from 'coze-coding-dev-sdk';
import { eq } from 'drizzle-orm';

// POST /api/admin/reset-admin-password - 重置管理员密码
export async function POST(request: NextRequest) {
  try {
    const { username, newPassword } = await request.json();

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: '用户名和新密码不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const { admins } = await import('@/storage/database/shared/schema');

    // 获取管理员
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));

    if (!admin) {
      return NextResponse.json(
        { error: '管理员不存在' },
        { status: 404 }
      );
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    const [updatedAdmin] = await db
      .update(admins)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(admins.username, username))
      .returning();

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        name: updatedAdmin.name,
      },
    });
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return NextResponse.json(
      { error: '密码重置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
