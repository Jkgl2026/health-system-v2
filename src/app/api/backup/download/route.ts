import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

export const dynamic = 'force-dynamic';

// GET /api/backup/download?backupId=xxx - 生成备份下载URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const backupId = searchParams.get('backupId');
    const expireTime = parseInt(searchParams.get('expireTime') || '3600', 10);

    if (!backupId) {
      return NextResponse.json(
        { error: '缺少备份ID' },
        { status: 400 }
      );
    }

    const url = await backupManager.getBackupDownloadUrl(backupId, expireTime);

    if (url) {
      return NextResponse.json({
        success: true,
        message: '生成下载URL成功',
        data: {
          downloadUrl: url,
          expireTime,
          backupId,
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: '生成下载URL失败',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: '生成下载URL失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
