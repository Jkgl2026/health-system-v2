import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

// 强制动态渲染，因为使用了 request.url
export const dynamic = 'force-dynamic';

/**
 * GET /user/detail?userId=xxx
 * 用户详情接口（含答案+分析）
 * 严格遵循需求文档
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        code: 400,
        msg: 'userId不能为空',
        data: null
      });
    }

    // 查询用户完整信息
    const result = await exec_sql(
      `SELECT * FROM sys_user WHERE user_id = $1`,
      [userId]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({
        code: 404,
        msg: '用户不存在',
        data: null
      });
    }

    const user = result[0];

    // 解析JSON字段
    let parsedAnswerContent = null;
    let parsedAnalysis = null;
    let parsedHistory = null;

    try {
      if (user.answer_content) {
        parsedAnswerContent = JSON.parse(user.answer_content);
      }
    } catch (e) {
      parsedAnswerContent = user.answer_content;
    }

    try {
      if (user.analysis) {
        parsedAnalysis = JSON.parse(user.analysis);
      } else {
        parsedAnalysis = user.analysis;
      }
    } catch (e) {
      parsedAnalysis = user.analysis;
    }

    try {
      if (user.history) {
        parsedHistory = JSON.parse(user.history);
      } else {
        parsedHistory = [];
      }
    } catch (e) {
      parsedHistory = [];
    }

    // 查询自检历史记录
    let symptomCheckHistory = [];
    try {
      const checkRecords = await exec_sql(
        `SELECT
          sc.id as check_id,
          sc.check_date,
          sc.selected_symptoms,
          sc.target_symptoms,
          sc.total_score,
          sc.qi_blood_score,
          sc.circulation_score,
          sc.toxins_score,
          sc.blood_lipids_score,
          sc.coldness_score,
          sc.immunity_score,
          sc.emotions_score,
          ha.qi_blood,
          ha.circulation,
          ha.toxins,
          ha.blood_lipids,
          ha.coldness,
          ha.immunity,
          ha.emotions,
          ha.overall_health,
          ha.health_status,
          ha.analysis_report
        FROM symptom_check sc
        LEFT JOIN health_analysis ha ON sc.id = ha.check_id
        WHERE sc.user_id = $1
        ORDER BY sc.check_date DESC
        LIMIT 20`,
        [userId]
      );
      symptomCheckHistory = checkRecords;
    } catch (e) {
      console.error('[查询自检历史失败]', e);
      symptomCheckHistory = [];
    }

    return NextResponse.json({
      code: 200,
      msg: '成功',
      data: {
        ...user,
        answer_content: parsedAnswerContent,
        analysis: parsedAnalysis,
        history: parsedHistory,
        symptomCheckHistory
      }
    });

  } catch (error) {
    console.error('[User Detail API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
