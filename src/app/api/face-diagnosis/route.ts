import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
// 注意：faceDiagnosisRecords 表由 /api/face-diagnosis-records 路由管理
// 这里不再直接使用 Drizzle ORM 操作该表，避免与原始 SQL 创建的表结构冲突

// LLM调用重试配置
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1秒

// 延迟函数
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
      console.log(`[FaceDiagnosis] LLM调用尝试 ${attempt + 1}/${retries + 1}`);
      
      const response = await client.invoke(messages, options);
      
      if (!response || !response.content) {
        throw new Error('LLM返回空响应');
      }
      
      console.log(`[FaceDiagnosis] LLM调用成功，响应长度: ${response.content.length}`);
      return { success: true, content: response.content };
    } catch (error: any) {
      lastError = error;
      const errorType = error?.constructor?.name || 'UnknownError';
      const errorMessage = error?.message || String(error);
      
      console.error(`[FaceDiagnosis] LLM调用失败 (尝试 ${attempt + 1}/${retries + 1}):`, {
        errorType,
        errorMessage,
        stack: error?.stack?.split('\n').slice(0, 3)
      });
      
      // 如果是最后一次尝试，不再重试
      if (attempt === retries) {
        break;
      }
      
      // 某些错误不需要重试
      if (errorMessage.includes('invalid') || errorMessage.includes('格式') || errorMessage.includes('参数')) {
        console.log('[FaceDiagnosis] 错误类型不适合重试，直接返回失败');
        break;
      }
      
      // 等待后重试
      console.log(`[FaceDiagnosis] 等待 ${RETRY_DELAY}ms 后重试...`);
      await delay(RETRY_DELAY);
    }
  }
  
  return { 
    success: false, 
    error: lastError?.message || 'LLM调用失败' 
  };
}

// 健壮的JSON解析函数
function parseJSONResponse(content: string): { success: boolean; data?: any; error?: string } {
  try {
    // 方法1: 直接解析
    try {
      const data = JSON.parse(content);
      return { success: true, data };
    } catch {
      // 继续尝试其他方法
    }
    
    // 方法2: 提取markdown代码块中的JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        const data = JSON.parse(codeBlockMatch[1].trim());
        return { success: true, data };
      } catch {
        // 继续尝试其他方法
      }
    }
    
    // 方法3: 提取第一个完整的JSON对象
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        // 尝试修复常见的JSON问题
        let jsonStr = jsonMatch[0];
        
        // 移除尾部逗号
        jsonStr = jsonStr.replace(/,\s*}/g, '}');
        jsonStr = jsonStr.replace(/,\s*]/g, ']');
        
        // 修复未转义的换行符
        jsonStr = jsonStr.replace(/\n/g, '\\n');
        
        const data = JSON.parse(jsonStr);
        return { success: true, data };
      } catch {
        // 继续尝试其他方法
      }
    }
    
    // 方法4: 尝试修复并解析
    try {
      // 移除可能的注释
      let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');
      cleaned = cleaned.replace(/\/\/.*$/gm, '');
      
      // 查找JSON对象
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return { success: true, data };
      }
    } catch {
      // 所有方法都失败
    }
    
    return { 
      success: false, 
      error: '无法解析JSON响应' 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'JSON解析异常' 
    };
  }
}

// 面诊系统提示词
const FACE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位专业的中医面诊专家，拥有丰富的面相诊断经验。请根据用户提供的面部照片进行全面的面诊分析。

## 分析框架

请严格按照以下JSON格式输出分析结果，确保输出的是有效的JSON：

{
  "score": <0-100的综合健康评分>,
  "faceColor": {
    "color": "<面色：青/赤/黄/白/黑/正常>",
    "meaning": "<面色代表的健康含义>",
    "severity": "<严重程度：无/轻度/中度/重度>"
  },
  "faceLuster": {
    "status": "<光泽状态：明润/晦暗/枯槁>",
    "meaning": "<光泽代表的气血状态>"
  },
  "facialFeatures": {
    "eyes": {
      "status": "<眼睛状态描述>",
      "issues": ["<问题1>", "<问题2>"],
      "organRef": "<对应的脏腑：肝>"
    },
    "nose": {
      "status": "<鼻子状态描述>",
      "issues": [],
      "organRef": "<对应的脏腑：脾/肺>"
    },
    "lips": {
      "status": "<嘴唇状态描述>",
      "issues": [],
      "organRef": "<对应的脏腑：脾>"
    },
    "ears": {
      "status": "<耳朵状态描述>",
      "issues": [],
      "organRef": "<对应的脏腑：肾>"
    },
    "forehead": {
      "status": "<额头状态描述>",
      "issues": [],
      "organRef": "<对应区域>"
    }
  },
  "facialCharacteristics": {
    "spots": "<是否有斑点，位置和类型>",
    "acne": "<是否有痤疮，位置>",
    "wrinkles": "<皱纹情况>",
    "puffiness": "<浮肿情况>",
    "darkCircles": "<黑眼圈情况>"
  },
  "constitution": {
    "type": "<主体质：平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质>",
    "confidence": <0-100的置信度>,
    "secondary": "<次要体质倾向>"
  },
  "organStatus": {
    "heart": <0-100的心脏健康评分>,
    "liver": <0-100的肝脏健康评分>,
    "spleen": <0-100的脾脏健康评分>,
    "lung": <0-100的肺脏健康评分>,
    "kidney": <0-100的肾脏健康评分>
  },
  "suggestions": [
    {
      "type": "饮食",
      "content": "<具体的饮食建议>"
    },
    {
      "type": "作息",
      "content": "<具体的作息建议>"
    },
    {
      "type": "运动",
      "content": "<具体的运动建议>"
    },
    {
      "type": "穴位按摩",
      "content": "<具体的穴位按摩建议>"
    }
  ],
  "summary": "<一段话总结面诊结论>"
}

## 诊断要点

1. **五色诊法**：
   - 青色：主寒、痛、瘀、惊，对应肝
   - 赤色：主热，对应心
   - 黄色：主虚、湿，对应脾
   - 白色：主寒、虚、脱血，对应肺
   - 黑色：主寒、痛、瘀、肾虚，对应肾

2. **五官分部诊法**：
   - 眼睛：反映肝血、肾精状态
   - 鼻子：反映脾胃、肺气状态
   - 嘴唇：反映脾胃、心血状态
   - 耳朵：反映肾气状态
   - 额头：反映心、肺功能

3. **注意事项**：
   - 如果照片不清晰或无法判断，请在相应字段标注"无法判断"
   - 请根据实际观察给出客观分析，不要臆测
   - 评分要客观公正，不要过高或过低`;

// POST /api/face-diagnosis - 面诊分析（用户端）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, userId, saveRecord = true } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: '请上传面部照片' },
        { status: 400 }
      );
    }

    // 验证图片格式
    const isValidBase64 = image.startsWith('data:image/') || image.startsWith('/9j/');
    const isValidUrl = image.startsWith('http://') || image.startsWith('https://');
    
    if (!isValidBase64 && !isValidUrl) {
      return NextResponse.json(
        { success: false, error: '图片格式不正确，请上传有效的图片' },
        { status: 400 }
      );
    }

    // 准备图片URL
    const imageUrl = isValidBase64 && !image.startsWith('data:image/') 
      ? `data:image/jpeg;base64,${image}` 
      : image;

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: FACE_DIAGNOSIS_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请分析这张面部照片，给出专业的中医面诊报告。请严格按照JSON格式输出：' },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
              detail: 'high' as const,
            },
          },
        ],
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
      console.error('[FaceDiagnosis] LLM调用失败:', llmResult.error);
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
      console.error('[FaceDiagnosis] JSON解析失败:', {
        error: parseResult.error,
        contentPreview: llmResult.content?.substring(0, 500)
      });
      // 如果JSON解析失败，返回原始文本作为报告
      analysisResult = {
        score: 0,
        fullReport: llmResult.content,
        parseError: true,
        parseErrorDetail: parseResult.error
      };
    } else {
      analysisResult = parseResult.data;
      console.log('[FaceDiagnosis] JSON解析成功');
    }

    // 生成完整报告文本
    const fullReport = generateFullReport(analysisResult);

    // 保存到数据库 - 使用原始 SQL，通过 face-diagnosis-records API
    // 注意：不在此处直接保存，由前端调用 /api/face-diagnosis-records 的 saveDiagnosis action
    // 这样可以避免与原始 SQL 创建的表结构冲突
    let recordId = null;

    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        fullReport,
        recordId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Face diagnosis error:', error);
    return NextResponse.json(
      { success: false, error: '面诊分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 生成完整报告文本
function generateFullReport(result: any): string {
  if (result.parseError) {
    return result.fullReport || '分析结果解析失败';
  }

  const sections: string[] = [];

  sections.push('【中医面诊报告】\n');

  // 综合评分
  if (result.score !== undefined) {
    sections.push(`📊 综合健康评分：${result.score}分\n`);
  }

  // 面色分析
  if (result.faceColor) {
    sections.push('🎨 面色分析');
    sections.push(`  面色：${result.faceColor.color || '未判断'}`);
    if (result.faceColor.meaning) {
      sections.push(`  含义：${result.faceColor.meaning}`);
    }
    if (result.faceColor.severity) {
      sections.push(`  严重程度：${result.faceColor.severity}`);
    }
    sections.push('');
  }

  // 光泽分析
  if (result.faceLuster) {
    sections.push('✨ 面色光泽');
    sections.push(`  状态：${result.faceLuster.status || '未判断'}`);
    if (result.faceLuster.meaning) {
      sections.push(`  含义：${result.faceLuster.meaning}`);
    }
    sections.push('');
  }

  // 五官分析
  if (result.facialFeatures) {
    sections.push('👁️ 五官分析');
    const features = result.facialFeatures;
    if (features.eyes) {
      sections.push(`  眼睛（对应：肝）：${features.eyes.status || '正常'}`);
    }
    if (features.nose) {
      sections.push(`  鼻子（对应：脾/肺）：${features.nose.status || '正常'}`);
    }
    if (features.lips) {
      sections.push(`  嘴唇（对应：脾）：${features.lips.status || '正常'}`);
    }
    if (features.ears) {
      sections.push(`  耳朵（对应：肾）：${features.ears.status || '正常'}`);
    }
    if (features.forehead) {
      sections.push(`  额头：${features.forehead.status || '正常'}`);
    }
    sections.push('');
  }

  // 面部特征
  if (result.facialCharacteristics) {
    sections.push('🔍 面部特征');
    const chars = result.facialCharacteristics;
    if (chars.spots) sections.push(`  斑点：${chars.spots}`);
    if (chars.acne) sections.push(`  痤疮：${chars.acne}`);
    if (chars.wrinkles) sections.push(`  皱纹：${chars.wrinkles}`);
    if (chars.puffiness) sections.push(`  浮肿：${chars.puffiness}`);
    if (chars.darkCircles) sections.push(`  黑眼圈：${chars.darkCircles}`);
    sections.push('');
  }

  // 体质判断
  if (result.constitution) {
    sections.push('🏷️ 体质判断');
    sections.push(`  主体质：${result.constitution.type || '未判断'}`);
    if (result.constitution.confidence) {
      sections.push(`  置信度：${result.constitution.confidence}%`);
    }
    if (result.constitution.secondary) {
      sections.push(`  次要倾向：${result.constitution.secondary}`);
    }
    sections.push('');
  }

  // 五脏状态
  if (result.organStatus) {
    sections.push('💚 五脏健康状态');
    const organs = result.organStatus;
    sections.push(`  心：${organs.heart || '-'}分`);
    sections.push(`  肝：${organs.liver || '-'}分`);
    sections.push(`  脾：${organs.spleen || '-'}分`);
    sections.push(`  肺：${organs.lung || '-'}分`);
    sections.push(`  肾：${organs.kidney || '-'}分`);
    sections.push('');
  }

  // 健康建议
  if (result.suggestions && Array.isArray(result.suggestions)) {
    sections.push('💡 健康建议');
    result.suggestions.forEach((s: any) => {
      sections.push(`  【${s.type}】${s.content}`);
    });
    sections.push('');
  }

  // 总结
  if (result.summary) {
    sections.push(`📝 总结：${result.summary}`);
  }

  return sections.join('\n');
}

// 更新健康档案
async function updateHealthProfile(db: any, userId: string, type: 'face' | 'tongue', result: any) {
  try {
    // 检查是否已有档案
    const existingProfile = await db.execute(
      'SELECT id FROM health_profiles WHERE user_id = $1',
      [userId]
    );

    const now = new Date().toISOString();
    
    if (existingProfile.rows?.length > 0) {
      // 更新现有档案
      const updateFields: string[] = ['updated_at = $1'];
      const values: any[] = [now];
      let paramIndex = 2;

      if (type === 'face') {
        updateFields.push(`latest_face_score = $${paramIndex++}`);
        values.push(result.score);
        updateFields.push(`face_diagnosis_count = face_diagnosis_count + 1`);
        updateFields.push(`last_face_diagnosis_at = $${paramIndex++}`);
        values.push(now);
      } else {
        updateFields.push(`latest_tongue_score = $${paramIndex++}`);
        values.push(result.score);
        updateFields.push(`tongue_diagnosis_count = tongue_diagnosis_count + 1`);
        updateFields.push(`last_tongue_diagnosis_at = $${paramIndex++}`);
        values.push(now);
      }

      // 更新综合评分（取面诊和舌诊的平均值，或其中之一）
      updateFields.push(`latest_score = COALESCE((latest_face_score + latest_tongue_score) / 2, latest_face_score, latest_tongue_score)`);

      // 更新体质
      if (result.constitution?.type) {
        updateFields.push(`constitution = $${paramIndex++}`);
        values.push(result.constitution.type);
        if (result.constitution.confidence) {
          updateFields.push(`constitution_confidence = $${paramIndex++}`);
          values.push(result.constitution.confidence);
        }
      }

      values.push(userId);

      await db.execute(
        `UPDATE health_profiles SET ${updateFields.join(', ')} WHERE user_id = $${paramIndex}`,
        values
      );
    } else {
      // 创建新档案
      await db.execute(`
        INSERT INTO health_profiles (
          user_id, latest_score, constitution, constitution_confidence,
          latest_face_score, face_diagnosis_count, last_face_diagnosis_at,
          latest_tongue_score, tongue_diagnosis_count, last_tongue_diagnosis_at
        ) VALUES ($1, $2, $3, $4, $5, 1, $6, NULL, 0, NULL)
      `, [
        userId,
        result.score,
        result.constitution?.type || null,
        result.constitution?.confidence || null,
        type === 'face' ? result.score : null,
        now,
      ]);
    }
  } catch (error) {
    console.error('Failed to update health profile:', error);
  }
}
