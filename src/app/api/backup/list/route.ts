import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

// GET /api/backup/list - 列出所有备份
export async function GET(request: NextRequest) {
  try {
    const backups = await backupManager.listBackups();

    return NextResponse.json({
      success: true,
      message: '获取备份列表成功',
      data: {
        count: backups.length,
        backups: backups.map(backup => ({
          backupId: backup.backupId,
          backupType: backup.backupType,
          backupDate: backup.backupDate,
          tableCount: backup.tableCount,
          totalRecords: backup.totalRecords,
          fileSize: `${(backup.fileSize / 1024).toFixed(2)} KB`,
          previousBackupId: backup.previousBackupId,
          checksum: backup.checksum,
          createdBy: backup.createdBy,
        })),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { error: '获取备份列表失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
