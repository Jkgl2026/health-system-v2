import { NextRequest, NextResponse } from 'next/server';
import { enhancedBackupManager } from '@/storage/database/enhancedBackupManager';
import { archiveManager } from '@/storage/database/archiveManager';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

/**
 * 定时任务API - 自动执行数据库优化
 * POST /api/cron/optimize
 *
 * 可以通过外部定时任务（如cron job）调用此API
 * 或者通过云平台提供的定时任务功能调用
 *
 * 执行的操作：
 * 1. 归档超过1年的审计日志
 * 2. 清理超过2年的已归档审计日志
 * 3. 执行智能备份（每天增量，每周全量）
 * 4. 清理超过30天的旧备份
 * 5. 执行VACUUM ANALYZE
 */
export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（可选，防止未授权调用）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: '未授权访问',
        },
        { status: 401 }
      );
    }

    console.log('[Cron] 开始执行定时优化任务...');
    const startTime = Date.now();

    const results: any = {
      timestamp: new Date().toISOString(),
      tasks: [],
    };

    // 1. 归档审计日志
    try {
      console.log('[Cron] 任务 1/5: 归档审计日志...');
      const archiveResult = await archiveManager.archiveOldAuditLogs(365);
      results.tasks.push({
        name: '归档审计日志',
        status: 'success',
        archivedCount: archiveResult,
      });
      console.log(`[Cron] 归档了 ${archiveResult} 条审计日志`);
    } catch (error) {
      console.error('[Cron] 归档审计日志失败:', error);
      results.tasks.push({
        name: '归档审计日志',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      });
    }

    // 2. 清理已归档的审计日志
    try {
      console.log('[Cron] 任务 2/5: 清理已归档审计日志...');
      const cleanupResult = await archiveManager.cleanupArchivedLogs(730);
      results.tasks.push({
        name: '清理已归档审计日志',
        status: 'success',
        cleanedCount: cleanupResult,
      });
      console.log(`[Cron] 清理了 ${cleanupResult} 条已归档审计日志`);
    } catch (error) {
      console.error('[Cron] 清理已归档审计日志失败:', error);
      results.tasks.push({
        name: '清理已归档审计日志',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      });
    }

    // 3. 执行智能备份
    try {
      console.log('[Cron] 任务 3/5: 执行智能备份...');
      const backupResult = await enhancedBackupManager.performSmartBackup();
      results.tasks.push({
        name: '执行备份',
        status: 'success',
        backupId: backupResult.backupId,
        backupType: backupResult.backupType,
      });
      console.log(
        `[Cron] 备份完成: ${backupResult.backupId} (${backupResult.backupType})`
      );
    } catch (error) {
      console.error('[Cron] 执行备份失败:', error);
      results.tasks.push({
        name: '执行备份',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      });
    }

    // 4. 清理旧备份
    try {
      console.log('[Cron] 任务 4/5: 清理旧备份...');
      const cleanupBackupResult = await enhancedBackupManager.cleanupOldBackups(30);
      results.tasks.push({
        name: '清理旧备份',
        status: 'success',
        cleanedCount: cleanupBackupResult,
      });
      console.log(`[Cron] 清理了 ${cleanupBackupResult} 个旧备份`);
    } catch (error) {
      console.error('[Cron] 清理旧备份失败:', error);
      results.tasks.push({
        name: '清理旧备份',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      });
    }

    // 5. 执行VACUUM ANALYZE
    try {
      console.log('[Cron] 任务 5/5: 执行VACUUM ANALYZE...');
      const db = await getDb();
      await db.execute(sql`VACUUM ANALYZE`);
      results.tasks.push({
        name: 'VACUUM ANALYZE',
        status: 'success',
      });
      console.log('[Cron] VACUUM ANALYZE 完成');
    } catch (error) {
      console.error('[Cron] VACUUM ANALYZE 失败:', error);
      results.tasks.push({
        name: 'VACUUM ANALYZE',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      });
    }

    const duration = Date.now() - startTime;
    results.duration = duration;
    results.success = results.tasks.every((task: any) => task.status === 'success');

    console.log(
      `[Cron] 定时优化任务完成，耗时 ${duration}ms，成功率 ${
        results.tasks.filter((t: any) => t.status === 'success').length
      }/${results.tasks.length}`
    );

    return NextResponse.json({
      success: true,
      message: '定时优化任务执行完成',
      results,
    });
  } catch (error) {
    console.error('[Cron] 定时优化任务失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '定时优化任务失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/optimize
 * 获取定时任务状态
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: '定时任务API运行正常',
    info: {
      lastRun: '查看日志获取最后运行时间',
      schedule: '建议每天凌晨2点执行',
      tasks: [
        '归档超过1年的审计日志',
        '清理超过2年的已归档审计日志',
        '执行智能备份（每天增量，每周全量）',
        '清理超过30天的旧备份',
        '执行VACUUM ANALYZE',
      ],
    },
  });
}
