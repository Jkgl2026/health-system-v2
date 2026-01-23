import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * 调试API：检查用户数据完整性
 * 用于诊断用户数据是否存在、是否完整
 */
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

    const db = await getDb();
    
    // 检查用户是否存在
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({
        success: false,
        userId,
        message: '用户不存在',
        checks: {
          user: { exists: false },
          symptomCheck: { exists: false },
          healthAnalysis: { exists: false },
          userChoice: { exists: false },
          requirements: { exists: false },
        },
      });
    }

    // 检查各项数据是否存在
    const [symptomCheck] = await db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .limit(1);

    const [healthAnalysisData] = await db
      .select()
      .from(healthAnalysis)
      .where(eq(healthAnalysis.userId, userId))
      .limit(1);

    const [userChoice] = await db
      .select()
      .from(userChoices)
      .where(eq(userChoices.userId, userId))
      .limit(1);

    const [requirementsData] = await db
      .select()
      .from(requirements)
      .where(eq(requirements.userId, userId))
      .limit(1);

    // 生成诊断报告
    const report = {
      success: true,
      userId,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: user.age,
        gender: user.gender,
        createdAt: user.createdAt,
      },
      checks: {
        user: { exists: true, data: user },
        symptomCheck: {
          exists: !!symptomCheck,
          data: symptomCheck,
          completedAt: symptomCheck?.checkedAt,
          hasData: symptomCheck && symptomCheck.checkedSymptoms.length > 0,
        },
        healthAnalysis: {
          exists: !!healthAnalysisData,
          data: healthAnalysisData,
          completedAt: healthAnalysisData?.analyzedAt,
          hasData: healthAnalysisData && healthAnalysisData.overallHealth > 0,
        },
        userChoice: {
          exists: !!userChoice,
          data: userChoice,
          completedAt: userChoice?.selectedAt,
        },
        requirements: {
          exists: !!requirementsData,
          data: requirementsData,
          completedAt: requirementsData?.completedAt,
          completionRate: requirementsData ? 
            [
              requirementsData.requirement1Completed ? 1 : 0,
              requirementsData.requirement2Completed ? 1 : 0,
              requirementsData.requirement3Completed ? 1 : 0,
              requirementsData.requirement4Completed ? 1 : 0,
            ].reduce((a, b) => a + b, 0) / 4 * 100 : 0,
        },
      },
      summary: {
        totalTables: 5,
        existingTables: [
          'user',
          ...(symptomCheck ? ['symptomCheck'] : []),
          ...(healthAnalysisData ? ['healthAnalysis'] : []),
          ...(userChoice ? ['userChoice'] : []),
          ...(requirementsData ? ['requirements'] : []),
        ].filter(Boolean).length,
        missingTables: [
          !symptomCheck && 'symptomCheck',
          !healthAnalysisData && 'healthAnalysis',
          !userChoice && 'userChoice',
          !requirementsData && 'requirements',
        ].filter(Boolean),
      },
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('检查用户数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '检查失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
