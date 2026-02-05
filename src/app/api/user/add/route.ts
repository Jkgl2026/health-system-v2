import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /user/add
 * 新增用户接口（Coze对接专用）
 * 严格遵循需求文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 检查必填字段
    const requiredFields = ['name', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          code: 400,
          msg: `${field}不能为空`,
          data: null
        });
      }
    }

    // 检查手机号是否已存在
    const existResult = await exec_sql(
      'SELECT user_id FROM sys_user WHERE phone = $1',
      [body.phone]
    );

    if (existResult && existResult.length > 0) {
      // 如果已存在，则更新数据
      return await updateUser(body, existResult[0].user_id);
    }

    // 插入新用户
    const insertQuery = `
      INSERT INTO sys_user (
        name, phone, age, gender, height, weight, job,
        sleep, drink_smoke, exercise,
        allergy, sickness, symptom,
        complete, health_status, health_score,
        score_life, score_sleep, score_stress, score_body, score_risk,
        done_self_check, done_require,
        answer_content, analysis, history
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23,
        $24, $25, $26
      )
      RETURNING user_id
    `;

    const params = [
      body.name,
      body.phone,
      body.age || null,
      body.gender || null,
      body.height || null,
      body.weight || null,
      body.job || null,
      body.sleep || null,
      body.drink_smoke || null,
      body.exercise || null,
      body.allergy || null,
      body.sickness || null,
      body.symptom || null,
      body.complete || 0,
      body.health_status || null,
      body.health_score || 0,
      body.score_life || null,
      body.score_sleep || null,
      body.score_stress || null,
      body.score_body || null,
      body.score_risk || null,
      body.done_self_check || false,
      body.done_require || false,
      body.answer_content || null,
      body.analysis || null,
      body.history || null
    ];

    const result = await exec_sql(insertQuery, params);

    return NextResponse.json({
      code: 200,
      msg: '新增成功',
      data: {
        userId: result[0].user_id
      }
    });

  } catch (error) {
    console.error('[User Add API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}

// 更新用户数据
async function updateUser(body: any, userId: number) {
  try {
    const updateQuery = `
      UPDATE sys_user SET
        name = $1, age = $2, gender = $3, height = $4, weight = $5, job = $6,
        sleep = $7, drink_smoke = $8, exercise = $9,
        allergy = $10, sickness = $11, symptom = $12,
        complete = $13, health_status = $14, health_score = $15,
        score_life = $16, score_sleep = $17, score_stress = $18, score_body = $19, score_risk = $20,
        done_self_check = $21, done_require = $22,
        answer_content = $23, analysis = $24,
        history = COALESCE($25, history),
        create_time = CASE WHEN $26 THEN CURRENT_TIMESTAMP ELSE create_time END
      WHERE user_id = $27
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
        [userId]
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
      body.name,
      body.age || null,
      body.gender || null,
      body.height || null,
      body.weight || null,
      body.job || null,
      body.sleep || null,
      body.drink_smoke || null,
      body.exercise || null,
      body.allergy || null,
      body.sickness || null,
      body.symptom || null,
      body.complete || 0,
      body.health_status || null,
      body.health_score || 0,
      body.score_life || null,
      body.score_sleep || null,
      body.score_stress || null,
      body.score_body || null,
      body.score_risk || null,
      body.done_self_check || false,
      body.done_require || false,
      body.answer_content || null,
      body.analysis || null,
      newHistory,
      !!newHistory, // 是否更新历史
      userId
    ];

    await exec_sql(updateQuery, params);

    return NextResponse.json({
      code: 200,
      msg: '更新成功',
      data: {
        userId
      }
    });

  } catch (error) {
    console.error('[User Update API] Error:', error);
    throw error;
  }
}
