import { NextRequest, NextResponse } from 'next/server';
import pg from 'pg';
const { Pool } = pg;

// POST /api/test-pg - 测试直接使用 pg Pool
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 直接使用 pg Pool
    const pool = new Pool({
      connectionString: process.env.PGDATABASE_URL,
    });

    const query = `
      INSERT INTO users (name, phone, gender, age, weight, height, bmi)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, phone, gender, age, weight, height, bmi, created_at;
    `;

    const result = await pool.query(query, [
      data.name || null,
      data.phone || null,
      data.gender || null,
      data.age || null,
      data.weight || null,
      data.height || null,
      data.bmi || null,
    ]);

    await pool.end();

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
