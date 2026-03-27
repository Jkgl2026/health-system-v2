import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();

    // 创建users表
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        age INTEGER,
        gender VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)
    `);

    console.log('[CreateUsersTable] 用户表创建成功');

    return NextResponse.json({
      success: true,
      message: '用户表创建成功',
    });
  } catch (error) {
    console.error('[CreateUsersTable] 创建用户表失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '创建用户表失败', details: errorMessage },
      { status: 500 }
    );
  }
}
