import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/check-user-seven-questions?userId=xxx - 检查特定用户的七问数据
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const user = await healthDataManager.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const requirement = await healthDataManager.getRequirementByUserId(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      requirement: {
        id: requirement?.id,
        sevenQuestionsAnswers: requirement?.sevenQuestionsAnswers,
        hasSevenQuestions: !!requirement?.sevenQuestionsAnswers,
        questionsCount: Array.isArray(requirement?.sevenQuestionsAnswers) 
          ? requirement.sevenQuestionsAnswers.length 
          : 0,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking user seven questions:', error);
    return NextResponse.json(
      { error: '检查失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
