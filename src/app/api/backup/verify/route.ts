import { NextRequest, NextResponse } from 'next/server';
import { backupManager } from '@/storage/database/backupManager';

export const dynamic = 'force-dynamic';

// GET /api/backup/verify?backupId=xxx - 验证备份完整性
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const backupId = searchParams.get('backupId');

    if (!backupId) {
      return NextResponse.json(
        { error: '缺少备份ID' },
        { status: 400 }
      );
    }

    const verification = await backupManager.verifyBackup(backupId);

    return NextResponse.json({
      success: true,
      message: verification.valid ? '备份验证通过' : '备份验证失败',
      data: verification,
    }, { status: 200 });
  } catch (error) {
    console.error('Error verifying backup:', error);
    return NextResponse.json(
      { error: '验证备份失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
