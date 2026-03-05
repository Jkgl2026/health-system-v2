import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { auditLogs } from '@/storage/database/shared/schema';
import { desc, eq, and, gte, lte, sql } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET /api/admin/login-logs - 获取登录日志列表
export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action') || ''; // LOGIN, LOGIN_FAILED
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const username = searchParams.get('username') || '';

    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [
      sql`${auditLogs.tableName} = 'admins'`,
      sql`${auditLogs.action} IN ('LOGIN', 'LOGIN_FAILED')`,
    ];

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (username) {
      conditions.push(sql`${auditLogs.operatorName} ILIKE ${`%${username}%`}`);
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      conditions.push(lte(auditLogs.createdAt, endDateTime));
    }

    const db = await getDb();

    // 查询总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // 查询数据
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // 格式化数据
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      username: log.operatorName,
      ip: log.ip,
      userAgent: log.userAgent,
      success: log.action === 'LOGIN',
      loginTime: log.createdAt,
      description: log.description,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: formattedLogs,
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
    console.error('[LoginLogs] 获取登录日志失败:', error);
    return NextResponse.json(
      { error: '获取登录日志失败' },
      { status: 500 }
    );
  }
}
