import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { isNull } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();

    // 查询所有用户（包括已删除的）
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    // 查询未删除的用户
    const activeUsers = await db.select().from(users).where(isNull(users.deletedAt));
    const activeCount = activeUsers.length;

    // 查询已删除的用户
    const deletedUsers = allUsers.filter((u: any) => u.deletedAt !== null);
    const deletedCount = deletedUsers.length;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,       // 所有用户（包括已删除）
        activeCount,      // 未删除的用户
        deletedCount,     // 已软删除的用户
        activeUsers: activeUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
          deletedAt: u.deletedAt,
          createdAt: u.createdAt
        })),
        deletedUsers: deletedUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
          deletedAt: u.deletedAt,
          createdAt: u.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error checking user count:', error);
    return NextResponse.json(
      { error: '查询用户数量失败' },
      { status: 500 }
    );
  }
}
