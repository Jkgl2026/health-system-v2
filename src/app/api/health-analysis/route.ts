import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertHealthAnalysis } from '@/storage/database';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

// 创建速率限制器（中等模式：每分钟最多20次请求）
const healthAnalysisRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 20,
  message: '请求过于频繁，请稍后再试',
});

// POST /api/health-analysis - 保存健康要素分析结果
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, healthAnalysisRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

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
    return createErrorResponse(error);
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
    return createErrorResponse(error);
  }
}
