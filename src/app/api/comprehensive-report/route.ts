import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { faceDiagnosisRecords, tongueDiagnosisRecords, healthProfiles } from '@/storage/database/shared/schema';
import { desc, eq, sql } from 'drizzle-orm';

// GET /api/comprehensive-report - 获取综合健康报告
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const db = await getDb();

    // 获取最新的面诊记录
    const faceResult = await db
      .select()
      .from(faceDiagnosisRecords)
      .where(userId ? eq(faceDiagnosisRecords.userId, userId) : sql`1=1`)
      .orderBy(desc(faceDiagnosisRecords.createdAt))
      .limit(1);

    const faceRecord = faceResult[0] || null;

    // 获取最新的舌诊记录
    const tongueResult = await db
      .select()
      .from(tongueDiagnosisRecords)
      .where(userId ? eq(tongueDiagnosisRecords.userId, userId) : sql`1=1`)
      .orderBy(desc(tongueDiagnosisRecords.createdAt))
      .limit(1);

    const tongueRecord = tongueResult[0] || null;

    if (!faceRecord && !tongueRecord) {
      return NextResponse.json({
        success: false,
        error: '暂无诊断记录，请先进行面诊或舌诊',
      });
    }

    // 解析数据
    const parseJson = (data: any) => {
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    };

    const faceData = faceRecord ? {
      ...faceRecord,
      organ_status: parseJson(faceRecord.organStatus),
      constitution: parseJson(faceRecord.constitution),
      recommendations: parseJson(faceRecord.suggestions),
      diagnosis_details: parseJson(faceRecord.faceColor),
      full_report: faceRecord.fullReport,
    } : null;

    const tongueData = tongueRecord ? {
      ...tongueRecord,
      organ_status: parseJson(tongueRecord.organStatus),
      constitution: parseJson(tongueRecord.constitution),
      recommendations: parseJson(tongueRecord.suggestions),
      diagnosis_details: parseJson(tongueRecord.tongueBody),
      full_report: tongueRecord.fullReport,
    } : null;

    // 计算综合评分
    let overallScore = null;
    if (faceData?.score && tongueData?.score) {
      overallScore = Math.round((Number(faceData.score) + Number(tongueData.score)) / 2);
    } else {
      overallScore = faceData?.score || tongueData?.score || null;
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
        comprehensiveAnalysis: {
          overallScore,
          organStatus: mergedOrganStatus,
          constitution: mergedConstitution,
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
