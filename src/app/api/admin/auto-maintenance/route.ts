import { NextRequest, NextResponse } from 'next/server';
import { autoMaintenanceScheduler } from '@/lib/autoMaintenanceScheduler';

/**
 * 自动维护状态API
 * GET /api/admin/auto-maintenance
 * 获取自动维护的调度状态、执行结果和统计信息
 */
export async function GET() {
  try {
    const schedules = autoMaintenanceScheduler.getSchedules();
    const results = autoMaintenanceScheduler.getResults(20);
    const stats = autoMaintenanceScheduler.getStats();

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        results,
        stats,
      },
    });
  } catch (error) {
    console.error('获取自动维护状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取自动维护状态失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
