import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertSymptomCheck } from '@/storage/database';

// POST /api/symptom-check - 保存症状自检结果
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const checkData: InsertSymptomCheck = {
      userId: data.userId,
      checkedSymptoms: data.checkedSymptoms,
      totalScore: data.totalScore || null,
      elementScores: data.elementScores || null,
    };

    const check = await healthDataManager.createSymptomCheck(checkData);
    return NextResponse.json({ success: true, check }, { status: 201 });
  } catch (error) {
    console.error('Error creating symptom check:', error);
    return NextResponse.json(
      { error: '保存症状自检结果失败' },
      { status: 500 }
    );
  }
}

// GET /api/symptom-check - 获取用户的症状自检记录
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

    const checks = await healthDataManager.getSymptomChecksByUserId(userId);
    return NextResponse.json({ success: true, checks });
  } catch (error) {
    console.error('Error fetching symptom checks:', error);
    return NextResponse.json(
      { error: '获取症状自检记录失败' },
      { status: 500 }
    );
  }
}
