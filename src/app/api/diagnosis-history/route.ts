import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { faceDiagnosisRecords, tongueDiagnosisRecords } from '@/storage/database/shared/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

// GET /api/diagnosis-history - 获取诊断历史记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, face, tongue
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');

    const db = await getDb();

    let records: any[] = [];

    if (type === 'all' || type === 'face') {
      const faceRecords = await db
        .select({
          id: faceDiagnosisRecords.id,
          user_id: faceDiagnosisRecords.userId,
          score: faceDiagnosisRecords.score,
          constitution: faceDiagnosisRecords.constitution,
          created_at: faceDiagnosisRecords.createdAt,
        })
        .from(faceDiagnosisRecords)
        .where(userId ? eq(faceDiagnosisRecords.userId, userId) : sql`1=1`)
        .orderBy(desc(faceDiagnosisRecords.createdAt))
        .limit(limit)
        .offset(offset);

      records = [...records, ...faceRecords.map(r => ({ ...r, type: 'face' as const }))];
    }

    if (type === 'all' || type === 'tongue') {
      const tongueRecords = await db
        .select({
          id: tongueDiagnosisRecords.id,
          user_id: tongueDiagnosisRecords.userId,
          score: tongueDiagnosisRecords.score,
          constitution: tongueDiagnosisRecords.constitution,
          created_at: tongueDiagnosisRecords.createdAt,
        })
        .from(tongueDiagnosisRecords)
        .where(userId ? eq(tongueDiagnosisRecords.userId, userId) : sql`1=1`)
        .orderBy(desc(tongueDiagnosisRecords.createdAt))
        .limit(limit)
        .offset(offset);

      records = [...records, ...tongueRecords.map(r => ({ ...r, type: 'tongue' as const }))];
    }

    // 按时间排序
    records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 限制总数
    if (type === 'all') {
      records = records.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching diagnosis history:', error);
    return NextResponse.json(
      { success: false, error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}
