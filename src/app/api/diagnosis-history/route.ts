import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

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
      // 使用原始SQL查询面诊记录（注意：远端数据库中使用 diagnosis_date 而不是 created_at）
      const faceResult = await db.execute(sql`
        SELECT id, user_id, constitution, diagnosis_date as created_at
        FROM face_diagnosis_records
        ${userId ? sql`WHERE user_id = ${userId}` : sql``}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      records = [...records, ...faceResult.rows.map((r: any) => ({ ...r, type: 'face' as const }))];
    }

    if (type === 'all' || type === 'tongue') {
      // 使用原始SQL查询舌诊记录（注意：远端数据库中使用 diagnosis_date 而不是 created_at）
      const tongueResult = await db.execute(sql`
        SELECT id, user_id, constitution, diagnosis_date as created_at
        FROM tongue_diagnosis_records
        ${userId ? sql`WHERE user_id = ${userId}` : sql``}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      records = [...records, ...tongueResult.rows.map((r: any) => ({ ...r, type: 'tongue' as const }))];
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
