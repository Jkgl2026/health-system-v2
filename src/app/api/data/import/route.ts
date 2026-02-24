import { NextRequest, NextResponse } from 'next/server';
import { exportManager } from '@/storage/database/exportManager';
import { S3Storage } from "coze-coding-dev-sdk";

// POST /api/data/import - 从JSON导入数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exportData, fileKey, createdBy = 'SYSTEM', overwrite = false, description } = body;

    let dataToImport = exportData;

    // 如果提供了 fileKey，从对象存储加载
    if (!dataToImport && fileKey) {
      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: "",
        secretKey: "",
        bucketName: process.env.COZE_BUCKET_NAME,
        region: "cn-beijing",
      });
      const fileContent = await storage.readFile({ fileKey });
      dataToImport = JSON.parse(fileContent.toString('utf-8'));
    }

    if (!dataToImport) {
      return NextResponse.json(
        { error: '缺少导出数据或文件路径' },
        { status: 400 }
      );
    }

    const result = await exportManager.importData(dataToImport, {
      createdBy,
      overwrite,
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
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: '导入数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
