import { NextRequest, NextResponse } from 'next/server';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import { enhancedBackupManager } from '@/storage/database/enhancedBackupManager';
import { archiveManager } from '@/storage/database/archiveManager';
import { autoMaintenanceScheduler } from '@/lib/autoMaintenanceScheduler';

/**
 * 数据库维护API
 * POST /api/admin/maintenance
 *
 * 支持的维护操作：
 * - vacuum: 清理死元组，回收空间
 * - analyze: 更新统计信息，优化查询计划
 * - reindex: 重建索引，提高查询性能
 * - full: 执行完整维护（vacuum + analyze + reindex）
 * - backup: 执行智能备份
 * - archive: 归档审计日志
 * - cleanup: 清理旧备份
 * - all: 执行所有维护操作
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少action参数',
          availableActions: [
            'vacuum',
            'analyze',
            'reindex',
            'full',
            'backup',
            'archive',
            'cleanup',
            'all',
          ],
        },
        { status: 400 }
      );
    }

    const results: any = {};

    switch (action) {
      case 'vacuum':
        results.vacuum = await performVacuum();
        break;
      case 'analyze':
        results.analyze = await performAnalyze();
        break;
      case 'reindex':
        results.reindex = await performReindex();
        break;
      case 'full':
        results.vacuum = await performVacuum();
        results.analyze = await performAnalyze();
        results.reindex = await performReindex();
        break;
      case 'backup':
        results.backup = await performBackup();
        break;
      case 'archive':
        results.archive = await performArchive();
        break;
      case 'cleanup':
        results.cleanup = await performCleanup();
        break;
      case 'all':
        // 执行所有维护操作
        results.vacuum = await performVacuum();
        results.analyze = await performAnalyze();
        results.reindex = await performReindex();
        results.archive = await performArchive();
        results.cleanup = await performCleanup();
        results.backup = await performBackup();
        break;
      case 'auto-start':
        results.autoMaintenance = await startAutoMaintenance(body.task);
        break;
      case 'auto-stop':
        results.autoMaintenance = await stopAutoMaintenance(body.task);
        break;
      case 'auto-update':
        results.autoMaintenance = await updateAutoMaintenance(
          body.task,
          body.schedule,
          body.enabled
        );
        break;
      case 'auto-run':
        results.autoMaintenance = await runAutoMaintenanceNow(body.task);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: `未知的action: ${action}`,
            availableActions: [
              'vacuum',
              'analyze',
              'reindex',
              'full',
              'backup',
              'archive',
              'cleanup',
              'all',
            ],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: '维护操作完成',
      results,
    });
  } catch (error) {
    console.error('数据库维护失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '数据库维护失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 执行VACUUM操作
 * 清理死元组，回收空间
 */
async function performVacuum(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行VACUUM...');

  try {
    const db = await getDb();
    await db.execute(sql`VACUUM ANALYZE`);

    const duration = Date.now() - startTime;
    console.log(`[Maintenance] VACUUM完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: 'VACUUM操作完成',
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] VACUUM失败:', error);
    throw error;
  }
}

/**
 * 执行ANALYZE操作
 * 更新统计信息，优化查询计划
 */
async function performAnalyze(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行ANALYZE...');

  try {
    const db = await getDb();
    await db.execute(sql`ANALYZE`);

    const duration = Date.now() - startTime;
    console.log(`[Maintenance] ANALYZE完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: 'ANALYZE操作完成',
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] ANALYZE失败:', error);
    throw error;
  }
}

/**
 * 执行REINDEX操作
 * 重建索引，提高查询性能
 */
async function performReindex(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行REINDEX...');

  try {
    const db = await getDb();
    // 重建所有索引
    await db.execute(sql`REINDEX DATABASE health_system`);

    const duration = Date.now() - startTime;
    console.log(`[Maintenance] REINDEX完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: 'REINDEX操作完成',
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] REINDEX失败:', error);
    throw error;
  }
}

/**
 * 执行备份操作
 */
async function performBackup(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行备份...');

  try {
    // 使用增强备份管理器
    const result = await enhancedBackupManager.createSmartBackup();
    const duration = Date.now() - startTime;
    console.log(`[Maintenance] 备份完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: result.message,
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] 备份失败:', error);
    throw error;
  }
}

/**
 * 执行归档操作
 */
async function performArchive(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行归档...');

  try {
    // 使用归档管理器
    const result = await archiveManager.archiveOldAuditLogs();
    const duration = Date.now() - startTime;
    console.log(`[Maintenance] 归档完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: result.message,
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] 归档失败:', error);
    throw error;
  }
}

/**
 * 执行清理操作
 */
async function performCleanup(): Promise<{
  success: boolean;
  message: string;
  duration: number;
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行清理...');

  try {
    // 使用增强备份管理器清理旧备份
    const result = await enhancedBackupManager.cleanupOldBackups();
    const duration = Date.now() - startTime;
    console.log(`[Maintenance] 清理完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: result.message,
      duration,
    };
  } catch (error) {
    console.error('[Maintenance] 清理失败:', error);
    throw error;
  }
}

/**
 * 启动自动维护
 */
async function startAutoMaintenance(task: string): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('[Maintenance] 启动自动维护任务:', task);
  
  try {
    const result = await autoMaintenanceScheduler.startTask(task);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[Maintenance] 启动自动维护失败:', error);
    throw error;
  }
}

/**
 * 停止自动维护
 */
async function stopAutoMaintenance(task: string): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('[Maintenance] 停止自动维护任务:', task);
  
  try {
    const result = await autoMaintenanceScheduler.stopTask(task);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[Maintenance] 停止自动维护失败:', error);
    throw error;
  }
}

/**
 * 更新自动维护
 */
async function updateAutoMaintenance(
  task: string,
  schedule: string,
  enabled: boolean
): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('[Maintenance] 更新自动维护任务:', task, schedule, enabled);
  
  try {
    const result = await autoMaintenanceScheduler.updateTask(task, schedule, enabled);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[Maintenance] 更新自动维护失败:', error);
    throw error;
  }
}

/**
 * 立即运行自动维护
 */
async function runAutoMaintenanceNow(task: string): Promise<{
  success: boolean;
  message: string;
}> {
  console.log('[Maintenance] 立即运行自动维护任务:', task);
  
  try {
    const result = await autoMaintenanceScheduler.runTaskNow(task);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('[Maintenance] 运行自动维护失败:', error);
    throw error;
  }
}
