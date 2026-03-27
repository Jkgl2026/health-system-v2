import { NextRequest, NextResponse } from 'next/server';

interface VoiceHealthRequest {
  audio: string; // base64 encoded audio
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
  voiceQuality: {
    clarity: number;
    volume: number;
    tone: number;
    rhythm: number;
  };
  healthIndicators: HealthIndicator[];
  riskAssessment: {
    respiratory: string;
    vocalCord: string;
    overall: string;
  };
  recommendations: Recommendation[];
  voiceCareTips: string[];
  summary: string;
  fullReport: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceHealthRequest = await request.json();
    const { audio, userInfo } = body;

    if (!audio) {
      return NextResponse.json(
        { error: '请提供音频数据' },
        { status: 400 }
      );
    }

    console.log('[VoiceHealth] 开始分析:', { name: userInfo.name, gender: userInfo.gender });

    // 这里需要使用音频分析功能
    // 暂时返回模拟数据
    const result: VoiceHealthResult = {
      overallScore: 85,
      healthStatus: 'good',
      voiceQuality: {
        clarity: 88,
        volume: 85,
        tone: 82,
        rhythm: 85,
      },
      healthIndicators: [
        {
          indicator: '呼吸均匀性',
          value: 90,
          status: 'normal',
          description: '呼吸节奏稳定，气息充足',
        },
        {
          indicator: '声带健康度',
          value: 85,
          status: 'normal',
          description: '声音清晰，无明显嘶哑',
        },
        {
          indicator: '声音稳定性',
          value: 82,
          status: 'normal',
          description: '音调稳定，无明显波动',
        },
      ],
      riskAssessment: {
        respiratory: '低风险',
        vocalCord: '低风险',
        overall: '健康状况良好',
      },
      recommendations: [
        {
          category: '日常护理',
          content: '保持充足水分摄入，每天饮水1.5-2升',
          priority: 'high',
        },
        {
          category: '发声技巧',
          content: '避免长时间大声喊叫，学会正确的发声方法',
          priority: 'medium',
        },
        {
          category: '生活习惯',
          content: '避免吸烟和过量饮酒，保持规律作息',
          priority: 'high',
        },
      ],
      voiceCareTips: [
        '每天保持足够的水分摄入，保持喉咙湿润',
        '避免长时间连续用嗓，适当休息',
        '学习腹式呼吸，提高气息支持',
        '注意保暖，避免冷空气直接刺激喉咙',
        '定期进行声带放松练习',
      ],
      summary: '声音健康状态良好，各项指标均在正常范围内。建议继续保持良好的用嗓习惯，注意日常护理。',
      fullReport: generateMockFullReport(userInfo),
      timestamp: new Date().toISOString(),
    };

    console.log('[VoiceHealth] 分析完成:', result.healthStatus);

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

function generateMockFullReport(userInfo: any): string {
  return `【声音健康评估报告】

受检者：${userInfo.name || '未填写'}
性别：${userInfo.gender || '未知'}
评估时间：${new Date().toLocaleString('zh-CN')}

【声音健康状态】良好
综合评分：85分

【声音质量分析】
- 清晰度：88分
- 音量：85分
- 音调：82分
- 节奏：85分

【健康指标】
- 呼吸均匀性：90分（正常）
- 声带健康度：85分（正常）
- 声音稳定性：82分（正常）

【风险评估】
- 呼吸系统风险：低风险
- 声带健康风险：低风险
- 整体健康风险：健康状况良好

【健康建议】
1. 保持充足水分摄入，每天饮水1.5-2升
2. 避免长时间大声喊叫，学会正确的发声方法
3. 避免吸烟和过量饮酒，保持规律作息

【声音护理建议】
- 每天保持足够的水分摄入，保持喉咙湿润
- 避免长时间连续用嗓，适当休息
- 学习腹式呼吸，提高气息支持
- 注意保暖，避免冷空气直接刺激喉咙
- 定期进行声带放松练习

【总结】
声音健康状态良好，各项指标均在正常范围内。建议继续保持良好的用嗓习惯，注意日常护理。
`;
}
