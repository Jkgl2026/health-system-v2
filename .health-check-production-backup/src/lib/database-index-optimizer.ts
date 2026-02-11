/**
 * 数据库索引优化脚本
 * 为常用查询添加索引，提升查询性能
 */

import { sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';

/**
 * 数据库索引优化器
 */
export class DatabaseIndexOptimizer {
  /**
   * 创建所有推荐的索引
   */
  static async createAllIndexes(): Promise<void> {
    console.log('[IndexOptimizer] 开始创建数据库索引...');

    const indexes = [
      // users 表索引
      { name: 'idx_users_phone', table: 'users', columns: ['phone'] },
      { name: 'idx_users_email', table: 'users', columns: ['email'] },
      { name: 'idx_users_created_at', table: 'users', columns: ['created_at'] },
      { name: 'idx_users_deleted_at', table: 'users', columns: ['deleted_at'] },

      // requirements 表索引
      { name: 'idx_requirements_user_id', table: 'requirements', columns: ['user_id'], unique: true },
      { name: 'idx_requirements_updated_at', table: 'requirements', columns: ['updated_at'] },
      { name: 'idx_requirements_completed_at', table: 'requirements', columns: ['completed_at'] },

      // symptomChecks 表索引
      { name: 'idx_symptom_checks_user_id', table: 'symptom_checks', columns: ['user_id'] },
      { name: 'idx_symptom_checks_checked_at', table: 'symptom_checks', columns: ['checked_at'] },
      { name: 'idx_symptom_checks_user_id_checked_at', table: 'symptom_checks', columns: ['user_id', 'checked_at'] },

      // healthAnalysis 表索引
      { name: 'idx_health_analysis_user_id', table: 'health_analysis', columns: ['user_id'] },
      { name: 'idx_health_analysis_analyzed_at', table: 'health_analysis', columns: ['analyzed_at'] },
      { name: 'idx_health_analysis_user_id_analyzed_at', table: 'health_analysis', columns: ['user_id', 'analyzed_at'] },

      // userChoices 表索引
      { name: 'idx_user_choices_user_id', table: 'user_choices', columns: ['user_id'] },
      { name: 'idx_user_choices_selected_at', table: 'user_choices', columns: ['selected_at'] },
      { name: 'idx_user_choices_user_id_selected_at', table: 'user_choices', columns: ['user_id', 'selected_at'] },

      // admins 表索引
      { name: 'idx_admins_username', table: 'admins', columns: ['username'], unique: true },
      { name: 'idx_admins_is_active', table: 'admins', columns: ['is_active'] },

      // auditLogs 表索引
      { name: 'idx_audit_logs_table_name', table: 'audit_logs', columns: ['table_name'] },
      { name: 'idx_audit_logs_record_id', table: 'audit_logs', columns: ['record_id'] },
      { name: 'idx_audit_logs_action', table: 'audit_logs', columns: ['action'] },
      { name: 'idx_audit_logs_created_at', table: 'audit_logs', columns: ['created_at'] },
      { name: 'idx_audit_logs_operator_id', table: 'audit_logs', columns: ['operator_id'] },
      {
        name: 'idx_audit_logs_table_record',
        table: 'audit_logs',
        columns: ['table_name', 'record_id'],
      },
      {
        name: 'idx_audit_logs_action_created_at',
        table: 'audit_logs',
        columns: ['action', 'created_at'],
      },
    ];

    const db = await getDb();
    let created = 0;
    let skipped = 0;

    for (const index of indexes) {
      try {
        await this.createIndex(
          db,
          index.name,
          index.table,
          index.columns,
          index.unique
        );
        created++;
        console.log(`[IndexOptimizer] ✓ 创建索引: ${index.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          skipped++;
          console.log(`[IndexOptimizer] - 索引已存在: ${index.name}`);
        } else {
          console.error(`[IndexOptimizer] ✗ 创建索引失败: ${index.name}`, error);
        }
      }
    }

    console.log(`[IndexOptimizer] 完成！创建: ${created}, 跳过: ${skipped}`);
  }

  /**
   * 创建单个索引
   */
  private static async createIndex(
    db: any,
    name: string,
    table: string,
    columns: string[],
    unique: boolean = false
  ): Promise<void> {
    const uniqueKeyword = unique ? 'UNIQUE' : '';
    const columnsStr = columns.map(col => `"${col}"`).join(', ');
    const query = sql`
      CREATE INDEX IF NOT EXISTS ${sql.raw(name)}
      ON ${sql.raw(table)} (${sql.raw(columnsStr)})
    `;

    await db.execute(query);
  }

  /**
   * 删除索引
   */
  static async dropIndex(name: string): Promise<void> {
    const db = await getDb();
    const query = sql`DROP INDEX IF EXISTS ${sql.raw(name)}`;
    await db.execute(query);
    console.log(`[IndexOptimizer] ✓ 删除索引: ${name}`);
  }

  /**
   * 分析索引使用情况
   */
  static async analyzeIndexUsage(): Promise<any[]> {
    const db = await getDb();
    const query = sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
    `;

    const result = await db.execute(query);
    return result.rows || [];
  }

  /**
   * 获取所有索引列表
   */
  static async listIndexes(): Promise<any[]> {
    const db = await getDb();
    const query = sql`
      SELECT
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;

    const result = await db.execute(query);
    return result.rows || [];
  }

  /**
   * 分析表并更新统计信息
   */
  static async analyzeTable(tableName: string): Promise<void> {
    const db = await getDb();
    const query = sql`ANALYZE ${sql.raw(tableName)}`;
    await db.execute(query);
    console.log(`[IndexOptimizer] ✓ 分析表: ${tableName}`);
  }

  /**
   * 分析所有表
   */
  static async analyzeAllTables(): Promise<void> {
    const tables = [
      'users',
      'requirements',
      'symptom_checks',
      'health_analysis',
      'user_choices',
      'admins',
      'audit_logs',
    ];

    for (const table of tables) {
      await this.analyzeTable(table);
    }
  }

  /**
   * 重建索引（如果索引碎片化）
   */
  static async rebuildIndex(indexName: string): Promise<void> {
    const db = await getDb();
    const query = sql`REINDEX INDEX ${sql.raw(indexName)}`;
    await db.execute(query);
    console.log(`[IndexOptimizer] ✓ 重建索引: ${indexName}`);
  }

  /**
   * 获取表大小统计
   */
  static async getTableSizes(): Promise<any[]> {
    const db = await getDb();
    const query = sql`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) AS index_size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
    `;

    const result = await db.execute(query);
    return result.rows || [];
  }
}

/**
 * 使用示例
 */
export async function optimizeDatabase(): Promise<void> {
  console.log('========================================');
  console.log('   数据库性能优化开始');
  console.log('========================================');

  // 1. 创建所有索引
  await DatabaseIndexOptimizer.createAllIndexes();

  // 2. 分析所有表
  await DatabaseIndexOptimizer.analyzeAllTables();

  // 3. 获取索引使用情况
  const indexUsage = await DatabaseIndexOptimizer.analyzeIndexUsage();
  console.log('\n索引使用情况:');
  console.table(indexUsage);

  // 4. 获取表大小
  const tableSizes = await DatabaseIndexOptimizer.getTableSizes();
  console.log('\n表大小统计:');
  console.table(tableSizes);

  console.log('========================================');
  console.log('   数据库性能优化完成');
  console.log('========================================');
}

export default DatabaseIndexOptimizer;
