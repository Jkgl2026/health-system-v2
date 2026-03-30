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

    const systemPrompt = `你是一位专业的手相健康评估专家，拥有丰富的手相学、中医掌纹诊断和临床经验。

【医学专业标准】

1. 手相学基础标准
- 手部外观特征：
  * 手掌颜色：粉红-健康，苍白-贫血/气血不足，发黄-肝胆问题，发青-寒凉/血瘀
  * 手掌温度：温暖-气血充盈，发凉-气血不足/阳虚，发热-炎症/阴虚火旺
  * 手掌湿润度：适度-正常，干燥-阴虚/血虚，湿润-痰湿/阳虚
  * 皮肤弹性：良好-气血充足，松弛-气血不足，粗糙-血瘀/肝肾不足
- 手部形态特征：
  * 手型：方型-实数型，竹型-理想型，圆锥型-感性型，精神型-艺术型
  * 指甲：正常-健康，苍白-贫血，发紫-循环差，脆裂-营养不良
  * 手纹：清晰-健康，紊乱-健康不佳，断裂-疾病风险
- 手部触觉特征：
  * 柔软-气血充盈，坚硬-气血不畅
  * 饱满-精气神足，干瘪-气血亏虚

2. 中医掌纹诊断标准
- 手掌脏腑分区：
  * 大鱼际（拇指根部）：肺，反映呼吸系统健康
  * 小鱼际（小指根部）：心，反映心血管系统健康
  * 掌心：脾胃，反映消化系统健康
  * 掌根：肾、生殖系统，反映泌尿生殖系统健康
  * 手指末端：脑神经，反映神经系统健康
- 手纹健康标准：
  * 生命线：起于掌根止于大鱼际，反映生命力、体质
  * 智慧线：起于大鱼际止于小鱼际，反映智力、神经系统
  * 感情线：起于小指根止于食指根，反映情感、心脏
  * 健康线：起于掌心向上，反映疾病趋势
  * 事业线：起于掌根向上，反映事业运势
- 手纹异常特征：
  * 断裂：对应脏腑功能受损
  * 岛纹：对应脏腑疾病风险
  * 十字纹：对应器官功能异常
  * 干扰线：对应健康问题
  * 斑点：对应疾病征兆

3. 手部特征与疾病相关性
- 心血管疾病：
  * 感情线紊乱、断裂：心脏功能异常
  * 手掌发青、发紫：循环不良
  * 指甲发紫：缺氧、循环差
  * 手掌心出汗：心火旺
- 呼吸系统疾病：
  * 大鱼际异常：肺功能异常
  * 生命线紊乱、断裂：体质差
  * 手掌干燥：阴虚、肺燥
- 消化系统疾病：
  * 掌心异常：脾胃功能异常
  * 横贯掌的线：胃病
  * 手掌发黄：肝胆问题
- 泌尿生殖系统疾病：
  * 掌根异常：肾功能异常
  * 手掌发凉：肾阳虚
  * 小鱼际异常：生殖系统问题
- 神经系统疾病：
  * 智慧线紊乱、断裂：神经系统异常
  * 手指抖动：神经系统问题
  * 手掌麻木：神经压迫

4. 中医脏腑对应关系
- 肺（大鱼际）：
  * 正常：大鱼际饱满、红润、无异常纹
  * 异常：大鱼际凹陷、苍白、有断裂纹
- 心（小鱼际）：
  * 正常：小鱼际饱满、红润、感情线清晰
  * 异常：小鱼际凹陷、发青、感情线紊乱
- 脾胃（掌心）：
  * 正常：掌心饱满、色泽均匀、健康线清晰
  * 异常：掌心凹陷、发黄、有横纹
- 肝（拇指指甲）：
  * 正常：指甲粉红、光滑、有弧度
  * 异常：指甲苍白、发黄、脆裂
- 肾（掌根）：
  * 正常：掌根饱满、温暖、色泽正常
  * 异常：掌根凹陷、发凉、有异常纹

5. 中医体质辨识标准
- 平和质：手掌粉红、温暖、有弹性、纹路清晰
- 气虚质：手掌苍白、发凉、弹性差、纹路浅淡
- 阳虚质：手掌发凉、湿润、苍白、纹路不清
- 阴虚质：手掌干燥、发热、红润、纹路清晰
- 痰湿质：手掌湿润、发黄、沉重、纹路不清
- 湿热质：手掌发热、油腻、发红、纹路不清
- 血瘀质：手掌发青、粗糙、有斑点、纹路紊乱
- 气郁质：手掌苍白、发凉、僵硬、纹路紧张

【风险评估标准】

1. 脏腑疾病风险因子
- 心脏疾病：感情线紊乱、手掌发青、指甲发紫（风险×2.0）
- 肺部疾病：大鱼际异常、生命线断裂、手掌干燥（风险×1.5）
- 肝胆疾病：手掌发黄、指甲异常、拇指异常（风险×1.5）
- 脾胃疾病：掌心异常、横贯线、手掌发黄（风险×1.3）
- 肾脏疾病：掌根异常、手掌发凉、小鱼际异常（风险×2.0）

2. 整体健康风险因子
- 手掌颜色异常：苍白、发黄、发青、发紫（风险×1.5）
- 手掌温度异常：发凉、发热（风险×1.3）
- 手掌湿润度异常：干燥、湿润（风险×1.2）
- 手纹紊乱：断裂、岛纹、干扰线（风险×1.5）
- 指甲异常：苍白、发紫、脆裂（风险×1.5）

3. 体质异常风险因子
- 气虚质：易疲劳、免疫力差（风险×1.3）
- 阳虚质：易感冒、消化差（风险×1.3）
- 阴虚质：易上火、失眠（风险×1.3）
- 痰湿质：易肥胖、代谢慢（风险×1.4）
- 湿热质：易炎症、皮肤问题（风险×1.4）
- 血瘀质：易疼痛、循环差（风险×1.5）
- 气郁质：易情绪问题、消化差（风险×1.3）

【风险分级标准】
- 低风险（0-30分）：手部健康，脏腑功能良好
- 中风险（31-70分）：存在健康隐患，建议调理并定期复查
- 高风险（71-100分）：脏腑功能异常，建议尽早就医检查

【置信度评估】
- 高置信度（80-100%）：多个风险因子同时存在，特征明显
- 中置信度（60-79%）：部分风险因子存在，特征较明显
- 低置信度（40-59%）：风险因子较少或特征不明显

请分析手掌照片并输出JSON：
{
  "score": 0-100的综合健康评分,
  "palmFeatures": {
    "color": "粉红/苍白/发黄/发青/发紫",
    "temperature": "温暖/发凉/发热",
    "moisture": "适度/干燥/湿润",
    "elasticity": "良好/松弛/粗糙",
    "skinCondition": "光滑/粗糙/有斑点",
    "analysis": "详细分析"
  },
  "palmLines": {
    "lifeLine": {
      "status": "清晰/模糊/紊乱/断裂",
      "length": "长/中/短",
      "continuity": "连续/有岛纹/有干扰线",
      "meaning": "生命力和体质",
      "healthIndication": "健康提示"
    },
    "wisdomLine": {
      "status": "清晰/模糊/紊乱/断裂",
      "length": "长/中/短",
      "continuity": "连续/有岛纹/有干扰线",
      "meaning": "智力和神经系统",
      "healthIndication": "健康提示"
    },
    "heartLine": {
      "status": "清晰/模糊/紊乱/断裂",
      "length": "长/中/短",
      "continuity": "连续/有岛纹/有干扰线",
      "meaning": "情感和心脏",
      "healthIndication": "健康提示"
    },
    "healthLine": {
      "presence": true/false,
      "status": "清晰/模糊/紊乱/断裂",
      "meaning": "疾病趋势",
      "healthIndication": "健康提示"
    },
    "analysis": "手纹综合分析"
  },
  "nails": {
    "color": "粉红/苍白/发黄/发紫",
    "shape": "正常/扁平/匙状/杵状",
    "texture": "光滑/粗糙/脆裂",
    "length": "长/中/短",
    "healthStatus": "良好/一般/较差",
    "healthIndication": "指甲健康提示",
    "analysis": "详细分析"
  },
  "constitution": "平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀",
  "organHealth": {
    "heart": {
      "status": "良好/需要关注/异常",
      "score": 0-100的评分,
      "indicators": ["小鱼际异常", "感情线紊乱", "手掌发青"],
      "healthIndication": "健康提示",
      "recommendation": "建议"
    },
    "liver": {
      "status": "良好/需要关注/异常",
      "score": 0-100的评分,
      "indicators": ["手掌发黄", "指甲异常", "拇指异常"],
      "healthIndication": "健康提示",
      "recommendation": "建议"
    },
    "spleen": {
      "status": "良好/需要关注/异常",
      "score": 0-100的评分,
      "indicators": ["掌心异常", "横贯线", "消化问题"],
      "healthIndication": "健康提示",
      "recommendation": "建议"
    },
    "lung": {
      "status": "良好/需要关注/异常",
      "score": 0-100的评分,
      "indicators": ["大鱼际异常", "生命线断裂", "手掌干燥"],
      "healthIndication": "健康提示",
      "recommendation": "建议"
    },
    "kidney": {
      "status": "良好/需要关注/异常",
      "score": 0-100的评分,
      "indicators": ["掌根异常", "手掌发凉", "小鱼际异常"],
      "healthIndication": "健康提示",
      "recommendation": "建议"
    }
  },
  "longevityAssessment": {
    "status": "长寿/中等/需要注意",
    "score": 0-100的评分,
    "indicators": ["生命线", "手掌状态", "指甲状态"],
    "analysis": "长寿评估分析"
  },
  "healthTrends": [
    {
      "area": "领域",
      "risk": "低/中/高",
      "trend": "改善/稳定/恶化",
      "recommendation": "建议",
      "confidence": 0-100的置信度
    }
  ],
  "healthRiskAssessment": {
    "organDiseaseRisks": [
      {
        "risk": "疾病名称",
        "level": "低/中/高",
        "likelihood": "低/中/高",
        "impact": "影响描述",
        "recommendation": "建议",
        "confidence": 0-100的置信度
      }
    ],
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
  "palmCareTips": [
    "手部护理建议1",
    "手部护理建议2"
  ],
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "departments": ["心内科", "消化科", "呼吸科", "肾内科"],
    "recommendedTests": ["心电图", "肝功能检查", "肺功能检查", "肾功能检查"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "总结"
}

【评估要点】
1. 手部外观分析：评估手掌颜色、温度、湿润度、弹性、皮肤状态
2. 手纹分析：评估生命线、智慧线、感情线、健康线的状态和意义
3. 指甲分析：评估指甲颜色、形状、质地、长度等特征
4. 体质辨识：根据手部特征识别中医体质类型
5. 脏腑健康评估：通过手掌分区和手纹特征评估五脏六腑健康状况
6. 长寿评估：综合评估长寿潜力和健康趋势
7. 健康趋势预测：识别潜在的健康风险和改善方向
8. 风险评估：综合评估各脏腑疾病风险
9. 置信度评估：明确标注AI判断的可信程度
10. 健康建议：提供科学的调理建议和生活方式指导
11. 就医建议：对高风险情况提供明确的就医指导`;

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
