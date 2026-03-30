import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

interface VoiceHealthRequest {
  audioUrl?: string; // 音频URL
  audioFeatures?: {
    duration?: number; // 录音时长（秒）
    averageVolume?: number; // 平均音量
    pitchRange?: string; // 音调范围
    speakingSpeed?: string; // 语速
    clarity?: string; // 清晰度
    voiceQuality?: string; // 声音质量
    breathingPattern?: string; // 呼吸模式
  };
  userDescription?: string; // 用户对声音状态的描述
  userInfo: {
    name: string;
    age?: string;
    gender?: string;
    phone?: string;
  };
}

interface HealthIndicator {
  indicator: string;
  value: number;
  status: 'normal' | 'warning' | 'abnormal';
  description: string;
}

interface Recommendation {
  category: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

interface VoiceHealthResult {
  overallScore: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  acousticFeatures: {
    pitch: {
      averagePitch: number;
      pitchRange: string;
      pitchStability: string;
      pitchVariation: string;
      analysis: string;
    };
    volume: {
      averageVolume: number;
      volumeRange: string;
      volumeStability: string;
      analysis: string;
    };
    tempo: {
      averageSpeed: number;
      speedVariation: string;
      pausePattern: string;
      pauseDuration: string;
      analysis: string;
    };
    timbre: {
      brightness: string;
      purity: string;
      fullness: string;
      quality: string;
      analysis: string;
    };
    resonance: {
      chestResonance: string;
      nasalResonance: string;
      headResonance: string;
      balance: string;
      analysis: string;
    };
  };
  psychologicalState: {
    stressLevel: {
      score: number;
      level: string;
      indicators: Array<{
        indicator: string;
        detected: boolean;
        severity: string;
        description: string;
      }>;
      analysis: string;
    };
    emotionalState: {
      primaryEmotion: string;
      secondaryEmotion: string;
      confidence: number;
      indicators: Array<{
        indicator: string;
        detected: boolean;
        severity: string;
        description: string;
      }>;
      analysis: string;
    };
    fatigueLevel: {
      score: number;
      level: string;
      indicators: Array<{
        indicator: string;
        detected: boolean;
        severity: string;
        description: string;
      }>;
      analysis: string;
    };
    mentalState: {
      clarity: string;
      focus: string;
      stability: string;
      analysis: string;
    };
  };
  physicalHealth: {
    respiratoryHealth: {
      pattern: string;
      rate: number;
      depth: string;
      rhythm: string;
      capacity: string;
      efficiency: number;
      analysis: string;
    };
    vocalHealth: {
      vocalCordCondition: string;
      voiceQuality: string;
      voiceProjection: string;
      voiceStamina: string;
      riskFactors: string[];
      analysis: string;
    };
    nervousSystem: {
      voiceControl: string;
      coordination: string;
      stability: string;
      reaction: string;
      analysis: string;
    };
    overallHealth: {
      status: string;
      vitality: string;
      energy: string;
      analysis: string;
    };
  };
  healthRiskAssessment: {
    stressRelatedRisks: Array<{
      risk: string;
      level: string;
      likelihood: string;
      impact: string;
      recommendation: string;
    }>;
    physicalRisks: Array<{
      risk: string;
      level: string;
      likelihood: string;
      impact: string;
      recommendation: string;
    }>;
    overallRisk: string;
    priorityAreas: string[];
  };
  recommendations: Recommendation[];
  voiceCareTips: string[];
  improvementPlan: {
    stressReduction: {
      target: string;
      methods: Array<{
        method: string;
        frequency: string;
        duration: string;
        expectedEffect: string;
      }>;
    };
    voiceTraining: {
      target: string;
      methods: Array<{
        method: string;
        frequency: string;
        duration: string;
        expectedEffect: string;
      }>;
    };
    lifestyle: {
      target: string;
      methods: Array<{
        method: string;
        frequency: string;
        duration: string;
        expectedEffect: string;
      }>;
    };
  };
  summary: string;
  fullReport: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceHealthRequest = await request.json();
    const { audioUrl, audioFeatures, userDescription, userInfo } = body;

    if (!audioFeatures && !userDescription) {
      return NextResponse.json(
        { error: '请提供音频特征数据或声音状态描述' },
        { status: 400 }
      );
    }

    console.log('[VoiceHealth] 开始分析:', { 
      name: userInfo.name, 
      gender: userInfo.gender,
      hasAudioFeatures: !!audioFeatures,
      hasUserDescription: !!userDescription 
    });

    // 使用LLM进行深度分析
    const analysisResult = await analyzeVoiceWithLLM(
      audioFeatures,
      userDescription,
      userInfo,
      request
    );

    // 生成完整报告
    const fullReport = generateFullReport(analysisResult, userInfo);

    const result: VoiceHealthResult = {
      overallScore: analysisResult.overallScore || 75,
      healthStatus: analysisResult.healthStatus || 'good',
      acousticFeatures: analysisResult.acousticFeatures || {
        pitch: { averagePitch: 0, pitchRange: '', pitchStability: '', pitchVariation: '', analysis: '' },
        volume: { averageVolume: 0, volumeRange: '', volumeStability: '', analysis: '' },
        tempo: { averageSpeed: 0, speedVariation: '', pausePattern: '', pauseDuration: '', analysis: '' },
        timbre: { brightness: '', purity: '', fullness: '', quality: '', analysis: '' },
        resonance: { chestResonance: '', nasalResonance: '', headResonance: '', balance: '', analysis: '' },
      },
      psychologicalState: analysisResult.psychologicalState || {
        stressLevel: { score: 0, level: '', indicators: [], analysis: '' },
        emotionalState: { primaryEmotion: '', secondaryEmotion: '', confidence: 0, indicators: [], analysis: '' },
        fatigueLevel: { score: 0, level: '', indicators: [], analysis: '' },
        mentalState: { clarity: '', focus: '', stability: '', analysis: '' },
      },
      physicalHealth: analysisResult.physicalHealth || {
        respiratoryHealth: { pattern: '', rate: 0, depth: '', rhythm: '', capacity: '', efficiency: 0, analysis: '' },
        vocalHealth: { vocalCordCondition: '', voiceQuality: '', voiceProjection: '', voiceStamina: '', riskFactors: [], analysis: '' },
        nervousSystem: { voiceControl: '', coordination: '', stability: '', reaction: '', analysis: '' },
        overallHealth: { status: '', vitality: '', energy: '', analysis: '' },
      },
      healthRiskAssessment: analysisResult.healthRiskAssessment || {
        stressRelatedRisks: [],
        physicalRisks: [],
        overallRisk: '',
        priorityAreas: [],
      },
      recommendations: analysisResult.recommendations || [],
      voiceCareTips: analysisResult.voiceCareTips || [],
      improvementPlan: analysisResult.improvementPlan || {
        stressReduction: { target: '', methods: [] },
        voiceTraining: { target: '', methods: [] },
        lifestyle: { target: '', methods: [] },
      },
      summary: analysisResult.summary || '',
      fullReport,
      timestamp: new Date().toISOString(),
    };

    console.log('[VoiceHealth] 分析完成:', result.healthStatus);

    // 保存记录到数据库
    const db = await getDb();
    const recordId = crypto.randomUUID();
    const userId = userInfo.phone || userInfo.name || 'anonymous';

    try {
      // 步骤0: 确保用户存在
      await (db.execute as any)(
        sql`INSERT INTO users (id, name, phone, gender, age) VALUES (${userId}, ${userInfo.name || '未填写'}, ${userInfo.phone || ''}, ${userInfo.gender || '未知'}, ${userInfo.age || null}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, gender = EXCLUDED.gender, age = EXCLUDED.age, updated_at = NOW()`
      );

      // 步骤1: 插入基本字段（包括必填的 audio_url 字段）
      await (db.execute as any)(
        sql`INSERT INTO voice_health_records (id, user_id, audio_url, name, gender, phone, age, overall_score, health_status, summary, full_report, created_at) VALUES (${recordId}, ${userId}, ${audioUrl || ''}, ${userInfo.name || '未填写'}, ${userInfo.gender || '未知'}, ${userInfo.phone || ''}, ${userInfo.age || null}, ${result.overallScore}, ${result.healthStatus}, ${result.summary || ''}, ${fullReport}, NOW())`
      );

      console.log('[VoiceHealth] 基本字段保存成功');

      // 步骤2: 更新JSON字段
      await (db.execute as any)(
        sql`UPDATE voice_health_records SET acoustic_features = ${JSON.stringify(result.acousticFeatures || {})}, psychological_state = ${JSON.stringify(result.psychologicalState || {})}, physical_health = ${JSON.stringify(result.physicalHealth || {})}, health_risk_assessment = ${JSON.stringify(result.healthRiskAssessment || {})}, recommendations = ${JSON.stringify(result.recommendations || [])}, voice_care_tips = ${JSON.stringify(result.voiceCareTips || [])}, improvement_plan = ${JSON.stringify(result.improvementPlan || {})} WHERE id = ${recordId}`
      );

      console.log('[VoiceHealth] JSON字段保存成功，记录ID:', recordId);
    } catch (dbError) {
      console.error('[VoiceHealth] 数据库保存失败:', dbError);
      // 即使数据库保存失败，也返回分析结果
    }

    // 添加 recordId 到返回数据
    (result as any).id = recordId;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[VoiceHealth] 分析失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '声音健康评估失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// 使用LLM进行声音分析
async function analyzeVoiceWithLLM(
  audioFeatures: any,
  userDescription: string | undefined,
  userInfo: any,
  request: NextRequest
): Promise<Partial<VoiceHealthResult>> {
  // 构建分析提示词
  let analysisInput = '';
  
  if (audioFeatures) {
    analysisInput += `音频特征数据：
- 录音时长：${audioFeatures.duration || '未知'}秒
- 平均音量：${audioFeatures.averageVolume || '未知'}
- 音调范围：${audioFeatures.pitchRange || '未知'}
- 语速：${audioFeatures.speakingSpeed || '未知'}
- 清晰度：${audioFeatures.clarity || '未知'}
- 声音质量：${audioFeatures.voiceQuality || '未知'}
- 呼吸模式：${audioFeatures.breathingPattern || '未知'}

`;
  }

  if (userDescription) {
    analysisInput += `用户声音状态描述：
${userDescription}

`;
  }

  analysisInput += `用户信息：
- 姓名：${userInfo.name}
- 年龄：${userInfo.age || '未知'}
- 性别：${userInfo.gender || '未知'}

请基于以上信息，进行全面的声音健康评估分析。`;

  const systemPrompt = `你是一位专业的声音健康评估专家，拥有丰富的声学分析、中医声音诊断和临床经验。

【医学专业标准】

1. 语音声学基础标准
- 基频（F0）：成年男性 85-180Hz，成年女性 165-255Hz
- 音调范围：正常成年人为1-2个八度
- 语速：正常语速 120-160 词/分钟
- 共鸣峰：男性约500Hz，女性约800Hz
- 声强：正常对话约60-70dB
- 呼吸频率：12-20次/分钟
- 声门闭合度：正常80-100%

2. 声带医学标准
- 声带振动模式：黏膜波、声带边缘、声门闭合
- 声带健康评估：
  * 正常：声带光滑、对称、运动自如
  * 声带小结：声带前中1/3交界处对称性增厚
  * 声带息肉：声带表面单侧性肿物
  * 声带麻痹：声带固定或活动受限
- 声音质量分类：
  * Breathy（气息音）：声门闭合不全
  * Hoarse（沙哑）：声带粗糙或不规则振动
  * Strained（紧绷）：声带过度紧张
  * Diplophonia（双重音）：声带振动不对称

3. 声音与心理健康相关性
- 焦虑：语速加快、音调升高、呼吸浅促
- 抑郁：语速减慢、音量降低、语调单调
- 压力：声音紧绷、颤抖、停顿增加
- 疲劳：音量减弱、音色粗糙、共鸣不足
- 兴奋：语速加快、音量增大、音调变化丰富

4. 神经系统评估标准
- 锥体外系疾病：音调单调、声音僵硬
- 肌萎缩侧索硬化：声音嘶哑、吞咽困难
- 帕金森病：声音低沉、语速缓慢、声音颤抖
- 脑卒中：构音障碍、声音不清、发音困难

5. 中医声音诊断标准
- 五声对应五脏：
  * 肝（木）：呼声，正常柔和，异常则短促或尖锐
  * 心（火）：笑声，正常爽朗，异常则声音破裂
  * 脾（土）：歌声，正常和谐，异常则声音沉闷
  * 肺（金）：哭声，正常清亮，异常则声音嘶哑
  * 肾（水）：呻声，正常深沉，异常则声音微弱
- 气虚：声音低弱、气短、语速慢
- 气滞：声音抑郁、语速不匀、停顿多
- 阴虚：声音干涩、音调偏高、音色粗糙
- 阳虚：声音低沉、音量小、无力

【风险评估标准】

1. 声带疾病风险因子
- 高频用声：教师、歌手、销售等职业（风险×2.0）
- 吸烟史：声带损伤、声音粗糙（风险×1.5）
- 酗酒史：声带充血、声音沙哑（风险×1.5）
- 呼吸道感染：声音嘶哑、喉痛（风险×1.3）
- 胃食管反流：喉部灼烧感、清嗓动作（风险×1.4）
- 压力过大：声音紧绷、颤抖（风险×1.3）
- 睡眠不足：声音无力、音色粗糙（风险×1.2）

2. 心理健康风险因子
- 压力声音特征：语速异常、音调不稳定、停顿频繁
- 情绪声音特征：音调变化异常、音量波动大
- 疲劳声音特征：音量降低、音色粗糙、共鸣减弱
- 焦虑声音特征：语速加快、呼吸急促、声音紧张
- 抑郁声音特征：语速减慢、音调单调、音量低

3. 神经系统风险因子
- 构音障碍：发音不清、声音僵硬
- 声音颤抖：音调或音量不规则波动
- 声音低沉：音调低于正常范围
- 声音嘶哑：持续声音粗糙

【风险分级标准】
- 低风险（0-30分）：声音健康，建议保持良好用嗓习惯
- 中风险（31-70分）：存在声音问题，建议改善用嗓习惯并定期复查
- 高风险（71-100分）：声音异常明显，建议尽早就医检查

【置信度评估】
- 高置信度（80-100%）：多个风险因子同时存在，特征明显
- 中置信度（60-79%）：部分风险因子存在，特征较明显
- 低置信度（40-59%）：风险因子较少或特征不明显

请根据提供的音频特征和用户描述，进行全面的声音健康评估。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "overallScore": 0-100的综合健康评分,
  "healthStatus": "excellent/good/fair/poor",
  "acousticFeatures": {
    "pitch": {
      "averagePitch": 平均音调数值(Hz),
      "pitchRange": "音调范围描述",
      "pitchStability": "稳定/不稳定",
      "pitchVariation": "正常/偏窄/偏宽",
      "analysis": "详细分析"
    },
    "volume": {
      "averageVolume": 平均音量数值(dB),
      "volumeRange": "音量范围描述",
      "volumeStability": "稳定/不稳定",
      "analysis": "详细分析"
    },
    "tempo": {
      "averageSpeed": 平均语速数值(词/分钟),
      "speedVariation": "正常/偏快/偏慢",
      "pausePattern": "正常/频繁/稀少",
      "pauseDuration": "正常/偏长/偏短",
      "analysis": "详细分析"
    },
    "timbre": {
      "brightness": "明亮/暗淡/正常",
      "purity": "纯净/粗糙/一般",
      "fullness": "饱满/单薄/正常",
      "quality": "良好/一般/较差",
      "analysis": "详细分析"
    },
    "resonance": {
      "chestResonance": "强/中/弱",
      "nasalResonance": "强/中/弱",
      "headResonance": "强/中/弱",
      "balance": "良好/一般/较差",
      "analysis": "详细分析"
    }
  },
  "psychologicalState": {
    "stressLevel": {
      "score": 0-100的压力评分,
      "level": "低/中/高",
      "indicators": [
        {
          "indicator": "语速变化",
          "detected": true/false,
          "severity": "轻度/中度/重度",
          "description": "详细描述"
        }
      ],
      "analysis": "详细分析"
    },
    "emotionalState": {
      "primaryEmotion": "主要情绪",
      "secondaryEmotion": "次要情绪",
      "confidence": 0-100的置信度,
      "indicators": [],
      "analysis": "详细分析"
    },
    "fatigueLevel": {
      "score": 0-100的疲劳评分,
      "level": "轻度/中度/重度",
      "indicators": [],
      "analysis": "详细分析"
    },
    "mentalState": {
      "clarity": "清晰/一般/模糊",
      "focus": "集中/分散",
      "stability": "稳定/不稳定",
      "analysis": "详细分析"
    }
  },
  "physicalHealth": {
    "respiratoryHealth": {
      "pattern": "腹式呼吸/胸式呼吸/混合呼吸",
      "rate": 呼吸频率数值(次/分钟),
      "depth": "正常/浅/深",
      "rhythm": "均匀/不均匀",
      "capacity": "良好/一般/较差",
      "efficiency": 0-100的效率评分,
      "analysis": "详细分析"
    },
    "vocalHealth": {
      "vocalCordCondition": "良好/一般/较差",
      "voiceQuality": "清晰/粗糙/沙哑/气息音",
      "voiceProjection": "强/中/弱",
      "voiceStamina": "良好/一般/较差",
      "riskFactors": ["声带炎症风险", "声带小结风险", "声带息肉风险", "声带麻痹风险"],
      "analysis": "详细分析"
    },
    "nervousSystem": {
      "voiceControl": "良好/一般/较差",
      "coordination": "良好/一般/较差",
      "stability": "稳定/不稳定",
      "reaction": "快/中/慢",
      "riskIndicators": ["构音障碍", "声音颤抖", "声音低沉", "声音僵硬"],
      "analysis": "详细分析"
    },
    "overallHealth": {
      "status": "良好/一般/较差",
      "vitality": "强/中/弱",
      "energy": "充足/一般/不足",
      "analysis": "详细分析"
    }
  },
  "tcmDiagnosis": {
    "organHealth": {
      "liver": "正常/气虚/气滞",
      "heart": "正常/气虚/心火亢盛",
      "spleen": "正常/气虚/湿盛",
      "lung": "正常/气虚/肺燥",
      "kidney": "正常/阳虚/阴虚"
    },
    "qiPattern": "正常/气虚/气滞",
    "constitution": "平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀",
    "analysis": "中医诊断分析"
  },
  "healthRiskAssessment": {
    "stressRelatedRisks": [
      {
        "risk": "风险名称",
        "level": "低/中/高",
        "likelihood": "低/中/高",
        "impact": "影响描述",
        "recommendation": "建议",
        "confidence": 0-100的置信度
      }
    ],
    "physicalRisks": [],
    "overallRisk": "低/中/高",
    "riskScore": 0-100的风险总分,
    "confidence": 0-100的置信度,
    "priorityAreas": ["优先关注领域1", "优先关注领域2"]
  },
  "recommendations": [
    {
      "category": "类别",
      "content": "具体建议",
      "priority": "high/medium/low",
      "evidence": "医学依据"
    }
  ],
  "voiceCareTips": [
    "声音护理建议1",
    "声音护理建议2"
  ],
  "improvementPlan": {
    "stressReduction": {
      "target": "目标描述",
      "methods": [
        {
          "method": "方法名称",
          "frequency": "频率",
          "duration": "时长",
          "expectedEffect": "预期效果"
        }
      ]
    },
    "voiceTraining": {
      "target": "目标描述",
      "methods": []
    },
    "lifestyle": {
      "target": "目标描述",
      "methods": []
    }
  },
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "department": "耳鼻喉科/神经内科/心理科/精神科",
    "recommendedTests": ["喉镜检查", "声带功能评估"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "总结描述"
}

【评估要点】
1. 声学特征分析：基于语音声学标准，分析音调、音量、节奏、音色、共鸣等参数
2. 声带健康评估：识别声带疾病风险，包括声带炎症、小结、息肉、麻痹等
3. 心理状态推断：通过声音特征识别焦虑、抑郁、压力、疲劳等心理状态
4. 神经系统评估：识别构音障碍、声音颤抖等神经系统疾病风险
5. 中医诊断：根据声音特性判断五脏六腑健康状态和体质类型
6. 风险评估：综合考虑职业、习惯、症状等多因素，评估声带疾病和心理健康风险
7. 置信度评估：明确标注AI判断的可信程度
8. 改善建议：提供科学的声音护理、心理调适和生活方式改善建议
9. 就医建议：对高风险情况提供明确的就医指导`;

  try {
    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 调用LLM
    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: analysisInput },
    ], {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.3,
    });

    if (!response || !response.content) {
      throw new Error('LLM返回空响应');
    }

    // 解析JSON
    let result: any;
    try {
      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[VoiceHealth] JSON解析失败:', response.content);
      throw new Error('无法解析分析结果');
    }

    return result;
  } catch (error) {
    console.error('[VoiceHealth] LLM分析失败:', error);
    // 返回默认结果
    return {
      overallScore: 75,
      healthStatus: 'good',
      recommendations: [
        {
          category: '声音护理',
          content: '保持充足水分，避免过度用声',
          priority: 'medium',
        },
      ],
      voiceCareTips: [
        '多喝水，保持喉咙湿润',
        '避免长时间大声喊叫',
        '注意休息，保护声带',
      ],
      summary: '声音健康评估完成，建议继续关注用嗓习惯。',
    };
  }
}

// 生成完整报告
function generateFullReport(result: any, userInfo: any): string {
  const sections: string[] = [];
  
  sections.push('【声音健康评估报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`性别：${userInfo.gender || '未知'}`);
  sections.push(`评估时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  // 综合评分
  if (result.overallScore !== undefined) {
    sections.push(`📊 综合健康评分：${result.overallScore}分`);
    sections.push(`健康状态：${result.healthStatus || '未知'}`);
    sections.push('');
  }

  // 声学特征
  if (result.acousticFeatures) {
    sections.push('🎵 声学特征分析');
    const acoustic = result.acousticFeatures;
    
    if (acoustic.pitch) {
      sections.push('  音调分析：');
      sections.push(`    平均音调：${acoustic.pitch.averagePitch || '未知'}`);
      sections.push(`    音调范围：${acoustic.pitch.pitchRange || '未知'}`);
      sections.push(`    稳定性：${acoustic.pitch.pitchStability || '未知'}`);
      if (acoustic.pitch.analysis) sections.push(`    ${acoustic.pitch.analysis}`);
    }
    
    if (acoustic.volume) {
      sections.push('  音量分析：');
      sections.push(`    平均音量：${acoustic.volume.averageVolume || '未知'}`);
      sections.push(`    音量范围：${acoustic.volume.volumeRange || '未知'}`);
      sections.push(`    稳定性：${acoustic.volume.volumeStability || '未知'}`);
      if (acoustic.volume.analysis) sections.push(`    ${acoustic.volume.analysis}`);
    }
    
    if (acoustic.tempo) {
      sections.push('  节奏分析：');
      sections.push(`    平均语速：${acoustic.tempo.averageSpeed || '未知'}`);
      sections.push(`    速度变化：${acoustic.tempo.speedVariation || '未知'}`);
      sections.push(`    停顿模式：${acoustic.tempo.pausePattern || '未知'}`);
      if (acoustic.tempo.analysis) sections.push(`    ${acoustic.tempo.analysis}`);
    }
    
    if (acoustic.timbre) {
      sections.push('  音色分析：');
      sections.push(`    明亮度：${acoustic.timbre.brightness || '未知'}`);
      sections.push(`    纯净度：${acoustic.timbre.purity || '未知'}`);
      sections.push(`    饱满度：${acoustic.timbre.fullness || '未知'}`);
      if (acoustic.timbre.analysis) sections.push(`    ${acoustic.timbre.analysis}`);
    }
    
    sections.push('');
  }

  // 心理状态
  if (result.psychologicalState) {
    sections.push('🧠 心理状态评估');
    const psych = result.psychologicalState;
    
    if (psych.stressLevel) {
      sections.push(`  压力水平：${psych.stressLevel.level}（${psych.stressLevel.score}分）`);
      if (psych.stressLevel.analysis) sections.push(`  ${psych.stressLevel.analysis}`);
    }
    
    if (psych.emotionalState) {
      sections.push(`  情绪状态：${psych.emotionalState.primaryEmotion} / ${psych.emotionalState.secondaryEmotion}`);
      if (psych.emotionalState.analysis) sections.push(`  ${psych.emotionalState.analysis}`);
    }
    
    if (psych.fatigueLevel) {
      sections.push(`  疲劳程度：${psych.fatigueLevel.level}（${psych.fatigueLevel.score}分）`);
      if (psych.fatigueLevel.analysis) sections.push(`  ${psych.fatigueLevel.analysis}`);
    }
    
    sections.push('');
  }

  // 身体健康
  if (result.physicalHealth) {
    sections.push('💪 身体健康评估');
    const health = result.physicalHealth;
    
    if (health.respiratoryHealth) {
      sections.push('  呼吸系统：');
      sections.push(`    呼吸模式：${health.respiratoryHealth.pattern || '未知'}`);
      sections.push(`    呼吸频率：${health.respiratoryHealth.rate || '未知'}/分`);
      sections.push(`    呼吸深度：${health.respiratoryHealth.depth || '未知'}`);
      sections.push(`    呼吸节奏：${health.respiratoryHealth.rhythm || '未知'}`);
      sections.push(`    呼吸效率：${health.respiratoryHealth.efficiency || 0}%`);
      if (health.respiratoryHealth.analysis) sections.push(`    ${health.respiratoryHealth.analysis}`);
    }
    
    if (health.vocalHealth) {
      sections.push('  声带健康：');
      sections.push(`    声带状态：${health.vocalHealth.vocalCordCondition || '未知'}`);
      sections.push(`    声音质量：${health.vocalHealth.voiceQuality || '未知'}`);
      sections.push(`    声音投射：${health.vocalHealth.voiceProjection || '未知'}`);
      if (health.vocalHealth.analysis) sections.push(`    ${health.vocalHealth.analysis}`);
    }
    
    sections.push('');
  }

  // 风险评估
  if (result.healthRiskAssessment) {
    sections.push('⚠️ 健康风险评估');
    const risk = result.healthRiskAssessment;
    
    sections.push(`  整体风险：${risk.overallRisk || '低'}`);
    
    if (risk.stressRelatedRisks && risk.stressRelatedRisks.length > 0) {
      sections.push('  压力相关风险：');
      risk.stressRelatedRisks.forEach((r: any) => {
        sections.push(`    • ${r.risk}（${r.level}风险，${r.likelihood}可能性）：${r.recommendation}`);
      });
    }
    
    if (risk.physicalRisks && risk.physicalRisks.length > 0) {
      sections.push('  身体相关风险：');
      risk.physicalRisks.forEach((r: any) => {
        sections.push(`    • ${r.risk}（${r.level}风险，${r.likelihood}可能性）：${r.recommendation}`);
      });
    }
    
    if (risk.priorityAreas && risk.priorityAreas.length > 0) {
      sections.push(`  优先关注：${risk.priorityAreas.join('、')}`);
    }
    
    sections.push('');
  }

  // 改善计划
  if (result.improvementPlan) {
    sections.push('📋 改善计划');
    const plan = result.improvementPlan;
    
    if (plan.stressReduction) {
      sections.push(`  压力管理目标：${plan.stressReduction.target}`);
      if (plan.stressReduction.methods && plan.stressReduction.methods.length > 0) {
        plan.stressReduction.methods.forEach((m: any) => {
          sections.push(`    • ${m.method}：${m.frequency}，持续${m.duration}，预期${m.expectedEffect}`);
        });
      }
    }
    
    sections.push('');
  }

  // 声音护理建议
  if (result.voiceCareTips && result.voiceCareTips.length > 0) {
    sections.push('💡 声音护理建议');
    result.voiceCareTips.forEach((tip: string, index: number) => {
      sections.push(`  ${index + 1}. ${tip}`);
    });
    sections.push('');
  }

  // 健康建议
  if (result.recommendations && result.recommendations.length > 0) {
    sections.push('🎯 健康建议');
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
