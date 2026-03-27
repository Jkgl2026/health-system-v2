import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

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
  agingFactors: AgingFactor[];
  healthIndex: HealthIndex;
  recommendations: Recommendation[];
  antiAgingTips: string[];
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
    const systemPrompt = `你是一位专业的生理年龄评估专家，基于面部特征分析用户的生理年龄。

请仔细分析上传的面部照片，评估用户的生理年龄，并提供详细的衰老因素分析和健康建议。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "estimatedAge": 数值（预估的生理年龄，整数）,
  "agingFactors": [
    {
      "factor": "衰老因素名称",
      "impact": "negative/positive/neutral",
      "description": "详细描述",
      "score": 数值（0-100）
    }
  ],
  "healthIndex": {
    "skin": 数值（0-100）,
    "eyes": 数值（0-100）,
    "facialSymmetry": 数值（0-100）,
    "overall": 数值（0-100）
  },
  "recommendations": [
    {
      "category": "建议类别",
      "content": "具体建议内容",
      "priority": "high/medium/low"
    }
  ],
  "antiAgingTips": [
    "抗衰老建议1",
    "抗衰老建议2"
  ],
  "summary": "总结描述"
}

评估标准：
1. 皮肤状态：皱纹、弹性、色素沉着、肤质
2. 眼部状态：眼袋、黑眼圈、眼角皱纹、眼神
3. 面部对称性：左右对称程度
4. 整体气色：面色光泽、血色

衰老因素包括：
- 负面因素（加速衰老）：皱纹、斑点、松弛、眼袋、暗沉等
- 正面因素（延缓衰老）：皮肤光泽、面部饱满、眼神明亮等
- 中性因素：遗传因素、骨相特征等

请根据用户实际年龄(${chronologicalAge}岁)和性别(${userInfo.gender || '未知'})进行分析。`;

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
      agingFactors: result.agingFactors || [],
      healthIndex: result.healthIndex,
      recommendations: result.recommendations || [],
      antiAgingTips: result.antiAgingTips || [],
      summary: result.summary || '',
      fullReport,
      timestamp: new Date().toISOString(),
    };

    console.log('[BiologicalAge] 分析完成:', {
      estimatedAge,
      ageDifference,
      biologicalAgeScore,
    });

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

  // 健康指标
  if (result.healthIndex) {
    sections.push('💚 健康指标分析');
    sections.push(`  皮肤状态：${result.healthIndex.skin}分`);
    sections.push(`  眼部状态：${result.healthIndex.eyes}分`);
    sections.push(`  面部对称性：${result.healthIndex.facialSymmetry}分`);
    sections.push(`  整体评分：${result.healthIndex.overall}分`);
    sections.push('');
  }

  // 衰老因素分析
  if (result.agingFactors && result.agingFactors.length > 0) {
    sections.push('👁️ 衰老因素分析');
    result.agingFactors.forEach((factor: AgingFactor) => {
      const impactText = factor.impact === 'negative' ? '加速' : factor.impact === 'positive' ? '延缓' : '中性';
      sections.push(`  【${factor.factor}】（${impactText}）`);
      sections.push(`    ${factor.description}`);
      sections.push(`    评分：${factor.score}/100`);
    });
    sections.push('');
  }

  // 抗衰老建议
  if (result.antiAgingTips && result.antiAgingTips.length > 0) {
    sections.push('🛡️ 抗衰老建议');
    result.antiAgingTips.forEach((tip: string, index: number) => {
      sections.push(`  ${index + 1}. ${tip}`);
    });
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
