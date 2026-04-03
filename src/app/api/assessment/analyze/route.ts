import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import {
  AnalysisEngine,
  AnalysisProgress,
  AnalysisError
} from '@/lib/analysis-engine';
import { 
  AnalysisError as AnalysisErrorType,
  ErrorHandler 
} from '@/lib/error-handling';
import { 
  CacheManager,
  createCacheKey
} from '@/lib/cache-system';

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
    const cacheManager = new CacheManager();
    const cacheKey = createCacheKey('analysis', sessionId);
    const cachedResult = await cacheManager.get(cacheKey);
    
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
        SELECT response_data
        FROM health_questionnaire_responses
        WHERE id = ${session.health_questionnaire_id}
      `
    );

    // 查询体质问卷
    const constitutionResult = await (db.execute as any)(
      sql`
        SELECT response_data, primary_constitution
        FROM constitution_questionnaire_responses
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

    const healthQuestionnaire = healthResult.rows[0].response_data;
    const constitutionQuestionnaire = {
      ...constitutionResult.rows[0].response_data,
      primaryConstitution: constitutionResult.rows[0].primary_constitution
    };
    
    const personalInfo = session.personal_info || {};

    // 创建分析引擎实例
    const engine = new AnalysisEngine({
      healthQuestionnaire,
      constitutionQuestionnaire,
      personalInfo
    });

    // 执行分析（带进度跟踪）
    let currentStep = 0;
    const totalSteps = 8;
    
    const updateProgress = async (progress: number, step: string) => {
      currentStep++;
      console.log(`[分析引擎] 进度: ${progress}% - ${step} (${currentStep}/${totalSteps})`);
    };

    try {
      // 1. 计算健康评分
      await updateProgress(12.5, '计算健康评分');
      const healthScores = await engine.calculateHealthScores();

      // 2. 计算风险评估
      await updateProgress(25, '计算风险评估');
      const riskAssessment = await engine.calculateRiskAssessment();

      // 3. 体质分析
      await updateProgress(37.5, '体质分析');
      const constitutionAnalysis = await engine.analyzeConstitution();

      // 4. 生活质量评估
      await updateProgress(50, '生活质量评估');
      const qualityOfLife = await engine.assessQualityOfLife();

      // 5. 预期寿命评估
      await updateProgress(62.5, '预期寿命评估');
      const lifeExpectancy = await engine.calculateLifeExpectancy();

      // 6. 中医辨证
      await updateProgress(75, '中医辨证');
      const tcmDiagnosis = await engine.performTCMDiagnosis();

      // 7. 生成综合建议
      await updateProgress(87.5, '生成综合建议');
      const recommendations = await engine.generateRecommendations();

      // 8. 整合结果
      await updateProgress(100, '整合结果');
      const analysisResult = await engine.integrateResults({
        healthScores,
        riskAssessment,
        constitutionAnalysis,
        qualityOfLife,
        lifeExpectancy,
        tcmDiagnosis,
        recommendations
      });

      // 保存分析结果到数据库
      const analysisId = crypto.randomUUID();
      await (db.execute as any)(
        sql`
          INSERT INTO health_analysis (
            id,
            session_id,
            analysis_data,
            created_at
          )
          VALUES (
            ${analysisId},
            ${sessionId},
            ${JSON.stringify(analysisResult)},
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
      await cacheManager.set(cacheKey, analysisResult, 3600); // 缓存1小时

      const executionTime = Date.now() - startTime;
      console.log(`[分析引擎] 分析完成，耗时: ${executionTime}ms`);

      return NextResponse.json({
        success: true,
        data: {
          analysisId,
          sessionId,
          ...analysisResult
        },
        executionTime
      });

    } catch (engineError) {
      // 处理分析引擎内部错误
      const error = engineError as AnalysisErrorType;
      console.error('[分析引擎] 分析过程出错:', error);
      
      // 使用错误处理器处理
      const handledError = ErrorHandler.handleError(error);
      
      return NextResponse.json(
        {
          success: false,
          error: handledError.userMessage,
          details: {
            code: handledError.code,
            severity: handledError.severity,
            suggestion: handledError.suggestion
          }
        },
        { status: handledError.severity === 'critical' ? 500 : 400 }
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
    const cacheKey = createCacheKey('analysis', sessionId);
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
