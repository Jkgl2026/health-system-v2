import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { healthProfiles } from '@/storage/database/shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/comprehensive-report - 获取综合健康报告
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 获取最新的面诊记录 (使用原始SQL)
    const faceResult = await db.execute(sql`
      SELECT * FROM face_diagnosis_records 
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const faceRecord = faceResult.rows[0] || null;

    // 获取最新的舌诊记录 (使用原始SQL)
    const tongueResult = await db.execute(sql`
      SELECT * FROM tongue_diagnosis_records 
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const tongueRecord = tongueResult.rows[0] || null;

    // 获取最新的体态评估记录 (使用原始SQL)
    const postureResult = await db.execute(sql`
      SELECT * FROM posture_diagnosis_records 
      ${userId ? sql`WHERE user_id = ${userId}` : sql``}
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const postureRecord = postureResult.rows[0] || null;

    if (!faceRecord && !tongueRecord && !postureRecord) {
      return NextResponse.json({
        success: false,
        error: '暂无诊断记录，请先进行面诊、舌诊或体态评估',
      });
    }

    // 解析数据
    const parseJson = (data: any) => {
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    };

    // 使用 any 类型来避免 TypeScript 对原始 SQL 结果的类型检查
    const faceData = faceRecord ? {
      ...faceRecord,
      score: (faceRecord as any).score,
      organ_status: parseJson((faceRecord as any).organ_status),
      constitution: parseJson((faceRecord as any).constitution),
      recommendations: parseJson((faceRecord as any).suggestions),
      diagnosis_details: parseJson((faceRecord as any).face_color),
      full_report: (faceRecord as any).full_report,
    } as any : null;

    const tongueData = tongueRecord ? {
      ...tongueRecord,
      score: (tongueRecord as any).score,
      organ_status: parseJson((tongueRecord as any).organ_status),
      constitution: parseJson((tongueRecord as any).constitution),
      recommendations: parseJson((tongueRecord as any).suggestions),
      diagnosis_details: parseJson((tongueRecord as any).tongue_body),
      full_report: (tongueRecord as any).full_report,
    } as any : null;

    const postureData = postureRecord ? {
      ...postureRecord,
      score: (postureRecord as any).score,
      grade: (postureRecord as any).grade,
      bodyStructure: parseJson((postureRecord as any).body_structure),
      fasciaChainAnalysis: parseJson((postureRecord as any).fascia_chain_analysis),
      muscleAnalysis: parseJson((postureRecord as any).muscle_analysis),
      breathingAssessment: parseJson((postureRecord as any).breathing_assessment),
      alignmentAssessment: parseJson((postureRecord as any).alignment_assessment),
      compensationPatterns: parseJson((postureRecord as any).compensation_patterns),
      healthImpact: parseJson((postureRecord as any).health_impact),
      healthPrediction: parseJson((postureRecord as any).health_prediction),
      treatmentPlan: parseJson((postureRecord as any).treatment_plan),
    } as any : null;

    // 计算综合评分（包含面诊、舌诊、体态）
    let overallScore = null;
    const scores: number[] = [];
    if (faceData?.score) scores.push(Number(faceData.score));
    if (tongueData?.score) scores.push(Number(tongueData.score));
    if (postureData?.score) scores.push(Number(postureData.score));
    
    if (scores.length > 0) {
      overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    // 合并五脏状态
    const mergedOrganStatus: Record<string, any> = {
      heart: { face: null, tongue: null },
      liver: { face: null, tongue: null },
      spleen: { face: null, tongue: null },
      lung: { face: null, tongue: null },
      kidney: { face: null, tongue: null },
    };

    if (faceData?.organ_status) {
      Object.keys(mergedOrganStatus).forEach(organ => {
        if (faceData.organ_status[organ] !== undefined) {
          mergedOrganStatus[organ].face = faceData.organ_status[organ];
        }
      });
    }
    if (tongueData?.organ_status) {
      Object.keys(mergedOrganStatus).forEach(organ => {
        if (tongueData.organ_status[organ] !== undefined) {
          mergedOrganStatus[organ].tongue = tongueData.organ_status[organ];
        }
      });
    }

    // 合并体质判断
    let mergedConstitution = null;
    if (faceData?.constitution?.type && tongueData?.constitution?.type) {
      // 如果两种诊断一致，取该体质，否则取面诊结果
      mergedConstitution = faceData.constitution.type === tongueData.constitution.type
        ? faceData.constitution
        : { 
            type: `${faceData.constitution.type}（面诊）/ ${tongueData.constitution.type}（舌诊）`,
            description: '面诊与舌诊判断略有差异，建议咨询专业中医师',
          };
    } else {
      mergedConstitution = faceData?.constitution || tongueData?.constitution || null;
    }

    // 合并建议（去重）
    const mergedRecommendations: any[] = [];
    const seenTexts = new Set<string>();

    const addRecommendations = (recs: any[]) => {
      recs?.forEach((rec: any) => {
        const text = typeof rec === 'string' ? rec : rec.text || rec.content || rec;
        if (text && !seenTexts.has(text)) {
          seenTexts.add(text);
          mergedRecommendations.push(typeof rec === 'string' ? { text: rec } : rec);
        }
      });
    };

    addRecommendations(faceData?.recommendations || []);
    addRecommendations(tongueData?.recommendations || []);

    // 添加体态评估建议
    if (postureData?.treatmentPlan?.lifestyle) {
      postureData.treatmentPlan.lifestyle.forEach((item: any) => {
        if (item.content && !seenTexts.has(item.content)) {
          seenTexts.add(item.content);
          mergedRecommendations.push({ text: item.content, type: '体态', category: item.type });
        }
      });
    }

    // 获取健康档案
    const profileResult = await db
      .select()
      .from(healthProfiles)
      .where(userId ? eq(healthProfiles.userId, userId) : sql`1=1`)
      .orderBy(desc(healthProfiles.updatedAt))
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        faceDiagnosis: faceData,
        tongueDiagnosis: tongueData,
        postureDiagnosis: postureData,
        comprehensiveAnalysis: {
          overallScore,
          organStatus: mergedOrganStatus,
          constitution: mergedConstitution,
          postureGrade: postureData?.grade || null,
          postureScore: postureData?.score || null,
          recommendations: mergedRecommendations.slice(0, 10), // 最多10条建议
        },
        healthProfile: profileResult[0] || null,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating comprehensive report:', error);
    return NextResponse.json(
      { success: false, error: '生成综合报告失败' },
      { status: 500 }
    );
  }
}
