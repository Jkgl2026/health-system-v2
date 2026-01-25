# 数据库连接池优化指南

## 概述

本项目使用 `coze-coding-dev-sdk` 提供的 `getDb()` 函数获取数据库连接。连接池由 SDK 内部管理，以下是优化建议和监控方案。

## 当前连接池配置（建议值）

由于 `coze-coding-dev-sdk` 的配置不可直接访问，建议在应用层面配置以下参数：

```typescript
// 建议的连接池配置
const poolConfig = {
  max: 20,              // 最大连接数
  min: 5,               // 最小连接数
  idleTimeoutMillis: 30000,   // 空闲连接超时（30秒）
  connectionTimeoutMillis: 10000,  // 连接超时（10秒）
  idle: 10000,          // 多少毫秒检查一次空闲连接
};
```

## 连接池监控

### 1. 健康检查API扩展

在 `/api/health` 中添加连接池状态监控：

```typescript
// 检查连接池状态
async function checkPoolStatus() {
  const db = await getDb();
  
  // PostgreSQL查询连接池状态
  const poolQuery = `
    SELECT 
      count(*) as total_connections,
      count(*) FILTER (WHERE state = 'active') as active_connections,
      count(*) FILTER (WHERE state = 'idle') as idle_connections
    FROM pg_stat_activity 
    WHERE datname = current_database();
  `;
  
  const result = await db.execute(poolQuery);
  return result.rows[0];
}
```

### 2. 连接池优化API

创建 `/api/admin/pool-stats` API：

```typescript
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // 获取连接池统计信息
    const poolStats = await db.execute(`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE wait_event_type = 'Lock') as waiting
      FROM pg_stat_activity 
      WHERE datname = current_database();
    `);
    
    // 获取慢查询统计
    const slowQueries = await db.execute(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        max_time
      FROM pg_stat_statements
      WHERE mean_time > 100  -- 超过100ms的查询
      ORDER BY mean_time DESC
      LIMIT 10;
    `);
    
    return NextResponse.json({
      success: true,
      pool: poolStats.rows[0],
      slowQueries: slowQueries.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取连接池状态失败' },
      { status: 500 }
    );
  }
}
```

## 连接池优化建议

### 1. 查询优化

- **使用索引**：确保所有常用查询都有适当的索引
- **避免N+1查询**：使用JOIN或批量查询减少数据库往返
- **限制结果集**：使用LIMIT和OFFSET分页
- **缓存查询结果**：对频繁访问但不常变化的数据使用缓存

### 2. 连接管理

- **及时释放连接**：确保所有数据库操作都正确关闭连接
- **避免长事务**：长时间运行的事务会占用连接
- **使用连接池**：不要为每个请求创建新连接

### 3. 性能监控

- **定期检查慢查询日志**：使用 `pg_stat_statements` 扩展
- **监控连接数**：确保连接数在合理范围内
- **检查锁等待**：避免长时间锁等待

## PostgreSQL 配置建议

如果可以修改 PostgreSQL 配置，建议调整以下参数：

```postgresql
# postgresql.conf

# 连接配置
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB

# 慢查询日志
log_min_duration_statement = 1000  # 记录超过1秒的查询
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

# 查询统计
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all
```

## 实施计划

### 第一阶段：监控（立即执行）
- [x] 在健康检查API中添加连接池状态查询
- [ ] 创建连接池统计API
- [ ] 添加连接池告警（连接数超过80%）

### 第二阶段：优化（1周内）
- [ ] 分析慢查询日志
- [ ] 为常用查询添加索引
- [ ] 优化N+1查询
- [ ] 实现查询缓存

### 第三阶段：调优（根据监控数据）
- [ ] 根据实际负载调整连接池大小
- [ ] 优化 PostgreSQL 配置参数
- [ ] 实现连接池自动扩展

## 监控指标

需要定期监控的关键指标：

1. **连接数**
   - 总连接数：不应超过max_connections的80%
   - 活跃连接数：不应超过max_connections的50%
   - 空闲连接数：保持在5-10个

2. **查询性能**
   - 平均查询时间：<100ms
   - 慢查询数量：<10/分钟
   - 查询等待时间：<10ms

3. **锁等待**
   - 等待锁的连接数：<5
   - 锁等待时间：<1秒

## 告警规则

建议设置以下告警：

- 连接数 > 80% max_connections：立即告警
- 慢查询 > 10/分钟：警告告警
- 平均查询时间 > 200ms：警告告警
- 锁等待连接 > 5：立即告警

## 参考资料

- [PostgreSQL连接池最佳实践](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [pg_stat_statements文档](https://www.postgresql.org/docs/current/pgstatstatements.html)
- [数据库性能调优指南](https://wiki.postgresql.org/wiki/Performance_Optimization)
