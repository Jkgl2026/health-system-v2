import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Vision语义分析系统提示词
const POSTURE_SEMANTIC_ANALYSIS_PROMPT = `你是一位专业的体态评估专家，请根据MediaPipe检测到的关键点数据和计算出的角度，用通俗易懂的语言解释体态问题，并给出专业建议。

## 输入数据
- 关键点坐标：33个人体关键点的位置（归一化坐标0-1）
- 关节角度：各主要关节的角度测量值
- 检测问题：系统自动识别的体态问题列表
- 置信度：检测的可信程度

## 输出格式

请严格按照以下JSON格式输出：

{
  "summary": "<一句话总结当前体态状况>",
  "detailedAnalysis": {
    "head": {
      "status": "<正常/轻度前伸/中度前伸/重度前伸>",
      "description": "<详细描述>",
      "impact": "<对健康的影响>"
    },
    "shoulders": {
      "status": "<正常/轻度高低肩/中度高低肩/重度高低肩>",
      "leftRightDiff": "<左右差异描述>",
      "description": "<详细描述>",
      "impact": "<对健康的影响>"
    },
    "spine": {
      "status": "<正常/轻度侧弯/中度侧弯/重度侧弯>",
      "alignmentScore": "<对齐度评分>",
      "description": "<详细描述>",
      "impact": "<对健康的影响>"
    },
    "pelvis": {
      "status": "<正常/轻度倾斜/中度倾斜/重度倾斜>",
      "tiltDirection": "<倾斜方向>",
      "description": "<详细描述>",
      "impact": "<对健康的影响>"
    },
    "knees": {
      "status": "<正常/轻度超伸/中度超伸/重度超伸>",
      "description": "<详细描述>",
      "impact": "<对健康的影响>"
    }
  },
  "primaryIssues": [
    {
      "issue": "<问题名称>",
      "severity": "<严重程度>",
      "cause": "<可能原因>",
      "relatedMuscles": ["<相关肌肉>"],
      "recommendation": "<改善建议>"
    }
  ],
  "riskAssessment": {
    "painRisk": ["<疼痛风险>"],
    "progressionRisk": "<如果不改善可能的发展>",
    "overallRisk": "<低/中/高>"
  },
  "recommendations": {
    "immediate": ["<立即可以做的调整>"],
    "shortTerm": ["<短期改善方案>"],
    "longTerm": ["<长期调理建议>"],
    "exercises": [
      {
        "name": "<推荐动作>",
        "purpose": "<目的>",
        "frequency": "<频率>"
      }
    ]
  },
  "tcmPerspective": {
    "meridians": ["<可能受影响的经络>"],
    "acupoints": ["<建议按摩的穴位>"],
    "constitution": "<可能的体质倾向"
  }
}`;

// POST /api/posture-semantic-analysis - Vision语义分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landmarks, angles, issues, confidence, imageUrl } = body;

    if (!landmarks && !imageUrl) {
      return NextResponse.json(
        { success: false, error: '缺少关键点数据或图片' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 准备消息内容
    const messages: any[] = [
      { role: 'system', content: POSTURE_SEMANTIC_ANALYSIS_PROMPT },
    ];

    // 如果有图片，使用Vision模型同时分析
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请结合图片和MediaPipe检测结果进行综合分析：

**检测数据**：
- 置信度: ${(confidence * 100).toFixed(1)}%
- 关节角度: ${JSON.stringify(angles, null, 2)}
- 检测到的问题: ${JSON.stringify(issues, null, 2)}

请用通俗易懂的语言解释这些数据，并给出专业的改善建议。`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      });
    } else {
      // 纯数据分析
      messages.push({
        role: 'user',
        content: `请根据以下MediaPipe检测数据进行体态分析：

**关键点数据**（主要关节）：
- 鼻子: (${(landmarks[0]?.x * 100).toFixed(1)}%, ${(landmarks[0]?.y * 100).toFixed(1)}%)
- 左肩: (${(landmarks[11]?.x * 100).toFixed(1)}%, ${(landmarks[11]?.y * 100).toFixed(1)}%)
- 右肩: (${(landmarks[12]?.x * 100).toFixed(1)}%, ${(landmarks[12]?.y * 100).toFixed(1)}%)
- 左髋: (${(landmarks[23]?.x * 100).toFixed(1)}%, ${(landmarks[23]?.y * 100).toFixed(1)}%)
- 右髋: (${(landmarks[24]?.x * 100).toFixed(1)}%, ${(landmarks[24]?.y * 100).toFixed(1)}%)
- 左膝: (${(landmarks[25]?.x * 100).toFixed(1)}%, ${(landmarks[25]?.y * 100).toFixed(1)}%)
- 右膝: (${(landmarks[26]?.x * 100).toFixed(1)}%, ${(landmarks[26]?.y * 100).toFixed(1)}%)

**关节角度**：
${JSON.stringify(angles, null, 2)}

**检测到的问题**：
${JSON.stringify(issues, null, 2)}

**置信度**: ${(confidence * 100).toFixed(1)}%

请用通俗易懂的语言解释这些数据，并给出专业的改善建议。`
      });
    }

    // 调用Vision模型
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.5,
    });

    // 解析JSON响应
    let analysisResult;
    try {
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', response.content);
      // 如果解析失败，返回原始内容
      analysisResult = {
        summary: response.content.substring(0, 200),
        detailedAnalysis: {},
        primaryIssues: [],
        riskAssessment: { overallRisk: '未知' },
        recommendations: {
          immediate: [],
          shortTerm: [],
          longTerm: [],
          exercises: [],
        },
        tcmPerspective: {
          meridians: [],
          acupoints: [],
          constitution: '未知',
        },
        rawContent: response.content,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        analysisResult,
        confidence,
        detectedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error in posture semantic analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '语义分析失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-semantic-analysis - 简单的健康检查
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Posture Semantic Analysis API is ready',
    models: ['doubao-seed-1-6-vision-250815'],
  });
}
