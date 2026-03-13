import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { tongueDiagnosisRecords, healthProfiles } from '@/storage/database/shared/schema';
import { eq, sql } from 'drizzle-orm';

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
      console.log(`[TongueDiagnosis] LLM调用尝试 ${attempt + 1}/${retries + 1}`);
      
      const response = await client.invoke(messages, options);
      
      if (!response || !response.content) {
        throw new Error('LLM返回空响应');
      }
      
      console.log(`[TongueDiagnosis] LLM调用成功，响应长度: ${response.content.length}`);
      return { success: true, content: response.content };
    } catch (error: any) {
      lastError = error;
      const errorType = error?.constructor?.name || 'UnknownError';
      const errorMessage = error?.message || String(error);
      
      console.error(`[TongueDiagnosis] LLM调用失败 (尝试 ${attempt + 1}/${retries + 1}):`, {
        errorType,
        errorMessage,
        stack: error?.stack?.split('\n').slice(0, 3)
      });
      
      if (attempt === retries) break;
      if (errorMessage.includes('invalid') || errorMessage.includes('格式') || errorMessage.includes('参数')) {
        console.log('[TongueDiagnosis] 错误类型不适合重试，直接返回失败');
        break;
      }
      
      console.log(`[TongueDiagnosis] 等待 ${RETRY_DELAY}ms 后重试...`);
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

// 舌诊系统提示词
const TONGUE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位专业的中医舌诊专家，拥有丰富的舌象分析经验。请根据用户提供的舌苔照片进行专业的舌诊分析。

## 分析框架

请严格按照以下JSON格式输出分析结果，确保输出的是有效的JSON：

{
  "score": <0-100的综合健康评分>,
  "tongueBody": {
    "color": "<舌色：淡白/淡红/红/绛红/青紫/正常>",
    "shape": "<舌形：胖大/瘦薄/裂纹/齿痕/正常>",
    "texture": "<舌态：强硬/痿软/颤动/正常>",
    "meaning": "<舌质分析的含义>"
  },
  "tongueCoating": {
    "color": "<苔色：白苔/黄苔/灰苔/黑苔/正常>",
    "thickness": "<苔质：薄苔/厚苔/腻苔/腐苔/剥落苔>",
    "moisture": "<润燥：润苔/燥苔/糙苔>",
    "meaning": "<舌苔分析的含义>"
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
  "summary": "<一段话总结舌诊结论>"
}

## 诊断要点

1. **舌质诊法**：
   - 淡白舌：主虚、寒，气血两虚
   - 淡红舌：正常舌色
   - 红舌：主热，实热或阴虚内热
   - 绛红舌：主热盛，阴虚火旺
   - 青紫舌：主瘀血、寒凝

2. **舌形诊法**：
   - 胖大舌：主水湿、阳虚
   - 瘦薄舌：主气血两虚、阴虚火旺
   - 裂纹舌：主阴液亏损、血虚不润
   - 齿痕舌：主脾虚、水湿内盛

3. **舌苔诊法**：
   - 白苔：主表证、寒证
   - 黄苔：主里证、热证
   - 灰黑苔：主里热、里寒重证
   - 厚苔：主邪盛入里
   - 薄苔：正常或病轻
   - 腻苔：主湿浊、痰饮、食积

4. **注意事项**：
   - 如果照片不清晰或无法判断，请在相应字段标注"无法判断"
   - 请根据实际观察给出客观分析，不要臆测`;

// POST /api/tongue-diagnosis - 舌诊分析（用户端）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, userId, saveRecord = true } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: '请上传舌苔图片' },
        { status: 400 }
      );
    }

    const isValidBase64 = image.startsWith('data:image/') || image.startsWith('/9j/');
    const isValidUrl = image.startsWith('http://') || image.startsWith('https://');
    
    if (!isValidBase64 && !isValidUrl) {
      return NextResponse.json(
        { success: false, error: '图片格式不正确' },
        { status: 400 }
      );
    }

    const imageUrl = isValidBase64 && !image.startsWith('data:image/') 
      ? `data:image/jpeg;base64,${image}` 
      : image;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: 'system' as const, content: TONGUE_DIAGNOSIS_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请分析这张舌苔图片，给出专业的舌诊报告。请严格按照JSON格式输出：' },
          { type: 'image_url' as const, image_url: { url: imageUrl, detail: 'high' as const } },
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
      console.error('[TongueDiagnosis] LLM调用失败:', llmResult.error);
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
      console.error('[TongueDiagnosis] JSON解析失败:', {
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
      console.log('[TongueDiagnosis] JSON解析成功');
    }

    const fullReport = generateFullReport(analysisResult);

    let recordId = null;
    if (saveRecord) {
      try {
        const db = await getDb();
        const insertResult = await db.insert(tongueDiagnosisRecords).values({
          userId: userId || null,
          score: analysisResult.score || null,
          tongueBody: analysisResult.tongueBody || {},
          tongueCoating: analysisResult.tongueCoating || {},
          constitution: analysisResult.constitution || {},
          organStatus: analysisResult.organStatus || {},
          suggestions: analysisResult.suggestions || [],
          fullReport: fullReport,
        }).returning({ id: tongueDiagnosisRecords.id });
        recordId = insertResult[0]?.id || null;
        if (userId) await updateHealthProfile(db, userId, 'tongue', analysisResult);
      } catch (dbError) {
        console.error('Failed to save diagnosis record:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: { ...analysisResult, fullReport, recordId, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Tongue diagnosis error:', error);
    return NextResponse.json({ success: false, error: '舌诊分析失败' }, { status: 500 });
  }
}

function generateFullReport(result: any): string {
  if (result.parseError) return result.fullReport || '分析结果解析失败';
  const sections: string[] = [];
  sections.push('【中医舌诊报告】\n');
  if (result.score !== undefined) sections.push(`📊 综合健康评分：${result.score}分\n`);
  if (result.tongueBody) {
    sections.push('👅 舌质分析');
    if (result.tongueBody.color) sections.push(`  舌色：${result.tongueBody.color}`);
    if (result.tongueBody.shape) sections.push(`  舌形：${result.tongueBody.shape}`);
    if (result.tongueBody.meaning) sections.push(`  分析：${result.tongueBody.meaning}`);
    sections.push('');
  }
  if (result.tongueCoating) {
    sections.push('🦷 舌苔分析');
    if (result.tongueCoating.color) sections.push(`  苔色：${result.tongueCoating.color}`);
    if (result.tongueCoating.thickness) sections.push(`  苔质：${result.tongueCoating.thickness}`);
    if (result.tongueCoating.meaning) sections.push(`  分析：${result.tongueCoating.meaning}`);
    sections.push('');
  }
  if (result.constitution) {
    sections.push('🏷️ 体质判断');
    sections.push(`  主体质：${result.constitution.type || '未判断'}`);
    if (result.constitution.confidence) sections.push(`  置信度：${result.constitution.confidence}%`);
    sections.push('');
  }
  if (result.organStatus) {
    sections.push('💚 五脏健康状态');
    sections.push(`  心：${result.organStatus.heart || '-'}分  肝：${result.organStatus.liver || '-'}分`);
    sections.push(`  脾：${result.organStatus.spleen || '-'}分  肺：${result.organStatus.lung || '-'}分  肾：${result.organStatus.kidney || '-'}分`);
    sections.push('');
  }
  if (result.suggestions?.length) {
    sections.push('💡 健康建议');
    result.suggestions.forEach((s: any) => sections.push(`  【${s.type}】${s.content}`));
    sections.push('');
  }
  if (result.summary) sections.push(`📝 总结：${result.summary}`);
  return sections.join('\n');
}

async function updateHealthProfile(db: any, userId: string, type: 'face' | 'tongue', result: any) {
  try {
    const existing = await db.execute('SELECT id FROM health_profiles WHERE user_id = $1', [userId]);
    const now = new Date().toISOString();
    if (existing.rows?.length > 0) {
      const sets = ['updated_at = $1'];
      const vals: any[] = [now];
      let i = 2;
      if (type === 'tongue') {
        sets.push(`latest_tongue_score = $${i++}`, `tongue_diagnosis_count = tongue_diagnosis_count + 1`, `last_tongue_diagnosis_at = $${i++}`);
        vals.push(result.score, now);
      }
      sets.push(`latest_score = COALESCE((latest_face_score + latest_tongue_score) / 2, latest_face_score, latest_tongue_score)`);
      if (result.constitution?.type) {
        sets.push(`constitution = $${i++}`);
        vals.push(result.constitution.type);
      }
      vals.push(userId);
      await db.execute(`UPDATE health_profiles SET ${sets.join(', ')} WHERE user_id = $${i}`, vals);
    } else {
      await db.execute(`INSERT INTO health_profiles (user_id, latest_score, constitution, latest_tongue_score, tongue_diagnosis_count, last_tongue_diagnosis_at) VALUES ($1, $2, $3, $4, 1, $5)`, [userId, result.score, result.constitution?.type || null, result.score, now]);
    }
  } catch (e) { console.error('Failed to update health profile:', e); }
}
