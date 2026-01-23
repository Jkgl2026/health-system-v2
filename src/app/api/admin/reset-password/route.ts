import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { hashPassword } from '@/lib/password';

// POST /api/admin/reset-password - 重置管理员密码（需要重新初始化）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { username, oldPassword, newPassword } = data;

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '用户名、旧密码和新密码不能为空' },
        { status: 400 }
      );
    }

    // 验证旧密码
    const admin = await healthDataManager.verifyAdmin(username, oldPassword);

    if (!admin) {
      return NextResponse.json(
        { error: '用户名或旧密码错误' },
        { status: 401 }
      );
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword);

    // 更新密码
    const db = await import('coze-coding-dev-sdk').then(m => m.getDb());
    const { admins, eq } = await import('./shared/schema');

    const [updatedAdmin] = await db
      .update(admins)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(admins.username, username))
      .returning();

    if (!updatedAdmin) {
      return NextResponse.json(
        { error: '更新密码失败' },
        { status: 500 }
      );
    }

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = updatedAdmin;
    return NextResponse.json({
      success: true,
      message: '密码修改成功',
      admin: adminInfo,
    });
  } catch (error) {
    console.error('Error during admin password reset:', error);
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    );
  }
}
