import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { healthDataManager } from '@/storage/database';

// GET /api/get-audit-logs - 获取审计日志
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const tableName = searchParams.get('tableName') || undefined;
    const recordId = searchParams.get('recordId') || undefined;

    const logs = await healthDataManager.getAuditLogs({
      limit,
      tableName,
      recordId,
    });

    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    }, { status: 200 });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return NextResponse.json(
      { error: '获取审计日志失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
