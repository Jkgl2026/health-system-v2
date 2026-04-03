import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import { AnalysisEngine } from '@/lib/analysis-engine';
import { CacheManager, CacheKeyGenerator, globalCacheManager } from '@/lib/cache-system';

/**
 * 分析引擎API路由
 * POST /api/assessment/analyze - 执行健康分析
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少sessionId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查缓存
    const cache = globalCacheManager.getCache('analysis');
    const cacheKey = CacheKeyGenerator.generateCustom('analysis', { sessionId });
    const cachedResult = cache.get(cacheKey);
    
    if (cachedResult) {
      console.log(`[分析引擎] 使用缓存结果: ${sessionId}`);
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // 查询会话信息
    const sessionResult = await (db.execute as any)(
      sql`
        SELECT 
          id,
          user_id,
          personal_info,
          health_questionnaire_id,
          constitution_questionnaire_id,
          status
        FROM assessment_sessions
        WHERE id = ${sessionId}
      `
    );

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];
    
    // 检查是否已完成健康问卷和体质问卷
    if (!session.health_questionnaire_id || !session.constitution_questionnaire_id) {
      return NextResponse.json(
        { success: false, error: '请先完成健康问卷和体质问卷' },
        { status: 400 }
      );
    }

    // 查询健康问卷
    const healthResult = await (db.execute as any)(
      sql`
        SELECT *
        FROM health_questionnaires
        WHERE id = ${session.health_questionnaire_id}
      `
    );

    // 查询体质问卷
    const constitutionResult = await (db.execute as any)(
      sql`
        SELECT *
        FROM constitution_questionnaires
        WHERE id = ${session.constitution_questionnaire_id}
      `
    );

    if (!healthResult.rows || healthResult.rows.length === 0 ||
        !constitutionResult.rows || constitutionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '问卷数据不存在' },
        { status: 404 }
      );
    }

    const healthQuestionnaire = healthResult.rows[0];
    const constitutionQuestionnaire = constitutionResult.rows[0];
    
    const personalInfo = session.personal_info || {};

    // 创建分析引擎实例
    const engine = new AnalysisEngine({
      healthQuestionnaire,
      constitutionQuestionnaire,
      personalInfo
    });

    try {
      // 执行分析
      const healthScores = await engine.calculateHealthScores();
      const riskAssessment = await engine.calculateRiskAssessment();
      const constitutionAnalysis = await engine.analyzeConstitution();
      const qualityOfLife = await engine.assessQualityOfLife();
      const lifeExpectancy = await engine.calculateLifeExpectancy();
      const tcmDiagnosis = await engine.performTCMDiagnosis();
      const recommendations = await engine.generateRecommendations();

      // 整合结果
      const analysisResult = await engine.integrateResults({
        healthScores,
        riskAssessment,
        constitutionAnalysis,
        qualityOfLife,
        lifeExpectancy,
        tcmDiagnosis,
        recommendations
      });

      // 设置 sessionId
      analysisResult.sessionId = sessionId;

      // 保存分析结果到数据库
      const analysisId = crypto.randomUUID();
      await (db.execute as any)(
        sql`
          INSERT INTO health_analysis (
            id,
            user_id,
            qi_and_blood,
            circulation,
            toxins,
            blood_lipids,
            coldness,
            immunity,
            emotions,
            overall_health,
            analyzed_at
          )
          VALUES (
            ${analysisId},
            ${session.user_id},
            ${Math.round(healthScores.qiAndBlood)},
            ${Math.round(healthScores.circulation)},
            ${Math.round(healthScores.toxins)},
            ${Math.round(healthScores.bloodLipids)},
            ${Math.round(healthScores.coldness)},
            ${Math.round(healthScores.immunity)},
            ${Math.round(healthScores.emotions)},
            ${Math.round(healthScores.overallHealth)},
            NOW()
          )
        `
      );

      // 更新会话状态
      await (db.execute as any)(
        sql`
          UPDATE assessment_sessions
          SET 
            health_analysis_id = ${analysisId},
            status = 'completed',
            completed_at = NOW(),
            updated_at = NOW()
          WHERE id = ${sessionId}
        `
      );

      // 缓存结果
      cache.set(cacheKey, analysisResult, 3600);

      const executionTime = Date.now() - startTime;
      console.log(`[分析引擎] 分析完成，耗时: ${executionTime}ms`);

      return NextResponse.json({
        success: true,
        data: {
          analysisId,
          ...analysisResult
        },
        executionTime
      });

    } catch (engineError) {
      console.error('[分析引擎] 分析过程出错:', engineError);
      
      return NextResponse.json(
        {
          success: false,
          error: '分析过程出错',
          details: engineError instanceof Error ? engineError.message : '未知错误'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[分析引擎] API错误:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '分析服务暂时不可用，请稍后重试'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessment/analyze - 获取分析结果
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: '缺少sessionId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // 检查缓存
    const cacheManager = new CacheManager();
    const cacheKey = new CacheKeyGenerator().generate('analysis', { sessionId });
    const cachedResult = await cacheManager.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // 从数据库查询
    const result = await (db.execute as any)(
      sql`
        SELECT 
          ha.id,
          ha.analysis_data,
          asession.status,
          asession.completed_at
        FROM health_analysis ha
        JOIN assessment_sessions asession ON ha.session_id = asession.id
        WHERE ha.session_id = ${sessionId}
        ORDER BY ha.created_at DESC
        LIMIT 1
      `
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '分析结果不存在' },
        { status: 404 }
      );
    }

    const analysis = result.rows[0];

    // 如果分析已完成，缓存结果
    if (analysis.status === 'completed') {
      await cacheManager.set(cacheKey, analysis.analysis_data, 3600);
    }

    return NextResponse.json({
      success: true,
      data: analysis.analysis_data,
      status: analysis.status,
      completedAt: analysis.completed_at
    });

  } catch (error) {
    console.error('[分析引擎] 获取结果错误:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取分析结果失败'
      },
      { status: 500 }
    );
  }
}
