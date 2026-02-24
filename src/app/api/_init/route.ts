/**
 * 应用初始化 API
 *
 * 用途：在应用启动时自动检查并迁移数据库结构
 * 调用时机：
 * 1. 应用首次启动
 * 2. 代码部署后
 * 3. 数据库结构变更后
 */

import { NextResponse } from 'next/server';
import { ensureDatabaseSchema } from '@/lib/databaseMigration';

export async function GET() {
  try {
    console.log('[Init] 开始应用初始化...');

    // 执行数据库迁移
    const migrationResult = await ensureDatabaseSchema();

    if (!migrationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: '数据库迁移失败',
          errors: migrationResult.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '应用初始化完成',
      migrationsExecuted: migrationResult.executed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Init] 初始化失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '应用初始化失败',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
