import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
// 注意：tongueDiagnosisRecords 表由 /api/tongue-diagnosis-records 路由管理
// 这里不再直接使用 Drizzle ORM 操作该表，避免与原始 SQL 创建的表结构冲突

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
  "tripleHighRisk": {
    "overallRisk": {
      "level": "低/中/高",
      "score": <0-100的综合风险评分>,
      "confidence": <0-100的置信度>,
      "tcmPattern": "主要证型"
    },
    "hypertension": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100>,
      "tongueIndicators": [
        {
          "name": "舌质红",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "location": "舌尖/舌中/舌根/全舌",
          "confidence": <0-100>,
          "tcmMeaning": "肝阳上亢，内热炽盛"
        },
        {
          "name": "舌下络脉怒张",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "tcmMeaning": "血瘀阻络"
        }
      ],
      "tcmPatterns": [
        {
          "pattern": "肝阳上亢型",
          "matchScore": <0-100>,
          "features": ["舌红苔黄", "舌边红", "脉弦"],
          "pathology": "肝气郁结，化火上炎",
          "treatmentPrinciple": "平肝潜阳，清热泻火"
        }
      ],
      "organInvolvement": [
        {
          "organ": "肝",
          "status": "亢盛/正常/不足",
          "description": "肝阳上亢，气血上逆"
        },
        {
          "organ": "肾",
          "status": "亢盛/正常/不足",
          "description": "肾阴不足，水不涵木"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["头晕", "头痛", "面红"]
      },
      "midTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "1年内",
        "possibleSymptoms": ["血压升高", "心悸"]
      },
      "longTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3年以上",
        "possibleSymptoms": ["心血管疾病", "中风风险"]
      },
      "preventiveMeasures": [
        {
          "type": "饮食",
          "content": "清淡饮食",
          "importance": "高/中/低"
        }
      ],
      "treatmentPlan": {
        "dietaryTherapy": ["清热降火", "平肝潜阳"],
        "acupuncturePoints": ["太冲", "肝俞", "肾俞"],
        "herbalFormulas": ["天麻钩藤饮"],
        "lifestyle": ["充足睡眠", "情绪调适"]
      },
      "medicalRecommendations": [
        "建议血压监测",
        "建议血脂检查",
        "建议中医调理"
      ]
    },
    "hyperglycemia": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100>,
      "tongueIndicators": [
        {
          "name": "舌苔黄腻",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "tcmMeaning": "湿热内蕴"
        },
        {
          "name": "舌质红绛",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "tcmMeaning": "阴虚火旺"
        }
      ],
      "tcmPatterns": [
        {
          "pattern": "阴虚燥热型",
          "matchScore": <0-100>,
          "features": ["舌红少苔", "舌干裂", "脉细数"],
          "pathology": "阴虚内热，津液亏损",
          "treatmentPrinciple": "滋阴润燥，清热生津"
        }
      ],
      "organInvolvement": [
        {
          "organ": "脾",
          "status": "亢盛/正常/不足",
          "description": "脾失健运，痰湿内生"
        },
        {
          "organ": "肾",
          "status": "亢盛/正常/不足",
          "description": "肾阴不足，虚火内生"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["口干", "口渴", "乏力"]
      },
      "midTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "1年内",
        "possibleSymptoms": ["血糖升高", "多尿"]
      },
      "longTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3年以上",
        "possibleSymptoms": ["糖尿病并发症", "器官损害"]
      },
      "preventiveMeasures": [
        {
          "type": "饮食",
          "content": "控糖饮食",
          "importance": "高/中/低"
        }
      ],
      "treatmentPlan": {
        "dietaryTherapy": ["滋阴润燥", "健脾化痰"],
        "acupuncturePoints": ["脾俞", "胃俞", "肾俞"],
        "herbalFormulas": ["六味地黄丸", "消渴丸"],
        "lifestyle": ["规律运动", "充足睡眠"]
      },
      "medicalRecommendations": [
        "建议血糖检查",
        "建议糖化血红蛋白检查",
        "建议中医调理"
      ]
    },
    "hyperlipidemia": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100>,
      "tongueIndicators": [
        {
          "name": "舌苔厚腻",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "tcmMeaning": "痰湿内盛"
        },
        {
          "name": "舌质胖大",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "tcmMeaning": "脾虚湿盛"
        }
      ],
      "tcmPatterns": [
        {
          "pattern": "痰湿阻滞型",
          "matchScore": <0-100>,
          "features": ["舌胖苔腻", "脉滑", "体胖"],
          "pathology": "脾失健运，痰湿内生",
          "treatmentPrinciple": "健脾化痰，祛湿降脂"
        }
      ],
      "organInvolvement": [
        {
          "organ": "脾",
          "status": "亢盛/正常/不足",
          "description": "脾虚失运，痰湿内生"
        },
        {
          "organ": "肝",
          "status": "亢盛/正常/不足",
          "description": "肝失疏泄，气机不畅"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["乏力", "头晕", "痰多"]
      },
      "midTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "1年内",
        "possibleSymptoms": ["血脂升高", "动脉硬化"]
      },
      "longTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3年以上",
        "possibleSymptoms": ["冠心病", "脑卒中"]
      },
      "preventiveMeasures": [
        {
          "type": "饮食",
          "content": "低脂饮食",
          "importance": "高/中/低"
        }
      ],
      "treatmentPlan": {
        "dietaryTherapy": ["健脾化痰", "祛湿降脂"],
        "acupuncturePoints": ["脾俞", "丰隆", "足三里"],
        "herbalFormulas": ["二陈汤", "降脂汤"],
        "lifestyle": ["规律运动", "饮食清淡"]
      },
      "medicalRecommendations": [
        "建议血脂检查",
        "建议肝功能检查",
        "建议中医调理"
      ]
    },
    "comprehensiveTCMAnalysis": {
      "constitution": {
        "primary": "主要体质",
        "secondary": "次要体质",
        "trend": "体质趋势"
      },
      "meridianStatus": [
        {
          "meridian": "肝经",
          "status": "失衡/正常",
          "symptoms": ["肝阳上亢", "肝气郁结"]
        }
      ],
      "qiBloodStatus": {
        "qi": "充足/不足/瘀滞",
        "blood": "充盈/不足/瘀滞",
        "balance": "平衡/失衡"
      },
      "yinYangStatus": {
        "yin": "充足/不足",
        "yang": "充足/不足",
        "balance": "平衡/失衡"
      }
    },
    "comprehensiveRecommendations": {
      "immediate": [
        "建议立即就医检查",
        "调整饮食结构",
        "规律作息"
      ],
      "shortTerm": [
        "3个月后复查",
        "建立健康档案",
        "监测生理指标"
      ],
      "longTerm": [
        "定期体检",
        "健康管理",
        "生活方式干预"
      ]
    }
  },
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

    // 保存到数据库 - 使用原始 SQL，通过 tongue-diagnosis-records API
    // 注意：不在此处直接保存，由前端调用 /api/tongue-diagnosis-records 的 saveDiagnosis action
    // 这样可以避免与原始 SQL 创建的表结构冲突
    let recordId = null;

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
  
  // 三高风险评估（新增）
  if (result.tripleHighRisk) {
    sections.push('🔬 三高风险评估（舌诊）\n');
    
    // 总体风险
    if (result.tripleHighRisk.overallRisk) {
      sections.push('总体风险');
      sections.push(`  风险等级：${result.tripleHighRisk.overallRisk.level || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.overallRisk.score || 0}分`);
      sections.push(`  中医证型：${result.tripleHighRisk.overallRisk.tcmPattern || '未识别'}`);
      sections.push('');
    }

    // 高血压风险
    if (result.tripleHighRisk.hypertension) {
      sections.push('💓 高血压风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hypertension.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hypertension.riskScore || 0}分`);
      
      // 舌象指标
      if (result.tripleHighRisk.hypertension.tongueIndicators && result.tripleHighRisk.hypertension.tongueIndicators.length > 0) {
        sections.push('  舌象指标：');
        result.tripleHighRisk.hypertension.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.tcmMeaning) sections.push(`      中医含义：${ind.tcmMeaning}`);
          }
        });
      }

      // 中医证型
      if (result.tripleHighRisk.hypertension.tcmPatterns && result.tripleHighRisk.hypertension.tcmPatterns.length > 0) {
        sections.push('  中医证型分析：');
        result.tripleHighRisk.hypertension.tcmPatterns.forEach((pattern: any) => {
          sections.push(`    • ${pattern.pattern}（匹配度${pattern.matchScore}%）`);
          sections.push(`      病机：${pattern.pathology}`);
          sections.push(`      治则：${pattern.treatmentPrinciple}`);
        });
      }

      // 脏腑关系
      if (result.tripleHighRisk.hypertension.organInvolvement && result.tripleHighRisk.hypertension.organInvolvement.length > 0) {
        sections.push('  脏腑关系：');
        result.tripleHighRisk.hypertension.organInvolvement.forEach((organ: any) => {
          sections.push(`    • ${organ.organ}：${organ.status}（${organ.description}）`);
        });
      }

      // 治疗方案
      if (result.tripleHighRisk.hypertension.treatmentPlan) {
        sections.push('  中医治疗方案：');
        const tp = result.tripleHighRisk.hypertension.treatmentPlan;
        if (tp.dietaryTherapy) sections.push(`    食疗：${tp.dietaryTherapy.join('、')}`);
        if (tp.acupuncturePoints) sections.push(`    穴位：${tp.acupuncturePoints.join('、')}`);
        if (tp.herbalFormulas) sections.push(`    方剂：${tp.herbalFormulas.join('、')}`);
        if (tp.lifestyle) sections.push(`    调摄：${tp.lifestyle.join('、')}`);
      }

      sections.push('');
    }

    // 高血糖风险
    if (result.tripleHighRisk.hyperglycemia) {
      sections.push('🍬 高血糖风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hyperglycemia.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hyperglycemia.riskScore || 0}分`);
      
      // 舌象指标
      if (result.tripleHighRisk.hyperglycemia.tongueIndicators && result.tripleHighRisk.hyperglycemia.tongueIndicators.length > 0) {
        sections.push('  舌象指标：');
        result.tripleHighRisk.hyperglycemia.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.tcmMeaning) sections.push(`      中医含义：${ind.tcmMeaning}`);
          }
        });
      }

      // 中医证型
      if (result.tripleHighRisk.hyperglycemia.tcmPatterns && result.tripleHighRisk.hyperglycemia.tcmPatterns.length > 0) {
        sections.push('  中医证型分析：');
        result.tripleHighRisk.hyperglycemia.tcmPatterns.forEach((pattern: any) => {
          sections.push(`    • ${pattern.pattern}（匹配度${pattern.matchScore}%）`);
          sections.push(`      病机：${pattern.pathology}`);
          sections.push(`      治则：${pattern.treatmentPrinciple}`);
        });
      }

      sections.push('');
    }

    // 高血脂风险
    if (result.tripleHighRisk.hyperlipidemia) {
      sections.push('🥓 高血脂风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hyperlipidemia.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hyperlipidemia.riskScore || 0}分`);
      
      // 舌象指标
      if (result.tripleHighRisk.hyperlipidemia.tongueIndicators && result.tripleHighRisk.hyperlipidemia.tongueIndicators.length > 0) {
        sections.push('  舌象指标：');
        result.tripleHighRisk.hyperlipidemia.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.tcmMeaning) sections.push(`      中医含义：${ind.tcmMeaning}`);
          }
        });
      }

      // 中医证型
      if (result.tripleHighRisk.hyperlipidemia.tcmPatterns && result.tripleHighRisk.hyperlipidemia.tcmPatterns.length > 0) {
        sections.push('  中医证型分析：');
        result.tripleHighRisk.hyperlipidemia.tcmPatterns.forEach((pattern: any) => {
          sections.push(`    • ${pattern.pattern}（匹配度${pattern.matchScore}%）`);
          sections.push(`      病机：${pattern.pathology}`);
          sections.push(`      治则：${pattern.treatmentPrinciple}`);
        });
      }

      sections.push('');
    }

    // 综合中医分析
    if (result.tripleHighRisk.comprehensiveTCMAnalysis) {
      sections.push('⚕️ 综合中医分析');
      const tcm = result.tripleHighRisk.comprehensiveTCMAnalysis;
      
      if (tcm.constitution) {
        sections.push(`  体质：${tcm.constitution.primary}`);
        if (tcm.constitution.secondary) sections.push(`  次要体质：${tcm.constitution.secondary}`);
        sections.push(`  体质趋势：${tcm.constitution.trend}`);
      }

      if (tcm.qiBloodStatus) {
        sections.push(`  气血：${tcm.qiBloodStatus.qi}、${tcm.qiBloodStatus.blood}（${tcm.qiBloodStatus.balance}）`);
      }

      if (tcm.yinYangStatus) {
        sections.push(`  阴阳：${tcm.yinYangStatus.yin}、${tcm.yinYangStatus.yang}（${tcm.yinYangStatus.balance}）`);
      }

      sections.push('');
    }

    // 综合建议
    if (result.tripleHighRisk.comprehensiveRecommendations) {
      sections.push('💡 综合建议');
      
      if (result.tripleHighRisk.comprehensiveRecommendations.immediate) {
        sections.push('  立即行动：');
        result.tripleHighRisk.comprehensiveRecommendations.immediate.forEach((rec: string) => {
          sections.push(`    • ${rec}`);
        });
      }

      sections.push('');
    }
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
