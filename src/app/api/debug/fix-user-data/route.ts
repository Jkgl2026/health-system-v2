import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * 调试API：修复用户数据
 * 用于为缺失数据的用户添加测试数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // 检查用户是否存在
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const results: any = {
      userId,
      created: [],
      skipped: [],
    };

    // 修复症状自检数据
    if (!data.symptomCheck || data.symptomCheck === true) {
      const [existing] = await db
        .select()
        .from(symptomChecks)
        .where(eq(symptomChecks.userId, userId))
        .limit(1);

      if (!existing) {
        await db.insert(symptomChecks).values({
          userId,
          checkedSymptoms: ['1', '2', '3', '4', '5'],
          totalScore: 5,
          elementScores: {
            气血: 1,
            循环: 1,
            毒素: 1,
            血脂: 1,
            寒凉: 1,
            免疫: 0,
            情绪: 0,
          },
        });
        results.created.push('symptomCheck');
      } else {
        results.skipped.push('symptomCheck (已存在)');
      }
    }

    // 修复健康分析数据
    if (!data.healthAnalysis || data.healthAnalysis === true) {
      const [existing] = await db
        .select()
        .from(healthAnalysis)
        .where(eq(healthAnalysis.userId, userId))
        .limit(1);

      if (!existing) {
        await db.insert(healthAnalysis).values({
          userId,
          qiAndBlood: 1,
          circulation: 1,
          toxins: 1,
          bloodLipids: 1,
          coldness: 1,
          immunity: 0,
          emotions: 0,
          overallHealth: 5,
        });
        results.created.push('healthAnalysis');
      } else {
        results.skipped.push('healthAnalysis (已存在)');
      }
    }

    // 修复用户选择数据
    if (!data.userChoice || data.userChoice === true) {
      const [existing] = await db
        .select()
        .from(userChoices)
        .where(eq(userChoices.userId, userId))
        .limit(1);

      if (!existing) {
        await db.insert(userChoices).values({
          userId,
          planType: '方案三：健康调理师全程指导',
          planDescription: '最快、最专业的方法，有健康调理师一对一指导，针对您的具体情况制定调理方案，全程跟踪恢复效果。',
        });
        results.created.push('userChoice');
      } else {
        results.skipped.push('userChoice (已存在)');
      }
    }

    // 修复要求数据
    if (!data.requirements || data.requirements === true) {
      const [existing] = await db
        .select()
        .from(requirements)
        .where(eq(requirements.userId, userId))
        .limit(1);

      if (!existing) {
        await db.insert(requirements).values({
          userId,
          requirement1Completed: true,
          requirement2Completed: true,
          requirement3Completed: true,
          requirement4Completed: true,
        });
        results.created.push('requirements');
      } else {
        results.skipped.push('requirements (已存在)');
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `成功创建 ${results.created.length} 项数据，跳过 ${results.skipped.length} 项已存在数据`,
    });
  } catch (error) {
    console.error('修复用户数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '修复失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
