import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// POST /api/health-questionnaire - 提交健康问卷
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      // 基础信息
      age,
      gender,
      height,
      weight,
      // 疾病史
      hasHypertension,
      hypertensionYears,
      hypertensionMedications,
      hasDiabetes,
      diabetesYears,
      diabetesType,
      diabetesMedications,
      hasHyperlipidemia,
      hyperlipidemiaYears,
      hyperlipidemiaMedications,
      otherDiseases,
      // 症状史
      symptoms,
      symptomDuration,
      symptomSeverity,
      // 生活习惯
      smokingStatus,
      smokingYears,
      smokingPerDay,
      drinkingStatus,
      drinkingFrequency,
      drinkingType,
      exerciseFrequency,
      exerciseDuration,
      exerciseType,
      sleepHours,
      sleepQuality,
      sleepIssues,
      dietHabits,
      dietIssues,
      stressLevel,
      stressSource,
      // 家族病史
      familyHypertension,
      familyDiabetes,
      familyCardiovascular,
      familyOther,
      // 其他
      notes
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 计算BMI
    let bmi = null;
    if (height && weight) {
      bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));
    }

    // 确保用户存在
    await (db.execute as any)(
      sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO UPDATE SET id = ${userId}`
    );

    // 插入健康问卷
    const questionnaireId = crypto.randomUUID();

    // 步骤1: 插入基本字段
    await (db.execute as any)(
      sql`INSERT INTO health_questionnaires (id, user_id, age, gender, height, weight, bmi, notes) VALUES (${questionnaireId}, ${userId}, ${age}, ${gender}, ${height}, ${weight}, ${bmi}, ${notes})`
    );

    // 步骤2: 更新疾病史字段
    const hasHypertensionValue = hasHypertension === true;
    const hasDiabetesValue = hasDiabetes === true;
    const hasHyperlipidemiaValue = hasHyperlipidemia === true;

    // 处理数组字段 - 将数组转换为PostgreSQL JSONB格式
    const formatArray = (arr: any[] | null | undefined) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      // jsonb类型字段需要JSON字符串格式
      return JSON.stringify(arr);
    };

    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET
        has_hypertension = ${hasHypertensionValue},
        hypertension_years = ${hypertensionYears || null},
        hypertension_medications = ${formatArray(hypertensionMedications)},
        has_diabetes = ${hasDiabetesValue},
        diabetes_years = ${diabetesYears || null},
        diabetes_type = ${diabetesType || null},
        diabetes_medications = ${formatArray(diabetesMedications)},
        has_hyperlipidemia = ${hasHyperlipidemiaValue},
        hyperlipidemia_years = ${hyperlipidemiaYears || null},
        hyperlipidemia_medications = ${formatArray(hyperlipidemiaMedications)},
        other_diseases = ${formatArray(otherDiseases)}
        WHERE id = ${questionnaireId}`
    );

    // 步骤3: 更新症状史字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET
        symptoms = ${formatArray(symptoms)},
        symptom_duration = ${symptomDuration || null},
        symptom_severity = ${symptomSeverity || null}
        WHERE id = ${questionnaireId}`
    );

    // 步骤4: 更新生活习惯字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET
        smoking_status = ${smokingStatus || null},
        smoking_years = ${smokingYears || null},
        smoking_per_day = ${smokingPerDay || null},
        drinking_status = ${drinkingStatus || null},
        drinking_frequency = ${drinkingFrequency || null},
        drinking_type = ${formatArray(drinkingType)},
        exercise_frequency = ${exerciseFrequency || null},
        exercise_duration = ${exerciseDuration || null},
        exercise_type = ${formatArray(exerciseType)}
        WHERE id = ${questionnaireId}`
    );

    // 步骤5: 更新睡眠和饮食字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET
        sleep_hours = ${sleepHours || null},
        sleep_quality = ${sleepQuality || null},
        sleep_issues = ${formatArray(sleepIssues)},
        diet_habits = ${dietHabits || null},
        diet_issues = ${formatArray(dietIssues)}
        WHERE id = ${questionnaireId}`
    );

    // 步骤6: 更新压力和家族史字段
    const familyHypertensionValue = familyHypertension === true;
    const familyDiabetesValue = familyDiabetes === true;
    const familyCardiovascularValue = familyCardiovascular === true;

    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET
        stress_level = ${stressLevel || null},
        stress_source = ${formatArray(stressSource)},
        family_hypertension = ${familyHypertensionValue},
        family_diabetes = ${familyDiabetesValue},
        family_cardiovascular = ${familyCardiovascularValue},
        family_other = ${formatArray(familyOther)}
        WHERE id = ${questionnaireId}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: questionnaireId,
        bmi,
        message: '健康问卷提交成功'
      }
    });

  } catch (error) {
    console.error('Health questionnaire submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '健康问卷提交失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/health-questionnaire?userId=xxx - 获取用户的健康问卷历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查询健康问卷历史
    const recordsResult = await (db.execute as any)(
      sql`SELECT * FROM health_questionnaires WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    );

    const records = recordsResult.rows;

    // 查询总数
    const countResult = await (db.execute as any)(
      sql`SELECT COUNT(*) as count FROM health_questionnaires WHERE user_id = ${userId}`
    );

    const total = Number(countResult.rows[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      }
    });

  } catch (error) {
    console.error('Error fetching health questionnaires:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取健康问卷记录失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
