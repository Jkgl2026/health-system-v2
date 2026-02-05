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
        name, phone, age, gender, height, weight,
        waistline, hipline, blood_pressure_high, blood_pressure_low,
        blood_sugar, blood_fat, heart_rate,
        sleep_hours, exercise_hours, smoking, drinking, diet,
        chronic_disease, medication, family_history, symptoms,
        answer_content, analysis,
        health_status, health_score, self_check_completed
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22,
        $23, $24,
        $25, $26, $27
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
      body.waistline || null,
      body.hipline || null,
      body.blood_pressure_high || null,
      body.blood_pressure_low || null,
      body.blood_sugar || null,
      body.blood_fat || null,
      body.heart_rate || null,
      body.sleep_hours || null,
      body.exercise_hours || null,
      body.smoking || null,
      body.drinking || null,
      body.diet || null,
      body.chronic_disease || null,
      body.medication || null,
      body.family_history || null,
      body.symptoms || null,
      body.answer_content || null,
      body.analysis || null,
      body.health_status || null,
      body.health_score || 0,
      body.self_check_completed || false
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
        name = $1, age = $2, gender = $3, height = $4, weight = $5,
        waistline = $6, hipline = $7, blood_pressure_high = $8, blood_pressure_low = $9,
        blood_sugar = $10, blood_fat = $11, heart_rate = $12,
        sleep_hours = $13, exercise_hours = $14, smoking = $15, drinking = $16, diet = $17,
        chronic_disease = $18, medication = $19, family_history = $20, symptoms = $21,
        answer_content = $22, analysis = $23,
        health_status = $24, health_score = $25, self_check_completed = $26,
        update_time = CURRENT_TIMESTAMP
      WHERE user_id = $27
    `;

    const params = [
      body.name,
      body.age || null,
      body.gender || null,
      body.height || null,
      body.weight || null,
      body.waistline || null,
      body.hipline || null,
      body.blood_pressure_high || null,
      body.blood_pressure_low || null,
      body.blood_sugar || null,
      body.blood_fat || null,
      body.heart_rate || null,
      body.sleep_hours || null,
      body.exercise_hours || null,
      body.smoking || null,
      body.drinking || null,
      body.diet || null,
      body.chronic_disease || null,
      body.medication || null,
      body.family_history || null,
      body.symptoms || null,
      body.answer_content || null,
      body.analysis || null,
      body.health_status || null,
      body.health_score || 0,
      body.self_check_completed || false,
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
