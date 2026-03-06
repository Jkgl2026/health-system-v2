import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { faceDiagnosisRecords, tongueDiagnosisRecords, healthProfiles } from '@/storage/database/shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/health-progress - 获取健康改善进度数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 获取面诊记录（按时间排序）
    const faceRecords = await db
      .select({
        id: faceDiagnosisRecords.id,
        score: faceDiagnosisRecords.score,
        organStatus: faceDiagnosisRecords.organStatus,
        constitution: faceDiagnosisRecords.constitution,
        createdAt: faceDiagnosisRecords.createdAt,
      })
      .from(faceDiagnosisRecords)
      .where(userId ? eq(faceDiagnosisRecords.userId, userId) : sql`1=1`)
      .orderBy(faceDiagnosisRecords.createdAt)
      .limit(20);

    // 获取舌诊记录（按时间排序）
    const tongueRecords = await db
      .select({
        id: tongueDiagnosisRecords.id,
        score: tongueDiagnosisRecords.score,
        organStatus: tongueDiagnosisRecords.organStatus,
        constitution: tongueDiagnosisRecords.constitution,
        createdAt: tongueDiagnosisRecords.createdAt,
      })
      .from(tongueDiagnosisRecords)
      .where(userId ? eq(tongueDiagnosisRecords.userId, userId) : sql`1=1`)
      .orderBy(tongueDiagnosisRecords.createdAt)
      .limit(20);

    // 合并并按时间排序
    const allRecords = [
      ...(faceRecords || []).map((r: any) => ({ ...r, type: 'face', created_at: r.createdAt })),
      ...(tongueRecords || []).map((r: any) => ({ ...r, type: 'tongue', created_at: r.createdAt })),
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
      if (r.organStatus) {
        const organStatus = typeof r.organStatus === 'string' ? JSON.parse(r.organStatus) : r.organStatus;
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
