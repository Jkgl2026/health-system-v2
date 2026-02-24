import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 获取用户的 requirements 数据
    const requirements = await healthDataManager.getRequirementByUserId(userId);

    return NextResponse.json({
      success: true,
      userId,
      requirements: requirements,
      sevenQuestionsAnswers: requirements?.sevenQuestionsAnswers,
      sevenQuestionsAnswersType: typeof requirements?.sevenQuestionsAnswers,
      sevenQuestionsAnswersKeys: requirements?.sevenQuestionsAnswers
        ? Object.keys(requirements.sevenQuestionsAnswers)
        : [],
    });
  } catch (error) {
    console.error('获取用户requirements数据失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
