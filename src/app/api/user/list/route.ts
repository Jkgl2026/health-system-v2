import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

// 强制动态渲染，因为使用了 request.url
export const dynamic = 'force-dynamic';

/**
 * GET /user/list
 * 分页列表接口
 * 参数：page, size, keyword
 * 严格遵循需求文档
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '20');
    const keyword = searchParams.get('keyword') || '';

    // 计算偏移量
    const offset = (page - 1) * size;

    // 构建查询条件
    let whereClause = '';
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (keyword) {
      whereClause = 'WHERE name LIKE $1 OR phone LIKE $1';
      queryParams.push(`%${keyword}%`);
      paramIndex++;
    }

    // 查询总数
    const countResult = await exec_sql(
      `SELECT COUNT(*) as total FROM sys_user ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // 查询列表
    const listQuery = `
      SELECT
        user_id,
        name,
        phone,
        age,
        gender,
        self_check_completed,
        health_status,
        health_score,
        create_time
      FROM sys_user
      ${whereClause}
      ORDER BY create_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(size, offset);
    const listResult = await exec_sql(listQuery, queryParams);

    // 返回统一格式
    return NextResponse.json({
      code: 200,
      msg: '成功',
      data: {
        list: listResult,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size)
      }
    });

  } catch (error) {
    console.error('[User List API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
