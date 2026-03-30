import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

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
    await db.execute(
      'INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO UPDATE SET id = $1',
      [userId]
    );

    // 插入健康问卷
    const result = await db.execute(`
      INSERT INTO health_questionnaires (
        user_id, age, gender, height, weight, bmi,
        has_hypertension, hypertension_years, hypertension_medications,
        has_diabetes, diabetes_years, diabetes_type, diabetes_medications,
        has_hyperlipidemia, hyperlipidemia_years, hyperlipidemia_medications,
        other_diseases, symptoms, symptom_duration, symptom_severity,
        smoking_status, smoking_years, smoking_per_day,
        drinking_status, drinking_frequency, drinking_type,
        exercise_frequency, exercise_duration, exercise_type,
        sleep_hours, sleep_quality, sleep_issues,
        diet_habits, diet_issues, stress_level, stress_source,
        family_hypertension, family_diabetes, family_cardiovascular, family_other,
        notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23,
        $24, $25, $26,
        $27, $28, $29,
        $30, $31, $32,
        $33, $34, $35, $36,
        $37, $38, $39, $40,
        $41
      )
      RETURNING id
    `, [
      userId, age, gender, height, weight, bmi,
      hasHypertension, hypertensionYears, hypertensionMedications,
      hasDiabetes, diabetesYears, diabetesType, diabetesMedications,
      hasHyperlipidemia, hyperlipidemiaYears, hyperlipidemiaMedications,
      otherDiseases, symptoms, symptomDuration, symptomSeverity,
      smokingStatus, smokingYears, smokingPerDay,
      drinkingStatus, drinkingFrequency, drinkingType,
      exerciseFrequency, exerciseDuration, exerciseType,
      sleepHours, sleepQuality, sleepIssues,
      dietHabits, dietIssues, stressLevel, stressSource,
      familyHypertension, familyDiabetes, familyCardiovascular, familyOther,
      notes
    ]);

    const questionnaireId = result.rows[0]?.id;

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
    const recordsResult = await db.execute(`
      SELECT * FROM health_questionnaires 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const records = recordsResult.rows;

    // 查询总数
    const countResult = await db.execute(`
      SELECT COUNT(*) as count FROM health_questionnaires WHERE user_id = $1
    `, [userId]);

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
