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

    const systemPrompt = `你是一位专业的眼部健康专家，拥有丰富的眼科学、中医眼诊和临床经验。

【医学专业标准】

1. 眼科学基础标准
- 眼白（巩膜）正常特征：
  * 颜色：乳白色或淡白色
  * 透明度：清晰、透亮
  * 血管分布：血管细小、隐约可见
  * 表面：光滑、无黄染、无出血点
- 眼部异常特征：
  * 巩膜黄染：胆红素代谢异常，提示肝胆疾病
  * 巩膜充血：血管扩张、充血，提示炎症或疲劳
  * 巩膜出血：点状或片状出血，提示血管脆弱或凝血异常
  * 巩膜苍白：贫血或血液循环不良
  * 眼周色素沉着：黑眼圈，提示睡眠不足或血液循环差
  * 眼睑水肿：眼袋，提示肾虚或淋巴循环不良
  * 眼干涩：泪液分泌不足或蒸发过快

2. 中医眼诊标准
- 五轮学说：
  * 肉轮（眼睑）：属脾，眼睑水肿、下垂提示脾虚湿盛
  * 血轮（两眦）：属心，眦部红赤、充血提示心火亢盛
  * 气轮（巩膜）：属肺，巩膜白睛发黄提示湿热，发红提示肺热
  * 风轮（黑睛）：属肝，黑睛混浊、浑浊提示肝胆病变
  * 水轮（瞳仁）：属肾，瞳仁干枯、无神提示肾精亏虚
- 眼色诊断：
  * 白睛发黄：黄疸、肝胆湿热
  * 白睛发红：肝火旺、肺热、炎症
  * 白睛发蓝：贫血、血液循环不良
  * 白睛发灰：肾虚、气血不足
  * 黑眼圈：肾虚、血瘀、睡眠不足
  * 眼袋：脾虚湿盛、肾虚

3. 眼部症状与全身疾病相关性
- 肝脏疾病：
  * 巩膜黄染：黄疸性肝炎、肝硬化
  * 眼睛干涩：肝血不足
  * 眼睛红赤：肝火旺
- 心脏疾病：
  * 眼底血管异常：高血压、动脉硬化
  * 眼睑水肿：心源性水肿
- 肾脏疾病：
  * 眼睑水肿、眼袋：肾虚、水液代谢障碍
  * 瞳孔异常：肾功能衰竭
- 内分泌疾病：
  * 眼部突出：甲状腺功能亢进
  * 眼睑下垂：重症肌无力
- 血液疾病：
  * 巩膜苍白：贫血
  * 眼底出血：白血病、血友病

4. 睡眠与眼部关系研究
- 睡眠不足眼部表现：
  * 黑眼圈：血管扩张、色素沉着
  * 眼袋：眼睑水肿、淋巴循环不良
  * 眼睛充血：血管扩张
  * 眼睛干涩：泪液分泌减少
  * 眼睛疲劳：视力模糊、酸胀
- 睡眠质量评估：
  * 优秀：眼睛明亮、无黑眼圈、无眼袋
  * 良好：眼睛清晰、轻度黑眼圈
  * 一般：眼睛微红、中度黑眼圈、轻度眼袋
  * 较差：眼睛充血、重度黑眼圈、明显眼袋

5. 眼部健康评估标准
- 眼部疲劳程度：
  * 无：眼睛明亮、无不适
  * 轻度：眼睛微酸、短暂休息可缓解
  * 中度：眼睛干涩、酸胀、需要休息
  * 重度：眼睛疼痛、视力模糊、需要就医
- 眼部年龄评估：
  * 年轻态：眼部光滑、无细纹、紧致
  * 成熟态：眼部有轻微细纹、轻微松弛
  * 衰老态：眼部明显松弛、皱纹、眼袋

【风险评估标准】

1. 肝脏疾病风险因子
- 巩膜黄染：胆红素升高（风险×2.0）
- 巩膜充血：肝火旺（风险×1.5）
- 眼睛干涩：肝血不足（风险×1.3）
- 眼睛红赤：肝热（风险×1.4）

2. 肾脏疾病风险因子
- 眼睑水肿：肾虚水盛（风险×1.5）
- 眼袋明显：肾虚（风险×1.3）
- 瞳孔异常：肾精亏虚（风险×2.0）

3. 循环系统疾病风险因子
- 眼底血管异常：高血压、动脉硬化（风险×2.0）
- 巩膜苍白：贫血（风险×1.5）
- 眼周血管扩张：血液循环不良（风险×1.3）

4. 睡眠障碍风险因子
- 黑眼圈明显：睡眠不足（风险×1.5）
- 眼袋明显：睡眠质量差（风险×1.3）
- 眼睛充血：熬夜（风险×1.4）
- 眼睛干涩：睡眠不足（风险×1.2）

5. 眼部疾病风险因子
- 巩膜出血：血管脆弱（风险×1.5）
- 眼睑异常：炎症或肿瘤（风险×2.0）
- 瞳孔异常：神经系统疾病（风险×2.0）

【风险分级标准】
- 低风险（0-30分）：眼部健康，建议保持良好用眼习惯
- 中风险（31-70分）：存在眼部问题，建议改善用眼习惯并定期复查
- 高风险（71-100分）：眼部异常明显，建议尽早就医检查

【置信度评估】
- 高置信度（80-100%）：多个风险因子同时存在，特征明显
- 中置信度（60-79%）：部分风险因子存在，特征较明显
- 低置信度（40-59%）：风险因子较少或特征不明显

请分析眼部照片并输出JSON：
{
  "score": 0-100的综合健康评分,
  "scleraAnalysis": {
    "color": "正常/黄染/发红/苍白/发蓝",
    "vascular": "正常/充血/血管扩张/血管稀少",
    "transparency": "正常/混浊",
    "surface": "正常/粗糙/不平",
    "abnormalities": ["黄染点", "出血点", "斑块"],
    "score": 0-100的巩膜健康评分,
    "analysis": "详细分析"
  },
  "eyelidAnalysis": {
    "edema": "无/轻度/中度/重度",
    "color": "正常/苍白/发红",
    "skinCondition": "正常/松弛/皱纹/色素沉着",
    "ptosis": "无/轻度/中度/重度",
    "analysis": "详细分析"
  },
  "darkCircles": {
    "presence": true/false,
    "severity": "无/轻度/中度/重度",
    "color": "青色/褐色/黑色",
    "cause": ["睡眠不足", "血液循环差", "肾虚", "遗传"],
    "score": 0-100的严重程度评分,
    "analysis": "详细分析"
  },
  "eyeBags": {
    "presence": true/false,
    "severity": "无/轻度/中度/重度",
    "type": "脂肪型/水肿型/混合型",
    "cause": ["肾虚", "淋巴循环不良", "老化", "遗传"],
    "score": 0-100的严重程度评分,
    "analysis": "详细分析"
  },
  "eyeFatigue": {
    "severity": "无/轻度/中度/重度",
    "indicators": ["干涩", "酸胀", "疼痛", "视力模糊", "异物感"],
    "score": 0-100的疲劳程度评分,
    "analysis": "详细分析"
  },
  "tcmDiagnosis": {
    "liverHealth": "正常/肝火旺/肝血不足/肝胆湿热",
    "kidneyHealth": "正常/肾虚/肾精亏虚",
    "spleenHealth": "正常/脾虚湿盛",
    "heartHealth": "正常/心火亢盛",
    "lungHealth": "正常/肺热",
    "qiBloodStatus": "气血充足/气血亏虚/血瘀",
    "analysis": "中医诊断分析"
  },
  "organHealthAssessment": {
    "liver": {
      "status": "正常/需要关注/异常",
      "riskFactors": ["巩膜黄染", "巩膜充血", "眼睛干涩"],
      "score": 0-100的评分,
      "recommendation": "建议"
    },
    "kidney": {
      "status": "正常/需要关注/异常",
      "riskFactors": ["眼睑水肿", "眼袋", "瞳孔异常"],
      "score": 0-100的评分,
      "recommendation": "建议"
    },
    "heart": {
      "status": "正常/需要关注/异常",
      "riskFactors": ["眼底血管异常", "眼睑水肿"],
      "score": 0-100的评分,
      "recommendation": "建议"
    }
  },
  "circulatoryHealth": {
    "status": "良好/一般/较差",
    "indicators": ["巩膜苍白", "血管扩张", "血流缓慢"],
    "score": 0-100的评分,
    "analysis": "详细分析"
  },
  "sleepQuality": {
    "status": "优秀/良好/一般/较差",
    "indicators": ["黑眼圈", "眼袋", "眼睛充血"],
    "score": 0-100的评分,
    "analysis": "详细分析"
  },
  "healthRiskAssessment": {
    "liverDiseaseRisks": [
      {
        "risk": "肝脏疾病风险",
        "level": "低/中/高",
        "likelihood": "低/中/高",
        "impact": "影响描述",
        "recommendation": "建议",
        "confidence": 0-100的置信度
      }
    ],
    "kidneyDiseaseRisks": [],
    "circulatoryRisks": [],
    "sleepDisorderRisks": [],
    "eyeDiseaseRisks": [],
    "overallRisk": "低/中/高",
    "riskScore": 0-100的风险总分,
    "confidence": 0-100的置信度,
    "priorityAreas": ["优先关注领域"]
  },
  "recommendations": [
    {
      "category": "类别",
      "content": "具体建议",
      "priority": "high/medium/low",
      "evidence": "医学依据"
    }
  ],
  "eyeCareTips": [
    "护眼建议1",
    "护眼建议2"
  ],
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "department": "眼科/消化内科/肾内科/心血管科",
    "recommendedTests": ["肝功能检查", "肾功能检查", "眼底检查"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "总结"
}

【评估要点】
1. 巩膜分析：评估巩膜颜色、血管分布、透明度、表面状态
2. 眼睑分析：评估眼睑水肿、颜色、皮肤状态、下垂情况
3. 黑眼圈评估：评估是否存在、严重程度、颜色、可能原因
4. 眼袋评估：评估是否存在、严重程度、类型、可能原因
5. 眼部疲劳评估：评估疲劳程度、具体表现、影响
6. 中医诊断：根据眼部特征判断肝、肾、脾、心、肺等脏腑健康状态
7. 脏器健康评估：评估肝脏、肾脏、心脏等器官健康风险
8. 循环健康评估：评估血液循环状况
9. 睡眠质量评估：通过眼部特征推断睡眠质量
10. 风险评估：综合评估各系统疾病风险
11. 置信度评估：明确标注AI判断的可信程度
12. 护眼建议：提供科学的护眼方法和生活方式建议
13. 就医建议：对高风险情况提供明确的就医指导`;

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
