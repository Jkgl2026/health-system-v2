import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /user/update
 * 更新健康数据接口
 * 严格遵循需求文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({
        code: 400,
        msg: 'user_id不能为空',
        data: null
      });
    }

    // 更新用户数据
    const updateQuery = `
      UPDATE sys_user SET
        age = $1, gender = $2, height = $3, weight = $4, job = $5,
        sleep = $6, drink_smoke = $7, exercise = $8,
        allergy = $9, sickness = $10, symptom = $11,
        complete = $12, health_status = $13, health_score = $14,
        score_life = $15, score_sleep = $16, score_stress = $17, score_body = $18, score_risk = $19,
        done_self_check = $20, done_require = $21,
        answer_content = $22, analysis = $23,
        history = COALESCE($24, history)
      WHERE user_id = $25
    `;

    // 解析现有历史记录
    let newHistory = null;
    if (body.answer_content || body.health_score !== undefined) {
      const historyItem = {
        timestamp: new Date().toISOString(),
        health_score: body.health_score,
        health_status: body.health_status,
        answer_content: body.answer_content,
        analysis: body.analysis
      };

      const currentHistory = await exec_sql(
        'SELECT history FROM sys_user WHERE user_id = $1',
        [user_id]
      );

      if (currentHistory && currentHistory[0].history) {
        try {
          const historyArray = JSON.parse(currentHistory[0].history);
          historyArray.push(historyItem);
          newHistory = JSON.stringify(historyArray);
        } catch (e) {
          newHistory = JSON.stringify([historyItem]);
        }
      } else {
        newHistory = JSON.stringify([historyItem]);
      }
    }

    const params = [
      body.age,
      body.gender,
      body.height,
      body.weight,
      body.job,
      body.sleep,
      body.drink_smoke,
      body.exercise,
      body.allergy,
      body.sickness,
      body.symptom,
      body.complete,
      body.health_status,
      body.health_score,
      body.score_life,
      body.score_sleep,
      body.score_stress,
      body.score_body,
      body.score_risk,
      body.done_self_check,
      body.done_require,
      body.answer_content,
      body.analysis,
      newHistory,
      user_id
    ];

    await exec_sql(updateQuery, params);

    return NextResponse.json({
      code: 200,
      msg: '更新成功',
      data: {
        userId: user_id
      }
    });

  } catch (error) {
    console.error('[User Update API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
