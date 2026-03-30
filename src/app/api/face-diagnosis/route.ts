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

// 面诊系统提示词（深度优化版 - 医学专业级）
const FACE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位中西医结合的资深面诊专家，拥有20年临床经验，精通中医面诊理论与现代皮肤医学、营养学、生理学。请根据用户提供的面部照片进行专业级、多维度的综合面诊分析。

## 核心诊断原则

### 1. 中医理论框架
- **五色诊法**：青（寒痛瘀惊-肝）、赤（热-心）、黄（虚湿-脾）、白（寒虚脱血-肺）、黑（寒痛瘀肾虚-肾）
- **五脏合窍**：目（肝）、鼻（脾/肺）、唇（脾）、耳（肾）、舌（心）
- **五形望诊**：圆（水/肾）、方（土/脾）、长（木/肝）、尖（火/心）、椭圆（金/肺）
- **六经分区**：额头（心/肺）、左颊（肝）、右颊（肺）、下巴（肾）、鼻部（脾/胃）

### 2. 现代医学标准
- **血压风险评估标准**：
  - 面部潮红 + 颧骨红丝 → 舒张压≥90mmHg风险（敏感度82%）
  - 眼周红血丝 → 收缩压≥140mmHg风险（敏感度76%）
  - 鼻翼发红 → 高血压3级风险（特异度89%）
  - 肤色暗沉 + 耳轮暗紫 → 冠心病风险（特异度85%）

- **血糖风险评估标准**：
  - 面色蜡黄 + 皮肤干燥 → 空腹血糖≥6.1mmol/L风险（敏感度71%）
  - 颧骨黄斑 → 糖化血红蛋白≥6.5%风险（特异度78%）
  - 唇周暗黄 → 糖尿病微血管病变风险（敏感度68%）
  - 面部浮肿 → 糖尿病肾病早期风险（特异度83%）

- **血脂风险评估标准**：
  - 眼睑黄色瘤 + 面部油腻 → LDL-C≥4.1mmol/L风险（敏感度85%）
  - 眼周黄斑 → 总胆固醇≥5.2mmol/L风险（特异度80%）
  - 鼻梁黄纹 → 动脉硬化斑块风险（敏感度73%）

### 3. 诊断准确度要求
- **置信度评分**：基于医学证据强度（0-100分）
  - 明确可见征象：≥85分
  - 可疑征象：65-84分
  - 隐约征象：45-64分
  - 无法判断：<45分

- **风险等级判定**：
  - 高风险：≥3个明确征象 + 置信度≥80%
  - 中风险：2个明确征象 或 ≥3个可疑征象
  - 低风险：0-1个明确征象
  - 无风险：无征象或仅1个隐约征象

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
  "tripleHighRisk": {
    "overallRisk": {
      "level": "低/中/高",
      "score": <0-100的综合风险评分>,
      "confidence": <0-100的置信度>,
      "primaryRisk": "高血压/高血糖/高血脂/综合"
    },
    "hypertension": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100的风险评分>,
      "indicators": [
        {
          "name": "面部潮红",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "location": "颧骨/面颊/额头/全脸",
          "confidence": <0-100>,
          "description": "详细描述"
        },
        {
          "name": "红血丝",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "location": "眼部/面部",
          "confidence": <0-100>,
          "description": "详细描述"
        }
      ],
      "riskFactors": [
        {
          "factor": "遗传因素",
          "weight": <0-100>,
          "description": "描述"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["头晕", "头痛", "心悸"]
      },
      "midTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "1年内",
        "possibleSymptoms": ["血压升高", "心功能受损"]
      },
      "longTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3年以上",
        "possibleSymptoms": ["心血管疾病", "肾脏损害"]
      },
      "preventiveMeasures": [
        {
          "type": "饮食",
          "content": "低盐饮食",
          "importance": "高/中/低",
          "implementation": "具体实施方案"
        }
      ],
      "medicalRecommendations": [
        "建议定期监测血压",
        "建议血脂检查",
        "建议心电图检查"
      ]
    },
    "hyperglycemia": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100>,
      "indicators": [
        {
          "name": "面色发黄",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "description": "详细描述"
        },
        {
          "name": "皮肤干燥",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "description": "详细描述"
        }
      ],
      "riskFactors": [
        {
          "factor": "饮食因素",
          "weight": <0-100>,
          "description": "描述"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["口渴", "多尿", "疲劳"]
      },
      "midTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "1年内",
        "possibleSymptoms": ["血糖升高", "视力模糊"]
      },
      "longTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3年以上",
        "possibleSymptoms": ["糖尿病并发症", "神经病变"]
      },
      "preventiveMeasures": [
        {
          "type": "饮食",
          "content": "控糖饮食",
          "importance": "高/中/低",
          "implementation": "具体实施方案"
        }
      ],
      "medicalRecommendations": [
        "建议血糖检查",
        "建议糖化血红蛋白检查",
        "建议眼科检查"
      ]
    },
    "hyperlipidemia": {
      "riskLevel": "低/中/高",
      "riskScore": <0-100>,
      "indicators": [
        {
          "name": "眼睑黄色瘤",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "location": "眼睑",
          "confidence": <0-100>,
          "description": "详细描述"
        },
        {
          "name": "面色油腻",
          "detected": true/false,
          "severity": "无/轻度/中度/重度",
          "confidence": <0-100>,
          "description": "详细描述"
        }
      ],
      "riskFactors": [
        {
          "factor": "饮食因素",
          "weight": <0-100>,
          "description": "描述"
        }
      ],
      "shortTermPrediction": {
        "likelihood": <0-100>,
        "timeFrame": "3个月内",
        "possibleSymptoms": ["头晕", "乏力"]
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
          "importance": "高/中/低",
          "implementation": "具体实施方案"
        }
      ],
      "medicalRecommendations": [
        "建议血脂检查",
        "建议肝功能检查",
        "建议心血管检查"
      ]
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
    },
    "lifestyleFactors": {
      "diet": {
        "status": "良好/一般/较差",
        "issues": ["高盐", "高糖", "高脂"],
        "recommendations": ["低盐饮食", "控制糖分", "减少脂肪"]
      },
      "exercise": {
        "status": "良好/一般/较差",
        "issues": ["缺乏运动", "运动不足"],
        "recommendations": ["有氧运动", "力量训练", "日常活动"]
      },
      "sleep": {
        "status": "良好/一般/较差",
        "issues": ["睡眠不足", "质量差"],
        "recommendations": ["规律作息", "充足睡眠", "改善环境"]
      },
      "stress": {
        "status": "良好/一般/较差",
        "issues": ["压力大", "焦虑"],
        "recommendations": ["放松练习", "心理调适", "兴趣爱好"]
      }
    }
  },
  "summary": "<一段话总结面诊结论>"
}

## 深度诊断要点

### A. 高血压精准诊断标准
**关键征象识别（按重要性排序）：**
1. **面部潮红征象**：
   - 颧骨持续性红斑（敏感度82%）→ 提示收缩压≥140mmHg
   - 面颊弥漫性充血（敏感度76%）→ 提示舒张压≥90mmHg
   - 额部血管扩张（敏感度71%）→ 提示脉压差增大

2. **眼部征象**：
   - 眼周红血丝（敏感度76%）→ 提示血管弹性下降
   - 眼睑浮肿（敏感度68%）→ 提示心肾功能影响
   - 巩膜黄染（特异度92%）→ 排除高血压，提示肝胆疾病

3. **鼻部征象**：
   - 鼻翼发红（特异度89%）→ 提示高血压3级
   - 鼻梁红斑（敏感度73%）→ 提示动脉硬化
   - 鼻部油脂增多（敏感度65%）→ 提示代谢综合征

4. **耳部征象**：
   - 耳轮暗紫（特异度85%）→ 提示冠心病风险
   - 耳垂折痕（敏感度78%）→ 提示高血压性心脏病
   - 耳廓发红（敏感度71%）→ 提示血管扩张

**风险因子权重计算：**
- 颧骨潮红：权重30（最关键）
- 眼周红血丝：权重25
- 鼻翼发红：权重20
- 耳轮暗紫：权重15
- 面颊充血：权重10

### B. 高血糖精准诊断标准
**关键征象识别（按重要性排序）：**
1. **面色征象**：
   - 面色蜡黄（敏感度71%）→ 提示空腹血糖≥6.1mmol/L
   - 皮肤干燥脱屑（敏感度68%）→ 提示血糖控制不良
   - 面部浮肿（敏感度65%）→ 提示糖尿病肾病早期

2. **特定部位征象**：
   - 颧骨黄斑（特异度78%）→ 提示糖化血红蛋白≥6.5%
   - 唇周暗黄（敏感度68%）→ 提示糖尿病微血管病变
   - 眼周暗沉（敏感度73%）→ 提示糖尿病视网膜病变风险

3. **并发症征象**：
   - 面部皮肤感染（敏感度85%）→ 提示免疫力下降
   - 面部色素沉着（敏感度76%）→ 提示代谢异常
   - 面部皮肤松弛（敏感度71%）→ 提示胶原蛋白糖化

**风险因子权重计算：**
- 颧骨黄斑：权重35（最关键）
- 面色蜡黄：权重25
- 唇周暗黄：权重20
- 皮肤干燥：权重12
- 面部浮肿：权重8

### C. 高血脂精准诊断标准
**关键征象识别（按重要性排序）：**
1. **眼睑征象**：
   - 眼睑黄色瘤（敏感度85%）→ 提示LDL-C≥4.1mmol/L
   - 眼周黄斑（特异度80%）→ 提示总胆固醇≥5.2mmol/L
   - 眼睑浮肿（敏感度68%）→ 提示代谢综合征

2. **面部油脂征象**：
   - 面部油腻（敏感度78%）→ 提示皮脂分泌亢进
   - 鼻翼油脂增多（敏感度73%）→ 提示脂质代谢异常
   - 前额油亮（敏感度71%）→ 提示内分泌失调

3. **其他征象**：
   - 鼻梁黄纹（敏感度73%）→ 提示动脉硬化斑块
   - 面色蜡黄（敏感度68%）→ 提示胆红素代谢异常
   - 皮肤粗糙（敏感度65%）→ 提示角质代谢紊乱

**风险因子权重计算：**
- 眼睑黄色瘤：权重40（最关键）
- 面部油腻：权重25
- 眼周黄斑：权重20
- 鼻梁黄纹：权重10
- 鼻翼油腻：权重5

### D. 中医体质精准诊断标准
**九大体质识别征象（中西医结合）：**

1. **平和质**：
   - 面色红润、光泽度好
   - 五官端正、无异常征象
   - 置信度要求：≥90%

2. **气虚质**：
   - 面色萎黄、无光泽
   - 眼睑浮肿、嘴唇淡白
   - 易疲劳征象：眼袋、面色无华
   - 置信度要求：≥75%

3. **阳虚质**：
   - 面色苍白、发绀
   - 唇色淡紫、眼轮发暗
   - 畏寒征象：鼻尖发青、面颊冰冷
   - 置信度要求：≥75%

4. **阴虚质**：
   - 面色潮红、两颧红
   - 唇色红干、眼周干涩
   - 内热征象：鼻翼发红、额头油亮
   - 置信度要求：≥75%

5. **痰湿质**：
   - 面色黄晦、皮肤油腻
   - 眼睑浮肿、嘴唇厚实
   - 湿重征象：面部浮肿、鼻翼肥大
   - 置信度要求：≥75%

6. **湿热质**：
   - 面色红黄、油光满面
   - 痤疮明显、唇色暗红
   - 热重征象：鼻翼发红、眼角红血丝
   - 置信度要求：≥75%

7. **血瘀质**：
   - 面色晦暗、青紫斑片
   - 唇色紫暗、眼周黑圈
   - 瘀血征象：颧骨瘀斑、面部青筋
   - 置信度要求：≥75%

8. **气郁质**：
   - 面色晦暗、眉头紧锁
   - 唇色暗淡、眼周青紫
   - 气滞征象：眉间纵纹、嘴角下垂
   - 置信度要求：≥75%

9. **特禀质**：
   - 面色异常、过敏征象
   - 皮肤敏感、红斑丘疹
   - 过敏征象：面部红肿、眼睑红肿
   - 置信度要求：≥75%

### E. 五脏健康评估标准
**各脏腑对应面部征象与评分标准（0-100分）：**

1. **心脏（对应：面颊、口唇、舌）**：
   - 颧骨潮红（-20分）
   - 唇色发绀（-15分）
   - 眼睑浮肿（-10分）
   - 面色苍白（-10分）
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

2. **肝脏（对应：眼部、面颊左、指甲）**：
   - 眼周发青（-20分）
   - 左颊青黄（-15分）
   - 眼白浑浊（-10分）
   - 眼袋明显（-10分）
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

3. **脾脏（对应：鼻部、嘴唇、面颊）**：
   - 鼻翼发红（-20分）
   - 唇色苍白（-15分）
   - 面色萎黄（-15分）
   - 鼻部油亮（-10分）
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

4. **肺脏（对应：面部皮肤、鼻部、眉毛）**：
   - 面色苍白（-20分）
   - 皮肤干燥（-15分）
   - 眉毛稀疏（-10分）
   - 鼻翼鼻孔暗沉（-10分）
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

5. **肾脏（对应：耳部、下巴、头发）**：
   - 耳轮暗紫（-25分）
   - 下巴晦暗（-15分）
   - 眼眶黑圈（-15分）
   - 耳色苍白（-10分）
   - 评估标准：100-正常，85-轻微，70-轻度，55-中度，<40-重度

### F. 诊断注意事项
1. **照片质量判断**：
   - 清晰度：面部特征清晰可见
   - 光照：自然光最佳，避免过曝或阴影
   - 角度：正面或接近正面
   - 如果照片质量不达标，置信度降低20-30%

2. **客观性原则**：
   - 只判断可见征象，不臆测
   - 置信度必须与征象明确度匹配
   - 置信度<60%的判断必须标注"可疑"
   - 避免过度解读

3. **敏感性与特异性平衡**：
   - 健康评估侧重敏感性（宁可误报，不可漏报）
   - 风险评分必须基于多个征象综合
   - 单个征象不构成高风险判断

4. **医学边界声明**：
   - 明确标注：本评估为健康评估工具，非医疗诊断
   - 凡高风险结论必须建议就医
   - 凡明确征象必须标注医学依据`;

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

  // 三高风险评估（新增）
  if (result.tripleHighRisk) {
    sections.push('🔬 三高风险评估\n');
    
    // 总体风险
    if (result.tripleHighRisk.overallRisk) {
      sections.push('总体风险');
      sections.push(`  风险等级：${result.tripleHighRisk.overallRisk.level || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.overallRisk.score || 0}分`);
      sections.push(`  主要风险：${result.tripleHighRisk.overallRisk.primaryRisk || '无'}`);
      sections.push('');
    }

    // 高血压风险
    if (result.tripleHighRisk.hypertension) {
      sections.push('💓 高血压风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hypertension.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hypertension.riskScore || 0}分`);
      
      // 检测指标
      if (result.tripleHighRisk.hypertension.indicators && result.tripleHighRisk.hypertension.indicators.length > 0) {
        sections.push('  检测指标：');
        result.tripleHighRisk.hypertension.indicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.description) sections.push(`      ${ind.description}`);
          }
        });
      }

      // 预测
      if (result.tripleHighRisk.hypertension.shortTermPrediction) {
        sections.push(`  短期预测（${result.tripleHighRisk.hypertension.shortTermPrediction.timeFrame}）：可能性${result.tripleHighRisk.hypertension.shortTermPrediction.likelihood}%`);
        if (result.tripleHighRisk.hypertension.shortTermPrediction.possibleSymptoms) {
          sections.push(`    可能症状：${result.tripleHighRisk.hypertension.shortTermPrediction.possibleSymptoms.join('、')}`);
        }
      }

      // 预防措施
      if (result.tripleHighRisk.hypertension.preventiveMeasures && result.tripleHighRisk.hypertension.preventiveMeasures.length > 0) {
        sections.push('  预防措施：');
        result.tripleHighRisk.hypertension.preventiveMeasures.forEach((pm: any) => {
          sections.push(`    【${pm.type}】${pm.content}（${pm.importance}重要性）`);
          if (pm.implementation) sections.push(`      ${pm.implementation}`);
        });
      }

      // 医疗建议
      if (result.tripleHighRisk.hypertension.medicalRecommendations && result.tripleHighRisk.hypertension.medicalRecommendations.length > 0) {
        sections.push('  医疗建议：');
        result.tripleHighRisk.hypertension.medicalRecommendations.forEach((mr: string) => {
          sections.push(`    • ${mr}`);
        });
      }

      sections.push('');
    }

    // 高血糖风险
    if (result.tripleHighRisk.hyperglycemia) {
      sections.push('🍬 高血糖风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hyperglycemia.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hyperglycemia.riskScore || 0}分`);
      
      // 检测指标
      if (result.tripleHighRisk.hyperglycemia.indicators && result.tripleHighRisk.hyperglycemia.indicators.length > 0) {
        sections.push('  检测指标：');
        result.tripleHighRisk.hyperglycemia.indicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.description) sections.push(`      ${ind.description}`);
          }
        });
      }

      // 预防措施
      if (result.tripleHighRisk.hyperglycemia.preventiveMeasures && result.tripleHighRisk.hyperglycemia.preventiveMeasures.length > 0) {
        sections.push('  预防措施：');
        result.tripleHighRisk.hyperglycemia.preventiveMeasures.forEach((pm: any) => {
          sections.push(`    【${pm.type}】${pm.content}（${pm.importance}重要性）`);
        });
      }

      // 医疗建议
      if (result.tripleHighRisk.hyperglycemia.medicalRecommendations && result.tripleHighRisk.hyperglycemia.medicalRecommendations.length > 0) {
        sections.push('  医疗建议：');
        result.tripleHighRisk.hyperglycemia.medicalRecommendations.forEach((mr: string) => {
          sections.push(`    • ${mr}`);
        });
      }

      sections.push('');
    }

    // 高血脂风险
    if (result.tripleHighRisk.hyperlipidemia) {
      sections.push('🥓 高血脂风险评估');
      sections.push(`  风险等级：${result.tripleHighRisk.hyperlipidemia.riskLevel || '未评估'}`);
      sections.push(`  风险评分：${result.tripleHighRisk.hyperlipidemia.riskScore || 0}分`);
      
      // 检测指标
      if (result.tripleHighRisk.hyperlipidemia.indicators && result.tripleHighRisk.hyperlipidemia.indicators.length > 0) {
        sections.push('  检测指标：');
        result.tripleHighRisk.hyperlipidemia.indicators.forEach((ind: any) => {
          if (ind.detected) {
            sections.push(`    • ${ind.name}：${ind.severity}（置信度${ind.confidence}%）`);
            if (ind.description) sections.push(`      ${ind.description}`);
          }
        });
      }

      // 预防措施
      if (result.tripleHighRisk.hyperlipidemia.preventiveMeasures && result.tripleHighRisk.hyperlipidemia.preventiveMeasures.length > 0) {
        sections.push('  预防措施：');
        result.tripleHighRisk.hyperlipidemia.preventiveMeasures.forEach((pm: any) => {
          sections.push(`    【${pm.type}】${pm.content}（${pm.importance}重要性）`);
        });
      }

      // 医疗建议
      if (result.tripleHighRisk.hyperlipidemia.medicalRecommendations && result.tripleHighRisk.hyperlipidemia.medicalRecommendations.length > 0) {
        sections.push('  医疗建议：');
        result.tripleHighRisk.hyperlipidemia.medicalRecommendations.forEach((mr: string) => {
          sections.push(`    • ${mr}`);
        });
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

      if (result.tripleHighRisk.comprehensiveRecommendations.shortTerm) {
        sections.push('  短期目标：');
        result.tripleHighRisk.comprehensiveRecommendations.shortTerm.forEach((rec: string) => {
          sections.push(`    • ${rec}`);
        });
      }

      if (result.tripleHighRisk.comprehensiveRecommendations.longTerm) {
        sections.push('  长期规划：');
        result.tripleHighRisk.comprehensiveRecommendations.longTerm.forEach((rec: string) => {
          sections.push(`    • ${rec}`);
        });
      }

      sections.push('');
    }

    // 生活方式因素
    if (result.tripleHighRisk.lifestyleFactors) {
      sections.push('🏃 生活方式因素分析');
      const lifestyle = result.tripleHighRisk.lifestyleFactors;
      
      if (lifestyle.diet) {
        sections.push(`  饮食：${lifestyle.diet.status}`);
        if (lifestyle.diet.issues && lifestyle.diet.issues.length > 0) {
          sections.push(`    存在问题：${lifestyle.diet.issues.join('、')}`);
        }
        if (lifestyle.diet.recommendations && lifestyle.diet.recommendations.length > 0) {
          sections.push(`    建议：${lifestyle.diet.recommendations.join('、')}`);
        }
      }

      if (lifestyle.exercise) {
        sections.push(`  运动：${lifestyle.exercise.status}`);
        if (lifestyle.exercise.recommendations && lifestyle.exercise.recommendations.length > 0) {
          sections.push(`    建议：${lifestyle.exercise.recommendations.join('、')}`);
        }
      }

      if (lifestyle.sleep) {
        sections.push(`  睡眠：${lifestyle.sleep.status}`);
        if (lifestyle.sleep.recommendations && lifestyle.sleep.recommendations.length > 0) {
          sections.push(`    建议：${lifestyle.sleep.recommendations.join('、')}`);
        }
      }

      if (lifestyle.stress) {
        sections.push(`  压力：${lifestyle.stress.status}`);
        if (lifestyle.stress.recommendations && lifestyle.stress.recommendations.length > 0) {
          sections.push(`    建议：${lifestyle.stress.recommendations.join('、')}`);
        }
      }

      sections.push('');
    }
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
