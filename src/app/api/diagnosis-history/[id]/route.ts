import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { faceDiagnosisRecords, tongueDiagnosisRecords } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// GET /api/diagnosis-history/[id] - 获取单条诊断记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // face or tongue

    if (!type || (type !== 'face' && type !== 'tongue')) {
      return NextResponse.json(
        { success: false, error: '缺少type参数或type参数无效' },
        { status: 400 }
      );
    }

    const db = await getDb();

    let record: any;

    if (type === 'face') {
      const result = await db
        .select()
        .from(faceDiagnosisRecords)
        .where(eq(faceDiagnosisRecords.id, id))
        .limit(1);

      record = result[0];
    } else {
      const result = await db
        .select()
        .from(tongueDiagnosisRecords)
        .where(eq(tongueDiagnosisRecords.id, id))
        .limit(1);

      record = result[0];
    }

    if (!record) {
      return NextResponse.json(
        { success: false, error: '记录不存在' },
        { status: 404 }
      );
    }

    // 解析 JSON 字段
    const parseJson = (data: any) => {
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    };

    const formattedRecord = {
      ...record,
      type,
      organ_status: parseJson(record.organStatus),
      constitution: parseJson(record.constitution),
      recommendations: parseJson(record.suggestions),
      diagnosis_details: parseJson(record.tongueBody || record.faceColor),
      full_report: record.fullReport,
    };

    return NextResponse.json({
      success: true,
      data: formattedRecord,
    });
  } catch (error) {
    console.error('Error fetching diagnosis record:', error);
    return NextResponse.json(
      { success: false, error: '获取记录详情失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/diagnosis-history/[id] - 删除诊断记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // face or tongue

    if (!type || (type !== 'face' && type !== 'tongue')) {
      return NextResponse.json(
        { success: false, error: '缺少type参数或type参数无效' },
        { status: 400 }
      );
    }

    const db = await getDb();

    if (type === 'face') {
      await db.delete(faceDiagnosisRecords).where(eq(faceDiagnosisRecords.id, id));
    } else {
      await db.delete(tongueDiagnosisRecords).where(eq(tongueDiagnosisRecords.id, id));
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('Error deleting diagnosis record:', error);
    return NextResponse.json(
      { success: false, error: '删除记录失败' },
      { status: 500 }
    );
  }
}
