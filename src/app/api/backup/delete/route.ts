import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

// DELETE /api/backup/delete?backupId=xxx - 删除备份
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const backupId = searchParams.get('backupId');

    if (!backupId) {
      return NextResponse.json(
        { error: '缺少备份ID' },
        { status: 400 }
      );
    }

    const success = await backupManager.deleteBackup(backupId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '备份删除成功',
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: '备份删除失败',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: '删除备份失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
