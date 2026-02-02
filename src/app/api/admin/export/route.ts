import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const details = searchParams.get('details') === 'true';

    const db = await getDb();

    // 查询所有用户数据
    const usersResult = await db.execute(
      sql.raw(`
        SELECT id, name, phone, email, age, gender, created_at
        FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `)
    );

    const users = usersResult.rows;

    // 如果需要详细信息，加载每个用户的详细数据
    if (details) {
      const usersWithDetails = await Promise.all(
        users.map(async (user: any) => {
          // 查询症状自检
          const symptomResult = await db.execute(
            sql.raw(`SELECT * FROM symptom_checks WHERE user_id = '${user.id}' ORDER BY checked_at DESC`)
          );

          // 查询健康分析
          const analysisResult = await db.execute(
            sql.raw(`SELECT * FROM health_analysis WHERE user_id = '${user.id}' ORDER BY analyzed_at DESC`)
          );

          // 查询要求完成情况
          const reqResult = await db.execute(
            sql.raw(`SELECT * FROM requirements WHERE user_id = '${user.id}' LIMIT 1`)
          );

          return {
            ...user,
            symptomChecks: symptomResult.rows,
            healthAnalysis: analysisResult.rows,
            requirements: reqResult.rows[0] || null,
          };
        })
      );

      // 生成 CSV
      const csv = generateCSV(usersWithDetails);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="users-export.csv"',
        },
      });
    } else {
      // 简单导出
      const csv = generateSimpleCSV(users);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="users-simple-export.csv"',
        },
      });
    }
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateSimpleCSV(users: any[]): string {
  const headers = ['ID', '姓名', '电话', '邮箱', '年龄', '性别', '创建时间'];
  const rows = users.map((user: any) => [
    user.id,
    user.name || '',
    user.phone || '',
    user.email || '',
    user.age || '',
    user.gender || '',
    user.created_at || '',
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

function generateCSV(users: any[]): string {
  const headers = [
    'ID', '姓名', '电话', '邮箱', '年龄', '性别', '创建时间',
    '症状自检次数', '健康分析次数', '要求1完成', '要求2完成', '要求3完成', '要求4完成'
  ];

  const rows = users.map((user: any) => {
    const symptomChecks = user.symptomChecks || [];
    const healthAnalysis = user.healthAnalysis || [];
    const requirements = user.requirements || {};

    return [
      user.id,
      user.name || '',
      user.phone || '',
      user.email || '',
      user.age || '',
      user.gender || '',
      user.created_at || '',
      symptomChecks.length,
      healthAnalysis.length,
      requirements.requirement1_completed || false,
      requirements.requirement2_completed || false,
      requirements.requirement3_completed || false,
      requirements.requirement4_completed || false,
    ];
  });

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}
