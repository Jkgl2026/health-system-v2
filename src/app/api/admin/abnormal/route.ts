import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, healthAnalysis, symptomChecks } from '@/storage/database/shared/schema';
import { eq, and, lt, gt, isNotNull, desc } from 'drizzle-orm';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// 异常阈值配置
const DEFAULT_THRESHOLDS = {
  overallHealth: { min: 0, max: 60, label: '综合健康分' },
  qiAndBlood: { min: 0, max: 50, label: '气血' },
  circulation: { min: 0, max: 50, label: '循环' },
  toxins: { min: 0, max: 50, label: '毒素' },
  bloodLipids: { min: 0, max: 50, label: '血脂' },
  coldness: { min: 0, max: 50, label: '寒凉' },
  immunity: { min: 0, max: 50, label: '免疫' },
  emotions: { min: 0, max: 50, label: '情绪' },
};

// GET - 获取异常指标用户列表
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const thresholds = searchParams.get('thresholds');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 解析阈值配置
    let thresholdConfig = DEFAULT_THRESHOLDS;
    if (thresholds) {
      try {
        thresholdConfig = JSON.parse(thresholds);
      } catch (e) {
        console.error('阈值解析失败:', e);
      }
    }

    const db = await getDb();

    // 获取最新的健康分析数据
    const allAnalysis = await db
      .select({
        analysis: healthAnalysis,
        user: users,
      })
      .from(healthAnalysis)
      .innerJoin(users, eq(healthAnalysis.userId, users.id))
      .where(isNotNull(healthAnalysis.overallHealth))
      .orderBy(desc(healthAnalysis.analyzedAt));

    // 筛选异常用户
    const abnormalUsers: any[] = [];
    const userMap = new Map();

    for (const item of allAnalysis) {
      // 只保留每个用户的最新记录
      if (userMap.has(item.user.id)) continue;
      userMap.set(item.user.id, true);

      const analysis = item.analysis;
      const abnormalItems: string[] = [];
      let hasAbnormal = false;

      // 检查各指标是否异常
      for (const [key, config] of Object.entries(thresholdConfig)) {
        const value = analysis[key as keyof typeof analysis];
        if (value !== null && value !== undefined) {
          const { min, max, label } = config as { min: number; max: number; label: string };
          if (Number(value) < max) {
            abnormalItems.push(`${label}: ${value}`);
            hasAbnormal = true;
          }
        }
      }

      if (hasAbnormal) {
        abnormalUsers.push({
          user: item.user,
          analysis: analysis,
          abnormalItems,
          overallHealth: analysis.overallHealth,
        });
      }
    }

    // 分页
    const total = abnormalUsers.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedUsers = abnormalUsers.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      summary: {
        totalAbnormal: total,
        byElement: Object.fromEntries(
          Object.keys(thresholdConfig).map(key => [
            key,
            abnormalUsers.filter((u: any) => u.abnormalItems.some((item: string) => item.includes(thresholdConfig[key as keyof typeof thresholdConfig].label))).length
          ])
        ),
      },
    });
  } catch (error) {
    console.error('获取异常指标用户失败:', error);
    return NextResponse.json(
      { success: false, error: '获取异常指标用户失败' },
      { status: 500 }
    );
  }
}
