import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const name = searchParams.get('name');
    const phoneGroupId = searchParams.get('phoneGroupId');

    if (!phone && !name && !phoneGroupId) {
      return NextResponse.json(
        { error: '缺少查询参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    let whereClause = '';

    if (phoneGroupId) {
      const escapedId = phoneGroupId.replace(/'/g, "''");
      whereClause = `WHERE phone_group_id = '${escapedId}'`;
    } else if (phone) {
      const escapedPhone = phone.replace(/'/g, "''");
      whereClause = `WHERE phone = '${escapedPhone}'`;
    } else if (name) {
      const escapedName = name.replace(/'/g, "''");
      whereClause = `WHERE name = '${escapedName}'`;
    }

    // 查询用户历史记录
    const usersResult = await db.execute(
      sql.raw(`
        SELECT id, name, phone, email, age, gender, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
      `)
    );

    const users = usersResult.rows.map((user: any) => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      age: user.age,
      gender: user.gender,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Fetch user history error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
