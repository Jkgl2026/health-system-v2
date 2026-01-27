import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertSymptomCheck } from '@/storage/database';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

// 创建速率限制器（中等模式：每分钟最多20次请求）
const symptomCheckRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 20,
  message: '请求过于频繁，请稍后再试',
});

// POST /api/symptom-check - 保存症状自检结果
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, symptomCheckRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

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
    return createErrorResponse(error);
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
    return createErrorResponse(error);
  }
}
