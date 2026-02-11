/**
 * 数据库连接封装模块
 * 
 * 功能：
 * - 封装PostgreSQL连接
 * - 提供全局executeSQL函数执行原生SQL
 * - 所有数据库操作统一使用此函数
 * 
 * 使用方式：
 * import { executeSQL } from '@/app/lib/db';
 * 
 * // 查询单条数据
 * const result = await executeSQL('SELECT * FROM admins WHERE id = $1', [adminId]);
 * 
 * // 查询多条数据
 * const users = await executeSQL('SELECT * FROM users WHERE status = $1', ['active']);
 * 
 * // 执行增删改
 * await executeSQL('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', [username, passwordHash]);
 */

import { Pool, PoolConfig } from 'pg';

// 数据库连接配置（从环境变量读取）
const poolConfig: PoolConfig = {
  // 使用 DATABASE_URL（包含所有必要的连接参数和SSL设置）
  connectionString: process.env.DATABASE_URL,
  // 连接池配置
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时时间（30秒）
  connectionTimeoutMillis: 15000, // 连接超时时间（15秒）
};

// 创建连接池（单例模式，全局共享）
let pool: Pool | null = null;
let migrationChecked = false; // 标记是否已检查过迁移

/**
 * 检查并自动修复表结构
 * 确保数据库表结构与 Drizzle Schema 一致
 */
async function checkAndFixSchema(): Promise<void> {
  if (migrationChecked || !process.env.DATABASE_URL) {
    return;
  }

  try {
    console.log('[数据库初始化] 检查表结构...');

    // 检查 health_analysis 表是否存在
    const tablesExist = await pool!.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'health_analysis'
      )
    `);

    if (!tablesExist.rows[0].exists) {
      console.log('[数据库初始化] health_analysis 表不存在，跳过迁移检查');
      migrationChecked = true;
      return;
    }

    // 检查 id 列类型
    const columnInfo = await pool!.query(`
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'health_analysis' AND column_name = 'id'
    `);

    if (columnInfo.rows.length === 0) {
      console.warn('[数据库初始化] health_analysis.id 列不存在，需要手动修复');
      migrationChecked = true;
      return;
    }

    const currentType = columnInfo.rows[0].data_type;
    const maxLength = columnInfo.rows[0].character_maximum_length;

    // 检查是否需要修复（id 应该是 VARCHAR(36)）
    const needsFix = currentType !== 'character varying' || maxLength !== 36;

    if (!needsFix) {
      console.log('[数据库初始化] 表结构检查通过');
    } else {
      console.warn('[数据库初始化] 表结构不匹配，请调用 POST /api/migration/fix-health-analysis 手动修复');
    }

    migrationChecked = true;
  } catch (error) {
    console.error('[数据库初始化] 迁移检查失败:', error);
    // 不抛出错误，允许应用继续启动
    migrationChecked = true;
  }
}

/**
 * 获取数据库连接池
 * @returns Pool实例
 */
function getPool(): Pool {
  if (!pool) {
    pool = new Pool(poolConfig);

    // 监听连接错误
    pool.on('error', (err) => {
      console.error('[数据库连接池错误]', err);
    });

    console.log('[数据库] 连接池已创建');

    // 异步检查表结构（不阻塞启动）
    checkAndFixSchema().catch(err => {
      console.error('[数据库初始化] 异步检查失败:', err);
    });
  }
  return pool;
}

/**
 * 执行SQL语句（全局函数，所有模块复用）
 * 
 * @param sql - SQL语句（使用参数化查询，防SQL注入）
 * @param params - 参数数组（可选）
 * @returns 查询结果数组
 * @throws 数据库错误
 * 
 * @example
 * // 查询单条数据
 * const admins = await exec_sql('SELECT * FROM sys_admin WHERE username = $1', ['admin']);
 * const admin = admins[0];
 * 
 * // 插入数据
 * await exec_sql('INSERT INTO sys_admin (username, password) VALUES ($1, $2)', ['admin', '123456']);
 * 
 * // 更新数据
 * await exec_sql('UPDATE sys_admin SET update_time = NOW() WHERE admin_id = $1', [1]);
 * 
 * // 删除数据
 * await exec_sql('DELETE FROM sys_admin WHERE admin_id = $1', [1]);
 */
export async function exec_sql<T = any>(
  sql: string, 
  params: any[] = []
): Promise<T[]> {
  const pool = getPool();
  
  try {
    // 执行SQL查询
    const result = await pool.query(sql, params);
    
    // 返回查询结果（rows数组）
    return result.rows as T[];
  } catch (error) {
    // 详细输出错误信息
    console.error('[数据库执行错误]', {
      sql,
      params: params.map((p, i) => `$${i + 1} = ${typeof p === 'string' ? `'${p}'` : p}`).join(', '),
      errorType: typeof error,
      errorKeys: error ? Object.keys(error).join(', ') : 'null',
      error: error instanceof Error ? error.message : JSON.stringify(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // 抛出错误，由调用方处理
    throw new Error('数据库操作失败：' + (error instanceof Error ? error.message : JSON.stringify(error)));
  }
}

/**
 * 执行SQL语句并返回受影响的行数（用于INSERT/UPDATE/DELETE）
 * 
 * @param sql - SQL语句
 * @param params - 参数数组
 * @returns 受影响的行数
 */
export async function executeSQLWithCount(
  sql: string, 
  params: any[] = []
): Promise<number> {
  const pool = getPool();
  
  try {
    const result = await pool.query(sql, params);
    return result.rowCount || 0;
  } catch (error) {
    console.error('[数据库执行错误]', {
      sql,
      params,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('数据库操作失败：' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * 执行事务（批量操作）
 * 
 * @param callback - 事务回调函数，接收client参数
 * @returns 事务执行结果
 */
export async function executeTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    // 开始事务
    await client.query('BEGIN');
    
    // 执行回调
    const result = await callback(client);
    
    // 提交事务
    await client.query('COMMIT');
    
    return result;
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    
    console.error('[事务执行错误]', error);
    throw error;
  } finally {
    // 释放连接
    client.release();
  }
}

/**
 * 关闭数据库连接池（应用退出时调用）
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[数据库] 连接池已关闭');
  }
}

// 导出pool实例（用于特殊场景，如事务处理）
export { getPool };

// 类型定义
export type SQLResult<T = any> = {
  rows: T[];
  rowCount: number | null;
  fields: any[];
};

// 默认导出exec_sql函数（便于快速导入）
export default exec_sql;
