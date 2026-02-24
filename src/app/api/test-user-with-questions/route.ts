import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { SEVEN_QUESTIONS } from '@/lib/health-data';

// POST /api/test-user-with-questions - 创建一个带有七问数据的测试用户
export async function POST(request: NextRequest) {
  try {
    // 1. 创建用户
    const user = await healthDataManager.createUser({
      name: '测试用户（带七问数据）',
      age: 28,
      gender: '女',
      weight: '55kg',
      height: '160cm',
      bmi: '21.5',
    });

    if (!user) {
      throw new Error('创建用户失败');
    }

    // 2. 创建自检记录
    await healthDataManager.createSymptomCheck({
      userId: user.id,
      checkedSymptoms: ['1', '2', '3', '4', '5'],
      totalScore: 5,
      elementScores: {
        气血: 5,
        循环: 4,
        毒素: 3,
        血脂: 4,
        寒凉: 5,
        免疫: 3,
        情绪: 4,
      },
    });

    // 3. 创建健康分析记录
    await healthDataManager.createHealthAnalysis({
      userId: user.id,
      qiAndBlood: 5,
      circulation: 4,
      toxins: 3,
      bloodLipids: 4,
      coldness: 5,
      immunity: 3,
      emotions: 4,
      overallHealth: 4,
    });

    // 4. 创建用户选择记录
    await healthDataManager.createUserChoice({
      userId: user.id,
      planType: '系统调理',
      planDescription: '按照系统调理方案进行健康管理',
    });

    // 5. 创建要求完成记录（包含七问数据）
    const sevenQuestionsAnswers: Record<number, string> = {};
    SEVEN_QUESTIONS.forEach(q => {
      sevenQuestionsAnswers[q.id] = `这是问题${q.id}的测试回答：${q.question.substring(0, 10)}...`;
    });

    await healthDataManager.createRequirement({
      userId: user.id,
      requirement1Completed: true,
      requirement2Completed: true,
      requirement3Completed: true,
      requirement4Completed: true,
    });

    // 更新七问数据
    await healthDataManager.updateRequirement(user.id, {
      sevenQuestionsAnswers,
    });

    return NextResponse.json({
      success: true,
      message: '测试用户创建成功（包含七问数据）',
      userId: user.id,
      userName: user.name,
      sevenQuestionsCount: Object.keys(sevenQuestionsAnswers).length,
    }, { status: 201 });
  } catch (error) {
    console.error('[创建带七问数据的用户] 失败:', error);
    return NextResponse.json(
      {
        error: '创建用户失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
