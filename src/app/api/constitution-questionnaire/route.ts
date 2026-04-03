import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// GET /api/constitution-questionnaire - 获取用户的体质问卷记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: '请提供用户ID'
      }, { status: 400 });
    }

    const db = await getDb();

    // 获取最新的问卷记录
    const latestResult = await db.execute(sql`
      SELECT * FROM constitution_questionnaires
      WHERE user_id = ${userId}
      ORDER BY questionnaire_date DESC
      LIMIT 1
    `);

    // 获取历史记录
    const historyResult = await db.execute(sql`
      SELECT * FROM constitution_questionnaires
      WHERE user_id = ${userId}
      ORDER BY questionnaire_date DESC
      LIMIT 10
    `);

    const questionnaire = latestResult.rows?.[0];
    const history = historyResult.rows || [];

    return NextResponse.json({
      success: true,
      questionnaire: questionnaire ? {
        id: questionnaire.id,
        answers: questionnaire.answers,
        scores: questionnaire.scores,
        primaryConstitution: questionnaire.primary_constitution,
        secondaryConstitutions: questionnaire.secondary_constituents,
        isBalanced: questionnaire.is_balanced,
        questionnaireDate: questionnaire.questionnaire_date
      } : null,
      history: history.map((h: any) => ({
        primaryConstitution: h.primary_constitution,
        secondaryConstitutions: h.secondary_constituents,
        isBalanced: h.is_balanced,
        scores: h.scores,
        questionnaireDate: h.questionnaire_date
      }))
    });
  } catch (error) {
    console.error('[ConstitutionQuestionnaire] 获取失败:', error);
    return NextResponse.json(
      { error: '获取体质问卷失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/constitution-questionnaire - 保存体质问卷结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[ConstitutionQuestionnaire POST] Received request body:', JSON.stringify(body, null, 2));

    const { userId, answers, scores, primaryConstitution, secondaryConstitutions, isBalanced } = body;

    if (!userId || !answers || !scores || !primaryConstitution) {
      console.error('[ConstitutionQuestionnaire POST] 缺少必要参数:', {
        hasUserId: !!userId,
        hasAnswers: !!answers,
        hasScores: !!scores,
        hasPrimaryConstitution: !!primaryConstitution
      });
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 确保用户存在
    try {
      await (db.execute as any)(
        sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO UPDATE SET id = ${userId}`
      );
    } catch (userError) {
      console.error('[ConstitutionQuestionnaire POST] 确保用户存在失败:', userError);
      // 不阻止主流程，可能用户已存在
    }

    const questionnaireId = crypto.randomUUID();
    console.log('[ConstitutionQuestionnaire POST] 生成问卷ID:', questionnaireId);

    // 保存问卷结果
    await db.execute(sql`
      INSERT INTO constitution_questionnaires (
        id, user_id, answers, scores, primary_constitution,
        secondary_constituents, is_balanced, questionnaire_date
      ) VALUES (
        ${questionnaireId}, ${userId}, ${JSON.stringify(answers)},
        ${JSON.stringify(scores)}, ${primaryConstitution},
        ${JSON.stringify(secondaryConstitutions || [])}, ${isBalanced || false},
        NOW()
      )
    `);
    console.log('[ConstitutionQuestionnaire POST] 问卷保存成功');

    // 保存后，自动触发体质分析
    let analysisData = null;
    try {
      const analysisResponse = await fetch(`${process.env.CONGREGATE_CORS_ALLOWED_ORIGINS || 'http://localhost:5000'}/api/constitution-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (analysisResponse.ok) {
        analysisData = await analysisResponse.json();
        console.log('[ConstitutionQuestionnaire POST] 体质分析完成');
      }
    } catch (analysisError) {
      console.warn('[ConstitutionQuestionnaire POST] 体质分析失败，但不影响主流程:', analysisError);
    }

    return NextResponse.json({
      success: true,
      questionnaireId,
      message: '体质问卷保存成功',
      analysis: analysisData?.success ? analysisData : null
    });
  } catch (error) {
    console.error('[ConstitutionQuestionnaire POST] 保存失败:', error);
    return NextResponse.json(
      { error: '保存体质问卷失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
