import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { auditLogs } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();

    // 查询最近的审计日志
    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: '查询审计日志失败' },
      { status: 500 }
    );
  }
}
