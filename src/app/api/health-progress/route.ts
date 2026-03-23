import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { healthProfiles } from '@/storage/database/shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/health-progress - 获取健康改善进度数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 获取面诊记录（按时间排序）- 使用原始SQL
    const faceResult = await db.execute(sql`
      SELECT id, score, organ_status, constitution, created_at 
      FROM face_diagnosis_records 
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at ASC 
      LIMIT 20
    `);
    const faceRecords = faceResult.rows;

    // 获取舌诊记录（按时间排序）- 使用原始SQL
    const tongueResult = await db.execute(sql`
      SELECT id, score, organ_status, constitution, created_at 
      FROM tongue_diagnosis_records 
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at ASC 
      LIMIT 20
    `);
    const tongueRecords = tongueResult.rows;

    // 合并并按时间排序
    const allRecords = [
      ...(faceRecords || []).map((r: any) => ({ ...r, type: 'face', created_at: r.created_at })),
      ...(tongueRecords || []).map((r: any) => ({ ...r, type: 'tongue', created_at: r.created_at })),
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 计算评分趋势
    const scoreTrend = allRecords.map((r: any) => ({
      date: new Date(r.created_at).toLocaleDateString('zh-CN'),
      score: r.score,
      type: r.type,
    }));

    // 计算五脏状态趋势（取最近的记录）
    const organTrend: any = { heart: [], liver: [], spleen: [], lung: [], kidney: [] };
    allRecords.forEach((r: any) => {
      if (r.organ_status) {
        const organStatus = typeof r.organ_status === 'string' ? JSON.parse(r.organ_status) : r.organ_status;
        Object.keys(organTrend).forEach(organ => {
          if (organStatus && organStatus[organ]) {
            organTrend[organ].push({
              date: new Date(r.created_at).toLocaleDateString('zh-CN'),
              value: organStatus[organ],
            });
          }
        });
      }
    });

    // 统计体质分布
    const constitutionCount: Record<string, number> = {};
    allRecords.forEach((r: any) => {
      if (r.constitution) {
        const constitution = typeof r.constitution === 'string' ? JSON.parse(r.constitution) : r.constitution;
        if (constitution && constitution.type) {
          constitutionCount[constitution.type] = (constitutionCount[constitution.type] || 0) + 1;
        }
      }
    });

    // 获取最新评分
    const latestFace = faceRecords && faceRecords.length > 0 ? faceRecords[faceRecords.length - 1] : null;
    const latestTongue = tongueRecords && tongueRecords.length > 0 ? tongueRecords[tongueRecords.length - 1] : null;

    // 计算改善情况
    let improvement = null;
    if (allRecords.length >= 2) {
      const firstRecord = allRecords[0];
      const lastRecord = allRecords[allRecords.length - 1];
      if (firstRecord.score && lastRecord.score) {
        improvement = {
          from: firstRecord.score,
          to: lastRecord.score,
          change: lastRecord.score - firstRecord.score,
          percent: Math.round(((lastRecord.score - firstRecord.score) / firstRecord.score) * 100),
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRecords: allRecords.length,
        faceRecords: faceRecords?.length || 0,
        tongueRecords: tongueRecords?.length || 0,
        scoreTrend,
        organTrend,
        constitutionDistribution: Object.entries(constitutionCount).map(([type, count]) => ({ type, count })),
        latestScores: {
          face: latestFace?.score || null,
          tongue: latestTongue?.score || null,
          overall: latestFace?.score && latestTongue?.score 
            ? Math.round((Number(latestFace.score) + Number(latestTongue.score)) / 2) 
            : (latestFace?.score || latestTongue?.score || null),
        },
        improvement,
      },
    });
  } catch (error) {
    console.error('Error fetching health progress:', error);
    return NextResponse.json(
      { success: false, error: '获取健康进度失败' },
      { status: 500 }
    );
  }
}
