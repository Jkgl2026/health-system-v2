import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// POST /api/test-create-user - 测试创建用户（不使用Zod验证）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDb();

    // 直接插入数据，不使用 schema 验证
    const result = await db.execute(`
      INSERT INTO users (name, phone, gender, age, weight, height, bmi)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, phone, gender, age, weight, height, bmi, created_at;
    `, [
      data.name || null,
      data.phone || null,
      data.gender || null,
      data.age || null,
      data.weight || null,
      data.height || null,
      data.bmi || null,
    ]);

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: result.rows[0],
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
