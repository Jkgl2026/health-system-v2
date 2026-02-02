import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const db = await getDb();
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = '';
    const params: any[] = [];

    if (search) {
      whereClause = `
        WHERE name ILIKE $1
           OR phone ILIKE $1
           OR email ILIKE $1
      `;
      params.push(`%${search}%`);
    }

    // 查询用户总数
    const countResult = await db.execute(
      sql`SELECT COUNT(*) as count FROM users ${search ? sql.raw(whereClause) : sql.raw('')}`
    );

    const total = parseInt(countResult.rows[0]?.count || '0');
    const totalPages = Math.ceil(total / limit);

    // 查询用户列表
    const usersResult = await db.execute(
      sql`
        SELECT id, name, phone, email, age, gender, created_at
        FROM users
        ${search ? sql.raw(whereClause) : sql.raw('')}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );

    const users = usersResult.rows.map((user: any) => ({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: user.age,
        gender: user.gender,
        createdAt: user.created_at,
      },
      latestSymptomCheck: null,
      latestHealthAnalysis: null,
      latestChoice: null,
      requirements: null,
    }));

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
