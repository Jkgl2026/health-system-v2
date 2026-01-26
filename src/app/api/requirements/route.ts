import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertRequirement } from '@/storage/database';

// POST /api/requirements - 创建或更新四个要求的完成情况
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
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

    // 检查是否已存在
    const existing = await healthDataManager.getRequirementByUserId(data.userId);

    let requirement;
    if (existing) {
      requirement = await healthDataManager.updateRequirement(data.userId, requirementData);
    } else {
      requirement = await healthDataManager.createRequirement(requirementData);
    }

    return NextResponse.json({ success: true, requirement }, { status: 201 });
  } catch (error) {
    console.error('Error saving requirements:', error);
    return NextResponse.json(
      { error: '保存要求完成情况失败' },
      { status: 500 }
    );
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
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: '获取要求完成情况失败' },
      { status: 500 }
    );
  }
}
