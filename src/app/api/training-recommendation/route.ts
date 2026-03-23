import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { exerciseLibrary } from '@/storage/database/shared/schema';
import { eq, sql } from 'drizzle-orm';

// 训练推荐系统提示词
const TRAINING_RECOMMENDATION_PROMPT = `你是一位专业的运动康复专家，请根据用户的体态评估结果和训练动作库，生成个性化的训练推荐方案。

## 输出格式

请严格按照以下JSON格式输出：

{
  "recommendedSessions": [
    {
      "name": "<训练课名称>",
      "type": "<类型：整复训练/本源训练>",
      "duration": "<预计时长>",
      "frequency": "<建议频率>",
      "exercises": [
        {
          "exerciseId": "<动作ID>",
          "name": "<动作名称>",
          "sets": <组数>,
          "reps": "<次数/时长>",
          "restTime": "<组间休息>",
          "notes": "<注意事项>",
          "progression": "<进阶建议>"
        }
      ],
      "targetIssues": ["<针对的体态问题>"],
      "goals": ["<训练目标>"]
    }
  ],
  "priorityIssues": ["<优先解决的问题>"],
  "estimatedTimeline": "<预计改善时间>",
  "keyPoints": ["<关键要点>"],
  "cautions": ["<注意事项>"]
}`;

// POST /api/training-recommendation - 生成训练推荐
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, diagnosisRecordId, phase = 'all' } = body;

    if (!diagnosisRecordId) {
      return NextResponse.json(
        { success: false, error: '缺少诊断记录ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查询诊断记录 - 使用原始SQL
    const diagnosisResult = await db.execute(sql`
      SELECT * FROM posture_diagnosis_records WHERE id = ${diagnosisRecordId} LIMIT 1
    `);

    if (!diagnosisResult.rows[0]) {
      return NextResponse.json(
        { success: false, error: '诊断记录不存在' },
        { status: 404 }
      );
    }

    const diagnosisRecord = diagnosisResult.rows[0];

    // 查询训练动作库
    const exercises = await db
      .select()
      .from(exerciseLibrary)
      .where(eq(exerciseLibrary.isActive, true))
      .orderBy(exerciseLibrary.sortOrder);

    // 提取用户主要问题
    const mainIssues: string[] = [];
    
    if (diagnosisRecord.body_structure) {
      const bodyStructure = diagnosisRecord.body_structure as Record<string, any>;
      Object.entries(bodyStructure).forEach(([key, value]) => {
        if (value && typeof value === 'object' && (value as any).severity && (value as any).severity !== '无') {
          mainIssues.push(key);
        }
      });
    }

    // 按阶段准备训练动作
    const zhengfuExercises = exercises.filter(e => e.category === '整复训练');
    const benyuanExercises = exercises.filter(e => e.category === '本源训练');

    // 准备推荐数据
    const recommendationContext = {
      diagnosis: {
        score: diagnosisRecord.score,
        grade: diagnosisRecord.grade,
        bodyStructure: diagnosisRecord.body_structure,
        fasciaChainAnalysis: diagnosisRecord.fascia_chain_analysis,
        muscleAnalysis: diagnosisRecord.muscle_analysis,
        breathingAssessment: diagnosisRecord.breathing_assessment,
        compensationPatterns: diagnosisRecord.compensation_patterns,
        mainIssues,
      },
      exerciseLibrary: {
        zhengfu: zhengfuExercises.slice(0, 20).map(e => ({
          id: e.id,
          name: e.name,
          subCategory: e.subCategory,
          description: e.description,
          targetIssues: e.targetIssues,
          method: (e as any).method || e.description,
        })),
        benyuan: benyuanExercises.slice(0, 20).map(e => ({
          id: e.id,
          name: e.name,
          subCategory: e.subCategory,
          description: e.description,
          targetIssues: e.targetIssues,
          method: (e as any).method || e.description,
        })),
      },
      phase,
    };

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: TRAINING_RECOMMENDATION_PROMPT },
      {
        role: 'user' as const,
        content: `请根据以下体态评估结果和训练动作库，生成个性化的训练推荐方案：

**体态评估结果**：
${JSON.stringify(recommendationContext.diagnosis, null, 2)}

**可用训练动作库**：
${JSON.stringify(recommendationContext.exerciseLibrary, null, 2)}

**要求**：
1. 根据用户的体态问题，选择最相关的训练动作
2. 优先解决评分较低的问题
3. 整复训练用于改善结构问题，本源训练用于建立正确运动模式
4. 给出具体的组数、次数、休息时间
5. 提供进阶建议

请输出JSON格式的训练推荐方案。`
      },
    ];

    const response = await client.invoke(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.3,
    });

    // 解析JSON响应
    let recommendation;
    try {
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      recommendation = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse recommendation JSON:', response.content);
      // 回退：根据问题匹配训练动作
      recommendation = generateFallbackRecommendation(mainIssues, zhengfuExercises, benyuanExercises);
    }

    return NextResponse.json({
      success: true,
      data: {
        diagnosisRecordId,
        generatedAt: new Date().toISOString(),
        phase,
        ...recommendation,
      }
    });

  } catch (error) {
    console.error('Error generating training recommendation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '生成训练推荐失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 回退推荐逻辑
function generateFallbackRecommendation(
  mainIssues: string[],
  zhengfuExercises: any[],
  benyuanExercises: any[]
) {
  // 根据问题匹配训练动作
  const matchedZhengfu = zhengfuExercises.filter(e => {
    const targetIssues = e.targetIssues as string[] || [];
    return mainIssues.some(issue => targetIssues.includes(issue));
  }).slice(0, 6);

  const matchedBenyuan = benyuanExercises.filter(e => {
    const targetIssues = e.targetIssues as string[] || [];
    return mainIssues.some(issue => targetIssues.includes(issue));
  }).slice(0, 6);

  return {
    recommendedSessions: [
      {
        name: '结构整复训练',
        type: '整复训练',
        duration: '30-40分钟',
        frequency: '每周3-4次',
        exercises: matchedZhengfu.map(e => ({
          exerciseId: e.id,
          name: e.name,
          sets: 3,
          reps: '10-15次',
          restTime: '30秒',
          notes: e.description,
          progression: '动作标准后可增加难度',
        })),
        targetIssues: mainIssues,
        goals: ['改善结构对称性', '缓解肌肉紧张', '恢复关节活动度'],
      },
      {
        name: '本源力量训练',
        type: '本源训练',
        duration: '20-30分钟',
        frequency: '每周2-3次',
        exercises: matchedBenyuan.map(e => ({
          exerciseId: e.id,
          name: e.name,
          sets: 3,
          reps: '8-12次或30秒',
          restTime: '45秒',
          notes: e.description,
          progression: '保持正确呼吸模式，逐步增加负荷',
        })),
        targetIssues: mainIssues,
        goals: ['建立正确运动模式', '增强核心稳定性', '提升整体功能'],
      },
    ],
    priorityIssues: mainIssues.slice(0, 3),
    estimatedTimeline: '4-8周可见明显改善',
    keyPoints: [
      '训练前充分热身',
      '动作质量优先于数量',
      '保持正确呼吸模式',
      '如有不适应立即停止',
    ],
    cautions: [
      '疼痛时不进行训练',
      '严重问题请先就医',
      '训练强度循序渐进',
    ],
  };
}

// GET /api/training-recommendation - 获取推荐的训练动作
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issue = searchParams.get('issue'); // 体态问题关键词

    const db = await getDb();

    if (issue) {
      // 根据问题搜索相关训练动作
      const exercises = await db
        .select()
        .from(exerciseLibrary)
        .where(sql`${exerciseLibrary.targetIssues} @> ${JSON.stringify([issue])}`)
        .limit(10);

      return NextResponse.json({
        success: true,
        data: { exercises }
      });
    }

    // 返回热门训练动作
    const exercises = await db
      .select()
      .from(exerciseLibrary)
      .where(eq(exerciseLibrary.isActive, true))
      .orderBy(exerciseLibrary.sortOrder)
      .limit(20);

    return NextResponse.json({
      success: true,
      data: { exercises }
    });

  } catch (error) {
    console.error('Error fetching training recommendations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取训练推荐失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
