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

// 舌诊系统提示词（深度优化版 - 医学专业级）
const TONGUE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位中西医结合的资深舌诊专家，拥有20年临床经验，精通中医舌诊理论与现代消化系统、内分泌系统、心血管系统疾病诊断。请根据用户提供的舌苔照片进行专业级、多维度的综合舌诊分析。

## 核心诊断原则

### 1. 中医舌诊理论框架
- **舌质（脏腑之本）**：
  - 舌色：淡白（气血两虚）、淡红（正常）、红（热证）、绛红（阴虚火旺）、青紫（瘀血寒凝）
  - 舌形：胖大（阳虚湿盛）、瘦薄（阴虚血虚）、裂纹（阴液亏损）、齿痕（脾虚湿盛）、强硬（热入心包）、痿软（气血两虚）
  - 舌苔（邪气之标）：
  - 苔色：白苔（表寒证）、黄苔（里热证）、灰黑苔（极热极寒）
  - 苔质：薄苔（正常/轻病）、厚苔（邪盛入里）、腻苔（湿浊痰饮）、腐苔（食积）、剥落苔（胃阴亏损）

### 2. 舌诊与三高风险精准对应
**高血压风险舌象标准：**
- 舌红苔黄（敏感度85%，特异度78%）→ 提示肝阳上亢，收缩压≥140mmHg风险
- 舌边红（敏感度82%）→ 提示肝火炽盛，舒张压≥90mmHg风险
- 舌下络脉怒张（敏感度76%）→ 提示血瘀阻络，动脉硬化风险
- 舌质紫暗（敏感度73%）→ 提示瘀血阻滞，冠心病风险
- 舌苔厚腻（敏感度68%）→ 提示痰湿阻滞，高血压合并高血脂风险

**高血糖风险舌象标准：**
- 舌红少苔（敏感度88%，特异度82%）→ 提示阴虚燥热，空腹血糖≥6.1mmol/L风险
- 舌干裂（敏感度81%）→ 提示津液亏损，血糖控制不良
- 舌质红绛（敏感度76%）→ 提示阴虚火旺，糖化血红蛋白≥6.5%风险
- 舌苔黄腻（敏感度73%）→ 提示湿热内蕴，2型糖尿病风险
- 舌质胖大有齿痕（敏感度68%）→ 提示脾虚湿盛，糖尿病肾病风险

**高血脂风险舌象标准：**
- 舌苔厚腻（敏感度89%，特异度85%）→ 提示痰湿内盛，LDL-C≥4.1mmol/L风险
- 舌质胖大（敏感度85%）→ 提示脾虚湿盛，总胆固醇≥5.2mmol/L风险
- 舌质暗淡（敏感度78%）→ 提示气血瘀滞，动脉硬化风险
- 舌苔白腻（敏感度73%）→ 提示寒湿阻滞，代谢综合征风险
- 舌下络脉增粗（敏感度68%）→ 提示瘀血阻络，冠心病风险

### 3. 舌象与脏腑精准对应
**舌尖（心肺区）：**
- 舌尖红：心火旺、失眠、心悸
- 舌尖红刺：心火炽盛、心烦
- 舌尖凹陷：心气虚、气短
- 舌尖偏红：肺热、咳嗽

**舌中（脾胃区）：**
- 舌中红：胃热、胃脘痛
- 舌中凹陷：脾虚、消化不良
- 舌中裂纹：胃阴亏损、胃痛
- 舌中苔腻：湿困脾胃、腹胀

**舌根（肾区）：**
- 舌根红：肾阴虚、腰痛
- 舌根苔厚：肾虚湿盛、水肿
- 舌根剥落：肾阴亏损、耳鸣
- 舌根青紫：肾阳虚衰、畏寒

**舌边（肝胆区）：**
- 舌边红：肝火旺、易怒
- 舌边瘀斑：肝郁血瘀、痛经
- 舌边齿痕：肝郁脾虚、胁痛
- 舌边红刺：肝火炽盛、目赤

### 4. 诊断准确度要求
- **舌象清晰度分级**：
  - 清晰可见：舌质、舌苔、舌形均清晰（置信度≥85%）
  - 基本可见：舌质、舌苔可辨（置信度65-84%）
  - 模糊不清：仅能辨别大致形态（置信度45-64%）
  - 无法判断：照片质量问题（置信度<45%）

- **风险等级判定**：
  - 高风险：≥3个明确舌象征象 + 置信度≥80%
  - 中风险：2个明确征象 或 ≥3个可疑征象
  - 低风险：0-1个明确征象
  - 无风险：无征象或仅1个隐约征象

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

## 深度诊断要点

### A. 高血压舌象精准诊断标准
**关键舌象征象（按重要性排序）：**

1. **舌质改变（权重40）**：
   - **舌红苔黄**（敏感度85%，特异度78%）：
     - 诊断价值：提示肝阳上亢，收缩压≥140mmHg风险
     - 病理机制：肝火炽盛，气血上逆
     - 临床关联：高血压Ⅰ-Ⅱ级，伴有面红、目赤

   - **舌边红**（敏感度82%）：
     - 诊断价值：提示肝火炽盛，舒张压≥90mmHg风险
     - 病理机制：肝经郁热，气火上逆
     - 临床关联：高血压合并焦虑、易怒

   - **舌质紫暗**（敏感度73%）：
     - 诊断价值：提示瘀血阻滞，冠心病风险
     - 病理机制：气滞血瘀，脉络受阻
     - 临床关联：高血压合并冠心病、心绞痛

2. **舌下络脉改变（权重30）**：
   - **舌下络脉怒张**（敏感度76%）：
     - 诊断价值：提示血瘀阻络，动脉硬化风险
     - 病理机制：瘀血阻络，血管弹性下降
     - 临床关联：高血压性心脏病、冠心病
     - 分级标准：轻度（络脉稍粗）、中度（明显增粗）、重度（怒张迂曲）

   - **舌下瘀斑**（敏感度71%）：
     - 诊断价值：提示瘀血内阻，微循环障碍
     - 病理机制：气血瘀滞，微循环不畅
     - 临床关联：高血压合并微血管病变

3. **舌苔改变（权重20）**：
   - **舌苔厚腻**（敏感度68%）：
     - 诊断价值：提示痰湿阻滞，高血压合并高血脂风险
     - 病理机制：脾失健运，痰湿内生
     - 临床关联：高血压合并代谢综合征、高血脂

4. **舌形改变（权重10）**：
   - **舌尖红刺**（敏感度65%）：
     - 诊断价值：提示心火旺，高血压合并心悸风险
     - 病理机制：心火炽盛，气血上逆
     - 临床关联：高血压合并心律失常

**风险评分计算：**
- 高风险：≥3个征象 + 置信度≥80%
- 中风险：2个征象 或 ≥3个可疑征象
- 低风险：0-1个征象

### B. 高血糖舌象精准诊断标准
**关键舌象征象（按重要性排序）：**

1. **舌质改变（权重40）**：
   - **舌红少苔**（敏感度88%，特异度82%）：
     - 诊断价值：提示阴虚燥热，空腹血糖≥6.1mmol/L风险
     - 病理机制：阴虚内热，津液亏损
     - 临床关联：糖尿病前期、早期糖尿病
     - 分级标准：轻度（舌稍红少苔）、中度（舌红少苔明显）、重度（舌红光剥无苔）

   - **舌干裂**（敏感度81%）：
     - 诊断价值：提示津液亏损，血糖控制不良
     - 病理机制：阴虚津亏，胃液不足
     - 临床关联：糖尿病合并高血糖、口干多饮
     - 裂纹特点：深裂纹（重度）、浅裂纹（中度）、纹理不清（轻度）

   - **舌质红绛**（敏感度76%）：
     - 诊断价值：提示阴虚火旺，糖化血红蛋白≥6.5%风险
     - 病理机制：阴虚火旺，耗伤津液
     - 临床关联：2型糖尿病、血糖控制不良

2. **舌苔改变（权重35）**：
   - **舌苔黄腻**（敏感度73%）：
     - 诊断价值：提示湿热内蕴，2型糖尿病风险
     - 病理机制：湿热内蕴，气化失常
     - 临床关联：2型糖尿病合并湿热证
     - 舌苔特征：苔色黄、苔质腻、根部厚

   - **舌苔剥落**（敏感度68%）：
     - 诊断价值：提示胃阴亏损，糖尿病并发症风险
     - 病理机制：胃阴亏损，津液不足
     - 临床关联：糖尿病胃轻瘫、糖尿病并发症
     - 剥落特点：花剥苔（胃阴虚）、光剥苔（胃气阴两虚）

3. **舌形改变（权重25）**：
   - **舌质胖大有齿痕**（敏感度68%）：
     - 诊断价值：提示脾虚湿盛，糖尿病肾病风险
     - 病理机制：脾虚失运，水湿内停
     - 临床关联：糖尿病肾病、糖尿病合并水肿

### C. 高血脂舌象精准诊断标准
**关键舌象征象（按重要性排序）：**

1. **舌苔改变（权重40）**：
   - **舌苔厚腻**（敏感度89%，特异度85%）：
     - 诊断价值：提示痰湿内盛，LDL-C≥4.1mmol/L风险
     - 病理机制：脾失健运，痰湿内生
     - 临床关联：高胆固醇血症、高甘油三酯血症
     - 分级标准：轻度（苔稍厚腻）、中度（苔明显厚腻）、重度（苔极厚腻如腐）

   - **舌苔白腻**（敏感度73%）：
     - 诊断价值：提示寒湿阻滞，代谢综合征风险
     - 病理机制：寒湿困脾，运化失常
     - 临床关联：代谢综合征、高脂血症

2. **舌质改变（权重35）**：
   - **舌质胖大**（敏感度85%）：
     - 诊断价值：提示脾虚湿盛，总胆固醇≥5.2mmol/L风险
     - 病理机制：脾虚气弱，湿浊内生
     - 临床关联：高脂血症、肥胖症
     - 胖大程度：轻度（舌稍胖）、中度（舌明显胖大）、重度（舌极度胖大）

   - **舌质暗淡**（敏感度78%）：
     - 诊断价值：提示气血瘀滞，动脉硬化风险
     - 病理机制：气血瘀滞，脉络不畅
     - 临床关联：动脉粥样硬化、冠心病

3. **舌下络脉改变（权重25）**：
   - **舌下络脉增粗**（敏感度68%）：
     - 诊断价值：提示瘀血阻络，冠心病风险
     - 病理机制：瘀血阻络，血管狭窄
     - 临床关联：高脂血症合并冠心病

### D. 舌象与五脏精准对应标准
**各脏腑对应舌象与评分标准（0-100分）：**

1. **心脏（对应：舌尖）**：
   - 舌尖红（-20分）→ 心火炽盛
   - 舌尖红刺（-25分）→ 心火亢盛
   - 舌尖凹陷（-15分）→ 心气不足
   - 舌尖偏红（-15分）→ 肺热蕴结
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

2. **肝脏（对应：舌边）**：
   - 舌边红（-20分）→ 肝火旺盛
   - 舌边瘀斑（-25分）→ 肝郁血瘀
   - 舌边齿痕（-15分）→ 肝郁脾虚
   - 舌边红刺（-20分）→ 肝火炽盛
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

3. **脾脏（对应：舌中）**：
   - 舌中红（-15分）→ 胃热炽盛
   - 舌中凹陷（-20分）→ 脾虚气弱
   - 舌中裂纹（-20分）→ 胃阴亏损
   - 舌中苔腻（-25分）→ 湿困脾胃
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

4. **肺脏（对应：舌尖前部）**：
   - 舌尖偏红（-15分）→ 肺热蕴结
   - 舌苔薄黄（-15分）→ 风热犯肺
   - 舌苔少津（-20分）→ 肺阴亏损
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

5. **肾脏（对应：舌根）**：
   - 舌根红（-20分）→ 肾阴虚火旺
   - 舌根苔厚（-25分）→ 肾虚湿盛
   - 舌根剥落（-25分）→ 肾阴亏损
   - 舌根青紫（-20分）→ 肾阳虚衰
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

### E. 舌象与体质精准对应标准
**九大体质舌象识别（中西医结合）：**

1. **平和质**：
   - 舌象：淡红舌、薄白苔、舌体适中
   - 置信度要求：≥90%

2. **气虚质**：
   - 舌象：淡白舌、齿痕舌、薄白苔
   - 诊断要点：舌质淡白、舌边齿痕、苔薄白
   - 置信度要求：≥75%

3. **阳虚质**：
   - 舌象：淡白舌、胖大舌、湿润苔
   - 诊断要点：舌质淡白、舌体胖大、苔润多津
   - 置信度要求：≥75%

4. **阴虚质**：
   - 舌象：红舌、少苔、裂纹舌
   - 诊断要点：舌质红、少苔或无苔、舌干裂
   - 置信度要求：≥75%

5. **痰湿质**：
   - 舌象：胖大舌、厚腻苔
   - 诊断要点：舌体胖大、舌苔厚腻、苔色白或黄
   - 置信度要求：≥75%

6. **湿热质**：
   - 舌象：红舌、黄腻苔
   - 诊断要点：舌质红、舌苔黄腻、苔质厚
   - 置信度要求：≥75%

7. **血瘀质**：
   - 舌象：青紫舌、瘀斑舌、舌下络脉怒张
   - 诊断要点：舌质青紫、有瘀斑、舌下络脉怒张
   - 置信度要求：≥75%

8. **气郁质**：
   - 舌象：淡红舌、舌边红、薄黄苔
   - 诊断要点：舌边红、舌质正常偏暗、薄黄苔
   - 置信度要求：≥75%

9. **特禀质**：
   - 舌象：红舌、剥落苔、裂纹舌
   - 诊断要点：舌质红、地图舌（剥落苔）、过敏征象
   - 置信度要求：≥75%

### F. 舌诊注意事项
1. **照片质量判断**：
   - 清晰度：舌质、舌苔、舌形清晰可见
   - 光照：自然光最佳，避免反光和阴影
   - 舌体伸出：自然伸出，舌体放松
   - 拍摄角度：正面拍摄，舌面完整可见

2. **客观性原则**：
   - 只判断可见舌象，不臆测
   - 置信度必须与舌象清晰度匹配
   - 置信度<60%的判断必须标注"可疑"
   - 避免过度解读

3. **医学边界声明**：
   - 明确标注：本评估为健康评估工具，非医疗诊断
   - 凡高风险结论必须建议就医
   - 凡明确舌象必须标注医学依据`;

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
