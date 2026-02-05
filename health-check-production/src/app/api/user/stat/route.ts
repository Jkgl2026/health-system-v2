import { NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * GET /user/stat
 * 统计数据接口
 * 严格遵循需求文档
 */
export async function GET() {
  try {
    // 总用户数
    const totalUsers = await exec_sql('SELECT COUNT(*) as count FROM sys_user');

    // 已完成自检人数
    const doneSelfCheck = await exec_sql('SELECT COUNT(*) as count FROM sys_user WHERE self_check_completed = true');

    // 已完成要求人数
    const doneRequire = await exec_sql('SELECT COUNT(*) as count FROM sys_user WHERE self_check_completed = true');
    
    // 平均健康分数
    const avgHealthScore = await exec_sql('SELECT AVG(health_score) as avg FROM sys_user WHERE health_score > 0');
    
    // 最近注册用户（前10个）
    const recentUsers = await exec_sql(`
      SELECT 
        user_id,
        name,
        phone,
        health_score,
        health_status,
        create_time
      FROM sys_user
      ORDER BY create_time DESC
      LIMIT 10
    `);

    return NextResponse.json({
      code: 200,
      msg: '成功',
      data: {
        totalUsers: totalUsers[0].count,
        doneSelfCheck: doneSelfCheck[0].count,
        doneRequire: doneRequire[0].count,
        avgHealthScore: Math.round(avgHealthScore[0].avg || 0),
        recentUsers
      }
    });

  } catch (error) {
    console.error('[User Stat API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
