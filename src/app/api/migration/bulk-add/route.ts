import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /api/migration/bulk-add
 * 批量添加用户到数据库（用于数据迁移）
 */
export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users)) {
      return NextResponse.json({
        code: 400,
        msg: '参数错误，users 必须是数组',
        data: null
      });
    }

    const results = [];

    for (const user of users) {
      try {
        // 检查手机号是否已存在
        if (user.phone) {
          const existResult = await exec_sql(
            'SELECT user_id FROM sys_user WHERE phone = $1',
            [user.phone]
          );

          if (existResult && existResult.length > 0) {
            // 如果已存在，更新数据
            const updateQuery = `
              UPDATE sys_user SET
                name = $1, age = $2, gender = $3, height = $4, weight = $5,
                blood_pressure_high = $6, blood_pressure_low = $7,
                blood_sugar = $8, blood_fat = $9,
                sleep_hours = $10, exercise_hours = $11, smoking = $12, drinking = $13, diet = $14,
                chronic_disease = $15, medication = $16, family_history = $17, symptoms = $18,
                answer_content = $19, analysis = $20,
                health_status = $21, health_score = $22,
                update_time = CURRENT_TIMESTAMP
              WHERE user_id = $23
            `;

            const params = [
              user.name,
              user.age || null,
              user.gender || null,
              user.height || null,
              user.weight || null,
              user.blood_pressure_high || null,
              user.blood_pressure_low || null,
              user.blood_sugar || null,
              user.blood_fat || null,
              user.sleep_hours || null,
              user.exercise_hours || null,
              user.smoking || null,
              user.drinking || null,
              user.diet || null,
              user.chronic_disease || null,
              user.medication || null,
              user.family_history || null,
              user.symptoms || null,
              user.answer_content || null,
              user.analysis || null,
              user.health_status || null,
              user.health_score || 0,
              existResult[0].user_id
            ];

            await exec_sql(updateQuery, params);

            results.push({
              name: user.name,
              phone: user.phone,
              success: true,
              action: 'updated',
              userId: existResult[0].user_id
            });

            continue;
          }
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
          user.name,
          user.phone,
          user.age || null,
          user.gender || null,
          user.height || null,
          user.weight || null,
          user.waistline || null,
          user.hipline || null,
          user.blood_pressure_high || null,
          user.blood_pressure_low || null,
          user.blood_sugar || null,
          user.blood_fat || null,
          user.heart_rate || null,
          user.sleep_hours || null,
          user.exercise_hours || null,
          user.smoking || null,
          user.drinking || null,
          user.diet || null,
          user.chronic_disease || null,
          user.medication || null,
          user.family_history || null,
          user.symptoms || null,
          user.answer_content || null,
          user.analysis || null,
          user.health_status || null,
          user.health_score || 0,
          user.self_check_completed || false
        ];

        const result = await exec_sql(insertQuery, params);

        results.push({
          name: user.name,
          phone: user.phone,
          success: true,
          action: 'created',
          userId: result[0].user_id
        });

      } catch (error) {
        results.push({
          name: user.name,
          phone: user.phone,
          success: false,
          action: 'failed',
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return NextResponse.json({
      code: 200,
      msg: '批量操作完成',
      data: {
        total: users.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('[Bulk Add API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
