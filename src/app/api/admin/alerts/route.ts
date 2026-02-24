import { NextRequest, NextResponse } from 'next/server';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';
import { alertManager, AlertLevel, AlertType } from '@/lib/alertManager';

// GET /api/admin/alerts - 获取告警历史
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as AlertLevel | null;
    const type = searchParams.get('type') as AlertType | null;
    const resolved = searchParams.get('resolved');
    const limit = searchParams.get('limit');

    const alerts = alertManager.getHistory({
      level: level || undefined,
      type: type || undefined,
      resolved: resolved !== null ? resolved === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    // 获取统计信息
    const stats = alertManager.getStats();

    const response = NextResponse.json({
      success: true,
      alerts,
      stats,
      total: alerts.length,
    });

    console.log('[Alerts] 查询告警历史成功，数量:', alerts.length);

    return response;
  } catch (error) {
    console.error('[Alerts] 查询告警历史失败:', error);
    return NextResponse.json(
      { 
        error: '查询告警历史失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
