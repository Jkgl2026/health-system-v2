import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

// 强制动态渲染，因为访问了数据库
export const dynamic = 'force-dynamic';

// 获取用户统计数据
export async function GET(request: NextRequest) {
  try {
    // 获取总用户数
    const totalUsersResult = await exec_sql(
      'SELECT COUNT(*) as count FROM sys_user'
    );
    const totalUsers = Number(totalUsersResult[0].count);

    // 获取已完成自检的用户数（有详细数据的用户）
    const completedCheckResult = await exec_sql(
      `SELECT COUNT(*) as count FROM sys_user
       WHERE self_check_completed = true`
    );
    const completedCheck = Number(completedCheckResult[0].count);

    // 获取已完成健康七问的用户数
    const completedRequirementResult = await exec_sql(
      `SELECT COUNT(*) as count FROM sys_user
       WHERE answer_content IS NOT NULL AND answer_content != ''`
    );
    const completedRequirement = Number(completedRequirementResult[0].count);

    // 计算平均健康分数
    const avgHealthScoreResult = await exec_sql(
      `SELECT AVG(health_score) as avg_score
       FROM sys_user
       WHERE health_score IS NOT NULL`
    );
    const avgHealthScore = Number(avgHealthScoreResult[0].avg_score || 0);

    return NextResponse.json({
      code: 200,
      data: {
        totalUsers,
        completedCheck,
        completedRequirement,
        avgHealthScore: Math.round(avgHealthScore),
      },
    });
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '获取统计数据失败',
    });
  }
}
