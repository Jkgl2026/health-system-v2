import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/test-batch-users - 批量创建测试用户
export async function POST(request: NextRequest) {
  try {
    const count = 5; // 创建5个测试用户
    const results = [];

    for (let i = 1; i <= count; i++) {
      // 1. 创建用户
      const user = await healthDataManager.createUser({
        name: `测试用户${i}`,
        age: 25 + i * 2,
        gender: i % 2 === 0 ? '女' : '男',
        weight: `${60 + i}kg`,
        height: `${165 + i}cm`,
        bmi: `${22 + i * 0.2}`,
      });

      if (!user) {
        throw new Error(`创建用户${i}失败`);
      }

      // 2. 创建自检记录
      const symptomCount = 3 + Math.floor(Math.random() * 7); // 3-10个症状
      const checkedSymptoms = Array.from({ length: symptomCount }, (_, idx) => `${idx + 1}`);
      const totalScore = 3 + Math.floor(Math.random() * 5);
      const elementScores = {
        气血: Math.floor(Math.random() * 10),
        循环: Math.floor(Math.random() * 10),
        毒素: Math.floor(Math.random() * 10),
        血脂: Math.floor(Math.random() * 10),
        寒凉: Math.floor(Math.random() * 10),
        免疫: Math.floor(Math.random() * 10),
        情绪: Math.floor(Math.random() * 10),
      };

      await healthDataManager.createSymptomCheck({
        userId: user.id,
        checkedSymptoms,
        totalScore,
        elementScores,
      });

      // 3. 创建健康分析记录
      const qiAndBlood = Math.floor(Math.random() * 10);
      const circulation = Math.floor(Math.random() * 10);
      const toxins = Math.floor(Math.random() * 10);
      const bloodLipids = Math.floor(Math.random() * 10);
      const coldness = Math.floor(Math.random() * 10);
      const immunity = Math.floor(Math.random() * 10);
      const emotions = Math.floor(Math.random() * 10);
      const overallHealth = Math.floor((qiAndBlood + circulation + toxins + bloodLipids + coldness + immunity + emotions) / 7);

      await healthDataManager.createHealthAnalysis({
        userId: user.id,
        qiAndBlood,
        circulation,
        toxins,
        bloodLipids,
        coldness,
        immunity,
        emotions,
        overallHealth,
      });

      // 4. 创建用户选择记录
      const planTypes = ['自我调理', '产品调理', '系统调理'];
      const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
      const planDescriptions = {
        '自我调理': '通过调整生活习惯，自我改善健康状况',
        '产品调理': '使用健康产品辅助调理身体',
        '系统调理': '按照系统调理方案进行健康管理',
      };

      await healthDataManager.createUserChoice({
        userId: user.id,
        planType,
        planDescription: planDescriptions[planType as keyof typeof planDescriptions],
      });

      // 5. 创建要求完成记录
      const completedCount = Math.floor(Math.random() * 4) + 1; // 1-4个要求已完成
      await healthDataManager.createRequirement({
        userId: user.id,
        requirement1Completed: completedCount >= 1,
        requirement2Completed: completedCount >= 2,
        requirement3Completed: completedCount >= 3,
        requirement4Completed: completedCount >= 4,
      });

      results.push({
        userId: user.id,
        name: user.name,
        stepsCompleted: 5,
      });

      console.log(`[批量创建] 创建用户${i}/${count}成功:`, user.name);
    }

    return NextResponse.json({
      success: true,
      message: `成功创建${count}个测试用户`,
      users: results,
    }, { status: 201 });
  } catch (error) {
    console.error('[批量创建] 失败:', error);
    return NextResponse.json(
      {
        error: '批量创建用户失败',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
