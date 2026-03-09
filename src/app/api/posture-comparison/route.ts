import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { postureDiagnosisRecords, postureComparisons } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';

// 体态对比系统提示词
const POSTURE_COMPARISON_SYSTEM_PROMPT = `你是一位专业的体态评估专家，请对比分析两次体态评估结果，找出改善和恶化的地方。

## 输出格式

请严格按照以下JSON格式输出：

{
  "scoreChange": <评分变化值，正数表示改善，负数表示恶化>,
  "improvements": [
    {
      "category": "<改善类别：身体结构/筋膜链/肌肉/呼吸/重心/代偿模式>",
      "item": "<具体项目>",
      "previous": "<之前状态>",
      "current": "<当前状态>",
      "change": "<变化程度：显著改善/轻度改善/基本持平>",
      "significance": "<临床意义>"
    }
  ],
  "deteriorations": [
    {
      "category": "<恶化类别>",
      "item": "<具体项目>",
      "previous": "<之前状态>",
      "current": "<当前状态>",
      "change": "<变化程度：显著恶化/轻度恶化>",
      "significance": "<临床意义>"
    }
  ],
  "stableItems": [
    {
      "category": "<稳定类别>",
      "item": "<具体项目>",
      "status": "<当前状态>"
    }
  ],
  "overallAssessment": "<整体评估结论>",
  "recommendations": ["<下一步建议>"]
}`;

// POST /api/posture-comparison - 创建体态对比分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentRecordId, previousRecordId } = body;

    if (!userId || !currentRecordId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查询当前记录
    const currentRecords = await db
      .select()
      .from(postureDiagnosisRecords)
      .where(eq(postureDiagnosisRecords.id, currentRecordId))
      .limit(1);

    if (!currentRecords[0]) {
      return NextResponse.json(
        { success: false, error: '当前评估记录不存在' },
        { status: 404 }
      );
    }

    // 如果没有提供previousRecordId，自动获取上一次记录
    let previousRecord = null;
    let previousRecordIdToUse = previousRecordId;

    if (!previousRecordIdToUse) {
      const previousRecords = await db
        .select()
        .from(postureDiagnosisRecords)
        .where(eq(postureDiagnosisRecords.userId, userId))
        .orderBy(desc(postureDiagnosisRecords.createdAt))
        .limit(2);

      if (previousRecords.length > 1) {
        previousRecord = previousRecords[1];
        previousRecordIdToUse = previousRecord.id;
      }
    } else {
      const previousRecords = await db
        .select()
        .from(postureDiagnosisRecords)
        .where(eq(postureDiagnosisRecords.id, previousRecordIdToUse))
        .limit(1);
      
      previousRecord = previousRecords[0];
    }

    if (!previousRecord) {
      return NextResponse.json(
        { success: false, error: '没有找到可对比的历史记录' },
        { status: 404 }
      );
    }

    const currentRecord = currentRecords[0];

    // 准备对比数据
    const comparisonData = {
      current: {
        score: currentRecord.score,
        grade: currentRecord.grade,
        bodyStructure: currentRecord.bodyStructure,
        fasciaChainAnalysis: currentRecord.fasciaChainAnalysis,
        muscleAnalysis: currentRecord.muscleAnalysis,
        breathingAssessment: currentRecord.breathingAssessment,
        alignmentAssessment: currentRecord.alignmentAssessment,
        compensationPatterns: currentRecord.compensationPatterns,
      },
      previous: {
        score: previousRecord.score,
        grade: previousRecord.grade,
        bodyStructure: previousRecord.bodyStructure,
        fasciaChainAnalysis: previousRecord.fasciaChainAnalysis,
        muscleAnalysis: previousRecord.muscleAnalysis,
        breathingAssessment: previousRecord.breathingAssessment,
        alignmentAssessment: previousRecord.alignmentAssessment,
        compensationPatterns: previousRecord.compensationPatterns,
      }
    };

    // 初始化LLM客户端进行智能对比
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: POSTURE_COMPARISON_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `请对比以下两次体态评估结果：

**当前评估**（${currentRecord.createdAt}）：
${JSON.stringify(comparisonData.current, null, 2)}

**之前评估**（${previousRecord.createdAt}）：
${JSON.stringify(comparisonData.previous, null, 2)}

请详细分析变化情况并给出JSON格式的对比结果。`
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.3,
    });

    // 解析JSON响应
    let comparisonResult;
    try {
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      comparisonResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse comparison JSON:', response.content);
      // 如果解析失败，使用简单的评分对比
      comparisonResult = {
        scoreChange: (currentRecord.score || 0) - (previousRecord.score || 0),
        improvements: [],
        deteriorations: [],
        stableItems: [],
        overallAssessment: response.content,
        recommendations: [],
      };
    }

    // 保存对比记录
    const insertResult = await db.insert(postureComparisons).values({
      userId,
      currentRecordId,
      previousRecordId: previousRecordIdToUse,
      scoreChange: comparisonResult.scoreChange,
      improvements: comparisonResult.improvements,
      deteriorations: comparisonResult.deteriorations,
      stableItems: comparisonResult.stableItems,
      comparisonImages: null, // 可以后续添加差异标注图
    }).returning({ id: postureComparisons.id });

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult[0]?.id,
        ...comparisonResult,
        currentRecord: currentRecord,
        previousRecord: previousRecord,
        currentRecordDate: currentRecord.createdAt,
        previousRecordDate: previousRecord.createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating posture comparison:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '体态对比分析失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-comparison - 获取体态对比历史
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

    // 查询对比记录
    const comparisons = await db
      .select()
      .from(postureComparisons)
      .where(eq(postureComparisons.userId, userId))
      .orderBy(desc(postureComparisons.createdAt))
      .limit(limit)
      .offset(offset);

    // 查询总数
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(postureComparisons)
      .where(eq(postureComparisons.userId, userId));

    const total = Number(countResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        comparisons,
        total,
        limit,
        offset,
      }
    });

  } catch (error) {
    console.error('Error fetching posture comparisons:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取体态对比记录失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 导入sql用于计数查询
import { sql } from 'drizzle-orm';
