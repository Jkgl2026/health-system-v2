import { NextRequest, NextResponse } from 'next/server';
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
export async function performVacuum(): Promise<{
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
export async function performAnalyze(): Promise<{
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
export async function performReindex(): Promise<{
  success: boolean;
  message: string;
  duration: number;
  reindexedTables: string[];
}> {
  const startTime = Date.now();
  console.log('[Maintenance] 开始执行REINDEX...');

  try {
    const db = await getDb();
    const tables = [
      'users',
      'symptom_checks',
      'health_analysis',
      'user_choices',
      'requirements',
      'admins',
      'audit_logs',
      'audit_logs_archive',
      'backup_records',
    ];

    const reindexedTables: string[] = [];

    for (const table of tables) {
      try {
        await db.execute(sql`REINDEX TABLE ${sql.raw(table)}`);
        reindexedTables.push(table);
        console.log(`[Maintenance] 已重建 ${table} 表的索引`);
      } catch (error) {
        console.error(`[Maintenance] 重建 ${table} 表索引失败:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Maintenance] REINDEX完成，耗时 ${duration}ms`);

    return {
      success: true,
      message: `已重建 ${reindexedTables.length} 个表的索引`,
      duration,
      reindexedTables,
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
  backupId: string;
  backupType: string;
}> {
  console.log('[Maintenance] 开始执行备份...');

  try {
    const result = await enhancedBackupManager.performFullBackupProcess();

    return {
      success: true,
      message: '备份操作完成',
      backupId: result.backup.backupId,
      backupType: result.backup.backupType,
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
  archivedCount: number;
  cleanedCount: number;
}> {
  console.log('[Maintenance] 开始执行归档...');

  try {
    const result = await archiveManager.performFullArchive();

    return {
      success: true,
      message: '归档操作完成',
      archivedCount: result.archivedCount,
      cleanedCount: result.cleanedCount,
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
  cleanedCount: number;
}> {
  console.log('[Maintenance] 开始执行清理...');

  try {
    const cleanedCount = await enhancedBackupManager.cleanupOldBackups(30);

    return {
      success: true,
      message: '清理操作完成',
      cleanedCount,
    };
  } catch (error) {
    console.error('[Maintenance] 清理失败:', error);
    throw error;
  }
}

/**
 * GET /api/admin/maintenance
 * 获取维护状态和统计信息
 */
export async function GET() {
  try {
    const db = await getDb();

    // 获取数据库大小信息
    const [dbSize] = await db.execute(sql`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) AS total_size,
        pg_database_size(current_database()) AS total_size_bytes
    `);

    // 获取表大小信息
    const tableSizes = await db.execute(sql`
      SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size('public.' || tablename)) AS total_size,
        pg_total_relation_size('public.' || tablename) AS total_size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size('public.' || tablename) DESC
    `);

    // 获取备份统计
    const backupStats = await enhancedBackupManager.getBackupStats();

    // 获取归档统计
    const archiveStats = await archiveManager.getArchiveStats();

    return NextResponse.json({
      success: true,
      data: {
        databaseSize: {
          total: dbSize.rows[0]?.total_size_bytes || 0,
          totalPretty: dbSize.rows[0]?.total_size || 'Unknown',
        },
        tableSizes: (tableSizes.rows as any[]).map((row) => ({
          tableName: row.tablename,
          totalSize: row.total_size_bytes,
          totalSizePretty: row.total_size,
        })),
        backupStats,
        archiveStats,
      },
    });
  } catch (error) {
    console.error('获取维护状态失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取维护状态失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 启动自动维护
 */
async function startAutoMaintenance(task?: string) {
  try {
    autoMaintenanceScheduler.start(task as any);

    return {
      success: true,
      message: task ? `任务 ${task} 已启动` : '所有任务已启动',
      schedules: autoMaintenanceScheduler.getSchedules(),
    };
  } catch (error) {
    console.error('启动自动维护失败:', error);
    throw error;
  }
}

/**
 * 停止自动维护
 */
async function stopAutoMaintenance(task?: string) {
  try {
    autoMaintenanceScheduler.stop(task as any);

    return {
      success: true,
      message: task ? `任务 ${task} 已停止` : '所有任务已停止',
      schedules: autoMaintenanceScheduler.getSchedules(),
    };
  } catch (error) {
    console.error('停止自动维护失败:', error);
    throw error;
  }
}

/**
 * 更新自动维护调度
 */
async function updateAutoMaintenance(task: string, schedule: string, enabled: boolean) {
  try {
    autoMaintenanceScheduler.updateSchedule(task as any, schedule, enabled);

    return {
      success: true,
      message: `任务 ${task} 已更新`,
      schedules: autoMaintenanceScheduler.getSchedules(),
    };
  } catch (error) {
    console.error('更新自动维护失败:', error);
    throw error;
  }
}

/**
 * 立即运行自动维护任务
 */
async function runAutoMaintenanceNow(task: string) {
  try {
    const result = await autoMaintenanceScheduler.runNow(task as any);

    return {
      success: true,
      message: `任务 ${task} 已执行`,
      result,
    };
  } catch (error) {
    console.error('执行自动维护任务失败:', error);
    throw error;
  }
}
