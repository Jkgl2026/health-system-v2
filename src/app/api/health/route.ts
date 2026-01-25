import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { checkDatabaseSchema, ensureDatabaseSchema } from '@/lib/databaseMigration';
import { alertManager, AlertLevel, AlertType, AlertRule } from '@/lib/alertManager';

// 初始化告警规则
if (!alertManager['rules'] || alertManager['rules'].size === 0) {
  // 数据库连接数告警
  alertManager.addRule({
    id: 'db-connection-count',
    name: '数据库连接数过高',
    description: '当数据库连接数超过80时触发告警',
    type: AlertType.DATABASE,
    level: AlertLevel.WARNING,
    enabled: true,
    threshold: 80,
    checkFn: async () => {
      try {
        const db = await getDb();
        const result = await db.execute(`
          SELECT count(*) as count FROM pg_stat_activity 
          WHERE datname = current_database();
        `);
        const count = parseInt(result.rows[0].count);
        return {
          triggered: count > 80,
          value: count,
          message: `数据库连接数: ${count}`,
        };
      } catch (error) {
        return {
          triggered: false,
          value: 0,
          message: '无法获取连接数',
        };
      }
    },
  });

  // 数据库响应时间告警
  alertManager.addRule({
    id: 'db-response-time',
    name: '数据库响应时间过长',
    description: '当数据库响应时间超过1秒时触发告警',
    type: AlertType.PERFORMANCE,
    level: AlertLevel.WARNING,
    enabled: true,
    threshold: 1000,
    checkFn: async () => {
      try {
        const start = Date.now();
        const db = await getDb();
        await db.execute(`SELECT 1`);
        const responseTime = Date.now() - start;
        return {
          triggered: responseTime > 1000,
          value: responseTime,
          message: `数据库响应时间: ${responseTime}ms`,
        };
      } catch (error) {
        return {
          triggered: true,
          value: 0,
          message: '数据库查询失败',
        };
      }
    },
  });

  // 启动告警检查
  alertManager.start();
}

// GET /api/health - 增强的健康检查
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const db = await getDb();

    // 1. 检查数据库结构兼容性
    console.log('[Health] 检查数据库结构兼容性...');
    const schemaCheck = await checkDatabaseSchema();

    if (!schemaCheck.isCompatible) {
      console.warn(`[Health] 数据库结构不兼容，缺失列: ${schemaCheck.missingColumns.join(', ')}`);
      console.log('[Health] 自动执行数据库迁移修复...');

      const migrationResult = await ensureDatabaseSchema();

      if (!migrationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: '数据库结构不兼容且自动修复失败',
            missingColumns: schemaCheck.missingColumns,
            migrationErrors: migrationResult.errors,
            database: {
              connected: true,
              isCompatible: false,
            },
          },
          { status: 500 }
        );
      }

      console.log('[Health] 数据库结构已自动修复');
    }

    // 2. 检查数据库连接和响应时间
    const dbStartTime = Date.now();
    const result = await db.execute(`SELECT NOW() as current_time;`);
    const dbResponseTime = Date.now() - dbStartTime;

    // 3. 检查表是否存在
    const tablesResult = await db.execute(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const tables = tablesResult.rows.map((row: any) => row.table_name);

    // 4. 检查用户数量
    let userCount = 0;
    try {
      const countResult = await db.execute(`SELECT COUNT(*) as count FROM users;`);
      const firstRow = countResult.rows[0] as any;
      userCount = parseInt(String(firstRow?.count || '0'));
    } catch (error) {
      console.error('Error counting users:', error);
    }

    // 5. 检查数据库连接数
    let connectionCount = 0;
    try {
      const connResult = await db.execute(`
        SELECT count(*) as count FROM pg_stat_activity 
        WHERE datname = current_database();
      `);
      connectionCount = parseInt(String(connResult.rows[0]?.count || '0'));
    } catch (error) {
      console.error('Error getting connection count:', error);
    }

    // 6. 检查数据库大小
    let databaseSize = 0;
    try {
      const sizeResult = await db.execute(`
        SELECT pg_database_size(current_database()) / 1024 / 1024 as size_mb;
      `);
      databaseSize = Math.round(parseFloat(String(sizeResult.rows[0]?.size_mb || '0')));
    } catch (error) {
      console.error('Error getting database size:', error);
    }

    // 7. 获取告警统计
    const alertStats = alertManager.getStats();
    const activeAlerts = alertManager.getActiveAlerts();

    // 8. 计算总体健康分数
    const healthScore = calculateHealthScore({
      dbResponseTime,
      connectionCount,
      databaseSize,
      activeAlerts: activeAlerts.length,
      userCount,
    });

    // 9. 构建响应
    const totalTime = Date.now() - startTime;

    const response = NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: totalTime,
      health: {
        score: healthScore,
        status: getHealthStatus(healthScore),
        message: getHealthMessage(healthScore),
      },
      database: {
        connected: true,
        responseTime: dbResponseTime,
        connectionCount,
        databaseSize,
        currentTime: result.rows[0].current_time,
        tables,
        userCount,
      },
      alerts: {
        total: alertStats.total,
        active: activeAlerts.length,
        critical: alertStats.byLevel[AlertLevel.CRITICAL],
        error: alertStats.byLevel[AlertLevel.ERROR],
        warning: alertStats.byLevel[AlertLevel.WARNING],
        recent: activeAlerts.slice(0, 5), // 最近的5条告警
      },
    });

    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    const totalTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        responseTime: totalTime,
        error: error instanceof Error ? error.message : '未知错误',
        health: {
          score: 0,
          status: 'CRITICAL',
          message: '健康检查失败',
        },
        database: {
          connected: false,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 计算健康分数（0-100）
 */
function calculateHealthScore(metrics: {
  dbResponseTime: number;
  connectionCount: number;
  databaseSize: number;
  activeAlerts: number;
  userCount: number;
}): number {
  let score = 100;

  // 数据库响应时间（权重：30%）
  if (metrics.dbResponseTime > 5000) score -= 30;
  else if (metrics.dbResponseTime > 1000) score -= 15;
  else if (metrics.dbResponseTime > 500) score -= 5;

  // 连接数（权重：20%）
  if (metrics.connectionCount > 90) score -= 20;
  else if (metrics.connectionCount > 80) score -= 10;
  else if (metrics.connectionCount > 60) score -= 5;

  // 数据库大小（权重：10%）
  if (metrics.databaseSize > 10000) score -= 10; // 超过10GB

  // 活跃告警（权重：40%）
  score -= Math.min(metrics.activeAlerts * 10, 40);

  return Math.max(0, score);
}

/**
 * 获取健康状态
 */
function getHealthStatus(score: number): string {
  if (score >= 90) return 'HEALTHY';
  if (score >= 70) return 'GOOD';
  if (score >= 50) return 'WARNING';
  if (score >= 30) return 'DEGRADED';
  return 'CRITICAL';
}

/**
 * 获取健康消息
 */
function getHealthMessage(score: number): string {
  if (score >= 90) return '系统运行正常';
  if (score >= 70) return '系统运行良好，但有一些小问题';
  if (score >= 50) return '系统运行一般，需要关注';
  if (score >= 30) return '系统性能下降，需要尽快处理';
  return '系统严重异常，需要立即处理';
}
