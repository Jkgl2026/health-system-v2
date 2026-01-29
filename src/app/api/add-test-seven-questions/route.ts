import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { healthDataManager } from '@/storage/database';
import { hashPassword } from '@/lib/password';

// POST /api/add-test-seven-questions - 添加带七问数据的测试用户
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    
    // 创建测试用户
    const testUser = await healthDataManager.createUser({
      name: '测试用户七问',
      phone: '13800138007',
      age: 35,
      gender: '男',
      weight: '70',
      height: '175',
      bloodPressure: '120/80',
      occupation: '软件工程师',
      address: '北京市朝阳区',
      bmi: '22.86',
    });

    console.log('✓ 创建测试用户成功:', testUser.id);

    // 创建症状自检数据
    await healthDataManager.createSymptomCheck({
      userId: testUser.id,
      checkedSymptoms: ['symptom_1', 'symptom_2', 'symptom_3'],
      totalScore: 15,
      elementScores: {
       气血: 5,
       循环: 3,
       毒素: 2,
       血脂: 3,
       寒凉: 2,
      },
    });

    // 创建健康要素分析
    await healthDataManager.createHealthAnalysis({
      userId: testUser.id,
      qiAndBlood: 75,
      circulation: 68,
      toxins: 72,
      bloodLipids: 70,
      coldness: 65,
      immunity: 78,
      emotions: 73,
      overallHealth: 72,
    });

    // 创建用户选择
    await healthDataManager.createUserChoice({
      userId: testUser.id,
      planType: '综合调理方案',
      planDescription: '气血调理 + 循环改善 + 免疫提升',
    });

    // 创建带七问数据的requirement（使用对象格式）
    const sevenQuestionsData = {
      1: '每周都会犯一次，通常在疲劳后',
      2: '每次持续1-2小时',
      3: '头晕、心慌、手脚发凉',
      4: '尝试过吃药、按摩，效果不明显',
      5: '从去年开始，工作压力大时加重，休息时减轻',
      6: '休息、放松心情时会减轻',
      7: '昨天下午加班后出现，特别累',
    };

    await healthDataManager.createRequirement({
      userId: testUser.id,
      requirement1Completed: true,
      requirement2Completed: true,
      requirement3Completed: true,
      requirement4Completed: true,
      sevenQuestionsAnswers: sevenQuestionsData,
      completedAt: new Date(),
    });

    console.log('✓ 创建带七问数据的requirement成功');

    return NextResponse.json({
      success: true,
      message: '测试用户及七问数据创建成功',
      userId: testUser.id,
      sevenQuestionsCount: Object.keys(sevenQuestionsData).length,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding test seven questions:', error);
    return NextResponse.json(
      { error: '添加测试七问数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
