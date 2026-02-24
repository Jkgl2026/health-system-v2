import { getDb } from "coze-coding-dev-sdk";
import { S3Storage } from "coze-coding-dev-sdk";
import {
  users,
  symptomChecks,
  healthAnalysis,
  userChoices,
  requirements,
  admins,
  auditLogs,
  backupRecords,
} from "./shared/schema";
import { lt, sql, desc } from "drizzle-orm";

export type BackupType = 'FULL' | 'INCREMENTAL';

// 备份元数据
export interface BackupMetadata {
  backupId: string;
  backupType: BackupType;
  backupDate: string;
  tableCount: number;
  totalRecords: number;
  fileSize: number;
  fileKey: string;
  previousBackupId?: string;
  checksum?: string;
  createdAt: string;
  createdBy: string;
  description?: string;
}

// 备份数据结构
export interface BackupData {
  metadata: {
    backupId: string;
    backupType: BackupType;
    backupDate: string;
    tables: string[];
    recordCounts: Record<string, number>;
    previousBackupId?: string;
    checksum: string;
  };
  data: {
    users: any[];
    symptomChecks: any[];
    healthAnalysis: any[];
    userChoices: any[];
    requirements: any[];
    admins: any[];
    auditLogs: any[];
  };
}

/**
 * 增强的备份管理器
 * 支持自动清理、智能备份策略
 */
export class EnhancedBackupManager {
  private storage: S3Storage;
  private readonly BACKUP_PREFIX = 'backups/';

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: "",
      secretKey: "",
      bucketName: process.env.COZE_BUCKET_NAME,
      region: "cn-beijing",
    });
  }

  /**
   * 生成备份ID
   */
  private generateBackupId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = crypto.randomUUID().split('-')[0];
    return `backup-${timestamp}-${uuid}`;
  }

  /**
   * 计算数据校验和
   */
  private calculateChecksum(data: any): string {
    const dataToHash = {
      ...data,
      metadata: {
        ...data.metadata,
        checksum: '',
      }
    };
    const str = JSON.stringify(dataToHash);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 创建全量备份
   */
  async createFullBackup(options: {
    createdBy: string;
    description?: string;
  } = { createdBy: 'SYSTEM' }): Promise<BackupMetadata> {
    console.log('[BackupManager] 开始创建全量备份...');
    const db = await getDb();
    const backupId = this.generateBackupId();
    const backupDate = new Date().toISOString();

    // 导出所有表的数据
    const backupData: BackupData = {
      metadata: {
        backupId,
        backupType: 'FULL',
        backupDate,
        tables: ['users', 'symptomChecks', 'healthAnalysis', 'userChoices', 'requirements', 'admins', 'auditLogs'],
        recordCounts: {},
        checksum: '',
      },
      data: {
        users: [],
        symptomChecks: [],
        healthAnalysis: [],
        userChoices: [],
        requirements: [],
        admins: [],
        auditLogs: [],
      },
    };

    // 导出所有表
    backupData.data.users = await db.select().from(users);
    backupData.data.symptomChecks = await db.select().from(symptomChecks);
    backupData.data.healthAnalysis = await db.select().from(healthAnalysis);
    backupData.data.userChoices = await db.select().from(userChoices);
    backupData.data.requirements = await db.select().from(requirements);
    backupData.data.admins = await db.select().from(admins);
    backupData.data.auditLogs = await db.select().from(auditLogs);

    // 计算记录数
    backupData.metadata.recordCounts.users = backupData.data.users.length;
    backupData.metadata.recordCounts.symptomChecks = backupData.data.symptomChecks.length;
    backupData.metadata.recordCounts.healthAnalysis = backupData.data.healthAnalysis.length;
    backupData.metadata.recordCounts.userChoices = backupData.data.userChoices.length;
    backupData.metadata.recordCounts.requirements = backupData.data.requirements.length;
    backupData.metadata.recordCounts.admins = backupData.data.admins.length;
    backupData.metadata.recordCounts.auditLogs = backupData.data.auditLogs.length;

    // 计算校验和
    backupData.metadata.checksum = this.calculateChecksum(backupData);

    // 上传到对象存储
    const fileName = `${this.BACKUP_PREFIX}${backupId}.json`;
    const fileContent = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    const fileKey = await this.storage.uploadFile({
      fileContent,
      fileName,
      contentType: 'application/json',
    });

    // 记录到数据库
    const metadata: BackupMetadata = {
      backupId,
      backupType: 'FULL',
      backupDate,
      tableCount: 7,
      totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
      fileSize: fileContent.length,
      fileKey,
      checksum: backupData.metadata.checksum,
      createdAt: backupDate,
      createdBy: options.createdBy,
      description: options.description,
    };

    await db.insert(backupRecords).values({
      backupId: metadata.backupId,
      backupType: metadata.backupType,
      fileKey: metadata.fileKey,
      fileSize: metadata.fileSize,
      tableCount: metadata.tableCount,
      totalRecords: metadata.totalRecords,
      previousBackupId: null,
      checksum: metadata.checksum,
      description: metadata.description || null,
      createdBy: metadata.createdBy,
    });

    console.log('[BackupManager] 全量备份创建成功:', {
      backupId,
      fileSize: `${(metadata.fileSize / 1024).toFixed(2)} KB`,
      totalRecords: metadata.totalRecords,
    });

    return metadata;
  }

  /**
   * 创建增量备份
   */
  async createIncrementalBackup(options: {
    previousBackupId?: string;
    createdBy: string;
    description?: string;
  } = { createdBy: 'SYSTEM' }): Promise<BackupMetadata> {
    console.log('[BackupManager] 开始创建增量备份...');
    const db = await getDb();
    const backupId = this.generateBackupId();
    const backupDate = new Date().toISOString();

    // 获取上一次备份
    let lastBackupTime = new Date(0);
    let lastBackupId = options.previousBackupId;

    if (!lastBackupId) {
      // 查找最近的全量备份
      const [lastBackup] = await db
        .select()
        .from(backupRecords)
        .where(sql`${backupRecords.backupType} = 'FULL'`)
        .orderBy(desc(backupRecords.createdAt))
        .limit(1);

      if (lastBackup) {
        lastBackupId = lastBackup.backupId;
        lastBackupTime = new Date(lastBackup.createdAt);
      }
    } else {
      const [backup] = await db.select().from(backupRecords).where(sql`${backupRecords.backupId} = ${lastBackupId}`);
      if (backup) {
        lastBackupTime = new Date(backup.createdAt);
      }
    }

    if (!lastBackupId) {
      console.log('[BackupManager] 没有找到之前的备份，将创建全量备份');
      return this.createFullBackup(options);
    }

    // 导出在上次备份之后变更的数据
    const backupData: BackupData = {
      metadata: {
        backupId,
        backupType: 'INCREMENTAL',
        backupDate,
        tables: ['users', 'symptomChecks', 'healthAnalysis', 'userChoices', 'requirements', 'admins', 'auditLogs'],
        recordCounts: {},
        previousBackupId: lastBackupId,
        checksum: '',
      },
      data: {
        users: [],
        symptomChecks: [],
        healthAnalysis: [],
        userChoices: [],
        requirements: [],
        admins: [],
        auditLogs: [],
      },
    };

    // 只导出在上次备份之后创建或更新的数据
    backupData.data.users = await db.select().from(users).where(sql`${users.createdAt} > ${lastBackupTime} OR ${users.updatedAt} > ${lastBackupTime}`);
    backupData.data.symptomChecks = await db.select().from(symptomChecks).where(sql`${symptomChecks.checkedAt} > ${lastBackupTime}`);
    backupData.data.healthAnalysis = await db.select().from(healthAnalysis).where(sql`${healthAnalysis.analyzedAt} > ${lastBackupTime}`);
    backupData.data.userChoices = await db.select().from(userChoices).where(sql`${userChoices.selectedAt} > ${lastBackupTime}`);
    backupData.data.requirements = await db.select().from(requirements).where(sql`${requirements.updatedAt} > ${lastBackupTime} OR ${requirements.completedAt} > ${lastBackupTime}`);
    backupData.data.admins = await db.select().from(admins).where(sql`${admins.updatedAt} > ${lastBackupTime}`);
    backupData.data.auditLogs = await db.select().from(auditLogs).where(sql`${auditLogs.createdAt} > ${lastBackupTime}`);

    // 计算记录数
    backupData.metadata.recordCounts.users = backupData.data.users.length;
    backupData.metadata.recordCounts.symptomChecks = backupData.data.symptomChecks.length;
    backupData.metadata.recordCounts.healthAnalysis = backupData.data.healthAnalysis.length;
    backupData.metadata.recordCounts.userChoices = backupData.data.userChoices.length;
    backupData.metadata.recordCounts.requirements = backupData.data.requirements.length;
    backupData.metadata.recordCounts.admins = backupData.data.admins.length;
    backupData.metadata.recordCounts.auditLogs = backupData.data.auditLogs.length;

    // 计算校验和
    backupData.metadata.checksum = this.calculateChecksum(backupData);

    // 上传到对象存储
    const fileName = `${this.BACKUP_PREFIX}${backupId}.json`;
    const fileContent = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    const fileKey = await this.storage.uploadFile({
      fileContent,
      fileName,
      contentType: 'application/json',
    });

    // 记录到数据库
    const metadata: BackupMetadata = {
      backupId,
      backupType: 'INCREMENTAL',
      backupDate,
      tableCount: 7,
      totalRecords: Object.values(backupData.metadata.recordCounts).reduce((a, b) => a + b, 0),
      fileSize: fileContent.length,
      fileKey,
      checksum: backupData.metadata.checksum,
      createdAt: backupDate,
      createdBy: options.createdBy,
      description: options.description,
    };

    await db.insert(backupRecords).values({
      backupId: metadata.backupId,
      backupType: metadata.backupType,
      fileKey: metadata.fileKey,
      fileSize: metadata.fileSize,
      tableCount: metadata.tableCount,
      totalRecords: metadata.totalRecords,
      previousBackupId: lastBackupId,
      checksum: metadata.checksum,
      description: metadata.description || null,
      createdBy: metadata.createdBy,
    });

    console.log('[BackupManager] 增量备份创建成功:', {
      backupId,
      fileSize: `${(metadata.fileSize / 1024).toFixed(2)} KB`,
      totalRecords: metadata.totalRecords,
      previousBackupId: lastBackupId,
    });

    return metadata;
  }

  /**
   * 清理超过指定天数的备份
   * @param days - 天数，默认为30天
   * @returns 删除的备份数量
   */
  async cleanupOldBackups(days: number = 30): Promise<number> {
    console.log(`[BackupManager] 开始清理超过 ${days} 天的备份...`);
    const db = await getDb();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 查询需要清理的备份
      const oldBackups = await db
        .select()
        .from(backupRecords)
        .where(lt(backupRecords.createdAt, cutoffDate))
        .orderBy(backupRecords.createdAt);

      if (oldBackups.length === 0) {
        console.log('[BackupManager] 没有需要清理的备份');
        return 0;
      }

      console.log(`[BackupManager] 找到 ${oldBackups.length} 个需要清理的备份`);

      let deletedCount = 0;

      // 删除对象存储中的文件
      for (const backup of oldBackups) {
        try {
          await this.storage.deleteFile({ fileKey: backup.fileKey });
          console.log(`[BackupManager] 已删除对象存储文件: ${backup.fileKey}`);
        } catch (error) {
          console.error(`[BackupManager] 删除对象存储文件失败: ${backup.fileKey}`, error);
        }
      }

      // 删除数据库记录
      const deleteResult = await db
        .delete(backupRecords)
        .where(lt(backupRecords.createdAt, cutoffDate));

      deletedCount = deleteResult.rowCount ?? 0;

      console.log(`[BackupManager] 成功清理 ${deletedCount} 个备份`);

      return deletedCount;
    } catch (error) {
      console.error('[BackupManager] 清理备份失败:', error);
      throw error;
    }
  }

  /**
   * 智能备份策略
   * - 每天增量备份
   * - 每周（周日）全量备份
   */
  async performSmartBackup(): Promise<BackupMetadata> {
    const dayOfWeek = new Date().getDay();
    const isSunday = dayOfWeek === 0;

    if (isSunday) {
      console.log('[BackupManager] 今天是周日，执行全量备份');
      return this.createFullBackup({
        createdBy: 'SYSTEM',
        description: '每周自动全量备份',
      });
    } else {
      console.log('[BackupManager] 今天不是周日，执行增量备份');
      return this.createIncrementalBackup({
        createdBy: 'SYSTEM',
        description: '每日自动增量备份',
      });
    }
  }

  /**
   * 执行完整的备份和清理流程
   * 1. 执行智能备份
   * 2. 清理超过30天的旧备份
   */
  async performFullBackupProcess(): Promise<{
    backup: BackupMetadata;
    cleanedCount: number;
  }> {
    console.log('[BackupManager] 开始执行完整的备份流程...');

    // 执行智能备份
    const backup = await this.performSmartBackup();

    // 清理超过30天的旧备份
    const cleanedCount = await this.cleanupOldBackups(30);

    console.log('[BackupManager] 完整备份流程完成:', {
      backupId: backup.backupId,
      backupType: backup.backupType,
      cleanedCount,
    });

    return {
      backup,
      cleanedCount,
    };
  }

  /**
   * 获取备份统计信息
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    fullBackups: number;
    incrementalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    const db = await getDb();

    try {
      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(backupRecords);

      const [fullResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(backupRecords)
        .where(sql`${backupRecords.backupType} = 'FULL'`);

      const [incrementalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(backupRecords)
        .where(sql`${backupRecords.backupType} = 'INCREMENTAL'`);

      const [sizeResult] = await db
        .select({ total: sql<number>`sum(${backupRecords.fileSize})::int` })
        .from(backupRecords);

      const [oldestResult] = await db
        .select({ createdAt: backupRecords.createdAt })
        .from(backupRecords)
        .orderBy(backupRecords.createdAt)
        .limit(1);

      const [newestResult] = await db
        .select({ createdAt: backupRecords.createdAt })
        .from(backupRecords)
        .orderBy(desc(backupRecords.createdAt))
        .limit(1);

      return {
        totalBackups: totalResult.count,
        fullBackups: fullResult.count,
        incrementalBackups: incrementalResult.count,
        totalSize: sizeResult.total || 0,
        oldestBackup: oldestResult?.createdAt || null,
        newestBackup: newestResult?.createdAt || null,
      };
    } catch (error) {
      console.error('[BackupManager] 获取备份统计信息失败:', error);
      throw error;
    }
  }
}

export const enhancedBackupManager = new EnhancedBackupManager();
