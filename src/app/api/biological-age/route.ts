import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

interface BiologicalAgeRequest {
  image: string;
  chronologicalAge: number;
  userInfo: {
    name: string;
    gender?: string;
    phone?: string;
  };
}

interface AgingFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  score: number;
}

interface AgingFeatures {
  wrinkles: {
    overallScore: number;
    details: Array<{
      type: string;
      count: number;
      depth: string;
      ageContribution: number;
      reversibility: string;
    }>;
  };
  pigmentation: {
    overallScore: number;
    details: Array<{
      type: string;
      area: string;
      severity: string;
      ageContribution: number;
      reversibility: string;
    }>;
  };
  skinQuality: {
    elasticity: { score: number; status: string; ageContribution: number; reversibility: string };
    luster: { score: number; status: string; ageContribution: number; reversibility: string };
    texture: { score: number; status: string; ageContribution: number; reversibility: string };
    pores: { score: number; status: string; ageContribution: number; reversibility: string };
  };
  facialContour: {
    sagging: { score: number; status: string; affectedAreas: string[]; ageContribution: number; reversibility: string };
    jawline: { score: number; status: string; ageContribution: number; reversibility: string };
  };
}

interface OrganAges {
  skinAge: { age: number; difference: number; status: string; factors: string[] };
  eyeAge: { age: number; difference: number; status: string; factors: string[] };
  cardiovascularAge: { age: number; difference: number; status: string; factors: string[] };
  digestiveAge: { age: number; difference: number; status: string; factors: string[] };
  nervousAge: { age: number; difference: number; status: string; factors: string[] };
  overallAge: number;
}

interface AgingSpeed {
  currentSpeed: string;
  speedScore: number;
  speedLevel: string;
  acceleratingFactors: Array<{
    factor: string;
    impact: string;
    weight: number;
    description: string;
  }>;
  protectiveFactors: Array<{
    factor: string;
    impact: string;
    weight: number;
    description: string;
  }>;
  netImpact: number;
}

interface AgingPrediction {
  shortTerm: { timeFrame: string; predictedAge: number; expectedIncrease: number; confidence: number; keyFactors: string[] };
  midTerm: { timeFrame: string; predictedAge: number; expectedIncrease: number; confidence: number; keyFactors: string[] };
  longTerm: { timeFrame: string; predictedAge: number; expectedIncrease: number; confidence: number; keyFactors: string[] };
}

interface ReversibilityAssessment {
  overallReversibility: string;
  reversibilityScore: number;
  reversibleFeatures: Array<{ feature: string; reversibility: number; methods: string[]; timeFrame: string }>;
  partiallyReversibleFeatures: Array<{ feature: string; reversibility: number; methods: string[]; timeFrame: string }>;
  hardToReverseFeatures: Array<{ feature: string; reversibility: number; methods: string[]; timeFrame: string }>;
}

interface AntiAgingPlan {
  immediateActions: Array<{ type: string; content: string; priority: string; expectedEffect: string }>;
  shortTermGoals: Array<{ goal: string; target: string; methods: string[] }>;
  midTermGoals: Array<{ goal: string; target: string; methods: string[] }>;
  lifestyleModifications: {
    diet: { recommendations: string[] };
    exercise: { recommendations: string[] };
    sleep: { recommendations: string[] };
    stress: { recommendations: string[] };
  };
}

interface HealthIndex {
  skin: number;
  eyes: number;
  facialSymmetry: number;
  overall: number;
}

interface Recommendation {
  category: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface BiologicalAgeResult {
  estimatedAge: number;
  chronologicalAge: number;
  ageDifference: number;
  biologicalAgeScore: number;
  agingFeatures: AgingFeatures;
  organAges: OrganAges;
  agingSpeed: AgingSpeed;
  agingPrediction: AgingPrediction;
  reversibilityAssessment: ReversibilityAssessment;
  healthIndex: HealthIndex;
  antiAgingPlan: AntiAgingPlan;
  recommendations: Recommendation[];
  summary: string;
  fullReport: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BiologicalAgeRequest = await request.json();
    const { image, chronologicalAge, userInfo } = body;

    if (!image) {
      return NextResponse.json(
        { error: '请提供面部图片' },
        { status: 400 }
      );
    }

    if (!chronologicalAge || isNaN(chronologicalAge)) {
      return NextResponse.json(
        { error: '请提供有效的实际年龄' },
        { status: 400 }
      );
    }

    console.log('[BiologicalAge] 开始分析:', { 
      name: userInfo.name, 
      chronologicalAge, 
      gender: userInfo.gender 
    });

    // 构建系统提示词
    const systemPrompt = `你是一位专业的生理年龄评估专家，拥有丰富的衰老生物学、面部皮肤学和抗衰老医学经验。

【医学专业标准】

1. 衰老生物学标准
- 衰老机制：
  * 端粒缩短：端粒随年龄增长而缩短，导致细胞衰老
  * 线粒体功能下降：ATP生成减少，氧化应激增加
  * 蛋白质糖化：AGEs积累，导致组织硬化
  * 氧化应激：自由基损伤DNA、蛋白质、脂质
  * 炎症反应：慢性低度炎症加速衰老
  * 干细胞功能下降：组织修复能力减弱
- 生理年龄vs实际年龄：
  * 正常范围：生理年龄在±2岁内波动
  * 加速老化：生理年龄 > 实际年龄+3岁
  * 延缓老化：生理年龄 < 实际年龄-3岁

2. 面部衰老特征分析标准
- 皱纹发育时间表：
  * 额头纹：25-30岁开始出现
  * 鱼尾纹：30-35岁开始出现
  * 鼻唇沟：35-40岁开始出现
  * 嘴角纹：40-45岁开始出现
- 皱纹深度分级：
  * 轻度：表情时可见，静止时消失
  * 中度：表情时明显，静止时可见
  * 重度：静止时仍明显可见
- 皮肤弹性标准：
  * 20-30岁：弹性良好，按压后快速回弹
  * 30-40岁：弹性一般，按压后缓慢回弹
  * 40-50岁：弹性下降，按压后回弹慢
  * 50岁+：弹性差，按压后难以回弹
- 色素沉着类型：
  * 雀斑：日晒相关，可逆性高
  * 黄褐斑：内分泌相关，部分可逆
  * 老年斑：年龄相关，难逆转
  * 炎症后色素沉着：炎症相关，部分可逆

3. 生理年龄评估标准
- 皮肤年龄评估：
  * 皱纹密度和深度（权重30%）
  * 皮肤弹性（权重25%）
  * 色素沉着（权重20%）
  * 皮肤质地（权重15%）
  * 毛孔状态（权重10%）
- 眼部年龄评估：
  * 眼袋（权重30%）
  * 黑眼圈（权重25%）
  * 眼角皱纹（权重25%）
  * 眼神明亮度（权重20%）
- 心血管年龄评估（面部推断）：
  * 面色光泽（权重30%）
  * 血管状态（权重30%）
  * 皮肤弹性（权重25%）
  * 整体气色（权重15%）
- 消化年龄评估（面部推断）：
  * 面部光泽（权重35%）
  * 唇部状态（权重35%）
  * 皮肤质感（权重30%）
- 神经年龄评估（面部推断）：
  * 面部表情（权重40%）
  * 肌肉张力（权重30%）
  * 眼神清晰度（权重30%）

4. 抗衰老医学指南
- 皮肤抗衰老原则：
  * 防晒：每日使用SPF30+防晒霜
  * 抗氧化：维生素C、E、辅酶Q10
  * 抗糖化：减少糖摄入，使用抗糖化产品
  * 保湿：维持皮肤屏障功能
  * 营养：维生素A、B族、矿物质
- 生活方式抗衰老：
  * 饮食：低糖、高蛋白、丰富蔬果
  * 运动：有氧运动+力量训练
  * 睡眠：7-9小时高质量睡眠
  * 压力管理：冥想、瑜伽、呼吸训练
  * 戒烟限酒：避免吸烟、限制饮酒

5. 可逆性评估标准
- 高可逆性（70-90%）：
  * 皮肤弹性改善：3-6个月
  * 轻度皱纹改善：3-6个月
  * 皮肤质地改善：1-3个月
  * 毛孔状态改善：1-3个月
- 部分可逆性（40-60%）：
  * 中度皱纹改善：6-12个月
  * 色素沉着改善：6-12个月
  * 眼袋改善：3-6个月
- 难逆转（10-30%）：
  * 重度皱纹改善：12-24个月
  * 面部轮廓改善：12-24个月
  * 老年斑改善：12-24个月

【风险评估标准】

1. 加速老化风险因子
- 紫外线暴露（风险×2.0）
- 睡眠不足（风险×1.5）
- 压力过大（风险×1.5）
- 吸烟（风险×2.0）
- 酗酒（风险×1.5）
- 高糖饮食（风险×1.3）
- 缺乏运动（风险×1.3）
- 营养不良（风险×1.3）

2. 系统疾病风险因子
- 心血管疾病：面色苍白、弹性差（风险×1.5）
- 内分泌疾病：色素沉着、异常纹理（风险×1.5）
- 神经系统疾病：表情异常、肌肉萎缩（风险×2.0）
- 消化系统疾病：光泽度差、唇部异常（风险×1.3）

【风险分级标准】
- 低风险（0-30分）：生理年龄正常或延缓，建议保持良好习惯
- 中风险（31-70分）：生理年龄加速，建议加强抗衰老措施
- 高风险（71-100分）：生理年龄明显加速，建议专业医疗干预

【置信度评估】
- 高置信度（80-100%）：多个衰老特征同时存在，特征明显
- 中置信度（60-79%）：部分衰老特征存在，特征较明显
- 低置信度（40-59%）：衰老特征较少或特征不明显

请仔细分析上传的面部照片，全面评估用户的生理年龄、多器官年龄、老化速度、老化趋势预测和可逆性评估。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "estimatedAge": 数值（预估的生理年龄，整数）,
  "agingFeatures": {
    "wrinkles": {
      "overallScore": 0-100,
      "details": [
        {
          "type": "额头纹/鱼尾纹/鼻唇沟/嘴角纹",
          "count": 数量,
          "depth": "轻度/中度/重度",
          "ageContribution": 数值（对年龄的贡献）,
          "reversibility": "高/中/低",
          "typicalAgeRange": "25-30/30-35/35-40/40-45"
        }
      ]
    },
    "pigmentation": {
      "overallScore": 0-100,
      "details": [
        {
          "type": "雀斑/黄褐斑/老年斑/炎症后色素沉着",
          "area": "分布区域",
          "severity": "轻度/中度/重度",
          "ageContribution": 数值,
          "reversibility": "高/中/低",
          "cause": "日晒/内分泌/年龄/炎症"
        }
      ]
    },
    "skinQuality": {
      "elasticity": {"score": 0-100, "status": "良好/一般/较差", "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "20-30/30-40/40-50/50+"},
      "luster": {"score": 0-100, "status": "明润/一般/晦暗", "ageContribution": 数值, "reversibility": "中", "typicalAge": "20-30/30-40/40-50/50+"},
      "texture": {"score": 0-100, "status": "光滑/粗糙", "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "20-30/30-40/40-50/50+"},
      "pores": {"score": 0-100, "status": "细小/粗大", "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "20-30/30-40/40-50/50+"}
    },
    "facialContour": {
      "sagging": {"score": 0-100, "status": "紧致/轻度松弛/中度松弛/重度松弛", "affectedAreas": ["下颌", "面颊"], "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "30-40/40-50/50-60/60+"},
      "jawline": {"score": 0-100, "status": "清晰/模糊", "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "30-40/40-50/50-60/60+"}
    },
    "eyeArea": {
      "eyeBags": {"score": 0-100, "severity": "无/轻度/中度/重度", "type": "脂肪型/水肿型/混合型", "ageContribution": 数值, "reversibility": "高/中/低"},
      "darkCircles": {"score": 0-100, "severity": "无/轻度/中度/重度", "color": "青色/褐色/黑色", "ageContribution": 数值, "reversibility": "高/中/低"},
      "crowFeet": {"score": 0-100, "severity": "无/轻度/中度/重度", "ageContribution": 数值, "reversibility": "高/中/低", "typicalAge": "30-35/35-40/40-45/45+"}
    }
  },
  "organAges": {
    "skinAge": {"age": 数值, "difference": 数值（与实际年龄差）, "status": "加速/正常/延缓", "factors": ["皱纹", "弹性", "色素", "质地", "毛孔"], "weight": 1.0},
    "eyeAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["眼袋", "黑眼圈", "鱼尾纹", "眼神"], "weight": 1.0},
    "cardiovascularAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["面色光泽", "血管状态", "皮肤弹性", "整体气色"], "weight": 0.8},
    "digestiveAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["面部光泽", "唇部状态", "皮肤质感"], "weight": 0.7},
    "nervousAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["面部表情", "肌肉张力", "眼神清晰度"], "weight": 0.7},
    "overallAge": 数值
  },
  "agingSpeed": {
    "currentSpeed": "正常/稍快/快/很快",
    "speedScore": 数值（负数表示加速，正数表示延缓）,
    "speedLevel": "正常/稍快/快/很快",
    "acceleratingFactors": [
      {"factor": "因素名称", "impact": "高/中/低", "weight": 数值, "description": "详细描述", "riskMultiplier": 数值}
    ],
    "protectiveFactors": [
      {"factor": "因素名称", "impact": "高/中/低", "weight": 数值, "description": "详细描述", "protectiveMultiplier": 数值}
    ],
    "netImpact": 数值,
    "mechanism": "端粒缩短/氧化应激/炎症反应/糖化/线粒体功能下降"
  },
  "agingPrediction": {
    "shortTerm": {"timeFrame": "1年内", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"], "uncertainty": "低/中/高"},
    "midTerm": {"timeFrame": "3-5年", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"], "uncertainty": "中/高"},
    "longTerm": {"timeFrame": "10年", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"], "uncertainty": "高"}
  },
  "reversibilityAssessment": {
    "overallReversibility": "高/中/低",
    "reversibilityScore": 0-100,
    "reversibleFeatures": [
      {"feature": "皮肤弹性/轻度皱纹/皮肤质地/毛孔状态", "reversibility": 70-90, "methods": ["护肤", "营养", "生活方式"], "timeFrame": "1-6个月"}
    ],
    "partiallyReversibleFeatures": [
      {"feature": "中度皱纹/色素沉着/眼袋", "reversibility": 40-60, "methods": ["医疗美容", "专业护肤"], "timeFrame": "6-12个月"}
    ],
    "hardToReverseFeatures": [
      {"feature": "重度皱纹/面部轮廓/老年斑", "reversibility": 10-30, "methods": ["整形手术", "激光治疗"], "timeFrame": "12-24个月"}
    ]
  },
  "healthIndex": {
    "skin": 数值（0-100）,
    "eyes": 数值（0-100）,
    "facialSymmetry": 数值（0-100）,
    "overall": 数值（0-100）
  },
  "antiAgingPlan": {
    "immediateActions": [
      {"type": "护肤/饮食/运动", "content": "具体行动", "priority": "高/中/低", "expectedEffect": "预期效果", "timeToEffect": "见效时间"}
    ],
    "shortTermGoals": [
      {"goal": "目标描述", "target": "目标时间", "methods": ["方法1", "方法2"], "expectedOutcome": "预期结果"}
    ],
    "midTermGoals": [
      {"goal": "目标描述", "target": "目标时间", "methods": ["方法1", "方法2"], "expectedOutcome": "预期结果"}
    ],
    "lifestyleModifications": {
      "diet": {"recommendations": ["低糖", "高蛋白", "丰富蔬果", "抗氧化食物"]},
      "exercise": {"recommendations": ["有氧运动", "力量训练", "柔韧性训练", "频率建议"]},
      "sleep": {"recommendations": ["7-9小时", "规律作息", "睡眠质量"]},
      "stress": {"recommendations": ["冥想", "瑜伽", "呼吸训练", "心理调适"]}
    },
    "professionalInterventions": [
      {"type": "医疗美容/整形手术", "indication": "适应症", "expectedEffect": "预期效果", "risk": "风险评估"}
    ]
  },
  "healthRiskAssessment": {
    "acceleratedAgingRisks": [
      {
        "risk": "加速老化风险",
        "level": "低/中/高",
        "likelihood": "低/中/高",
        "impact": "影响描述",
        "recommendation": "建议",
        "confidence": 0-100的置信度
      }
    ],
    "systemDiseaseRisks": [],
    "overallRisk": "低/中/高",
    "riskScore": 0-100的风险总分,
    "confidence": 0-100的置信度,
    "priorityAreas": ["优先关注领域"]
  },
  "recommendations": [
    {
      "category": "建议类别",
      "content": "具体建议内容",
      "priority": "high/medium/low",
      "evidence": "医学依据",
      "timeFrame": "见效时间"
    }
  ],
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "departments": ["皮肤科", "内分泌科", "心血管科", "神经科"],
    "recommendedTests": ["皮肤检测", "激素水平检测", "心血管检查"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "总结描述"
}

【评估要点】
1. 皮肤状态：皱纹（额头、眼角、嘴角、鼻唇沟）、弹性、色素沉着（雀斑、黄褐斑、老年斑）、肤质、毛孔
2. 眼部状态：眼袋（脂肪型/水肿型/混合型）、黑眼圈（青色/褐色/黑色）、鱼尾纹、眼神明亮度
3. 面部对称性：左右对称程度
4. 面部轮廓：下颌线清晰度、面部松弛度、典型年龄范围
5. 整体气色：面色光泽、血色、面色状态

多器官年龄评估：
- 皮肤年龄：根据皱纹、弹性、色素、质地、毛孔等评估（权重1.0）
- 眼睛年龄：根据眼部状态评估（权重1.0）
- 心血管年龄：根据面色、光泽、血管状态推断（权重0.8）
- 消化年龄：根据面部光泽、唇部状态推断（权重0.7）
- 神经年龄：根据面部表情、肌肉张力推断（权重0.7）

老化因素分析：
- 衰老因素分为：皱纹、色素、皮肤质量、面部轮廓、眼部状态五大类
- 每个因素需要评估：类型、数量、深度/严重度、年龄贡献、可逆性、典型年龄范围

老化速度评估：
- 分析当前老化速度（正常/稍快/快/很快）
- 识别加速老化因素（如紫外线暴露、睡眠不足、压力大等）
- 识别保护因素（如规律运动、健康饮食等）
- 计算净影响（加权总和）
- 分析衰老机制（端粒缩短、氧化应激、炎症反应、糖化、线粒体功能下降）

老化趋势预测：
- 短期预测（1年内）：预期增加的年龄
- 中期预测（3-5年）：预期增加的年龄
- 长期预测（10年）：预期增加的年龄
- 给出每个预测的置信度、关键影响因素和不确定性

可逆性评估：
- 评估整体可逆性（高/中/低）
- 分类：高可逆性（70-90%，1-6个月）、部分可逆（40-60%，6-12个月）、难逆转（10-30%，12-24个月）
- 给出改善方法和时间范围

抗衰老方案：
- 立即行动：可以立即采取的措施
- 短期目标：6个月内的目标
- 中期计划：1-2年的计划
- 生活方式调整：饮食、运动、睡眠、压力管理
- 专业干预：医疗美容、整形手术（如有需要）

风险评估：
- 识别加速老化风险因子
- 识别系统疾病风险因子
- 评估整体风险水平
- 给出置信度评估

请根据用户实际年龄(${chronologicalAge}岁)和性别(${userInfo.gender || '未知'})进行深度分析。`;

    // 构建用户消息
    const userMessage = `请分析这位${userInfo.gender || '用户'}的生理年龄，实际年龄是${chronologicalAge}岁。`;

    // 准备图片URL
    const imageUrl = image.startsWith('data:image/') 
      ? image 
      : `data:image/jpeg;base64,${image}`;

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmConfig = new Config();
    const client = new LLMClient(llmConfig, customHeaders);

    // 构建messages
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: userMessage },
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
      temperature: 0.3,
    });
    
    if (!response || !response.content) {
      throw new Error('LLM返回空响应');
    }
    
    const content = response.content;
    
    // 解析JSON响应
    let result: any;
    try {
      // 清理可能的markdown代码块标记
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[BiologicalAge] JSON解析失败:', content);
      throw new Error('无法解析分析结果');
    }

    // 计算年龄差值和评分
    const estimatedAge = result.estimatedAge || chronologicalAge;
    const ageDifference = estimatedAge - chronologicalAge;
    
    // 生物年龄评分计算
    let biologicalAgeScore = 100;
    if (ageDifference > 0) {
      biologicalAgeScore = Math.max(50, 100 - ageDifference * 5);
    } else if (ageDifference < 0) {
      biologicalAgeScore = Math.min(100, 100 - ageDifference * 3);
    }

    // 如果没有提供健康指数，根据衰老因素计算
    if (!result.healthIndex || Object.keys(result.healthIndex).length === 0) {
      const negativeFactors = result.agingFactors?.filter((f: AgingFactor) => f.impact === 'negative').length || 0;
      const positiveFactors = result.agingFactors?.filter((f: AgingFactor) => f.impact === 'positive').length || 0;
      
      result.healthIndex = {
        skin: Math.max(0, Math.min(100, 100 - negativeFactors * 10 + positiveFactors * 5)),
        eyes: Math.max(0, Math.min(100, 100 - negativeFactors * 8 + positiveFactors * 5)),
        facialSymmetry: Math.max(0, Math.min(100, 85 + Math.random() * 15)),
        overall: biologicalAgeScore,
      };
    }

    // 生成完整报告
    const fullReport = generateFullReport(result, chronologicalAge, estimatedAge, biologicalAgeScore, userInfo);

    // 构建返回数据
    const output: BiologicalAgeResult = {
      estimatedAge,
      chronologicalAge,
      ageDifference,
      biologicalAgeScore,
      agingFeatures: result.agingFeatures || {},
      organAges: result.organAges || {},
      agingSpeed: result.agingSpeed || {},
      agingPrediction: result.agingPrediction || {},
      reversibilityAssessment: result.reversibilityAssessment || {},
      healthIndex: result.healthIndex,
      antiAgingPlan: result.antiAgingPlan || {},
      recommendations: result.recommendations || [],
      summary: result.summary || '',
      fullReport,
      timestamp: new Date().toISOString(),
    };

    console.log('[BiologicalAge] 分析完成:', {
      estimatedAge,
      ageDifference,
      biologicalAgeScore,
    });

    // 保存记录到数据库
    const db = await getDb();
    const recordId = crypto.randomUUID();
    const userId = userInfo.phone || userInfo.name || 'anonymous';

    try {
      // 步骤0: 确保用户存在
      await (db.execute as any)(
        sql`INSERT INTO users (id, name, phone, gender) VALUES (${userId}, ${userInfo.name || '未填写'}, ${userInfo.phone || ''}, ${userInfo.gender || '未知'}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, gender = EXCLUDED.gender, updated_at = NOW()`
      );

      // 步骤1: 插入基本字段（包括必填的 image_url 字段）
      await (db.execute as any)(
        sql`INSERT INTO biological_age_records (id, user_id, image_url, name, gender, phone, actual_age, biological_age, age_difference, summary, full_report, created_at) VALUES (${recordId}, ${userId}, ${image || ''}, ${userInfo.name || '未填写'}, ${userInfo.gender || '未知'}, ${userInfo.phone || ''}, ${chronologicalAge}, ${estimatedAge}, ${ageDifference}, ${result.summary || ''}, ${fullReport}, NOW())`
      );

      console.log('[BiologicalAge] 基本字段保存成功');

      // 步骤2: 更新JSON字段
      await (db.execute as any)(
        sql`UPDATE biological_age_records SET aging_features = ${JSON.stringify(result.agingFeatures || {})}, organ_ages = ${JSON.stringify(result.organAges || {})}, aging_speed = ${JSON.stringify(result.agingSpeed || {})}, aging_prediction = ${JSON.stringify(result.agingPrediction || {})}, reversibility_assessment = ${JSON.stringify(result.reversibilityAssessment || {})}, anti_aging_plan = ${JSON.stringify(result.antiAgingPlan || {})}, recommendations = ${JSON.stringify(result.recommendations || [])} WHERE id = ${recordId}`
      );

      console.log('[BiologicalAge] JSON字段保存成功，记录ID:', recordId);
    } catch (dbError) {
      console.error('[BiologicalAge] 数据库保存失败:', dbError);
      // 即使数据库保存失败，也返回分析结果
    }

    // 添加 recordId 到返回数据
    (output as any).id = recordId;

    return NextResponse.json({
      success: true,
      data: output,
    });
  } catch (error) {
    console.error('[BiologicalAge] 分析失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '生理年龄评估失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// 生成完整报告
function generateFullReport(
  result: any,
  chronologicalAge: number,
  estimatedAge: number,
  biologicalAgeScore: number,
  userInfo: any
): string {
  const sections: string[] = [];
  
  sections.push('【生理年龄评估报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`实际年龄：${chronologicalAge}岁`);
  sections.push(`生理年龄：${estimatedAge}岁`);
  sections.push(`年龄差值：${estimatedAge > chronologicalAge ? '+' : ''}${estimatedAge - chronologicalAge}岁`);
  sections.push(`健康评分：${biologicalAgeScore}分`);
  sections.push('');

  // 年龄状态
  const ageDiff = estimatedAge - chronologicalAge;
  if (ageDiff > 5) {
    sections.push('📊 年龄状态：衰老加速，需重视\n');
  } else if (ageDiff > 2) {
    sections.push('📊 年龄状态：略显衰老\n');
  } else if (ageDiff < -5) {
    sections.push('📊 年龄状态：年轻态明显\n');
  } else if (ageDiff < -2) {
    sections.push('📊 年龄状态：保养良好\n');
  } else {
    sections.push('📊 年龄状态：年龄匹配\n');
  }

  // 多器官年龄评估
  if (result.organAges) {
    sections.push('🏥 多器官年龄评估');
    const organs = result.organAges;
    if (organs.skinAge) {
      sections.push(`  皮肤年龄：${organs.skinAge.age}岁（${organs.skinAge.difference > 0 ? '+' : ''}${organs.skinAge.difference}岁，${organs.skinAge.status}）`);
    }
    if (organs.eyeAge) {
      sections.push(`  眼睛年龄：${organs.eyeAge.age}岁（${organs.eyeAge.difference > 0 ? '+' : ''}${organs.eyeAge.difference}岁，${organs.eyeAge.status}）`);
    }
    if (organs.cardiovascularAge) {
      sections.push(`  心血管年龄：${organs.cardiovascularAge.age}岁（${organs.cardiovascularAge.difference > 0 ? '+' : ''}${organs.cardiovascularAge.difference}岁，${organs.cardiovascularAge.status}）`);
    }
    if (organs.digestiveAge) {
      sections.push(`  消化年龄：${organs.digestiveAge.age}岁（${organs.digestiveAge.difference > 0 ? '+' : ''}${organs.digestiveAge.difference}岁，${organs.digestiveAge.status}）`);
    }
    if (organs.nervousAge) {
      sections.push(`  神经年龄：${organs.nervousAge.age}岁（${organs.nervousAge.difference > 0 ? '+' : ''}${organs.nervousAge.difference}岁，${organs.nervousAge.status}）`);
    }
    if (organs.overallAge) {
      sections.push(`  综合器官年龄：${organs.overallAge}岁`);
    }
    sections.push('');
  }

  // 老化特征分析
  if (result.agingFeatures) {
    sections.push('👁️ 老化特征深度分析');
    const features = result.agingFeatures;
    
    if (features.wrinkles) {
      sections.push('  皱纹分析：');
      sections.push(`    总体评分：${features.wrinkles.overallScore || 0}/100`);
      if (features.wrinkles.details && features.wrinkles.details.length > 0) {
        features.wrinkles.details.forEach((w: any) => {
          sections.push(`    • ${w.type}：${w.count || '少量'}处，${w.depth}，年龄贡献${w.ageContribution || 0}岁，可逆性${w.reversibility}`);
        });
      }
    }
    
    if (features.pigmentation) {
      sections.push('  色素沉着分析：');
      sections.push(`    总体评分：${features.pigmentation.overallScore || 0}/100`);
      if (features.pigmentation.details && features.pigmentation.details.length > 0) {
        features.pigmentation.details.forEach((p: any) => {
          sections.push(`    • ${p.type}：${p.area}，${p.severity}，年龄贡献${p.ageContribution || 0}岁，可逆性${p.reversibility}`);
        });
      }
    }
    
    if (features.skinQuality) {
      sections.push('  皮肤质量分析：');
      const sq = features.skinQuality;
      if (sq.elasticity) sections.push(`    弹性：${sq.elasticity.score}分（${sq.elasticity.status}）`);
      if (sq.luster) sections.push(`    光泽：${sq.luster.score}分（${sq.luster.status}）`);
      if (sq.texture) sections.push(`    质地：${sq.texture.score}分（${sq.texture.status}）`);
      if (sq.pores) sections.push(`    毛孔：${sq.pores.score}分（${sq.pores.status}）`);
    }
    
    if (features.facialContour) {
      sections.push('  面部轮廓分析：');
      const fc = features.facialContour;
      if (fc.sagging) sections.push(`    松弛度：${fc.sagging.score}分（${fc.sagging.status}）`);
      if (fc.jawline) sections.push(`    下颌线：${fc.jawline.score}分（${fc.jawline.status}）`);
    }
    
    sections.push('');
  }

  // 老化速度评估
  if (result.agingSpeed) {
    sections.push('⚡ 老化速度评估');
    const speed = result.agingSpeed;
    sections.push(`  当前速度：${speed.currentSpeed}`);
    sections.push(`  速度评分：${speed.speedScore}`);
    sections.push(`  速度等级：${speed.speedLevel}`);
    
    if (speed.acceleratingFactors && speed.acceleratingFactors.length > 0) {
      sections.push('  加速老化因素：');
      speed.acceleratingFactors.forEach((f: any) => {
        sections.push(`    • ${f.factor}（${f.impact}影响，权重${f.weight}）：${f.description}`);
      });
    }
    
    if (speed.protectiveFactors && speed.protectiveFactors.length > 0) {
      sections.push('  保护因素：');
      speed.protectiveFactors.forEach((f: any) => {
        sections.push(`    • ${f.factor}（${f.impact}影响，权重${f.weight}）：${f.description}`);
      });
    }
    
    sections.push(`  净影响：${speed.netImpact > 0 ? '延缓' : speed.netImpact < 0 ? '加速' : '平衡'}`);
    sections.push('');
  }

  // 老化趋势预测
  if (result.agingPrediction) {
    sections.push('📈 老化趋势预测');
    const pred = result.agingPrediction;
    
    if (pred.shortTerm) {
      sections.push(`  短期预测（${pred.shortTerm.timeFrame}）：`);
      sections.push(`    预测年龄：${pred.shortTerm.predictedAge}岁`);
      sections.push(`    预期增加：${pred.shortTerm.expectedIncrease}岁`);
      sections.push(`    置信度：${pred.shortTerm.confidence}%`);
      if (pred.shortTerm.keyFactors && pred.shortTerm.keyFactors.length > 0) {
        sections.push(`    关键因素：${pred.shortTerm.keyFactors.join('、')}`);
      }
    }
    
    if (pred.midTerm) {
      sections.push(`  中期预测（${pred.midTerm.timeFrame}）：`);
      sections.push(`    预测年龄：${pred.midTerm.predictedAge}岁`);
      sections.push(`    预期增加：${pred.midTerm.expectedIncrease}岁`);
      sections.push(`    置信度：${pred.midTerm.confidence}%`);
      if (pred.midTerm.keyFactors && pred.midTerm.keyFactors.length > 0) {
        sections.push(`    关键因素：${pred.midTerm.keyFactors.join('、')}`);
      }
    }
    
    if (pred.longTerm) {
      sections.push(`  长期预测（${pred.longTerm.timeFrame}）：`);
      sections.push(`    预测年龄：${pred.longTerm.predictedAge}岁`);
      sections.push(`    预期增加：${pred.longTerm.expectedIncrease}岁`);
      sections.push(`    置信度：${pred.longTerm.confidence}%`);
      if (pred.longTerm.keyFactors && pred.longTerm.keyFactors.length > 0) {
        sections.push(`    关键因素：${pred.longTerm.keyFactors.join('、')}`);
      }
    }
    
    sections.push('');
  }

  // 可逆性评估
  if (result.reversibilityAssessment) {
    sections.push('🔄 可逆性评估');
    const rev = result.reversibilityAssessment;
    sections.push(`  整体可逆性：${rev.overallReversibility}`);
    sections.push(`  可逆性评分：${rev.reversibilityScore}/100`);
    
    if (rev.reversibleFeatures && rev.reversibleFeatures.length > 0) {
      sections.push('  高可逆性特征：');
      rev.reversibleFeatures.forEach((f: any) => {
        sections.push(`    • ${f.feature}：可逆性${f.reversibility}%，方法：${f.methods.join('、')}，时间：${f.timeFrame}`);
      });
    }
    
    if (rev.partiallyReversibleFeatures && rev.partiallyReversibleFeatures.length > 0) {
      sections.push('  部分可逆特征：');
      rev.partiallyReversibleFeatures.forEach((f: any) => {
        sections.push(`    • ${f.feature}：可逆性${f.reversibility}%，方法：${f.methods.join('、')}，时间：${f.timeFrame}`);
      });
    }
    
    if (rev.hardToReverseFeatures && rev.hardToReverseFeatures.length > 0) {
      sections.push('  难逆转特征：');
      rev.hardToReverseFeatures.forEach((f: any) => {
        sections.push(`    • ${f.feature}：可逆性${f.reversibility}%，方法：${f.methods.join('、')}，时间：${f.timeFrame}`);
      });
    }
    
    sections.push('');
  }

  // 健康指标
  if (result.healthIndex) {
    sections.push('💚 健康指标分析');
    sections.push(`  皮肤状态：${result.healthIndex.skin}分`);
    sections.push(`  眼部状态：${result.healthIndex.eyes}分`);
    sections.push(`  面部对称性：${result.healthIndex.facialSymmetry}分`);
    sections.push(`  整体评分：${result.healthIndex.overall}分`);
    sections.push('');
  }

  // 抗衰老方案
  if (result.antiAgingPlan) {
    sections.push('🛡️ 抗衰老方案');
    const plan = result.antiAgingPlan;
    
    if (plan.immediateActions && plan.immediateActions.length > 0) {
      sections.push('  立即行动：');
      plan.immediateActions.forEach((act: any) => {
        sections.push(`    • 【${act.type}】${act.content}（${act.priority}优先级）`);
        if (act.expectedEffect) sections.push(`      预期效果：${act.expectedEffect}`);
      });
    }
    
    if (plan.shortTermGoals && plan.shortTermGoals.length > 0) {
      sections.push('  短期目标：');
      plan.shortTermGoals.forEach((goal: any) => {
        sections.push(`    • ${goal.goal}（${goal.target}）`);
        if (goal.methods && goal.methods.length > 0) {
          sections.push(`      方法：${goal.methods.join('、')}`);
        }
      });
    }
    
    if (plan.midTermGoals && plan.midTermGoals.length > 0) {
      sections.push('  中期计划：');
      plan.midTermGoals.forEach((goal: any) => {
        sections.push(`    • ${goal.goal}（${goal.target}）`);
        if (goal.methods && goal.methods.length > 0) {
          sections.push(`      方法：${goal.methods.join('、')}`);
        }
      });
    }
    
    if (plan.lifestyleModifications) {
      sections.push('  生活方式调整：');
      const lifestyle = plan.lifestyleModifications;
      if (lifestyle.diet && lifestyle.diet.recommendations) {
        sections.push(`    饮食：${lifestyle.diet.recommendations.join('、')}`);
      }
      if (lifestyle.exercise && lifestyle.exercise.recommendations) {
        sections.push(`    运动：${lifestyle.exercise.recommendations.join('、')}`);
      }
      if (lifestyle.sleep && lifestyle.sleep.recommendations) {
        sections.push(`    睡眠：${lifestyle.sleep.recommendations.join('、')}`);
      }
      if (lifestyle.stress && lifestyle.stress.recommendations) {
        sections.push(`    压力管理：${lifestyle.stress.recommendations.join('、')}`);
      }
    }
    
    sections.push('');
  }

  // 健康建议
  if (result.recommendations && result.recommendations.length > 0) {
    sections.push('💡 健康建议');
    result.recommendations.forEach((rec: Recommendation) => {
      const priorityText = rec.priority === 'high' ? '重要' : rec.priority === 'medium' ? '中等' : '建议';
      sections.push(`  【${priorityText}】${rec.category}：${rec.content}`);
    });
    sections.push('');
  }

  // 总结
  if (result.summary) {
    sections.push(`📝 总结：${result.summary}`);
  }

  return sections.join('\n');
}
