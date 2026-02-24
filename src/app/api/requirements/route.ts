import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertRequirement } from '@/storage/database';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

// 创建速率限制器（中等模式：每分钟最多20次请求）
const requirementsRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 20,
  message: '请求过于频繁，请稍后再试',
});

// POST /api/requirements - 创建或更新四个要求的完成情况
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, requirementsRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();

    // 检查是否已存在
    const existing = await healthDataManager.getRequirementByUserId(data.userId);

    let requirement;
    if (existing) {
      // 只更新传递的字段，保留其他字段的值
      const updateData: Partial<InsertRequirement> = {
        userId: data.userId,
        updatedAt: new Date(),
      };

      // 只添加传递的字段
      if (data.requirement1Completed !== undefined) updateData.requirement1Completed = data.requirement1Completed;
      if (data.requirement2Completed !== undefined) updateData.requirement2Completed = data.requirement2Completed;
      if (data.requirement3Completed !== undefined) updateData.requirement3Completed = data.requirement3Completed;
      if (data.requirement4Completed !== undefined) updateData.requirement4Completed = data.requirement4Completed;
      if (data.requirement2Answers !== undefined) updateData.requirement2Answers = data.requirement2Answers;
      if (data.sevenQuestionsAnswers !== undefined) updateData.sevenQuestionsAnswers = data.sevenQuestionsAnswers;
      if (data.badHabitsChecklist !== undefined) updateData.badHabitsChecklist = data.badHabitsChecklist;
      if (data.symptoms300Checklist !== undefined) updateData.symptoms300Checklist = data.symptoms300Checklist;

      requirement = await healthDataManager.updateRequirement(data.userId, updateData);
    } else {
      // 创建新记录，使用默认值
      const requirementData: InsertRequirement = {
        userId: data.userId,
        requirement1Completed: data.requirement1Completed || false,
        requirement2Completed: data.requirement2Completed || false,
        requirement3Completed: data.requirement3Completed || false,
        requirement4Completed: data.requirement4Completed || false,
        requirement2Answers: data.requirement2Answers || null,
        sevenQuestionsAnswers: data.sevenQuestionsAnswers || null,
        badHabitsChecklist: data.badHabitsChecklist || null,
        symptoms300Checklist: data.symptoms300Checklist || null,
      };
      requirement = await healthDataManager.createRequirement(requirementData);
    }

    return NextResponse.json({ success: true, requirement }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/requirements - 获取用户的四个要求完成情况
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

    const requirement = await healthDataManager.getRequirementByUserId(userId);

    if (!requirement) {
      return NextResponse.json(
        { success: true, requirement: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, requirement });
  } catch (error) {
    return createErrorResponse(error);
  }
}
