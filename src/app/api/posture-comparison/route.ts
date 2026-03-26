import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

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

// 确保posture_comparisons表存在
async function ensurePostureComparisonsTable(db: any) {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS posture_comparisons (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(36) NOT NULL,
      current_record_id VARCHAR(36) NOT NULL,
      previous_record_id VARCHAR(36) NOT NULL,
      score_change INTEGER,
      improvements JSONB,
      deteriorations JSONB,
      stable_items JSONB,
      comparison_images JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

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

    // 确保表存在
    await ensurePostureComparisonsTable(db);

    // 查询当前记录 - 使用原始SQL
    const currentResult = await db.execute(sql`
      SELECT * FROM posture_diagnosis_records WHERE id = ${currentRecordId} LIMIT 1
    `);

    if (!currentResult.rows[0]) {
      return NextResponse.json(
        { success: false, error: '当前评估记录不存在' },
        { status: 404 }
      );
    }

    // 如果没有提供previousRecordId，自动获取上一次记录
    let previousRecord = null;
    let previousRecordIdToUse = previousRecordId;

    if (!previousRecordIdToUse) {
      const previousResult = await db.execute(sql`
        SELECT * FROM posture_diagnosis_records 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT 2
      `);

      if (previousResult.rows.length > 1) {
        previousRecord = previousResult.rows[1];
        previousRecordIdToUse = previousRecord.id;
      }
    } else {
      const prevResult = await db.execute(sql`
        SELECT * FROM posture_diagnosis_records WHERE id = ${previousRecordIdToUse} LIMIT 1
      `);
      
      previousRecord = prevResult.rows[0];
    }

    if (!previousRecord) {
      return NextResponse.json(
        { success: false, error: '没有找到可对比的历史记录' },
        { status: 404 }
      );
    }

    const currentRecord = currentResult.rows[0];

    // 准备对比数据
    const comparisonData = {
      current: {
        score: currentRecord.score,
        grade: currentRecord.grade,
        bodyStructure: currentRecord.body_structure,
        fasciaChainAnalysis: currentRecord.fascia_chain_analysis,
        muscleAnalysis: currentRecord.muscle_analysis,
        breathingAssessment: currentRecord.breathing_assessment,
        alignmentAssessment: currentRecord.alignment_assessment,
        compensationPatterns: currentRecord.compensation_patterns,
      },
      previous: {
        score: previousRecord.score,
        grade: previousRecord.grade,
        bodyStructure: previousRecord.body_structure,
        fasciaChainAnalysis: previousRecord.fascia_chain_analysis,
        muscleAnalysis: previousRecord.muscle_analysis,
        breathingAssessment: previousRecord.breathing_assessment,
        alignmentAssessment: previousRecord.alignment_assessment,
        compensationPatterns: previousRecord.compensation_patterns,
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

**当前评估**（${currentRecord.created_at}）：
${JSON.stringify(comparisonData.current, null, 2)}

**之前评估**（${previousRecord.created_at}）：
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
      const currentScore = Number((currentRecord as any).score) || 0;
      const previousScore = Number((previousRecord as any).score) || 0;
      comparisonResult = {
        scoreChange: currentScore - previousScore,
        improvements: [],
        deteriorations: [],
        stableItems: [],
        overallAssessment: response.content,
        recommendations: [],
      };
    }

    // 保存对比记录 - 使用原始SQL
    const insertResult = await db.execute(sql`
      INSERT INTO posture_comparisons 
      (user_id, current_record_id, previous_record_id, score_change, improvements, deteriorations, stable_items, comparison_images)
      VALUES (${userId}, ${currentRecordId}, ${previousRecordIdToUse}, ${comparisonResult.scoreChange || 0}, 
              ${JSON.stringify(comparisonResult.improvements || [])}, 
              ${JSON.stringify(comparisonResult.deteriorations || [])}, 
              ${JSON.stringify(comparisonResult.stableItems || [])}, NULL)
      RETURNING id
    `);

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult.rows[0]?.id,
        ...comparisonResult,
        currentRecord: currentRecord,
        previousRecord: previousRecord,
        currentRecordDate: currentRecord.created_at,
        previousRecordDate: previousRecord.created_at,
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

    // 确保表存在
    await ensurePostureComparisonsTable(db);

    // 查询对比记录 - 使用原始SQL
    const comparisonsResult = await db.execute(sql`
      SELECT * FROM posture_comparisons 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
    const comparisons = comparisonsResult.rows;

    // 查询总数
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM posture_comparisons WHERE user_id = ${userId}
    `);

    const total = Number(countResult.rows[0]?.count) || 0;

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
