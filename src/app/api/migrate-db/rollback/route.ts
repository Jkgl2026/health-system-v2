import { NextRequest, NextResponse } from 'next/server';
import { migrationManager } from '@/storage/database/migrationManager';

// POST /api/migrate-db/rollback - 回滚迁移
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { migrationId, createdBy = 'SYSTEM' } = body;

    if (!migrationId) {
      return NextResponse.json(
        { error: '缺少迁移ID' },
        { status: 400 }
      );
    }

    const result = await migrationManager.rollbackMigration(migrationId, {
      createdBy,
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
    console.error('Error rolling back migration:', error);
    return NextResponse.json(
      { error: '回滚迁移失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
