import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

// GET /api/admin/health-profiles - 获取健康档案列表
// 注意：health_profiles 表不由 Drizzle 管理，使用原始 SQL 查询
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    const result = await db.execute(`
      SELECT 
        id,
        user_id,
        face_diagnosis_count,
        tongue_diagnosis_count,
        latest_face_score,
        latest_tongue_score,
        latest_score,
        constitution,
        updated_at
      FROM health_profiles
      ORDER BY updated_at DESC
      LIMIT 100
    `);

    // 转换字段名以匹配前端期望
    const formattedProfiles = result.rows.map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      face_diagnosis_count: p.face_diagnosis_count || 0,
      tongue_diagnosis_count: p.tongue_diagnosis_count || 0,
      latest_face_score: p.latest_face_score,
      latest_tongue_score: p.latest_tongue_score,
      latest_score: p.latest_score,
      constitution: p.constitution,
      created_at: p.updated_at,
      updated_at: p.updated_at,
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
