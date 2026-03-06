import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { faceDiagnosisRecords, healthProfiles } from '@/storage/database/shared/schema';
import { eq, sql } from 'drizzle-orm';

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

    // 调用Vision模型分析
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3, // 降低温度以获得更稳定的JSON输出
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
      // 如果JSON解析失败，返回原始文本
      analysisResult = {
        score: 0,
        fullReport: response.content,
        parseError: true
      };
    }

    // 生成完整报告文本
    const fullReport = generateFullReport(analysisResult);

    // 保存到数据库
    let recordId = null;
    if (saveRecord) {
      try {
        const db = await getDb();
        
        // 插入面诊记录
        const insertResult = await db.insert(faceDiagnosisRecords).values({
          userId: userId || null,
          score: analysisResult.score || null,
          faceColor: analysisResult.faceColor || {},
          faceLuster: analysisResult.faceLuster || {},
          facialFeatures: analysisResult.facialFeatures || {},
          facialCharacteristics: analysisResult.facialCharacteristics || {},
          constitution: analysisResult.constitution || {},
          organStatus: analysisResult.organStatus || {},
          suggestions: analysisResult.suggestions || [],
          fullReport: fullReport,
        }).returning({ id: faceDiagnosisRecords.id });

        recordId = insertResult[0]?.id || null;

        // 更新健康档案（如果有关联用户）
        if (userId) {
          await updateHealthProfile(db, userId, 'face', analysisResult);
        }
      } catch (dbError) {
        console.error('Failed to save diagnosis record:', dbError);
        // 不影响主流程，继续返回结果
      }
    }

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
