import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { migrationManager } from '@/storage/database/migrationManager';

// GET /api/migrate-db/history - 获取迁移历史
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const history = await migrationManager.getMigrationHistory(limit);

    return NextResponse.json({
      success: true,
      message: '获取迁移历史成功',
      data: {
        count: history.length,
        migrations: history,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error getting migration history:', error);
    return NextResponse.json(
      { error: '获取迁移历史失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
