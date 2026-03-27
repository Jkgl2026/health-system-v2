import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, imageType, userInfo } = body;

    if (!image) {
      return NextResponse.json({ error: '请上传眼部照片' }, { status: 400 });
    }

    const imageUrl = image.startsWith('data:image/') ? image : `data:image/jpeg;base64,${image}`;
    
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位专业的眼部健康专家，请分析眼部照片并输出JSON：
{
  "score": 0-100,
  "scleraAnalysis": {"color": "正常", "vascular": "正常", "score": 0-100},
  "darkCircles": {"presence": false, "severity": "无"},
  "eyeBags": {"presence": false, "severity": "无"},
  "eyeFatigue": {"severity": "无", "score": 0-100},
  "liverHealth": {"status": "良好", "score": 0-100},
  "circulatoryHealth": {"status": "良好", "score": 0-100},
  "sleepQuality": {"status": "良好", "score": 0-100},
  "recommendations": ["建议1", "建议2"],
  "summary": "总结"
}`;

    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请分析这张眼部照片：' },
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
        sql`INSERT INTO eye_health_records (id, user_id, image_url, name, gender, phone, score, summary, full_report, created_at) VALUES (${recordId}, ${userId}, ${image || ''}, ${userInfo.name || '未填写'}, ${userInfo.gender || '未知'}, ${userInfo.phone || ''}, ${result.score || 75}, ${result.summary || ''}, ${fullReport}, NOW())`
      );

      console.log('[EyeHealth] 基本字段保存成功');

      // 步骤2: 更新JSON字段
      await (db.execute as any)(
        sql`UPDATE eye_health_records SET sclera_analysis = ${JSON.stringify(result.scleraAnalysis || {})}, dark_circles = ${JSON.stringify(result.darkCircles || {})}, eye_bags = ${JSON.stringify(result.eyeBags || {})}, eye_fatigue = ${JSON.stringify(result.eyeFatigue || {})}, liver_health = ${JSON.stringify(result.liverHealth || {})}, circulatory_health = ${JSON.stringify(result.circulatoryHealth || {})}, sleep_quality = ${JSON.stringify(result.sleepQuality || {})}, recommendations = ${JSON.stringify(result.recommendations || [])} WHERE id = ${recordId}`
      );

      console.log('[EyeHealth] JSON字段保存成功，记录ID:', recordId);
    } catch (dbError) {
      console.error('[EyeHealth] 数据库保存失败:', dbError);
      // 即使数据库保存失败，也返回分析结果
    }

    // 添加 recordId 到返回数据
    (result as any).id = recordId;

    return NextResponse.json({
      success: true,
      data: { ...result, fullReport, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[EyeHealth] 分析失败:', error);
    return NextResponse.json({ error: '眼部健康分析失败' }, { status: 500 });
  }
}

function generateReport(result: any, userInfo: any): string {
  const sections = [];
  sections.push('【眼部健康评估报告】\n');
  sections.push(`受检者：${userInfo.name || '未填写'}`);
  sections.push(`评估时间：${new Date().toLocaleString('zh-CN')}`);
  sections.push('');

  if (result.score) sections.push(`📊 综合评分：${result.score}分\n`);

  if (result.scleraAnalysis) {
    sections.push('👁️ 眼白分析');
    sections.push(`  颜色：${result.scleraAnalysis.color}`);
    sections.push(`  血管：${result.scleraAnalysis.vascular}`);
    sections.push(`  评分：${result.scleraAnalysis.score}分\n`);
  }

  if (result.darkCircles) sections.push(`🌑 黑眼圈：${result.darkCircles.severity}\n`);
  if (result.eyeBags) sections.push(`👜 眼袋：${result.eyeBags.severity}\n`);
  if (result.eyeFatigue) sections.push(`😴 眼部疲劳：${result.eyeFatigue.severity}（${result.eyeFatigue.score}分）\n`);

  if (result.liverHealth) sections.push(`💚 肝脏健康：${result.liverHealth.status}（${result.liverHealth.score}分）\n`);
  if (result.circulatoryHealth) sections.push(`🩸 循环健康：${result.circulatoryHealth.status}（${result.circulatoryHealth.score}分）\n`);
  if (result.sleepQuality) sections.push(`😴 睡眠质量：${result.sleepQuality.status}（${result.sleepQuality.score}分）\n`);

  if (result.recommendations) {
    sections.push('💡 护眼建议');
    result.recommendations.forEach((rec: string, i: number) => {
      sections.push(`  ${i + 1}. ${rec}`);
    });
    sections.push('');
  }

  if (result.summary) sections.push(`📝 总结：${result.summary}`);

  return sections.join('\n');
}
