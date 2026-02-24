import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { admins } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * 重置管理员密码API
 * 将admin用户密码重置为admin123
 */
export async function POST() {
  try {
    const db = await getDb();
    
    // 检查admin用户是否存在
    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, 'admin'))
      .limit(1);

    if (!existingAdmin) {
      return NextResponse.json({
        success: false,
        message: '管理员账号不存在，请先调用 /api/admin/init-admin 创建',
      }, { status: 404 });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 更新密码
    await db.update(admins)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(admins.username, 'admin'));

    return NextResponse.json({
      success: true,
      message: '管理员密码重置成功',
      credentials: {
        username: 'admin',
        password: 'admin123',
      },
      warning: '请立即修改默认密码！',
    });
  } catch (error) {
    console.error('重置管理员密码失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '重置失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
