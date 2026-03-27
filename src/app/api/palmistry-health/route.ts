import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, imageType, userInfo } = body;

    if (!image) {
      return NextResponse.json({ error: '请上传手掌照片' }, { status: 400 });
    }

    const imageUrl = image.startsWith('data:image/') ? image : `data:image/jpeg;base64,${image}`;
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的手相专家，请分析手掌照片并输出JSON格式的结果：
{
  "score": 0-100,
  "constitution": "主要体质",
  "organHealth": {
    "heart": {"status": "良好", "score": 0-100},
    "liver": {"status": "良好", "score": 0-100},
    "spleen": {"status": "良好", "score": 0-100},
    "lung": {"status": "良好", "score": 0-100},
    "kidney": {"status": "良好", "score": 0-100}
  },
  "longevityAssessment": {"status": "长寿", "score": 0-100},
  "healthTrends": [{"area": "领域", "risk": "风险等级"}],
  "recommendations": ["建议1", "建议2"],
  "summary": "总结"
}`;

    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请分析这张手掌照片：' },
          { type: 'image_url' as const, image_url: { url: imageUrl, detail: 'high' as const } },
        ],
      },
    ], { model: 'doubao-seed-1-6-vision-250815', temperature: 0.3 });

    let result: any;
    try {
      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      result = { score: 75, summary: response.content };
    }

    const fullReport = generateReport(result, userInfo);

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
        sql`INSERT INTO palmistry_records (id, user_id, image_url, name, gender, phone, image_type, score, constitution, summary, full_report, created_at) VALUES (${recordId}, ${userId}, ${image || ''}, ${userInfo.name || '未填写'}, ${userInfo.gender || '未知'}, ${userInfo.phone || ''}, ${imageType || 'palm'}, ${result.score || 75}, ${result.constitution || '未知'}, ${result.summary || ''}, ${fullReport}, NOW())`
      );

      console.log('[Palmistry] 基本字段保存成功');

      // 步骤2: 更新JSON字段
      await (db.execute as any)(
        sql`UPDATE palmistry_records SET organ_health = ${JSON.stringify(result.organHealth || {})}, longevity_assessment = ${JSON.stringify(result.longevityAssessment || {})}, health_trends = ${JSON.stringify(result.healthTrends || [])}, recommendations = ${JSON.stringify(result.recommendations || [])} WHERE id = ${recordId}`
      );

      console.log('[Palmistry] JSON字段保存成功，记录ID:', recordId);
    } catch (dbError) {
      console.error('[Palmistry] 数据库保存失败:', dbError);
      // 即使数据库保存失败，也返回分析结果
    }

    // 添加 recordId 到返回数据
    (result as any).id = recordId;

    return NextResponse.json({
      success: true,
      data: { ...result, fullReport, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Palmistry] 分析失败:', error);
    return NextResponse.json(
      { error: '手相分析失败' },
      { status: 500 }
    );
  }
}

function generateReport(result: any, userInfo: any): string {
  const sections = [];
  sections.push('【手相健康评估报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`评估时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  if (result.score) sections.push(`📊 综合评分：${result.score}分\n`);
  if (result.constitution) sections.push(`🏷️ 体质类型：${result.constitution}\n`);

  if (result.organHealth) {
    sections.push('💚 五脏健康状态');
    sections.push(`  心：${result.organHealth.heart?.status}（${result.organHealth.heart?.score}分）`);
    sections.push(`  肝：${result.organHealth.liver?.status}（${result.organHealth.liver?.score}分）`);
    sections.push(`  脾：${result.organHealth.spleen?.status}（${result.organHealth.spleen?.score}分）`);
    sections.push(`  肺：${result.organHealth.lung?.status}（${result.organHealth.lung?.score}分）`);
    sections.push(`  肾：${result.organHealth.kidney?.status}（${result.organHealth.kidney?.score}分）`);
    sections.push('');
  }

  if (result.longevityAssessment) {
    sections.push(`🌟 长寿评估：${result.longevityAssessment.status}（${result.longevityAssessment.score}分）\n`);
  }

  if (result.recommendations) {
    sections.push('💡 健康建议');
    result.recommendations.forEach((rec: string, i: number) => {
      sections.push(`  ${i + 1}. ${rec}`);
    });
    sections.push('');
  }

  if (result.summary) sections.push(`📝 总结：${result.summary}`);

  return sections.join('\n');
}
