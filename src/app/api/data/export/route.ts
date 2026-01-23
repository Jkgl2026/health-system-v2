import { NextRequest, NextResponse } from 'next/server';
import { exportManager } from '@/storage/database/exportManager';

// POST /api/data/export - 导出所有数据并上传到对象存储
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createdBy = 'SYSTEM', description } = body;

    const result = await exportManager.exportAndUpload({
      createdBy,
      description,
    });

    return NextResponse.json({
      success: true,
      message: '数据导出成功',
      data: result,
    }, { status: 200 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: '导出数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET /api/data/export - 导出所有数据（直接返回JSON）
export async function GET(request: NextRequest) {
  try {
    const exportData = await exportManager.exportAllData({
      createdBy: 'SYSTEM',
    });

    return NextResponse.json({
      success: true,
      message: '数据导出成功',
      data: exportData,
    }, { status: 200 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: '导出数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
