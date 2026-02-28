import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { desc, count, sql } from 'drizzle-orm';

// GET /api/debug/db-stats - 查看数据库统计
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // 统计各表记录数
    const userCount = await db.select({ count: count() }).from(users);
    const symptomCount = await db.select({ count: count() }).from(symptomChecks);
    const analysisCount = await db.select({ count: count() }).from(healthAnalysis);
    const choiceCount = await db.select({ count: count() }).from(userChoices);
    const reqCount = await db.select({ count: count() }).from(requirements);
    
    // 获取最近5个用户
    const recentUsers = await db.select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.createdAt)).limit(5);
    
    return NextResponse.json({
      success: true,
      stats: {
        users: userCount[0]?.count || 0,
        symptomChecks: symptomCount[0]?.count || 0,
        healthAnalysis: analysisCount[0]?.count || 0,
        userChoices: choiceCount[0]?.count || 0,
        requirements: reqCount[0]?.count || 0
      },
      recentUsers
    });
  } catch (error) {
    console.error('数据库统计失败:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
