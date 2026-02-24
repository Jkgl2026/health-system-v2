import { NextRequest, NextResponse } from 'next/server';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/admin/pool-stats - 获取数据库连接池统计信息
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const db = await getDb();

    // 1. 获取连接池统计信息
    const poolQuery = `
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
        count(*) FILTER (WHERE wait_event_type = 'Lock') as waiting_for_lock,
        count(*) FILTER (WHERE query_start < NOW() - INTERVAL '5 minutes') as long_running_queries
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `;

    const poolResult = await db.execute(poolQuery);
    const poolStats = poolResult.rows[0];

    // 2. 获取数据库大小和表大小统计
    const sizeQuery = `
      SELECT 
        pg_database_size(current_database()) / 1024 / 1024 as database_size_mb,
        pg_size_pretty(pg_database_size(current_database())) as database_size_pretty
    `;

    const sizeResult = await db.execute(sizeQuery);
    const sizeStats = sizeResult.rows[0];

    // 3. 获取表大小统计（Top 10）
    const tableSizeQuery = `
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_total_relation_size(schemaname||'.'||tablename) as total_size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10;
    `;

    const tableSizeResult = await db.execute(tableSizeQuery);

    // 4. 获取索引统计
    const indexQuery = `
      SELECT 
        count(*) as total_indexes,
        count(*) FILTER (WHERE idx_scan = 0) as unused_indexes
      FROM pg_stat_user_indexes;
    `;

    const indexResult = await db.execute(indexQuery);
    const indexStats = indexResult.rows[0];

    // 5. 尝试获取慢查询统计（如果pg_stat_statements扩展已启用）
    let slowQueries: any[] = [];
    try {
      const slowQueryQuery = `
        SELECT 
          query,
          calls,
          total_time,
          mean_time,
          max_time
        FROM pg_stat_statements
        WHERE mean_time > 100
        ORDER BY mean_time DESC
        LIMIT 10;
      `;
      const slowQueryResult = await db.execute(slowQueryQuery);
      slowQueries = slowQueryResult.rows || [];
    } catch (error) {
      console.log('[PoolStats] pg_stat_statements 扩展未启用');
    }

    // 6. 分析连接池健康状况
    const maxConnections = 100; // 假设最大连接数为100
    const totalConnections = Number(poolStats.total_connections || 0);
    const connectionUsage = (totalConnections / maxConnections) * 100;
    
    let healthStatus = 'healthy';
    let healthMessage = '连接池状态良好';

    if (connectionUsage > 80) {
      healthStatus = 'critical';
      healthMessage = `连接数过高 (${connectionUsage.toFixed(1)}%)，请检查连接泄漏`;
    } else if (connectionUsage > 60) {
      healthStatus = 'warning';
      healthMessage = `连接数较高 (${connectionUsage.toFixed(1)}%)，建议监控`;
    } else if (Number(poolStats.waiting_for_lock || 0) > 5) {
      healthStatus = 'warning';
      healthMessage = '锁等待连接较多，可能存在性能问题';
    } else if (Number(poolStats.long_running_queries || 0) > 3) {
      healthStatus = 'warning';
      healthMessage = '存在长时间运行的查询，建议优化';
    }

    const response = NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        status: healthStatus,
        message: healthMessage,
        connectionUsage: connectionUsage.toFixed(1),
      },
      pool: poolStats,
      database: sizeStats,
      tables: tableSizeResult.rows,
      indexes: indexStats,
      slowQueries: slowQueries.length > 0 ? slowQueries : null,
    });

    console.log('[PoolStats] 连接池状态查询成功:', healthStatus);

    return response;
  } catch (error) {
    console.error('[PoolStats] 获取连接池统计失败:', error);
    return NextResponse.json(
      { 
        error: '获取连接池统计失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
