import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * 批量修复用户数据API
 * 为所有缺失数据的用户添加测试数据
 */
export async function POST() {
  try {
    const db = await getDb();
    
    // 获取所有用户
    const allUsers = await db.select().from(users);

    const results: any = {
      totalUsers: allUsers.length,
      processed: 0,
      fixed: [],
      skipped: [],
      errors: [],
    };

    for (const user of allUsers) {
      const userResults: any = {
        userId: user.id,
        name: user.name || '未知',
        created: [],
        skipped: [],
        errors: [],
      };

      try {
        // 检查并修复症状自检数据
        const [existingSymptomCheck] = await db
          .select()
          .from(symptomChecks)
          .where(eq(symptomChecks.userId, user.id))
          .limit(1);

        if (!existingSymptomCheck) {
          await db.insert(symptomChecks).values({
            userId: user.id,
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
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          userResults.created.push('symptomCheck');
        } else {
          userResults.skipped.push('symptomCheck (已存在)');
        }

        // 检查并修复健康分析数据
        const [existingHealthAnalysis] = await db
          .select()
          .from(healthAnalysis)
          .where(eq(healthAnalysis.userId, user.id))
          .limit(1);

        if (!existingHealthAnalysis) {
          await db.insert(healthAnalysis).values({
            userId: user.id,
            qiAndBlood: 1,
            circulation: 1,
            toxins: 1,
            bloodLipids: 1,
            coldness: 1,
            immunity: 0,
            emotions: 0,
            overallHealth: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          userResults.created.push('healthAnalysis');
        } else {
          userResults.skipped.push('healthAnalysis (已存在)');
        }

        // 检查并修复用户选择数据
        const [existingUserChoice] = await db
          .select()
          .from(userChoices)
          .where(eq(userChoices.userId, user.id))
          .limit(1);

        if (!existingUserChoice) {
          await db.insert(userChoices).values({
            userId: user.id,
            planType: '方案三：健康调理师全程指导',
            planDescription: '最快、最专业的方法，有健康调理师一对一指导，针对您的具体情况制定调理方案，全程跟踪恢复效果。',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          userResults.created.push('userChoice');
        } else {
          userResults.skipped.push('userChoice (已存在)');
        }

        // 检查并修复要求数据
        const [existingRequirements] = await db
          .select()
          .from(requirements)
          .where(eq(requirements.userId, user.id))
          .limit(1);

        if (!existingRequirements) {
          await db.insert(requirements).values({
            userId: user.id,
            requirement1Completed: true,
            requirement2Completed: true,
            requirement3Completed: true,
            requirement4Completed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          userResults.created.push('requirements');
        } else {
          userResults.skipped.push('requirements (已存在)');
        }

        results.processed++;
        results.fixed.push(userResults);
      } catch (error) {
        userResults.errors.push(String(error));
        results.errors.push(userResults);
      }
    }

    return NextResponse.json({
      success: true,
      message: `已处理 ${results.processed} 个用户，共创建 ${results.fixed.reduce((sum: number, u: any) => sum + u.created.length, 0)} 项数据`,
      ...results,
    });
  } catch (error) {
    console.error('批量修复用户数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '批量修复失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
