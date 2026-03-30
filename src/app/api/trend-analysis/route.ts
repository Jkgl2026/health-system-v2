import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trendType, dateRange } = body;

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    const db = await getDb();

    // 获取所有检测记录
    let whereClause = sql`user_id = ${userId}`;
    if (dateRange && dateRange.startDate) {
      whereClause = sql`${whereClause} AND created_at >= ${dateRange.startDate}`;
    }
    if (dateRange && dateRange.endDate) {
      whereClause = sql`${whereClause} AND created_at <= ${dateRange.endDate}`;
    }

    // 获取面诊趋势
    const faceTrend = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        AVG(overall_score) as score
      FROM face_diagnosis_records
      WHERE ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 获取舌诊趋势
    const tongueTrend = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        AVG(overall_score) as score
      FROM tongue_diagnosis_records
      WHERE ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 获取体态趋势
    const postureTrend = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        AVG(overall_score) as score
      FROM posture_assessments
      WHERE ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 获取生理年龄趋势
    const biologicalAgeTrend = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        AVG(100 - age_difference) as score
      FROM biological_age_records
      WHERE ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 保存趋势数据到健康趋势表
    const trendData = {
      face: faceTrend.rows || [],
      tongue: tongueTrend.rows || [],
      posture: postureTrend.rows || [],
      biologicalAge: biologicalAgeTrend.rows || [],
    };

    await db.execute(sql`
      INSERT INTO health_trends (user_id, trend_type, trend_data, recorded_at)
      VALUES (${userId}, ${trendType || 'comprehensive'}, ${JSON.stringify(trendData)}, CURRENT_DATE)
    `);

    // 分析趋势
    const analysis = analyzeTrends(trendData);

    return NextResponse.json({
      success: true,
      data: {
        trendData,
        analysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[TrendAnalysis] 分析失败:', error);
    return NextResponse.json({ error: '趋势分析失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

function analyzeTrends(trendData: any): any {
  const analysis: any = {
    overallTrend: 'stable',
    trendSummary: [],
    improvingAreas: [],
    decliningAreas: [],
    stableAreas: [],
  };

  // 分析各个趋势
  for (const [key, data] of Object.entries(trendData)) {
    if (!data || !Array.isArray(data) || data.length < 2) {
      analysis.stableAreas.push(key);
      continue;
    }

    const firstScore = data[0].score || 0;
    const lastScore = data[data.length - 1].score || 0;
    const change = lastScore - firstScore;
    const changePercent = firstScore > 0 ? (change / firstScore) * 100 : 0;

    if (change > 5) {
      analysis.improvingAreas.push({
        area: key,
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
      });
      analysis.trendSummary.push(`${key}: 改善 +${change.toFixed(2)}分 (+${changePercent.toFixed(2)}%)`);
    } else if (change < -5) {
      analysis.decliningAreas.push({
        area: key,
        change: change.toFixed(2),
        changePercent: changePercent.toFixed(2),
      });
      analysis.trendSummary.push(`${key}: 下降 ${change.toFixed(2)}分 (${changePercent.toFixed(2)}%)`);
    } else {
      analysis.stableAreas.push(key);
      analysis.trendSummary.push(`${key}: 稳定 (${change.toFixed(2)}分)`);
    }
  }

  // 判断整体趋势
  if (analysis.improvingAreas.length > analysis.decliningAreas.length) {
    analysis.overallTrend = 'improving';
  } else if (analysis.decliningAreas.length > analysis.improvingAreas.length) {
    analysis.overallTrend = 'declining';
  }

  return analysis;
}
