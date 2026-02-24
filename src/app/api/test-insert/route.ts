import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';

// POST /api/test-insert - 测试直接使用 drizzle insert
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    console.log('Data received:', data);

    // 直接使用 drizzle insert
    const result = await db.insert(users).values({
      name: data.name || null,
      phone: data.phone || null,
      gender: data.gender || null,
      age: data.age || null,
      weight: data.weight || null,
      height: data.height || null,
      bmi: data.bmi || null,
    }).returning();

    console.log('Insert result:', result);

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: result[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        error: '创建用户失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
