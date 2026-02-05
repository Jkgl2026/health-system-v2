import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

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

    return NextResponse.json({
      code: 200,
      msg: '成功',
      data: {
        ...user,
        answer_content: parsedAnswerContent,
        analysis: parsedAnalysis,
        history: parsedHistory
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
