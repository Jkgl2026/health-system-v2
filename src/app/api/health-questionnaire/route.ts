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
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET has_hypertension = ${hasHypertension}, hypertension_years = ${hypertensionYears}, hypertension_medications = ${hypertensionMedications}, has_diabetes = ${hasDiabetes}, diabetes_years = ${diabetesYears}, diabetes_type = ${diabetesType}, diabetes_medications = ${diabetesMedications}, has_hyperlipidemia = ${hasHyperlipidemia}, hyperlipidemia_years = ${hyperlipidemiaYears}, hyperlipidemia_medications = ${hyperlipidemiaMedications}, other_diseases = ${otherDiseases} WHERE id = ${questionnaireId}`
    );

    // 步骤3: 更新症状史字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET symptoms = ${symptoms}, symptom_duration = ${symptomDuration}, symptom_severity = ${symptomSeverity} WHERE id = ${questionnaireId}`
    );

    // 步骤4: 更新生活习惯字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET smoking_status = ${smokingStatus}, smoking_years = ${smokingYears}, smoking_per_day = ${smokingPerDay}, drinking_status = ${drinkingStatus}, drinking_frequency = ${drinkingFrequency}, drinking_type = ${drinkingType}, exercise_frequency = ${exerciseFrequency}, exercise_duration = ${exerciseDuration}, exercise_type = ${exerciseType} WHERE id = ${questionnaireId}`
    );

    // 步骤5: 更新睡眠和饮食字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET sleep_hours = ${sleepHours}, sleep_quality = ${sleepQuality}, sleep_issues = ${sleepIssues}, diet_habits = ${dietHabits}, diet_issues = ${dietIssues} WHERE id = ${questionnaireId}`
    );

    // 步骤6: 更新压力和家族史字段
    await (db.execute as any)(
      sql`UPDATE health_questionnaires SET stress_level = ${stressLevel}, stress_source = ${stressSource}, family_hypertension = ${familyHypertension}, family_diabetes = ${familyDiabetes}, family_cardiovascular = ${familyCardiovascular}, family_other = ${familyOther} WHERE id = ${questionnaireId}`
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
