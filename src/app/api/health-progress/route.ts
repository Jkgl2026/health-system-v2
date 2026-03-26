import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// GET /api/health-progress - 获取健康改善进度数据
// 注意：诊断表不由 Drizzle 管理，使用原始 SQL 查询
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 获取面诊记录（按时间排序）- 使用原始SQL
    const faceResult = await db.execute(sql`
      SELECT id, constitution, diagnosis_date as created_at, features, recommendations
      FROM face_diagnosis_records
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at ASC
      LIMIT 20
    `);
    const faceRecords = faceResult.rows;

    // 获取舌诊记录（按时间排序）- 使用原始SQL
    const tongueResult = await db.execute(sql`
      SELECT id, constitution, diagnosis_date as created_at, features, recommendations
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

    // 计算评分趋势（注意：远端数据库中没有 score 字段，使用 features 字段计算）
    const scoreTrend = allRecords.map((r: any) => ({
      date: new Date(r.created_at).toLocaleDateString('zh-CN'),
      score: r.features && typeof r.features === 'object' ? r.features.score || 0 : 0,
      type: r.type,
    }));

    // 计算五脏状态趋势（取最近的记录，注意：远端数据库中使用 features 字段）
    const organTrend: any = { heart: [], liver: [], spleen: [], lung: [], kidney: [] };
    allRecords.forEach((r: any) => {
      if (r.features && typeof r.features === 'object') {
        Object.keys(organTrend).forEach(organ => {
          if (r.features && r.features[organ]) {
            organTrend[organ].push({
              date: new Date(r.created_at).toLocaleDateString('zh-CN'),
              value: r.features[organ],
            });
          }
        });
      }
    });

    // 统计体质分布
    const constitutionCount: Record<string, number> = {};
    allRecords.forEach((r: any) => {
      if (r.constitution) {
        const constitution = typeof r.constitution === 'string' ? r.constitution : r.constitution.type;
        if (constitution) {
          constitutionCount[constitution] = (constitutionCount[constitution] || 0) + 1;
        }
      }
    });

    // 获取最新评分（注意：远端数据库中没有 score 字段，使用 features 字段计算）
    const latestFace = faceRecords && faceRecords.length > 0 ? faceRecords[faceRecords.length - 1] : null;
    const latestTongue = tongueRecords && tongueRecords.length > 0 ? tongueRecords[tongueRecords.length - 1] : null;

    // 计算改善情况
    let improvement = null;
    if (allRecords.length >= 2) {
      const firstRecord = allRecords[0];
      const lastRecord = allRecords[allRecords.length - 1];
      const firstScore = firstRecord.features && typeof firstRecord.features === 'object' ? firstRecord.features.score || 0 : 0;
      const lastScore = lastRecord.features && typeof lastRecord.features === 'object' ? lastRecord.features.score || 0 : 0;
      if (firstScore || lastScore) {
        improvement = {
          from: firstScore,
          to: lastScore,
          change: lastScore - firstScore,
          percent: firstScore ? Math.round(((lastScore - firstScore) / firstScore) * 100) : 0,
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
          face: latestFace?.features && typeof latestFace.features === 'object' ? (latestFace.features as any).score || null : null,
          tongue: latestTongue?.features && typeof latestTongue.features === 'object' ? (latestTongue.features as any).score || null : null,
          overall: null, // 需要根据实际业务逻辑计算
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
