import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

// POST /api/backup/create - 创建数据库备份
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupType = 'FULL', previousBackupId, createdBy = 'SYSTEM', description } = body;

    if (backupType !== 'FULL' && backupType !== 'INCREMENTAL') {
      return NextResponse.json(
        { error: '无效的备份类型，必须是 FULL 或 INCREMENTAL' },
        { status: 400 }
      );
    }

    let metadata;
    if (backupType === 'FULL') {
      metadata = await backupManager.createFullBackup({
        createdBy,
        description,
      });
    } else {
      metadata = await backupManager.createIncrementalBackup({
        previousBackupId,
        createdBy,
        description,
      });
    }

    return NextResponse.json({
      success: true,
      message: '备份创建成功',
      data: metadata,
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: '创建备份失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
