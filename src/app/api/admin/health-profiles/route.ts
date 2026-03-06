import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { healthProfiles } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

// GET /api/admin/health-profiles - 获取健康档案列表
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    const profiles = await db
      .select()
      .from(healthProfiles)
      .orderBy(desc(healthProfiles.updatedAt))
      .limit(100);

    // 转换字段名以匹配前端期望
    const formattedProfiles = profiles.map(p => ({
      id: p.id,
      user_id: p.userId,
      face_diagnosis_count: p.faceDiagnosisCount || 0,
      tongue_diagnosis_count: p.tongueDiagnosisCount || 0,
      latest_face_score: p.latestFaceScore,
      latest_tongue_score: p.latestTongueScore,
      latest_score: p.latestScore,
      constitution: p.constitution,
      created_at: p.updatedAt,
      updated_at: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProfiles,
    });
  } catch (error) {
    console.error('Error fetching health profiles:', error);
    return NextResponse.json(
      { success: false, error: '获取健康档案失败' },
      { status: 500 }
    );
  }
}
