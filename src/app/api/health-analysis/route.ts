import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertHealthAnalysis } from '@/storage/database';

// POST /api/health-analysis - 保存健康要素分析结果
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const analysisData: InsertHealthAnalysis = {
      userId: data.userId,
      qiAndBlood: data.qiAndBlood || null,
      circulation: data.circulation || null,
      toxins: data.toxins || null,
      bloodLipids: data.bloodLipids || null,
      coldness: data.coldness || null,
      immunity: data.immunity || null,
      emotions: data.emotions || null,
      overallHealth: data.overallHealth || null,
    };

    const analysis = await healthDataManager.createHealthAnalysis(analysisData);
    return NextResponse.json({ success: true, analysis }, { status: 201 });
  } catch (error) {
    console.error('Error creating health analysis:', error);
    return NextResponse.json(
      { error: '保存健康要素分析结果失败' },
      { status: 500 }
    );
  }
}

// GET /api/health-analysis - 获取用户的健康要素分析记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '必须提供 userId 参数' },
        { status: 400 }
      );
    }

    const analyses = await healthDataManager.getHealthAnalysisByUserId(userId);
    return NextResponse.json({ success: true, analyses });
  } catch (error) {
    console.error('Error fetching health analyses:', error);
    return NextResponse.json(
      { error: '获取健康要素分析记录失败' },
      { status: 500 }
    );
  }
}
