import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users, symptomChecks, healthAnalysis, userChoices, requirements } from '@/storage/database/shared/schema';
import { v4 as uuidv4 } from 'uuid';

// POST /api/recover-local-data - 从本地数据恢复到数据库
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('[数据恢复] 收到数据:', JSON.stringify(data, null, 2));

    const db = await getDb();

    // 尝试从数据中提取用户信息
    const userId = data.userId || data.id || data.user_id || uuidv4();
    const name = data.name || data.userName || data.full_name || '';
    const phone = data.phone || data.phoneNumber || data.mobile || null;
    const email = data.email || null;
    const age = data.age || null;
    const gender = data.gender || null;
    const weight = data.weight || null;
    const height = data.height || null;
    const bloodPressure = data.bloodPressure || data.blood_pressure || null;
    const occupation = data.occupation || null;
    const address = data.address || null;
    const bmi = data.bmi || null;

    // 检查是否是关键用户
    const importantNames = ['小王', '小雪', '张三', '李四', '赤子乘龙'];
    const isImportant = importantNames.some(n => name.includes(n));

    console.log('[数据恢复] 用户信息:', {
      userId,
      name,
      phone,
      age,
      gender,
      isImportant,
    });

    // 插入或更新用户数据
    const insertedUser = await db.execute(`
      INSERT INTO users (
        id, name, phone, email, age, gender, weight, height, blood_pressure,
        occupation, address, bmi, created_at, updated_at
      )
      VALUES (
        '${userId}', '${name}', ${phone ? `'${phone}'` : 'NULL'}, ${email ? `'${email}'` : 'NULL'},
        ${age || 'NULL'}, ${gender ? `'${gender}'` : 'NULL'}, ${weight ? `'${weight}'` : 'NULL'},
        ${height ? `'${height}'` : 'NULL'}, ${bloodPressure ? `'${bloodPressure}'` : 'NULL'},
        ${occupation ? `'${occupation}'` : 'NULL'}, ${address ? `'${address}'` : 'NULL'}, ${bmi ? `'${bmi}'` : 'NULL'},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = '${name}',
        phone = ${phone ? `'${phone}'` : 'NULL'},
        email = ${email ? `'${email}'` : 'NULL'},
        age = ${age || 'NULL'},
        gender = ${gender ? `'${gender}'` : 'NULL'},
        weight = ${weight ? `'${weight}'` : 'NULL'},
        height = ${height ? `'${height}'` : 'NULL'},
        blood_pressure = ${bloodPressure ? `'${bloodPressure}'` : 'NULL'},
        occupation = ${occupation ? `'${occupation}'` : 'NULL'},
        address = ${address ? `'${address}'` : 'NULL'},
        bmi = ${bmi ? `'${bmi}'` : 'NULL'},
        updated_at = NOW()
      RETURNING *
    `);

    console.log('[数据恢复] 用户数据已插入/更新:', insertedUser.rows[0]);

    // 处理症状自检数据
    if (data.checkedSymptoms || data.symptoms || data.symptomChecks) {
      const symptomId = uuidv4();
      const checkedSymptoms = data.checkedSymptoms || data.symptoms || data.symptomChecks || [];
      const totalScore = data.totalScore || data.score || 0;
      const elementScores = data.elementScores || data.scores || {};

      await db.execute(`
        INSERT INTO symptom_checks (
          id, user_id, checked_symptoms, total_score, element_scores, checked_at
        )
        VALUES (
          '${symptomId}', '${userId}', '${JSON.stringify(checkedSymptoms)}'::jsonb,
          ${totalScore}, '${JSON.stringify(elementScores)}'::jsonb, NOW()
        )
      `);

      console.log('[数据恢复] 症状自检数据已插入');
    }

    // 处理健康分析数据
    if (data.healthAnalysis || data.analysis) {
      const analysisId = uuidv4();
      const analysis = data.healthAnalysis || data.analysis;

      await db.execute(`
        INSERT INTO health_analysis (
          id, user_id, qi_and_blood, circulation, toxins, blood_lipids,
          coldness, immunity, emotions, overall_health, analyzed_at
        )
        VALUES (
          '${analysisId}', '${userId}',
          ${analysis.qiAndBlood || analysis.qi_blood || 'NULL'},
          ${analysis.circulation || 'NULL'},
          ${analysis.toxins || 'NULL'},
          ${analysis.bloodLipids || analysis.blood_lipids || 'NULL'},
          ${analysis.coldness || 'NULL'},
          ${analysis.immunity || 'NULL'},
          ${analysis.emotions || 'NULL'},
          ${analysis.overallHealth || analysis.overall || 'NULL'},
          NOW()
        )
      `);

      console.log('[数据恢复] 健康分析数据已插入');
    }

    // 处理用户选择数据
    if (data.userChoice || data.choice || data.planType) {
      const choiceId = uuidv4();
      const choice = data.userChoice || data.choice;
      const planType = data.planType || choice?.planType || '未选择';
      const planDescription = data.planDescription || choice?.planDescription || '';

      await db.execute(`
        INSERT INTO user_choices (
          id, user_id, plan_type, plan_description, selected_at
        )
        VALUES (
          '${choiceId}', '${userId}', '${planType}',
          ${planDescription ? `'${planDescription}'` : 'NULL'}, NOW()
        )
      `);

      console.log('[数据恢复] 用户选择数据已插入');
    }

    // 处理要求完成数据
    if (data.requirements || data.requirementData) {
      const reqId = uuidv4();
      const reqData = data.requirements || data.requirementData;

      await db.execute(`
        INSERT INTO requirements (
          id, user_id, requirement1_completed, requirement2_completed,
          requirement3_completed, requirement4_completed,
          requirement2_answers, seven_questions_answers, updated_at
        )
        VALUES (
          '${reqId}', '${userId}',
          ${reqData.requirement1Completed !== undefined ? reqData.requirement1Completed : 'FALSE'},
          ${reqData.requirement2Completed !== undefined ? reqData.requirement2Completed : 'FALSE'},
          ${reqData.requirement3Completed !== undefined ? reqData.requirement3Completed : 'FALSE'},
          ${reqData.requirement4Completed !== undefined ? reqData.requirement4Completed : 'FALSE'},
          ${reqData.requirement2Answers ? `'${JSON.stringify(reqData.requirement2Answers).replace(/'/g, "''")}'::jsonb` : 'NULL'},
          ${reqData.sevenQuestionsAnswers ? `'${JSON.stringify(reqData.sevenQuestionsAnswers).replace(/'/g, "''")}'::jsonb` : 'NULL'},
          NOW()
        )
      `);

      console.log('[数据恢复] 要求完成数据已插入');
    }

    return NextResponse.json({
      success: true,
      message: isImportant
        ? `重要用户数据已恢复：${name}`
        : '数据已成功恢复到数据库',
      userId,
      recoveredData: {
        user: true,
        symptomChecks: !!data.checkedSymptoms || !!data.symptoms,
        healthAnalysis: !!data.healthAnalysis || !!data.analysis,
        userChoice: !!data.userChoice || !!data.choice || !!data.planType,
        requirements: !!data.requirements || !!data.requirementData,
      },
    });
  } catch (error) {
    console.error('[数据恢复] 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '数据恢复失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
