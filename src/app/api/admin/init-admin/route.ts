import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { admins } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * 初始化管理员账号API
 * 创建默认管理员账号（用户名：admin，密码：admin123）
 */
export async function POST() {
  try {
    const db = await getDb();
    
    // 检查是否已存在admin用户
    const [existingAdmin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, 'admin'))
      .limit(1);

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: '管理员账号已存在',
        username: existingAdmin.username,
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 创建管理员账号
    const [newAdmin] = await db.insert(admins).values({
      username: 'admin',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: '管理员账号创建成功',
      admin: {
        id: newAdmin.id,
        username: newAdmin.username,
      },
      credentials: {
        username: 'admin',
        password: 'admin123',
      },
      warning: '请立即修改默认密码！',
    });
  } catch (error) {
    console.error('初始化管理员账号失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '初始化失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
