import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// LLM调用重试配置
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 安全的LLM调用，带重试机制
async function safeLLMInvoke(
  client: LLMClient,
  messages: any[],
  options: any,
  retries = MAX_RETRIES
): Promise<{ success: boolean; content?: string; error?: string }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[PostureDiagnosis] LLM调用尝试 ${attempt + 1}/${retries + 1}`);
      
      const response = await client.invoke(messages, options);
      
      if (!response || !response.content) {
        throw new Error('LLM返回空响应');
      }
      
      console.log(`[PostureDiagnosis] LLM调用成功，响应长度: ${response.content.length}`);
      return { success: true, content: response.content };
    } catch (error: any) {
      lastError = error;
      const errorType = error?.constructor?.name || 'UnknownError';
      const errorMessage = error?.message || String(error);
      
      console.error(`[PostureDiagnosis] LLM调用失败 (尝试 ${attempt + 1}/${retries + 1}):`, {
        errorType,
        errorMessage,
        stack: error?.stack?.split('\n').slice(0, 3)
      });
      
      if (attempt === retries) break;
      if (errorMessage.includes('invalid') || errorMessage.includes('格式') || errorMessage.includes('参数')) {
        console.log('[PostureDiagnosis] 错误类型不适合重试，直接返回失败');
        break;
      }
      
      console.log(`[PostureDiagnosis] 等待 ${RETRY_DELAY}ms 后重试...`);
      await delay(RETRY_DELAY);
    }
  }
  
  return { success: false, error: lastError?.message || 'LLM调用失败' };
}

// 健壮的JSON解析函数
function parseJSONResponse(content: string): { success: boolean; data?: any; error?: string } {
  try {
    // 方法1: 直接解析
    try {
      const data = JSON.parse(content);
      return { success: true, data };
    } catch { /* 继续 */ }
    
    // 方法2: 提取markdown代码块中的JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        const data = JSON.parse(codeBlockMatch[1].trim());
        return { success: true, data };
      } catch { /* 继续 */ }
    }
    
    // 方法3: 提取第一个完整的JSON对象
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let jsonStr = jsonMatch[0];
        jsonStr = jsonStr.replace(/,\s*}/g, '}');
        jsonStr = jsonStr.replace(/,\s*]/g, ']');
        jsonStr = jsonStr.replace(/\n/g, '\\n');
        const data = JSON.parse(jsonStr);
        return { success: true, data };
      } catch { /* 继续 */ }
    }
    
    // 方法4: 尝试修复并解析
    try {
      let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');
      cleaned = cleaned.replace(/\/\/.*$/gm, '');
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return { success: true, data };
      }
    } catch { /* 所有方法都失败 */ }
    
    return { success: false, error: '无法解析JSON响应' };
  } catch (error: any) {
    return { success: false, error: error.message || 'JSON解析异常' };
  }
}

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

    // 调用Vision模型分析（带重试机制）
    const llmResult = await safeLLMInvoke(
      client,
      messages,
      {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      }
    );

    // 检查LLM调用是否成功
    if (!llmResult.success) {
      console.error('[PostureDiagnosis] LLM调用失败:', llmResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: `AI分析失败: ${llmResult.error}`,
          errorType: 'LLM_ERROR'
        },
        { status: 500 }
      );
    }

    // 解析JSON响应（使用健壮的解析方法）
    const parseResult = parseJSONResponse(llmResult.content!);
    
    let analysisResult;
    if (!parseResult.success) {
      console.error('[PostureDiagnosis] JSON解析失败:', {
        error: parseResult.error,
        contentPreview: llmResult.content?.substring(0, 500)
      });
      analysisResult = {
        score: 0,
        fullReport: llmResult.content,
        parseError: true,
        parseErrorDetail: parseResult.error
      };
    } else {
      analysisResult = parseResult.data;
      console.log('[PostureDiagnosis] JSON解析成功');
    }

    // 保存到数据库
    let recordId = null;
    if (saveRecord && userId) {
      try {
        const db = await getDb();
        
        // 插入体态诊断记录 - 使用原始SQL
        const insertResult = await db.execute(sql`
          INSERT INTO posture_diagnosis_records (
            user_id, front_image_url, left_side_image_url, right_side_image_url, back_image_url,
            score, grade, body_structure, fascia_chain_analysis, muscle_analysis,
            breathing_assessment, alignment_assessment, compensation_patterns,
            health_impact, health_prediction, treatment_plan, full_report
          ) VALUES (
            ${userId}, ${frontImage || null}, ${leftSideImage || null}, ${rightSideImage || null}, ${backImage || null},
            ${analysisResult.score || null}, ${analysisResult.grade || null},
            ${analysisResult.bodyStructure ? JSON.stringify(analysisResult.bodyStructure) : null},
            ${analysisResult.fasciaChainAnalysis ? JSON.stringify(analysisResult.fasciaChainAnalysis) : null},
            ${analysisResult.muscleAnalysis ? JSON.stringify(analysisResult.muscleAnalysis) : null},
            ${analysisResult.breathingAssessment ? JSON.stringify(analysisResult.breathingAssessment) : null},
            ${analysisResult.alignmentAssessment ? JSON.stringify(analysisResult.alignmentAssessment) : null},
            ${analysisResult.compensationPatterns ? JSON.stringify(analysisResult.compensationPatterns) : null},
            ${analysisResult.healthImpact ? JSON.stringify(analysisResult.healthImpact) : null},
            ${analysisResult.healthPrediction ? JSON.stringify(analysisResult.healthPrediction) : null},
            ${analysisResult.treatmentPlan ? JSON.stringify(analysisResult.treatmentPlan) : null},
            ${llmResult.content}
          )
          RETURNING id
        `);

        recordId = insertResult.rows[0]?.id;
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
        fullReport: llmResult.content,
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

    // 查询体态诊断记录 - 使用原始SQL
    const recordsResult = await db.execute(sql`
      SELECT * FROM posture_diagnosis_records 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
    const records = recordsResult.rows;

    // 查询总数
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM posture_diagnosis_records WHERE user_id = ${userId}
    `);

    const total = Number(countResult.rows[0]?.count) || 0;

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
