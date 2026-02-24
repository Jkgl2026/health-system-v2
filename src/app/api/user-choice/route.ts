import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertUserChoice } from '@/storage/database';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

// 创建速率限制器（中等模式：每分钟最多20次请求）
const userChoiceRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 20,
  message: '请求过于频繁，请稍后再试',
});

// POST /api/user-choice - 保存用户选择
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, userChoiceRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();
    const choiceData: InsertUserChoice = {
      userId: data.userId,
      planType: data.planType,
      planDescription: data.planDescription || null,
    };

    const choice = await healthDataManager.createUserChoice(choiceData);
    return NextResponse.json({ success: true, choice }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/user-choice - 获取用户的选择记录
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

    const choices = await healthDataManager.getUserChoicesByUserId(userId);
    return NextResponse.json({ success: true, choices });
  } catch (error) {
    return createErrorResponse(error);
  }
}
