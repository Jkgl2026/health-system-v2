import { getDb } from "coze-coding-dev-sdk";
import { auditLogs, auditLogsArchive } from "./shared/schema";
import { lt, sql } from "drizzle-orm";

/**
 * 审计日志归档管理器
 * 用于管理审计日志的归档和清理
 */
export class ArchiveManager {
  /**
   * 归档超过指定天数的审计日志
   * @param days - 天数，默认为365天（1年）
   * @returns 归档的记录数量
   */
  async archiveOldAuditLogs(days: number = 365): Promise<number> {
    console.log(`[ArchiveManager] 开始归档超过 ${days} 天的审计日志...`);
    const db = await getDb();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 查询需要归档的记录
      const oldLogs = await db
        .select()
        .from(auditLogs)
        .where(lt(auditLogs.createdAt, cutoffDate));

      if (oldLogs.length === 0) {
        console.log('[ArchiveManager] 没有需要归档的审计日志');
        return 0;
      }

      console.log(`[ArchiveManager] 找到 ${oldLogs.length} 条需要归档的审计日志`);

      // 插入到归档表
      const archiveRecords = oldLogs.map((log) => ({
        id: log.id,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        operatorId: log.operatorId,
        operatorName: log.operatorName,
        operatorType: log.operatorType,
        oldData: log.oldData,
        newData: log.newData,
        ip: log.ip,
        userAgent: log.userAgent,
        description: log.description,
        createdAt: log.createdAt,
        archivedAt: new Date(),
      }));

      await db.insert(auditLogsArchive).values(archiveRecords);

      // 删除已归档的记录
      const deleteResult = await db
        .delete(auditLogs)
        .where(lt(auditLogs.createdAt, cutoffDate));

      const archivedCount = deleteResult.rowCount ?? 0;

      console.log(`[ArchiveManager] 成功归档 ${archivedCount} 条审计日志`);

      return archivedCount;
    } catch (error) {
      console.error('[ArchiveManager] 归档审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 清理超过指定天数的已归档审计日志
   * @param days - 天数，默认为730天（2年）
   * @returns 删除的记录数量
   */
  async cleanupArchivedLogs(days: number = 730): Promise<number> {
    console.log(`[ArchiveManager] 开始清理超过 ${days} 天的已归档审计日志...`);
    const db = await getDb();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 删除超过指定天数的归档记录
      const deleteResult = await db
        .delete(auditLogsArchive)
        .where(lt(auditLogsArchive.archivedAt, cutoffDate));

      const deletedCount = deleteResult.rowCount ?? 0;

      console.log(`[ArchiveManager] 成功清理 ${deletedCount} 条已归档审计日志`);

      return deletedCount;
    } catch (error) {
      console.error('[ArchiveManager] 清理已归档审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取归档统计信息
   * @returns 归档统计信息
   */
  async getArchiveStats(): Promise<{
    currentLogs: number;
    archivedLogs: number;
    oldestLog: Date | null;
    oldestArchivedLog: Date | null;
  }> {
    const db = await getDb();

    try {
      // 获取当前审计日志数量
      const [currentLogsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogs);

      // 获取已归档日志数量
      const [archivedLogsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLogsArchive);

      // 获取最早的审计日志
      const [oldestLogResult] = await db
        .select({ createdAt: auditLogs.createdAt })
        .from(auditLogs)
        .orderBy(auditLogs.createdAt)
        .limit(1);

      // 获取最早的已归档审计日志
      const [oldestArchivedLogResult] = await db
        .select({ createdAt: auditLogsArchive.archivedAt })
        .from(auditLogsArchive)
        .orderBy(auditLogsArchive.archivedAt)
        .limit(1);

      return {
        currentLogs: currentLogsResult.count,
        archivedLogs: archivedLogsResult.count,
        oldestLog: oldestLogResult?.createdAt || null,
        oldestArchivedLog: oldestArchivedLogResult?.createdAt || null,
      };
    } catch (error) {
      console.error('[ArchiveManager] 获取归档统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 执行完整的归档流程
   * 1. 归档超过1年的审计日志
   * 2. 清理超过2年的已归档审计日志
   */
  async performFullArchive(): Promise<{
    archivedCount: number;
    cleanedCount: number;
  }> {
    console.log('[ArchiveManager] 开始执行完整的归档流程...');

    // 归档超过1年的日志
    const archivedCount = await this.archiveOldAuditLogs(365);

    // 清理超过2年的已归档日志
    const cleanedCount = await this.cleanupArchivedLogs(730);

    console.log('[ArchiveManager] 完整归档流程完成:', {
      archivedCount,
      cleanedCount,
    });

    return {
      archivedCount,
      cleanedCount,
    };
  }
}

export const archiveManager = new ArchiveManager();
