import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { eq } from 'drizzle-orm';

// GET /api/debug/check-user-data - 检查用户数据完整性
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { users, symptomChecks, healthAnalysis, userChoices, requirements } =
      await import('@/storage/database/shared/schema');

    // 获取所有用户
    const allUsers = await db.select().from(users);

    // 获取所有关联数据
    const allSymptomChecks = await db.select().from(symptomChecks);
    const allHealthAnalysis = await db.select().from(healthAnalysis);
    const allUserChoices = await db.select().from(userChoices);
    const allRequirements = await db.select().from(requirements);

    // 统计每个用户的关联数据
    const userData = allUsers.map(user => {
      const userSymptomChecks = allSymptomChecks.filter(sc => sc.userId === user.id);
      const userHealthAnalysis = allHealthAnalysis.filter(ha => ha.userId === user.id);
      const userChoices = allUserChoices.filter(uc => uc.userId === user.id);
      const userRequirements = allRequirements.filter(req => req.userId === user.id);

      return {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        symptomChecks: {
          count: userSymptomChecks.length,
          latest: userSymptomChecks.length > 0 ? userSymptomChecks[0] : null,
        },
        healthAnalysis: {
          count: userHealthAnalysis.length,
          latest: userHealthAnalysis.length > 0 ? userHealthAnalysis[0] : null,
        },
        userChoices: {
          count: userChoices.length,
          latest: userChoices.length > 0 ? userChoices[0] : null,
        },
        requirements: {
          count: userRequirements.length,
          latest: userRequirements.length > 0 ? userRequirements[0] : null,
        },
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: allUsers.length,
        totalSymptomChecks: allSymptomChecks.length,
        totalHealthAnalysis: allHealthAnalysis.length,
        totalUserChoices: allUserChoices.length,
        totalRequirements: allRequirements.length,
      },
      users: userData,
    });
  } catch (error) {
    console.error('Error checking user data:', error);
    return NextResponse.json(
      { error: '检查数据失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
