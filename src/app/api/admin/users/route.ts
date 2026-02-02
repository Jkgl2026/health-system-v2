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

    if (search) {
      const escapedSearch = search.replace(/'/g, "''");
      whereClause = `
        WHERE name ILIKE '%${escapedSearch}%'
           OR phone ILIKE '%${escapedSearch}%'
           OR email ILIKE '%${escapedSearch}%'
      `;
    }

    // 查询用户总数
    const countResult = await db.execute(
      sql.raw(`SELECT COUNT(*) as count FROM users ${whereClause}`)
    );

    const total = parseInt(String(countResult.rows[0]?.count || '0'));
    const totalPages = Math.ceil(total / limit);

    // 查询用户列表
    const usersResult = await db.execute(
      sql.raw(`
        SELECT id, name, phone, email, age, gender, created_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `)
    );

    // 查询每个用户的检测数据（只查询最新的）
    const users = usersResult.rows;

    const usersWithData = await Promise.all(
      users.map(async (user: any) => {
        // 获取最新症状自检
        const symptomResult = await db.execute(
          sql.raw(`
            SELECT * FROM symptom_checks
            WHERE user_id = '${user.id}'
            ORDER BY checked_at DESC
            LIMIT 1
          `)
        );

        // 获取最新健康分析
        const analysisResult = await db.execute(
          sql.raw(`
            SELECT * FROM health_analysis
            WHERE user_id = '${user.id}'
            ORDER BY analyzed_at DESC
            LIMIT 1
          `)
        );

        // 获取最新选择
        const choiceResult = await db.execute(
          sql.raw(`
            SELECT * FROM user_choices
            WHERE user_id = '${user.id}'
            ORDER BY selected_at DESC
            LIMIT 1
          `)
        );

        // 获取要求完成情况
        const reqResult = await db.execute(
          sql.raw(`
            SELECT * FROM requirements
            WHERE user_id = '${user.id}'
            LIMIT 1
          `)
        );

        return {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            age: user.age,
            gender: user.gender,
            createdAt: user.created_at,
          },
          latestSymptomCheck: symptomResult.rows[0] || null,
          latestHealthAnalysis: analysisResult.rows[0] || null,
          latestChoice: choiceResult.rows[0] || null,
          requirements: reqResult.rows[0] || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: usersWithData,
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
