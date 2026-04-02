import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// 创建或更新健康档案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bloodPressure, heartRate, bloodSugar, cholesterol, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    const db = await getDb();

    // 构建健康数据对象
    const healthData = {
      bloodPressure: bloodPressure || null,
      heartRate: heartRate || null,
      bloodSugar: bloodSugar || null,
      cholesterol: cholesterol || null,
      notes: notes || null,
      updatedAt: new Date().toISOString()
    };

    // 检查档案是否已存在
    const existingProfile = await db.execute(
      sql`SELECT id, constitution FROM health_profiles WHERE user_id = ${userId}`
    );

    if (existingProfile.rows?.length > 0) {
      // 更新现有档案
      await db.execute(sql`
        UPDATE health_profiles
        SET constitution = COALESCE(${JSON.stringify(healthData)}, constitution),
            updated_at = NOW()
        WHERE user_id = ${userId}
      `);
    } else {
      // 创建新档案
      const profileId = crypto.randomUUID();
      await db.execute(sql`
        INSERT INTO health_profiles (id, user_id, constitution, updated_at)
        VALUES (${profileId}, ${userId}, ${JSON.stringify(healthData)}, NOW())
      `);
    }

    return NextResponse.json({
      success: true,
      message: '健康档案保存成功'
    });
  } catch (error) {
    console.error('[HealthProfile] 保存失败:', error);
    return NextResponse.json({ error: '健康档案保存失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// 获取健康档案
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.execute(
      sql`SELECT * FROM health_profiles WHERE user_id = ${userId}`
    );

    if (result.rows?.length === 0) {
      return NextResponse.json({ error: '未找到健康档案' }, { status: 404 });
    }

    const profile = result.rows[0];

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('[HealthProfile] 获取失败:', error);
    return NextResponse.json({ error: '获取健康档案失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
