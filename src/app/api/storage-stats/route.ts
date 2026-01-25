import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements, admins, auditLogs } from '@/storage/database';
import { sql } from 'drizzle-orm';
import { S3Storage } from 'coze-coding-dev-sdk';

/**
 * 获取存储统计信息
 * GET /api/storage-stats
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // 获取数据库表大小信息（PostgreSQL 特定查询）
    const tableSizesResult = await db.execute(sql`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_total_relation_size(schemaname||'.'||tablename) AS total_size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    // 获取每个表的记录数
    const usersResult = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const symptomChecksResult = await db.select({ count: sql<number>`count(*)::int` }).from(symptomChecks);
    const healthAnalysisResult = await db.select({ count: sql<number>`count(*)::int` }).from(healthAnalysis);
    const userChoicesResult = await db.select({ count: sql<number>`count(*)::int` }).from(userChoices);
    const requirementsResult = await db.select({ count: sql<number>`count(*)::int` }).from(requirements);
    const adminsResult = await db.select({ count: sql<number>`count(*)::int` }).from(admins);
    const auditLogsResult = await db.select({ count: sql<number>`count(*)::int` }).from(auditLogs);

    const usersCount = usersResult[0];
    const symptomChecksCount = symptomChecksResult[0];
    const healthAnalysisCount = healthAnalysisResult[0];
    const userChoicesCount = userChoicesResult[0];
    const requirementsCount = requirementsResult[0];
    const adminsCount = adminsResult[0];
    const auditLogsCount = auditLogsResult[0];

    // 获取数据库总大小
    const dbSizeResult = await db.execute(sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS total_size,
             pg_database_size(current_database()) AS total_size_bytes
    `);

    // 尝试获取对象存储统计信息
    let backupStats = {
      totalBackupFiles: 0,
      totalSize: 0,
      totalSizePretty: '0 B',
      oldestBackup: null as string | null,
      newestBackup: null as string | null,
    };

    try {
      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: '',
        secretKey: '',
        bucketName: process.env.COZE_BUCKET_NAME,
        region: 'cn-beijing',
      });

      // 列出所有备份文件
      const listResult = await storage.listFiles({
        prefix: 'backups/',
        maxKeys: 1000,
      });

      if (listResult.keys.length > 0) {
        backupStats.totalBackupFiles = listResult.keys.length;

        // 计算总大小（这里假设所有文件都是备份文件，实际可能需要从文件名或元数据判断）
        // 由于 S3Storage.listFiles 不直接返回文件大小，我们只能估算
        // 实际应用中可能需要调用 headObject 获取每个文件的大小
        backupStats.totalSizePretty = 'N/A (需要单独查询每个文件)';
        backupStats.totalSize = 0; // 无法直接获取

        // 从文件名提取日期信息
        const backupFiles = listResult.keys.filter(key => key.startsWith('backups/backup-'));
        if (backupFiles.length > 0) {
          const dates = backupFiles.map(key => {
            const match = key.match(/backup-(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : null;
          }).filter((d): d is string => d !== null).sort();

          if (dates.length > 0) {
            backupStats.oldestBackup = dates[0];
            backupStats.newestBackup = dates[dates.length - 1];
          }
        }
      }
    } catch (error) {
      console.error('获取对象存储统计信息失败:', error);
      backupStats.totalSizePretty = 'Error: 无法获取';
    }

    // 计算单个用户的平均数据量
    const totalRecords =
      usersCount.count +
      symptomChecksCount.count +
      healthAnalysisCount.count +
      userChoicesCount.count +
      requirementsCount.count +
      adminsCount.count +
      auditLogsCount.count;

    const userCount = usersCount?.count || 1; // 避免除以零
    const avgDataPerUser = dbSizeResult.rows[0]?.total_size_bytes / userCount;

    return NextResponse.json({
      success: true,
      data: {
        databaseSize: {
          total: dbSizeResult.rows[0]?.total_size_bytes || 0,
          totalPretty: dbSizeResult.rows[0]?.total_size || 'Unknown',
          avgPerUser: avgDataPerUser,
          avgPerUserPretty: formatBytes(avgDataPerUser),
          usagePercent: Math.min(100, ((dbSizeResult.rows[0]?.total_size_bytes || 0) / (10 * 1024 * 1024 * 1024)) * 100),
          // 假设最大容量为 10 GB
          estimatedMaxUsers: Math.floor((10 * 1024 * 1024 * 1024) / avgDataPerUser),
        },
        objectStorage: backupStats,
        recordCounts: {
          users: usersCount?.count || 0,
          symptomChecks: symptomChecksCount?.count || 0,
          healthAnalysis: healthAnalysisCount?.count || 0,
          userChoices: userChoicesCount?.count || 0,
          requirements: requirementsCount?.count || 0,
          admins: adminsCount?.count || 0,
          auditLogs: auditLogsCount?.count || 0,
          total: totalRecords,
        },
        tableSizes: (tableSizesResult.rows as any[]).map(row => ({
          tableName: row.tablename,
          totalSize: row.total_size_bytes,
          totalSizePretty: row.total_size,
        })),
      },
    });
  } catch (error) {
    console.error('获取存储统计信息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取存储统计信息失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 格式化字节数为易读格式
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
