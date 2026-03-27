import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, userInfo, description } = body;

    if (!image && !description) {
      return NextResponse.json({ error: '请提供视频或描述' }, { status: 400 });
    }

    const systemPrompt = `你是一位专业的呼吸分析专家，请分析呼吸情况并输出JSON：
{
  "score": 0-100,
  "breathingPattern": "腹式/胸式/混合",
  "breathingQuality": "良好/一般/较差",
  "respiratoryHealth": {"status": "良好", "score": 0-100},
  "stressLevel": {"level": "低/中/高", "score": 0-100},
  "recommendations": ["建议1", "建议2"],
  "summary": "总结"
}`;

    let content = '';
    if (description) {
      content = `呼吸情况描述：${description}`;
    } else {
      content = '请分析呼吸视频';
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: content },
    ], { model: 'doubao-seed-1-6-vision-250815', temperature: 0.3 });

    let result: any;
    try {
      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      result = { score: 75, summary: response.content };
    }

    const fullReport = generateReport(result, userInfo);

    return NextResponse.json({
      success: true,
      data: { ...result, fullReport, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Breathing] 分析失败:', error);
    return NextResponse.json({ error: '呼吸分析失败' }, { status: 500 });
  }
}

function generateReport(result: any, userInfo: any): string {
  const sections = [];
  sections.push('【呼吸分析报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`评估时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  if (result.score) sections.push(`📊 综合评分：${result.score}分\n`);
  if (result.breathingPattern) sections.push(`🌬️ 呼吸模式：${result.breathingPattern}\n`);
  if (result.breathingQuality) sections.push(`✨ 呼吸质量：${result.breathingQuality}\n`);
  if (result.respiratoryHealth) sections.push(`💚 呼吸健康：${result.respiratoryHealth.status}（${result.respiratoryHealth.score}分）\n`);
  if (result.stressLevel) sections.push(`🧠 压力水平：${result.stressLevel.level}（${result.stressLevel.score}分）\n`);

  if (result.recommendations) {
    sections.push('💡 建议');
    result.recommendations.forEach((rec: string, i: number) => {
      sections.push(`  ${i + 1}. ${rec}`);
    });
    sections.push('');
  }

  if (result.summary) sections.push(`📝 总结：${result.summary}`);

  return sections.join('\n');
}
