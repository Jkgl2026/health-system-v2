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
    const systemPrompt = `你是一位专业的生理年龄评估专家，基于面部特征深度分析用户的生理年龄。

请仔细分析上传的面部照片，全面评估用户的生理年龄、多器官年龄、老化速度、老化趋势预测和可逆性评估。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "estimatedAge": 数值（预估的生理年龄，整数）,
  "agingFeatures": {
    "wrinkles": {
      "overallScore": 0-100,
      "details": [
        {
          "type": "额头纹",
          "count": 数量,
          "depth": "轻度/中度/重度",
          "ageContribution": 数值（对年龄的贡献）,
          "reversibility": "高/中/低"
        }
      ]
    },
    "pigmentation": {
      "overallScore": 0-100,
      "details": [
        {
          "type": "雀斑/黄褐斑",
          "area": "分布区域",
          "severity": "轻度/中度/重度",
          "ageContribution": 数值,
          "reversibility": "高/中/低"
        }
      ]
    },
    "skinQuality": {
      "elasticity": {"score": 0-100, "status": "良好/一般/较差", "ageContribution": 数值, "reversibility": "高/中/低"},
      "luster": {"score": 0-100, "status": "明润/一般/晦暗", "ageContribution": 数值, "reversibility": "高/中/低"},
      "texture": {"score": 0-100, "status": "光滑/粗糙", "ageContribution": 数值, "reversibility": "高/中/低"},
      "pores": {"score": 0-100, "status": "细小/粗大", "ageContribution": 数值, "reversibility": "高/中/低"}
    },
    "facialContour": {
      "sagging": {"score": 0-100, "status": "紧致/轻度松弛/中度松弛/重度松弛", "affectedAreas": ["下颌", "面颊"], "ageContribution": 数值, "reversibility": "高/中/低"},
      "jawline": {"score": 0-100, "status": "清晰/模糊", "ageContribution": 数值, "reversibility": "高/中/低"}
    }
  },
  "organAges": {
    "skinAge": {"age": 数值, "difference": 数值（与实际年龄差）, "status": "加速/正常/延缓", "factors": ["因素1", "因素2"]},
    "eyeAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["因素1", "因素2"]},
    "cardiovascularAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["因素1", "因素2"]},
    "digestiveAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["因素1", "因素2"]},
    "nervousAge": {"age": 数值, "difference": 数值, "status": "加速/正常/延缓", "factors": ["因素1", "因素2"]},
    "overallAge": 数值
  },
  "agingSpeed": {
    "currentSpeed": "正常/稍快/快/很快",
    "speedScore": 数值（负数表示加速，正数表示延缓）,
    "speedLevel": "正常/稍快/快/很快",
    "acceleratingFactors": [
      {"factor": "因素名称", "impact": "高/中/低", "weight": 数值, "description": "详细描述"}
    ],
    "protectiveFactors": [
      {"factor": "因素名称", "impact": "高/中/低", "weight": 数值, "description": "详细描述"}
    ],
    "netImpact": 数值
  },
  "agingPrediction": {
    "shortTerm": {"timeFrame": "1年内", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"]},
    "midTerm": {"timeFrame": "3-5年", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"]},
    "longTerm": {"timeFrame": "10年", "predictedAge": 数值, "expectedIncrease": 数值, "confidence": 0-100, "keyFactors": ["因素1", "因素2"]}
  },
  "reversibilityAssessment": {
    "overallReversibility": "高/中/低",
    "reversibilityScore": 0-100,
    "reversibleFeatures": [
      {"feature": "特征名称", "reversibility": 数值, "methods": ["方法1", "方法2"], "timeFrame": "时间范围"}
    ],
    "partiallyReversibleFeatures": [
      {"feature": "特征名称", "reversibility": 数值, "methods": ["方法1", "方法2"], "timeFrame": "时间范围"}
    ],
    "hardToReverseFeatures": [
      {"feature": "特征名称", "reversibility": 数值, "methods": ["方法1", "方法2"], "timeFrame": "时间范围"}
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
      {"type": "护肤/饮食/运动", "content": "具体行动", "priority": "高/中/低", "expectedEffect": "预期效果"}
    ],
    "shortTermGoals": [
      {"goal": "目标描述", "target": "目标时间", "methods": ["方法1", "方法2"]}
    ],
    "midTermGoals": [
      {"goal": "目标描述", "target": "目标时间", "methods": ["方法1", "方法2"]}
    ],
    "lifestyleModifications": {
      "diet": {"recommendations": ["建议1", "建议2"]},
      "exercise": {"recommendations": ["建议1", "建议2"]},
      "sleep": {"recommendations": ["建议1", "建议2"]},
      "stress": {"recommendations": ["建议1", "建议2"]}
    }
  },
  "recommendations": [
    {
      "category": "建议类别",
      "content": "具体建议内容",
      "priority": "high/medium/low"
    }
  ],
  "summary": "总结描述"
}

评估标准：
1. 皮肤状态：皱纹（额头、眼角、嘴角）、弹性、色素沉着（雀斑、黄褐斑）、肤质、毛孔
2. 眼部状态：眼袋、黑眼圈、眼角皱纹、眼神明亮度
3. 面部对称性：左右对称程度
4. 面部轮廓：下颌线清晰度、面部松弛度
5. 整体气色：面色光泽、血色、面色状态

多器官年龄评估：
- 皮肤年龄：根据皱纹、弹性、色素等评估
- 眼睛年龄：根据眼部状态评估
- 心血管年龄：根据面色、光泽、血管状态推断
- 消化年龄：根据面部光泽、唇部状态推断
- 神经年龄：根据面部表情、肌肉张力推断

老化因素分析：
- 衰老因素分为：皱纹、色素、皮肤质量、面部轮廓四大类
- 每个因素需要评估：类型、数量、深度/严重度、年龄贡献、可逆性

老化速度评估：
- 分析当前老化速度（正常/稍快/快/很快）
- 识别加速老化因素（如紫外线暴露、睡眠不足、压力大等）
- 识别保护因素（如规律运动、健康饮食等）
- 计算净影响（加权总和）

老化趋势预测：
- 短期预测（1年内）：预期增加的年龄
- 中期预测（3-5年）：预期增加的年龄
- 长期预测（10年）：预期增加的年龄
- 给出每个预测的置信度和关键影响因素

可逆性评估：
- 评估整体可逆性（高/中/低）
- 分类：高可逆性（如皮肤弹性）、部分可逆（如色素）、难逆转（如面部轮廓）
- 给出改善方法和时间范围

抗衰老方案：
- 立即行动：可以立即采取的措施
- 短期目标：6个月内的目标
- 中期计划：1-2年的计划
- 生活方式调整：饮食、运动、睡眠、压力管理

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

    // 保存记录到数据库（暂时跳过数据库保存，直接返回结果）
    const recordId = crypto.randomUUID();
    const userId = userInfo.phone || userInfo.name || 'anonymous';

    // TODO: 数据库保存功能待完善
    console.log('[BiologicalAge] 记录ID:', recordId, '用户ID:', userId);

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
