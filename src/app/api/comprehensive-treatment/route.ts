import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { postureDiagnosisRecords, faceDiagnosisRecords, tongueDiagnosisRecords, users, symptomChecks } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';

// 综合调理方案生成系统提示词
const COMPREHENSIVE_TREATMENT_PROMPT = `你是一位拥有丰富经验的中西医结合健康管理专家，擅长从面诊、舌诊、体态评估和症状自检多维度综合分析健康状况，并制定个性化的调理方案。

## 任务
根据用户的面诊数据、舌诊数据、体态评估数据和症状自检数据，进行深度关联分析，生成一份完整的综合调理方案。

## 分析框架

### 1. 多维度关联分析
需要分析面诊、舌诊、体态、症状之间的因果关系和相互影响：
- 体态问题如何影响气血运行和脏腑功能
- 脏腑功能异常如何在体态上体现
- 症状与体态问题的关联
- 各项评估结果的一致性和互补性

### 2. 体质判断
综合所有信息判断用户的中医体质类型

### 3. 核心问题识别
找出最需要优先解决的核心健康问题

### 4. 分阶段调理方案
制定松解激活期、力量重建期、功能整合期三个阶段的详细方案

### 5. 每日行动清单
给出可执行的每日行动建议

## 输出格式

请严格按照以下JSON格式输出：

{
  "diagnosis": {
    "summary": "<综合诊断总结（一段话）>",
    "constitution": {
      "type": "<体质类型>",
      "description": "<体质特征描述>",
      "evidence": ["<判断依据>"]
    },
    "primaryIssues": [
      {
        "issue": "<问题名称>",
        "severity": "<严重程度>",
        "source": "<问题来源（面诊/舌诊/体态/症状）>",
        "interconnections": ["<与其他问题的关联>"]
      }
    ],
    "rootCauses": [
      {
        "cause": "<根本原因>",
        "evidence": "<证据>",
        "impact": "<影响>"
      }
    ],
    "interconnectedFactors": [
      {
        "factor1": "<因素1>",
        "factor2": "<因素2>",
        "relationship": "<两者关系>",
        "mechanism": "<作用机制>"
      }
    ]
  },
  "phases": [
    {
      "phase": 1,
      "name": "松解激活期",
      "duration": "第1-2周",
      "goals": ["<阶段目标>"],
      "zhengfu": {
        "frequency": "<频率>",
        "sessions": [
          {
            "name": "<训练名称>",
            "exercises": [
              {
                "name": "<动作名称>",
                "purpose": "<目的>",
                "method": "<方法步骤>",
                "duration": "<时长>",
                "frequency": "<频率>",
                "cautions": ["<注意事项>"]
              }
            ]
          }
        ]
      },
      "benyuan": {
        "frequency": "<频率>",
        "sessions": [
          {
            "name": "<训练名称>",
            "exercises": [
              {
                "name": "<动作名称>",
                "purpose": "<目的>",
                "method": "<方法步骤>",
                "duration": "<时长>",
                "frequency": "<频率>",
                "cautions": ["<注意事项>"]
              }
            ]
          }
        ]
      },
      "tcm": {
        "acupressure": {
          "points": ["<穴位名称>"],
          "method": "<按摩方法>",
          "frequency": "<频率>",
          "duration": "<时长>"
        },
        "moxibustion": {
          "points": ["<艾灸穴位>"],
          "duration": "<时长>",
          "frequency": "<频率>",
          "cautions": ["<注意事项>"]
        },
        "herbalTea": ["<代茶饮建议>"],
        "dietaryTherapy": ["<食疗建议>"]
      },
      "lifestyle": {
        "posture": ["<姿势调整建议>"],
        "habits": ["<习惯调整建议>"],
        "environment": ["<环境优化建议>"]
      },
      "expectedOutcome": "<预期效果>"
    },
    {
      "phase": 2,
      "name": "力量重建期",
      "duration": "第3-6周",
      "goals": ["<阶段目标>"],
      "zhengfu": { ... },
      "benyuan": { ... },
      "tcm": { ... },
      "lifestyle": { ... },
      "expectedOutcome": "<预期效果>"
    },
    {
      "phase": 3,
      "name": "功能整合期",
      "duration": "第7-12周",
      "goals": ["<阶段目标>"],
      "zhengfu": { ... },
      "benyuan": { ... },
      "tcm": { ... },
      "lifestyle": { ... },
      "expectedOutcome": "<预期效果>"
    }
  ],
  "dailyRoutine": {
    "morning": [
      {
        "time": "<时间>",
        "activity": "<活动内容>",
        "duration": "<时长>",
        "purpose": "<目的>"
      }
    ],
    "daytime": [ ... ],
    "evening": [ ... ],
    "anytime": [ ... ]
  },
  "dietaryGuidelines": {
    "principles": ["<饮食原则>"],
    "recommended": ["<推荐食物>"],
    "avoid": ["<避免食物>"],
    "mealSchedule": "<饮食时间安排>"
  },
  "contraindications": ["<禁忌事项>"],
  "medicalAdvice": [
    {
      "condition": "<情况描述>",
      "department": "<建议科室>",
      "urgency": "<紧急程度：立即/近期/择期>"
    }
  ],
  "followUpPlan": {
    "firstReview": "<首次复查时间>",
    "assessmentIndicators": ["<评估指标>"],
    "adjustmentCriteria": "<方案调整标准>"
  }
}`;

// POST /api/comprehensive-treatment - 生成综合调理方案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, includeFaceDiagnosis = true, includeTongueDiagnosis = true, includePostureDiagnosis = true } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 收集所有诊断数据
    let faceData = null;
    let tongueData = null;
    let postureData = null;
    let symptomData = null;
    let userData = null;

    // 获取用户基本信息
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (userResult.length > 0) {
      userData = userResult[0];
    }

    // 获取最新的面诊数据
    if (includeFaceDiagnosis) {
      const faceResult = await db
        .select()
        .from(faceDiagnosisRecords)
        .where(eq(faceDiagnosisRecords.userId, userId))
        .orderBy(desc(faceDiagnosisRecords.createdAt))
        .limit(1);
      
      if (faceResult.length > 0) {
        faceData = faceResult[0];
      }
    }

    // 获取最新的舌诊数据
    if (includeTongueDiagnosis) {
      const tongueResult = await db
        .select()
        .from(tongueDiagnosisRecords)
        .where(eq(tongueDiagnosisRecords.userId, userId))
        .orderBy(desc(tongueDiagnosisRecords.createdAt))
        .limit(1);
      
      if (tongueResult.length > 0) {
        tongueData = tongueResult[0];
      }
    }

    // 获取最新的体态评估数据
    if (includePostureDiagnosis) {
      const postureResult = await db
        .select()
        .from(postureDiagnosisRecords)
        .where(eq(postureDiagnosisRecords.userId, userId))
        .orderBy(desc(postureDiagnosisRecords.createdAt))
        .limit(1);
      
      if (postureResult.length > 0) {
        postureData = postureResult[0];
      }
    }

    // 获取最新的症状自检数据
    const symptomResult = await db
      .select()
      .from(symptomChecks)
      .where(eq(symptomChecks.userId, userId))
      .orderBy(desc(symptomChecks.checkedAt))
      .limit(1);
    
    if (symptomResult.length > 0) {
      symptomData = symptomResult[0];
    }

    // 检查是否有足够的诊断数据
    if (!faceData && !tongueData && !postureData && !symptomData) {
      return NextResponse.json(
        { success: false, error: '没有足够的诊断数据，请先完成至少一项诊断' },
        { status: 400 }
      );
    }

    // 构建提示内容
    let promptContent = '请根据以下用户健康数据，生成综合调理方案：\n\n';

    // 用户基本信息
    if (userData) {
      promptContent += '## 用户基本信息\n';
      promptContent += `- 姓名：${userData.name || '未知'}\n`;
      promptContent += `- 年龄：${userData.age || '未知'}\n`;
      promptContent += `- 性别：${userData.gender || '未知'}\n`;
      promptContent += '\n';
    }

    // 面诊数据
    if (faceData) {
      promptContent += '## 面诊数据\n';
      if (faceData.fullReport) {
        promptContent += `完整报告：${faceData.fullReport.substring(0, 500)}\n`;
      }
      if (faceData.organStatus) {
        promptContent += `脏腑状态：${JSON.stringify(faceData.organStatus, null, 2)}\n`;
      }
      if (faceData.constitution) {
        promptContent += `体质判断：${JSON.stringify(faceData.constitution, null, 2)}\n`;
      }
      promptContent += '\n';
    }

    // 舌诊数据
    if (tongueData) {
      promptContent += '## 舌诊数据\n';
      if (tongueData.fullReport) {
        promptContent += `完整报告：${tongueData.fullReport.substring(0, 500)}\n`;
      }
      if (tongueData.organStatus) {
        promptContent += `脏腑状态：${JSON.stringify(tongueData.organStatus, null, 2)}\n`;
      }
      if (tongueData.constitution) {
        promptContent += `体质判断：${JSON.stringify(tongueData.constitution, null, 2)}\n`;
      }
      promptContent += '\n';
    }

    // 体态评估数据
    if (postureData) {
      promptContent += '## 体态评估数据\n';
      promptContent += `- 评分：${postureData.score || '未知'}\n`;
      promptContent += `- 等级：${postureData.grade || '未知'}\n`;
      if (postureData.bodyStructure) {
        promptContent += `- 身体结构：${JSON.stringify(postureData.bodyStructure, null, 2)}\n`;
      }
      if (postureData.fasciaChainAnalysis) {
        promptContent += `- 筋膜链分析：${JSON.stringify(postureData.fasciaChainAnalysis, null, 2)}\n`;
      }
      if (postureData.muscleAnalysis) {
        promptContent += `- 肌肉分析：${JSON.stringify(postureData.muscleAnalysis, null, 2)}\n`;
      }
      if (postureData.breathingAssessment) {
        promptContent += `- 呼吸评估：${JSON.stringify(postureData.breathingAssessment, null, 2)}\n`;
      }
      if (postureData.alignmentAssessment) {
        promptContent += `- 重心力线：${JSON.stringify(postureData.alignmentAssessment, null, 2)}\n`;
      }
      if (postureData.compensationPatterns) {
        promptContent += `- 代偿模式：${JSON.stringify(postureData.compensationPatterns, null, 2)}\n`;
      }
      if (postureData.healthPrediction) {
        promptContent += `- 健康预测：${JSON.stringify(postureData.healthPrediction, null, 2)}\n`;
      }
      promptContent += '\n';
    }

    // 症状自检数据
    if (symptomData) {
      promptContent += '## 症状自检数据\n';
      if (symptomData.checkedSymptoms) {
        promptContent += `- 已选症状：${JSON.stringify(symptomData.checkedSymptoms)}\n`;
      }
      if (symptomData.totalScore) {
        promptContent += `- 症状评分：${symptomData.totalScore}\n`;
      }
      promptContent += '\n';
    }

    promptContent += '请严格按照JSON格式输出完整的综合调理方案。';

    // 初始化LLM客户端，使用DeepSeek-V3进行深度推理
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: COMPREHENSIVE_TREATMENT_PROMPT },
      { role: 'user' as const, content: promptContent },
    ];

    // 调用DeepSeek-V3进行深度推理分析
    const response = await client.invoke(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.5,
    });

    // 解析JSON响应
    let treatmentPlan;
    try {
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      treatmentPlan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON:', response.content);
      treatmentPlan = {
        rawContent: response.content,
        parseError: true
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        treatmentPlan,
        sources: {
          hasFaceData: !!faceData,
          hasTongueData: !!tongueData,
          hasPostureData: !!postureData,
          hasSymptomData: !!symptomData,
        },
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Comprehensive treatment generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '生成综合调理方案失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
