import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { postureDiagnosisRecords } from '@/storage/database/shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

// 体态评估系统提示词
const POSTURE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位专业的体态评估专家，拥有丰富的运动医学、解剖学和中医推拿经验。请根据用户提供的四角度体态照片（正面、左侧、右侧、背面）进行全面的体态分析。

## 分析框架

请严格按照以下JSON格式输出分析结果，确保输出的是有效的JSON：

{
  "score": <0-100的综合体态评分>,
  "grade": "<等级：A优秀/B良好/C一般/D较差/E很差>",
  "bodyStructure": {
    "head": {
      "position": "<头部位置：正常/前伸/侧倾/旋转>",
      "angle": "<估计角度>",
      "severity": "<严重程度：无/轻度/中度/重度>",
      "issues": ["<具体问题>"]
    },
    "shoulder": {
      "height": "<肩部高度：水平/左高右低/右高左低>",
      "rounding": "<圆肩程度：无/轻度/中度/重度>",
      "wing": "<翼状肩：无/双侧/左侧/右侧>",
      "issues": ["<具体问题>"]
    },
    "spine": {
      "cervicalCurve": "<颈椎曲度：正常/变直/反弓>",
      "thoracicCurve": "<胸椎曲度：正常/驼背/平背>",
      "lumbarCurve": "<腰椎曲度：正常/骨盆前倾/骨盆后倾>",
      "scoliosis": "<脊柱侧弯：无/S型/C型>",
      "issues": ["<具体问题>"]
    },
    "pelvis": {
      "tilt": "<骨盆倾斜：正常/前倾/后倾/侧倾>",
      "rotation": "<骨盆旋转：无/顺时针/逆时针>",
      "issues": ["<具体问题>"]
    },
    "knee": {
      "alignment": "<膝部对齐：正常/O型腿/X型腿/膝超伸>",
      "issues": ["<具体问题>"]
    },
    "ankle": {
      "alignment": "<脚踝对齐：正常/足外翻/足内翻>",
      "archHeight": "<足弓：正常/高弓足/扁平足>",
      "issues": ["<具体问题>"]
    }
  },
  "fasciaChainAnalysis": {
    "frontLine": {
      "status": "<前表链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "backLine": {
      "status": "<后表链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "lateralLine": {
      "status": "<体侧链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "spiralLine": {
      "status": "<螺旋链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "armLine": {
      "status": "<手臂链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "deepFrontLine": {
      "status": "<深前线状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    }
  },
  "muscleAnalysis": {
    "tight": [
      {
        "muscle": "<紧张肌肉名称>",
        "location": "<位置>",
        "severity": "<程度>",
        "impact": "<影响>"
      }
    ],
    "weak": [
      {
        "muscle": "<无力肌肉名称>",
        "location": "<位置>",
        "severity": "<程度>",
        "impact": "<影响>"
      }
    ],
    "imbalanced": [
      {
        "pair": "<肌对名称>",
        "issue": "<失衡情况>",
        "impact": "<影响>"
      }
    ]
  },
  "breathingAssessment": {
    "pattern": "<呼吸模式：腹式/胸式/锁骨式/混合>",
    "diaphragm": "<膈肌功能：正常/紧张/受限>",
    "accessoryMuscles": "<辅助呼吸肌：放松/过度激活>",
    "ribcage": "<胸廓活动度：正常/受限>",
    "issues": ["<问题点>"],
    "impact": "<对体态的影响>"
  },
  "alignmentAssessment": {
    "centerOfGravity": "<重心位置：正常/前移/后移/左偏/右偏>",
    "forceLine": "<力线对齐：正常/偏移>",
    "weightDistribution": "<体重分布：均匀/前脚掌/后跟/单侧>",
    "issues": ["<问题点>"]
  },
  "compensationPatterns": [
    {
      "name": "<代偿模式名称>",
      "description": "<描述>",
      "cause": "<原因>",
      "affectedArea": "<影响区域>",
      "severity": "<严重程度>"
    }
  ],
  "healthImpact": {
    "painRisk": [
      {
        "area": "<疼痛区域>",
        "likelihood": "<可能性：高/中/低>",
        "cause": "<原因>"
      }
    ],
    "organFunction": [
      {
        "organ": "<脏器>",
        "impact": "<影响>",
        "reason": "<原因>"
      }
    ],
    "circulation": {
      "status": "<血液循环状态>",
      "issues": ["<问题点>"]
    },
    "nervousSystem": {
      "status": "<神经系统状态>",
      "issues": ["<问题点>"]
    }
  },
  "healthPrediction": {
    "shortTerm": "<3个月内可能出现的健康问题>",
    "midTerm": "<1年内可能出现的健康问题>",
    "longTerm": "<3年以上可能出现的健康问题>",
    "preventiveMeasures": ["<预防措施>"]
  },
  "treatmentPlan": {
    "zhengfu": {
      "name": "整复训练",
      "description": "<整体描述>",
      "sessions": [
        {
          "phase": "<阶段>",
          "focus": "<重点>",
          "duration": "<时长>",
          "exercises": [
            {
              "name": "<动作名称>",
              "purpose": "<目的>",
              "method": "<方法>",
              "duration": "<时长>",
              "frequency": "<频率>",
              "cautions": ["<注意事项>"]
            }
          ]
        }
      ]
    },
    "benyuan": {
      "name": "本源训练",
      "description": "<整体描述>",
      "sessions": [
        {
          "phase": "<阶段>",
          "focus": "<重点>",
          "duration": "<时长>",
          "exercises": [
            {
              "name": "<动作名称>",
              "purpose": "<目的>",
              "method": "<方法>",
              "duration": "<时长>",
              "frequency": "<频率>",
              "cautions": ["<注意事项>"]
            }
          ]
        }
      ]
    },
    "lifestyle": [
      {
        "type": "<建议类型>",
        "content": "<具体建议>"
      }
    ]
  },
  "summary": "<一段话总结体态评估结论>"
}

## 评估要点

### 1. 身体结构评估（四角度综合）

**正面观**：
- 头部是否居中
- 肩膀高度是否一致
- 锁骨是否对称
- 髂前上棘是否水平
- 髌骨是否正对前方
- 足弓是否正常

**侧面观**：
- 耳孔、肩峰、股骨大转子、膝关节、外踝是否在一条垂线
- 颈椎曲度
- 胸椎曲度
- 腰椎曲度
- 骨盆位置

**背面观**：
- 头部是否居中
- 肩胛骨位置
- 脊柱是否正直
- 髂后上棘是否水平
- 膝窝是否对称

### 2. 筋膜链评估
分析六条主要筋膜链的紧张和失衡情况

### 3. 肌肉分析
识别紧张肌肉、无力肌肉和肌力失衡

### 4. 呼吸模式评估
评估呼吸模式和膈肌功能

### 5. 重心与力线
评估重心位置和力线对齐

### 6. 代偿模式识别
识别身体的代偿策略和模式

### 7. 健康影响评估
分析体态问题对健康的影响

### 8. 调理方案
提供整复训练和本源训练的具体方案

## 注意事项

1. 如果某个角度的照片缺失或无法判断，请在相应字段标注"无法判断"
2. 请根据实际观察给出客观分析，不要臆测
3. 评分要客观公正，综合考虑各系统问题
4. 方案要具体可操作，符合个体化需求`;

// POST /api/posture-diagnosis - 体态评估分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      frontImage, 
      leftSideImage, 
      rightSideImage, 
      backImage, 
      userId, 
      saveRecord = true 
    } = body;

    // 至少需要一张图片
    if (!frontImage && !leftSideImage && !rightSideImage && !backImage) {
      return NextResponse.json(
        { success: false, error: '请至少上传一张体态照片' },
        { status: 400 }
      );
    }

    // 准备图片内容数组
    const imageContents: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string; detail: 'high' | 'low' } }> = [];
    
    // 添加文本提示
    let promptText = '请根据以下体态照片进行全面分析：\n\n';
    
    if (frontImage) promptText += '- 正面照片：已提供\n';
    if (leftSideImage) promptText += '- 左侧照片：已提供\n';
    if (rightSideImage) promptText += '- 右侧照片：已提供\n';
    if (backImage) promptText += '- 背面照片：已提供\n';
    
    promptText += '\n请严格按照JSON格式输出完整的体态评估报告。';
    
    imageContents.push({ type: 'text', text: promptText });
    
    // 添加图片
    if (frontImage) {
      const imageUrl = frontImage.startsWith('data:image/') ? frontImage : 
                       frontImage.startsWith('http') ? frontImage :
                       `data:image/jpeg;base64,${frontImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (leftSideImage) {
      const imageUrl = leftSideImage.startsWith('data:image/') ? leftSideImage : 
                       leftSideImage.startsWith('http') ? leftSideImage :
                       `data:image/jpeg;base64,${leftSideImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (rightSideImage) {
      const imageUrl = rightSideImage.startsWith('data:image/') ? rightSideImage : 
                       rightSideImage.startsWith('http') ? rightSideImage :
                       `data:image/jpeg;base64,${rightSideImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (backImage) {
      const imageUrl = backImage.startsWith('data:image/') ? backImage : 
                       backImage.startsWith('http') ? backImage :
                       `data:image/jpeg;base64,${backImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: POSTURE_DIAGNOSIS_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: imageContents
      },
    ];

    // 调用Vision模型分析
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3,
    });

    // 解析JSON响应
    let analysisResult;
    try {
      // 提取JSON部分（可能被markdown包裹）
      let jsonStr = response.content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse JSON:', response.content);
      analysisResult = {
        score: 0,
        fullReport: response.content,
        parseError: true
      };
    }

    // 保存到数据库
    let recordId = null;
    if (saveRecord && userId) {
      try {
        const db = await getDb();
        
        // 插入体态诊断记录
        const insertResult = await db.insert(postureDiagnosisRecords).values({
          userId,
          frontImageUrl: frontImage || null,
          leftSideImageUrl: leftSideImage || null,
          rightSideImageUrl: rightSideImage || null,
          backImageUrl: backImage || null,
          score: analysisResult.score || null,
          grade: analysisResult.grade || null,
          bodyStructure: analysisResult.bodyStructure || null,
          fasciaChainAnalysis: analysisResult.fasciaChainAnalysis || null,
          muscleAnalysis: analysisResult.muscleAnalysis || null,
          breathingAssessment: analysisResult.breathingAssessment || null,
          alignmentAssessment: analysisResult.alignmentAssessment || null,
          compensationPatterns: analysisResult.compensationPatterns || null,
          healthImpact: analysisResult.healthImpact || null,
          healthPrediction: analysisResult.healthPrediction || null,
          treatmentPlan: analysisResult.treatmentPlan || null,
          fullReport: response.content,
        }).returning({ id: postureDiagnosisRecords.id });

        recordId = insertResult[0]?.id;
      } catch (dbError) {
        console.error('Failed to save posture diagnosis record:', dbError);
        // 不影响主流程，继续返回结果
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        recordId,
        fullReport: response.content,
      }
    });

  } catch (error) {
    console.error('Posture diagnosis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '体态评估失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-diagnosis - 获取体态评估历史记录
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

    // 查询体态诊断记录
    const records = await db
      .select()
      .from(postureDiagnosisRecords)
      .where(eq(postureDiagnosisRecords.userId, userId))
      .orderBy(desc(postureDiagnosisRecords.createdAt))
      .limit(limit)
      .offset(offset);

    // 查询总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(postureDiagnosisRecords)
      .where(eq(postureDiagnosisRecords.userId, userId));

    const total = Number(countResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      }
    });

  } catch (error) {
    console.error('Error fetching posture diagnosis records:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取体态评估记录失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
