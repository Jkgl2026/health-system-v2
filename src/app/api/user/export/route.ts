import { NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

// 强制动态渲染，因为访问了数据库
export const dynamic = 'force-dynamic';

/**
 * GET /user/export
 * 导出Excel接口
 * 严格遵循需求文档
 */
export async function GET() {
  try {
    // 查询所有用户数据
    const users = await exec_sql(`
      SELECT
        user_id,
        name,
        phone,
        age,
        gender,
        height,
        weight,
        occupation,
        sleep,
        drink_smoke,
        exercise,
        allergy,
        sickness,
        symptom,
        complete,
        health_status,
        health_score,
        score_life,
        score_sleep,
        score_stress,
        score_body,
        score_risk,
        done_self_check,
        done_require,
        create_time
      FROM sys_user
      ORDER BY create_time DESC
    `);

    // 生成CSV内容
    const headers = [
      '用户ID', '姓名', '手机号', '年龄', '性别', '身高', '体重', '职业',
      '睡眠情况', '烟酒', '运动', '过敏史', '既往病史', '当前症状',
      '完成度', '健康状态', '健康分数', '生活方式得分', '睡眠得分',
      '压力得分', '体质得分', '风险得分', '是否完成自检', '是否完成要求', '创建时间'
    ];

    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.user_id,
        user.name,
        user.phone,
        user.age || '',
        user.gender || '',
        user.height || '',
        user.weight || '',
        user.occupation || '',
        user.sleep || '',
        user.drink_smoke || '',
        user.exercise || '',
        user.allergy || '',
        user.sickness || '',
        user.symptom || '',
        user.complete || 0,
        user.health_status || '',
        user.health_score || 0,
        user.score_life || '',
        user.score_sleep || '',
        user.score_stress || '',
        user.score_body || '',
        user.score_risk || '',
        user.done_self_check ? '是' : '否',
        user.done_require ? '是' : '否',
        user.create_time
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // 返回CSV文件
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=users_export.csv'
      }
    });

  } catch (error) {
    console.error('[User Export API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
