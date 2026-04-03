import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import { healthDataManager } from '@/storage/database';
import type { InsertHealthAnalysis } from '@/storage/database';
import { applyRateLimit } from '@/lib/rate-limit-middleware';
import { RateLimiter } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

// 创建速率限制器（中等模式：每分钟最多20次请求）
const healthAnalysisRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 20,
  message: '请求过于频繁，请稍后再试',
});

// POST /api/health-analysis - 保存健康要素分析结果
export async function POST(request: NextRequest) {
  try {
    // 应用速率限制
    const rateLimitResult = applyRateLimit(request, healthAnalysisRateLimiter);
    if (!rateLimitResult.success) {
      return rateLimitResult.response!;
    }

    const data = await request.json();
    const { sessionId } = data; // 提取 sessionId

    const analysisData: InsertHealthAnalysis = {
      userId: data.userId,
      qiAndBlood: data.qiAndBlood || null,
      circulation: data.circulation || null,
      toxins: data.toxins || null,
      bloodLipids: data.bloodLipids || null,
      coldness: data.coldness || null,
      immunity: data.immunity || null,
      emotions: data.emotions || null,
      overallHealth: data.overallHealth || null,
    };

    const analysis = await healthDataManager.createHealthAnalysis(analysisData);

    // 如果有 sessionId，更新评估会话
    if (sessionId && analysis.id) {
      const db = await getDb();
      try {
        await (db.execute as any)(sql`
          UPDATE assessment_sessions
          SET health_analysis_id = ${analysis.id},
              updated_at = NOW()
          WHERE id = ${sessionId}
        `);
      } catch (sessionError) {
        console.error('[HealthAnalysis] 更新会话失败:', sessionError);
        // 不阻止主流程
      }
    }

    // 统一响应格式：{ success: true, data: { id, ... } }
    return NextResponse.json({
      success: true,
      data: {
        id: analysis.id,
        ...analysis
      }
    }, { status: 201 });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// GET /api/health-analysis - 获取用户的健康要素分析记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '必须提供 userId 参数' },
        { status: 400 }
      );
    }

    const analyses = await healthDataManager.getHealthAnalysisByUserId(userId);

    // 统一响应格式
    return NextResponse.json({
      success: true,
      data: analyses
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
