import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// Vision语义分析系统提示词 - 增强版
const POSTURE_SEMANTIC_ANALYSIS_PROMPT = `你是一位专业的体态评估专家，精通运动医学、解剖学、中医推拿和康复训练。请根据MediaPipe检测到的骨骼关键点数据和计算出的角度，进行全面深入的体态分析。

## 输入数据说明
- 关键点坐标：33个人体关键点的位置（归一化坐标0-1）
- 关节角度：各主要关节的角度测量值
- 检测问题：系统自动识别的体态问题列表
- 四角度数据：正面、左侧、右侧、背面的检测结果
- 置信度：检测的可信程度

## 输出格式

请严格按照以下JSON格式输出，确保是有效的JSON：

{
  "summary": "<一句话总结当前体态状况，包括主要问题和风险>",
  
  "detailedAnalysis": {
    "head": {
      "status": "<状态：正常/轻度前伸/中度前伸/重度前伸/侧倾>",
      "angle": "<具体角度数据>",
      "description": "<详细描述当前状态和可能原因>",
      "impact": "<对颈椎、神经系统、血液循环的影响>"
    },
    "shoulders": {
      "status": "<状态：正常/轻度高低肩/中度高低肩/重度高低肩/圆肩>",
      "leftRightDiff": "<左右肩高度差异>",
      "roundingStatus": "<圆肩程度>",
      "description": "<详细描述>",
      "impact": "<对肩颈、呼吸、胸廓的影响>"
    },
    "spine": {
      "status": "<状态：正常/轻度侧弯/中度侧弯/重度侧弯/驼背>",
      "alignmentScore": "<脊柱对齐度百分比>",
      "curves": {
        "cervical": "<颈椎曲度状态>",
        "thoracic": "<胸椎曲度状态>",
        "lumbar": "<腰椎曲度状态>"
      },
      "description": "<详细描述>",
      "impact": "<对神经系统、内脏器官的影响>"
    },
    "pelvis": {
      "status": "<状态：正常/轻度前倾/中度前倾/重度前倾/后倾/侧倾>",
      "tiltAngle": "<倾斜角度>",
      "rotationStatus": "<旋转状态>",
      "description": "<详细描述>",
      "impact": "<对腰椎、髋关节、生殖系统的影响>"
    },
    "knees": {
      "status": "<状态：正常/轻度超伸/中度超伸/重度超伸/O型腿/X型腿>",
      "angle": "<膝角度数据>",
      "description": "<详细描述>",
      "impact": "<对膝关节、步态的影响>"
    },
    "ankles": {
      "status": "<状态：正常/足外翻/足内翻/扁平足/高弓足>",
      "description": "<详细描述>",
      "impact": "<对步态、膝盖、髋部的影响>"
    }
  },
  
  "primaryIssues": [
    {
      "issue": "<问题名称>",
      "severity": "<严重程度：轻度/中度/重度>",
      "angle": "<具体角度数据>",
      "cause": "<可能原因分析>",
      "relatedMuscles": ["<紧张的肌肉>", "<无力的肌肉>"],
      "relatedMeridians": ["<相关的经络>"],
      "recommendation": "<具体改善建议>"
    }
  ],
  
  "muscleAnalysis": {
    "tight": [
      {
        "muscle": "<肌肉名称>",
        "location": "<位置>",
        "reason": "<为何紧张>",
        "stretches": ["<推荐的拉伸动作>"]
      }
    ],
    "weak": [
      {
        "muscle": "<肌肉名称>",
        "location": "<位置>",
        "reason": "<为何无力>",
        "exercises": ["<推荐的强化动作>"]
      }
    ]
  },
  
  "fasciaChainAnalysis": {
    "frontLine": {
      "status": "<前表链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "backLine": {
      "status": "<后表链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "lateralLine": {
      "status": "<体侧链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "spiralLine": {
      "status": "<螺旋链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "deepFrontLine": {
      "status": "<深前线状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    }
  },
  
  "breathingAssessment": {
    "pattern": "<呼吸模式：腹式/胸式/锁骨式/混合>",
    "diaphragm": "<膈肌功能评估>",
    "accessoryMuscles": "<辅助呼吸肌状态>",
    "ribcageMobility": "<胸廓活动度>",
    "impact": "<对体态和健康的影响>"
  },
  
  "riskAssessment": {
    "painRisk": [
      {
        "area": "<疼痛风险区域>",
        "likelihood": "<可能性：高/中/低>",
        "cause": "<原因>",
        "prevention": "<预防措施>"
      }
    ],
    "organImpact": [
      {
        "organ": "<可能受影响的脏器>",
        "impact": "<影响描述>",
        "reason": "<原因>"
      }
    ],
    "progressionRisk": "<如果不改善，未来可能的发展>",
    "overallRisk": "<整体风险评估：低/中/高>"
  },
  
  "recommendations": {
    "immediate": [
      "<立即可以做的姿势调整>",
      "<日常生活中的注意事项>"
    ],
    "shortTerm": [
      "<1-2周内的改善方案>",
      "<推荐的训练频率>"
    ],
    "longTerm": [
      "<1-3个月的调理计划>",
      "<生活习惯的改变建议>"
    ],
    "exercises": [
      {
        "name": "<动作名称>",
        "category": "<类型：整复训练/本源训练/拉伸>",
        "purpose": "<目的>",
        "method": "<具体方法>",
        "duration": "<持续时间>",
        "frequency": "<频率>",
        "cautions": ["<注意事项>"]
      }
    ],
    "lifestyle": [
      {
        "area": "<生活领域：坐姿/睡姿/运动/工作>",
        "suggestion": "<具体建议>"
      }
    ]
  },
  
  "tcmPerspective": {
    "meridians": [
      {
        "name": "<经络名称>",
        "status": "<受阻/通畅/不畅>",
        "reason": "<原因>"
      }
    ],
    "acupoints": [
      {
        "name": "<穴位名称>",
        "location": "<位置>",
        "benefit": "<按摩此穴位的好处>",
        "method": "<按摩方法>"
      }
    ],
    "constitution": "<体质判断：平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质>",
    "constitutionReason": "<判断依据>"
  },
  
  "healthPrediction": {
    "shortTerm": "<1-3个月如果不改善可能出现的问题>",
    "midTerm": "<6个月-1年可能的发展>",
    "longTerm": "<3年以上可能出现的健康问题>",
    "preventiveMeasures": ["<预防措施>"]
  },
  
  "treatmentPlan": {
    "zhengfu": {
      "name": "整复训练方案",
      "description": "<方案描述>",
      "duration": "<建议周期>",
      "sessions": [
        {
          "week": "<第几周>",
          "focus": "<重点>",
          "exercises": ["<动作列表>"]
        }
      ]
    },
    "benyuan": {
      "name": "本源训练方案",
      "description": "<方案描述>",
      "duration": "<建议周期>",
      "sessions": [
        {
          "week": "<第几周>",
          "focus": "<重点>",
          "exercises": ["<动作列表>"]
        }
      ]
    }
  }
}`;

// POST /api/posture-semantic-analysis - Vision语义分析（增强版）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      landmarks, 
      angles, 
      issues, 
      confidence, 
      imageUrl,
      allAngles,
      allIssues 
    } = body;

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

    // 构建详细的分析请求
    let analysisContext = '';
    
    // 添加四角度数据
    if (allAngles && allAngles.length > 0) {
      analysisContext += `\n## 四角度关节角度数据\n`;
      allAngles.forEach((angleData: any) => {
        const angleNameMap: Record<string, string> = {
          front: '正面',
          left: '左侧',
          right: '右侧',
          back: '背面'
        };
        const angleName = angleNameMap[String(angleData.angle)] || String(angleData.angle);
        
        analysisContext += `\n### ${angleName}视角\n`;
        if (angleData.angles) {
          analysisContext += `- 左肩角度: ${angleData.angles.leftShoulderAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右肩角度: ${angleData.angles.rightShoulderAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 左髋角度: ${angleData.angles.leftHipAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右髋角度: ${angleData.angles.rightHipAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 左膝角度: ${angleData.angles.leftKneeAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右膝角度: ${angleData.angles.rightKneeAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 肩部倾斜: ${angleData.angles.shoulderTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 骨盆倾斜: ${angleData.angles.hipTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 头部倾斜: ${angleData.angles.headTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 脊柱对齐度: ${angleData.angles.spinalAlignment?.toFixed(1) || 'N/A'}%\n`;
          analysisContext += `- 头前伸距离: ${angleData.angles.forwardHeadProtrusion?.toFixed(1) || 'N/A'}cm\n`;
          analysisContext += `- 骨盆前倾角: ${angleData.angles.pelvicTilt?.toFixed(1) || 'N/A'}°\n`;
        }
      });
    }
    
    // 添加检测到的问题
    if (allIssues && allIssues.length > 0) {
      analysisContext += `\n## 检测到的体态问题\n`;
      allIssues.forEach((issue: any) => {
        analysisContext += `- ${issue.name}: ${issue.severity} - ${issue.description || ''}\n`;
        if (issue.anatomicalInfo) {
          if (issue.anatomicalInfo.relatedMuscles) {
            analysisContext += `  - 紧张肌肉: ${issue.anatomicalInfo.relatedMuscles.tight?.join('、') || '无'}\n`;
            analysisContext += `  - 无力肌肉: ${issue.anatomicalInfo.relatedMuscles.weak?.join('、') || '无'}\n`;
          }
        }
      });
    }
    
    // 如果有图片，使用Vision模型同时分析
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请结合图片和MediaPipe检测结果进行全面深入的体态分析：

**检测置信度**: ${(confidence * 100).toFixed(1)}%
${analysisContext}

请按照输出格式要求，提供详细的分析报告，包括：
1. 各部位的详细状态和健康影响
2. 主要问题及其原因分析
3. 肌肉和筋膜链状态
4. 呼吸模式评估
5. 健康风险评估
6. 具体的改善建议和训练方案
7. 中医视角的分析
8. 健康预测`
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
        content: `请根据以下MediaPipe检测数据进行全面深入的体态分析：

**关键点数据**（主要关节坐标%）：
${landmarks ? `
- 鼻子: (${(landmarks[0]?.x * 100).toFixed(1)}%, ${(landmarks[0]?.y * 100).toFixed(1)}%)
- 左肩: (${(landmarks[11]?.x * 100).toFixed(1)}%, ${(landmarks[11]?.y * 100).toFixed(1)}%)
- 右肩: (${(landmarks[12]?.x * 100).toFixed(1)}%, ${(landmarks[12]?.y * 100).toFixed(1)}%)
- 左髋: (${(landmarks[23]?.x * 100).toFixed(1)}%, ${(landmarks[23]?.y * 100).toFixed(1)}%)
- 右髋: (${(landmarks[24]?.x * 100).toFixed(1)}%, ${(landmarks[24]?.y * 100).toFixed(1)}%)
- 左膝: (${(landmarks[25]?.x * 100).toFixed(1)}%, ${(landmarks[25]?.y * 100).toFixed(1)}%)
- 右膝: (${(landmarks[26]?.x * 100).toFixed(1)}%, ${(landmarks[26]?.y * 100).toFixed(1)}%)
` : '未提供'}
${analysisContext}

**置信度**: ${(confidence * 100).toFixed(1)}%

请提供详细的分析报告。`
      });
    }

    // 调用Vision模型
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.4,
    });

    // 解析JSON响应
    let analysisResult;
    try {
      let jsonStr = response.content;
      
      // 尝试提取JSON
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // 修复可能的JSON问题
        let fixedJson = jsonMatch[0];
        // 移除尾部逗号
        fixedJson = fixedJson.replace(/,\s*}/g, '}');
        fixedJson = fixedJson.replace(/,\s*]/g, ']');
        
        analysisResult = JSON.parse(fixedJson);
      } else {
        throw new Error('未找到有效JSON');
      }
    } catch (parseError) {
      console.error('[SemanticAnalysis] JSON解析失败:', parseError);
      
      // 如果解析失败，构建基本结构
      analysisResult = {
        summary: response.content?.substring(0, 200) || '分析完成',
        detailedAnalysis: {
          head: { status: '需要进一步评估', description: '' },
          shoulders: { status: '需要进一步评估', description: '' },
          spine: { status: '需要进一步评估', description: '' },
          pelvis: { status: '需要进一步评估', description: '' },
          knees: { status: '需要进一步评估', description: '' },
          ankles: { status: '需要进一步评估', description: '' }
        },
        primaryIssues: issues || [],
        muscleAnalysis: { tight: [], weak: [] },
        fasciaChainAnalysis: {
          frontLine: { status: '需评估' },
          backLine: { status: '需评估' },
          lateralLine: { status: '需评估' },
          spiralLine: { status: '需评估' },
          deepFrontLine: { status: '需评估' }
        },
        breathingAssessment: {
          pattern: '需评估',
          diaphragm: '需评估'
        },
        riskAssessment: { 
          overallRisk: '需评估', 
          painRisk: [],
          progressionRisk: ''
        },
        recommendations: {
          immediate: ['建议进行专业体态评估'],
          shortTerm: ['建立正确的姿势意识'],
          longTerm: ['制定系统的训练计划'],
          exercises: [],
          lifestyle: []
        },
        tcmPerspective: {
          meridians: [],
          acupoints: [],
          constitution: '需专业中医师评估',
          constitutionReason: '基于体态观察的初步判断'
        },
        healthPrediction: {
          shortTerm: '建议定期复查',
          midTerm: '持续关注体态变化',
          longTerm: '预防慢性疼痛发生',
          preventiveMeasures: ['保持良好姿势', '规律运动', '定期休息']
        },
        treatmentPlan: {
          zhengfu: { 
            name: '整复训练方案', 
            description: '需专业康复师制定', 
            sessions: [] 
          },
          benyuan: { 
            name: '本源训练方案', 
            description: '需专业康复师制定', 
            sessions: [] 
          }
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
    console.error('[SemanticAnalysis] 分析错误:', error);
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

// GET /api/posture-semantic-analysis - 健康检查
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Posture Semantic Analysis API is ready',
    models: ['doubao-seed-1-6-vision-250815'],
    features: [
      '四角度骨骼检测数据整合',
      '关节角度精确分析',
      '体态问题深度诊断',
      '肌肉和筋膜链评估',
      '呼吸模式分析',
      '健康风险预测',
      '中医经络穴位分析',
      '个性化训练方案'
    ]
  });
}
