import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/admin/find-users-missing-seven-questions
// 查找所有缺少七问数据的用户
export async function GET(request: NextRequest) {
  try {
    // 获取所有用户
    const allUsers = await healthDataManager.getAllUsers();

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        users: [],
        message: '没有找到任何用户'
      });
    }

    // 检查每个用户的七问数据
    const usersMissingSevenQuestions = [];

    for (const user of allUsers) {
      const requirement = await healthDataManager.getRequirementByUserId(user.id);

      // 检查是否有七问答案
      const hasSevenQuestions =
        requirement &&
        requirement.sevenQuestionsAnswers &&
        Object.keys(requirement.sevenQuestionsAnswers).length > 0;

      if (!hasSevenQuestions) {
        usersMissingSevenQuestions.push({
          id: user.id,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt,
          requirementsCompleted: requirement ? [
            requirement.requirement1Completed,
            requirement.requirement2Completed,
            requirement.requirement3Completed,
            requirement.requirement4Completed,
          ].filter(Boolean).length : 0,
        });
      }
    }

    return NextResponse.json({
      success: true,
      users: usersMissingSevenQuestions,
      totalUsers: allUsers.length,
      missingCount: usersMissingSevenQuestions.length,
      completedCount: allUsers.length - usersMissingSevenQuestions.length
    });
  } catch (error) {
    console.error('[FindUsersMissingSevenQuestions] 查找失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '查找失败',
    }, { status: 500 });
  }
}
