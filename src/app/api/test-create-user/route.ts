import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';

// POST /api/test-create-user - 测试创建用户
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 使用 healthDataManager 创建用户
    const userData: InsertUser = {
      name: data.name || null,
      phone: data.phone || null,
      gender: data.gender || null,
      age: data.age || null,
      weight: data.weight || null,
      height: data.height || null,
      bmi: data.bmi || null,
    };

    const user = await healthDataManager.createUser(userData);

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user,
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
