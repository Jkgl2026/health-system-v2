import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

// POST /api/backup/restore - 从备份恢复数据库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, createdBy = 'SYSTEM', description } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: '缺少备份ID' },
        { status: 400 }
      );
    }

    const result = await backupManager.restoreFromBackup(backupId, {
      createdBy,
      description,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.details,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        details: result.details,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return NextResponse.json(
      { error: '恢复数据库失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
