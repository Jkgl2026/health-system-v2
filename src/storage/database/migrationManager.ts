import { getDb } from "coze-coding-dev-sdk";
import { backupManager } from "./backupManager";

// 迁移类型
export type MigrationType = 'ADD_COLUMN' | 'CREATE_TABLE' | 'DROP_COLUMN' | 'MODIFY_COLUMN';

// 迁移状态
export type MigrationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';

// 迁移记录
export interface MigrationRecord {
  id: string;
  migrationId: string;
  migrationType: MigrationType;
  tableName: string;
  description: string;
  status: MigrationStatus;
  backupId?: string; // 迁移前创建的备份ID
  rollbackSql?: string; // 回滚SQL
  executedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

// 迁移步骤
interface MigrationStep {
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
  description: string;
}

/**
 * 迁移管理器
 * 负责数据库迁移和回滚
 */
export class MigrationManager {
  // 迁移历史表名
  private readonly MIGRATION_HISTORY_TABLE = 'migration_history';

  /**
   * 初始化迁移历史表
   */
  private async initMigrationHistoryTable(): Promise<void> {
    const db = await getDb();
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS ${this.MIGRATION_HISTORY_TABLE} (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          migration_id VARCHAR(64) NOT NULL UNIQUE,
          migration_type VARCHAR(20) NOT NULL,
          table_name VARCHAR(50) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(20) NOT NULL,
          backup_id VARCHAR(64),
          rollback_sql TEXT,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE,
          error_message TEXT
        );
      `);
    } catch (error) {
      console.error('[MigrationManager] 创建迁移历史表失败:', error);
      throw error;
    }
  }

  /**
   * 生成迁移ID
   */
  private generateMigrationId(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = crypto.randomUUID().split('-')[0];
    return `migration-${timestamp}-${uuid}`;
  }

  /**
   * 记录迁移
   */
  private async recordMigration(record: Omit<MigrationRecord, 'id' | 'executedAt'>): Promise<void> {
    const db = await getDb();
    try {
      await db.execute(`
        INSERT INTO ${this.MIGRATION_HISTORY_TABLE} (
          migration_id, migration_type, table_name, description, status, 
          backup_id, rollback_sql, executed_at, completed_at, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        record.migrationId,
        record.migrationType,
        record.tableName,
        record.description,
        record.status,
        record.backupId,
        record.rollbackSql,
        new Date().toISOString(),
        record.completedAt || null,
        record.errorMessage || null,
      ]);
    } catch (error) {
      console.error('[MigrationManager] 记录迁移失败:', error);
      throw error;
    }
  }

  /**
   * 更新迁移状态
   */
  private async updateMigrationStatus(migrationId: string, status: MigrationStatus, options: {
    completedAt?: Date;
    errorMessage?: string;
  } = {}): Promise<void> {
    const db = await getDb();
    try {
      await db.execute(`
        UPDATE ${this.MIGRATION_HISTORY_TABLE}
        SET status = $1, completed_at = $2, error_message = $3
        WHERE migration_id = $4
      `, [
        status,
        options.completedAt || null,
        options.errorMessage || null,
        migrationId,
      ]);
    } catch (error) {
      console.error('[MigrationManager] 更新迁移状态失败:', error);
      throw error;
    }
  }

  /**
   * 执行迁移（带自动备份和回滚）
   */
  async executeMigration(steps: MigrationStep[], options: {
    autoBackup?: boolean;
    createdBy?: string;
    description?: string;
  } = {}): Promise<{ success: boolean; migrationId: string; backupId?: string; message: string }> {
    const { autoBackup = true, createdBy = 'SYSTEM', description = '数据库迁移' } = options;

    // 初始化迁移历史表
    await this.initMigrationHistoryTable();

    const migrationId = this.generateMigrationId();
    let backupId: string | undefined;

    try {
      console.log('[MigrationManager] 开始执行迁移:', migrationId);

      // 1. 自动备份
      if (autoBackup) {
        console.log('[MigrationManager] 创建迁移前备份...');
        const backupMetadata = await backupManager.createFullBackup({
          createdBy,
          description: `迁移前备份 - ${migrationId}`,
        });
        backupId = backupMetadata.backupId;
        console.log('[MigrationManager] 备份创建成功:', backupId);
      }

      // 2. 记录迁移（开始）
      await this.recordMigration({
        migrationId,
        migrationType: 'ADD_COLUMN', // 默认类型
        tableName: 'multiple', // 多个表
        description,
        status: 'RUNNING',
        backupId,
      });

      // 3. 执行迁移步骤
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`[MigrationManager] 执行步骤 ${i + 1}/${steps.length}:`, step.description);
        await step.execute();
      }

      // 4. 记录迁移（完成）
      await this.updateMigrationStatus(migrationId, 'COMPLETED', {
        completedAt: new Date(),
      });

      console.log('[MigrationManager] 迁移执行成功:', migrationId);

      return {
        success: true,
        migrationId,
        backupId,
        message: '迁移执行成功',
      };
    } catch (error) {
      console.error('[MigrationManager] 迁移执行失败:', error);

      // 记录迁移（失败）
      await this.updateMigrationStatus(migrationId, 'FAILED', {
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        migrationId,
        backupId,
        message: `迁移执行失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 回滚迁移
   */
  async rollbackMigration(migrationId: string, options: {
    createdBy?: string;
  } = {}): Promise<{ success: boolean; message: string; details?: any }> {
    const { createdBy = 'SYSTEM' } = options;

    try {
      console.log('[MigrationManager] 开始回滚迁移:', migrationId);

      // 1. 检查迁移是否存在
      const db = await getDb();
      const migrationResult = await db.execute(`
        SELECT * FROM ${this.MIGRATION_HISTORY_TABLE}
        WHERE migration_id = $1
      `, [migrationId]);

      if (!migrationResult.rows || migrationResult.rows.length === 0) {
        return {
          success: false,
          message: '迁移记录不存在',
        };
      }

      const migration = migrationResult.rows[0] as MigrationRecord;

      // 2. 如果有备份，从备份恢复
      if (migration.backupId) {
        console.log('[MigrationManager] 从备份恢复数据:', migration.backupId);
        const restoreResult = await backupManager.restoreFromBackup(migration.backupId, {
          createdBy,
          description: `回滚迁移 - ${migrationId}`,
        });

        if (!restoreResult.success) {
          return {
            success: false,
            message: '从备份恢复失败',
            details: restoreResult.details,
          };
        }
      }

      // 3. 更新迁移状态
      await this.updateMigrationStatus(migrationId, 'ROLLED_BACK', {
        completedAt: new Date(),
      });

      console.log('[MigrationManager] 迁移回滚成功:', migrationId);

      return {
        success: true,
        message: '迁移回滚成功',
        details: {
          migrationId,
          backupId: migration.backupId,
        },
      };
    } catch (error) {
      console.error('[MigrationManager] 回滚迁移失败:', error);
      return {
        success: false,
        message: `回滚迁移失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 获取迁移历史
   */
  async getMigrationHistory(limit = 50): Promise<MigrationRecord[]> {
    try {
      await this.initMigrationHistoryTable();
      const db = await getDb();
      const result = await db.execute(`
        SELECT * FROM ${this.MIGRATION_HISTORY_TABLE}
        ORDER BY executed_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows as MigrationRecord[];
    } catch (error) {
      console.error('[MigrationManager] 获取迁移历史失败:', error);
      return [];
    }
  }
}

// 导出单例
export const migrationManager = new MigrationManager();
