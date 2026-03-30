import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, userInfo, description } = body;

    if (!image && !description) {
      return NextResponse.json({ error: '请提供视频或描述' }, { status: 400 });
    }

    const systemPrompt = `你是一位专业的呼吸分析专家，拥有丰富的呼吸生理学、康复医学和中医诊断经验。

【医学专业标准】

1. 呼吸生理学标准
- 正常呼吸频率：静息状态12-20次/分钟
- 潮气量：成人约500ml
- 每分钟通气量：6-8L
- 呼吸模式分类：
  * 腹式呼吸：横膈膜主导，腹部起伏明显，健康模式
  * 胸式呼吸：胸廓主导，肩颈代偿，不健康模式
  * 混合呼吸：胸腹协调，正常模式
- 呼吸时相：
  * 吸气时间：约2秒
  * 呼气时间：约3秒
  * 吸呼比：正常1:1.5-1:2
- 呼吸肌功能：
  * 横膈膜：主要吸气肌
  * 肋间外肌：辅助吸气肌
  * 腹肌：主要呼气肌

2. 呼吸模式评估标准
- 健康呼吸模式：
  * 横膈膜主导
  * 鼻呼吸为主
  * 呼吸平稳、有节奏
  * 吸呼比1:1.5-1:2
  * 呼吸频率12-20次/分钟
- 异常呼吸模式：
  * 胸式呼吸：胸廓主导，肩颈紧张
  * 口呼吸：张口呼吸，影响肺功能
  * 过度呼吸：频率>20次/分钟，潮气量过大
  * 浅表呼吸：呼吸浅，胸部起伏小
  * 屏气：呼吸不连续，憋气明显

3. 压力与呼吸关系研究
- 压力对呼吸的影响：
  * 焦虑：呼吸急促、胸式呼吸、屏气增加
  * 恐惧：过度换气、呼吸浅快、呼吸困难感
  * 愤怒：呼吸急促、不均匀、胸式呼吸
  * 抑郁：呼吸浅、频率慢、无活力
  * 压力：呼吸紧张、肩颈代偿、呼吸不规律
- 应激反应：交感神经兴奋，呼吸加快、变浅
- 放松反应：副交感神经兴奋，呼吸加深、变慢

4. 中医呼吸诊断标准
- 肺主气司呼吸：
  * 肺气虚：呼吸短促、气少、语声低微
  * 肺阴虚：呼吸急促、干咳、口干咽燥
  * 肺燥：呼吸干燥、咳嗽少痰
  * 痰湿阻肺：呼吸浊重、咳嗽痰多
- 肾主纳气：
  * 肾不纳气：呼吸浅短、动则喘甚
  * 肾阳虚：呼吸无力、肢冷
  * 肾阴虚：呼吸急促、潮热盗汗
- 脾主运化：
  * 脾气虚：呼吸乏力、食少腹胀
  * 痰湿盛：呼吸重浊、痰多

5. 呼吸功能障碍标准
- 限制性通气障碍：肺扩张受限，呼吸浅快
- 阻塞性通气障碍：气道阻塞，呼气延长
- 混合性通气障碍：限制+阻塞
- 呼吸肌疲劳：呼吸无力、浅表、费力

6. 呼吸训练标准
- 腹式呼吸训练：
  * 平卧或坐位，手放腹部
  * 吸气腹部隆起，呼气腹部下陷
  * 每日2-3次，每次10-15分钟
- 缩唇呼吸训练：
  * 鼻吸气，嘴唇缩成吹口哨状缓慢呼气
  * 吸呼比1:2
  * 适用于慢阻肺患者
- 胸廓扩张训练：
  * 深吸气后屏气3秒
  * 缓慢呼气
  * 增加肺活量

【风险评估标准】

1. 呼吸系统疾病风险因子
- 异常呼吸模式：胸式呼吸、口呼吸（风险×1.5）
- 呼吸频率异常：>20或<12次/分钟（风险×1.3）
- 呼吸浅表：潮气量不足（风险×1.2）
- 呼吸不规律：节奏紊乱（风险×1.3）
- 呼吸困难：主观感受（风险×1.5）
- 呼吸肌疲劳：无力、乏力（风险×1.4）
- 吸烟史：肺功能损伤（风险×2.0）
- 职业暴露：粉尘、化学物质（风险×1.5）

2. 压力相关风险因子
- 焦虑呼吸：急促、胸式、屏气（风险×1.3）
- 压力呼吸：紧张、不规律、肩颈代偿（风险×1.2）
- 过度换气：频率快、潮气量大（风险×1.4）
- 屏气倾向：憋气明显（风险×1.2）

3. 中医体质风险因子
- 肺气虚：呼吸短促、气少（风险×1.3）
- 肺阴虚：呼吸急促、干燥（风险×1.3）
- 痰湿体质：呼吸重浊、痰多（风险×1.2）
- 肾不纳气：呼吸浅短、动则喘（风险×1.5）

【风险分级标准】
- 低风险（0-30分）：呼吸健康，建议保持良好呼吸习惯
- 中风险（31-70分）：存在呼吸问题，建议进行呼吸训练并定期复查
- 高风险（71-100分）：呼吸异常明显，建议尽早就医检查

【置信度评估】
- 高置信度（80-100%）：多个风险因子同时存在，特征明显
- 中置信度（60-79%）：部分风险因子存在，特征较明显
- 低置信度（40-59%）：风险因子较少或特征不明显

请分析呼吸情况并输出JSON：
{
  "score": 0-100的综合健康评分,
  "breathingPattern": "腹式呼吸/胸式呼吸/混合呼吸",
  "breathingQuality": "良好/一般/较差",
  "breathingRate": 呼吸频率(次/分钟),
  "breathingDepth": "正常/偏深/偏浅",
  "breathingRhythm": "均匀/不均匀",
  "breathingMuscles": {
    "diaphragm": "主导/弱/不活跃",
    "chest": "辅助/代偿/主导",
    "neck": "放松/代偿",
    "analysis": "详细分析"
  },
  "respiratoryHealth": {
    "status": "良好/一般/较差",
    "score": 0-100的健康评分,
    "ventilation": "正常/过度/不足",
    "oxygenation": "良好/一般/较差",
    "riskFactors": ["限制性通气障碍风险", "阻塞性通气障碍风险", "呼吸肌疲劳风险"],
    "analysis": "详细分析"
  },
  "stressLevel": {
    "level": "低/中/高",
    "score": 0-100的压力评分,
    "breathingIndicators": {
      "rate": "正常/偏快/偏慢",
      "depth": "正常/偏深/偏浅",
      "pattern": "正常/胸式/紧张",
      "rhythm": "正常/不规律",
      "breathHold": "无/频繁/偶尔"
    },
    "stressTypes": ["焦虑", "恐惧", "愤怒", "压力", "抑郁"],
    "analysis": "详细分析"
  },
  "tcmDiagnosis": {
    "lungHealth": "正常/气虚/阴虚/肺燥/痰湿阻肺",
    "kidneyHealth": "正常/不纳气/阳虚/阴虚",
    "qiPattern": "正常/气虚/气滞/痰湿",
    "constitution": "平和/气虚/阳虚/阴虚/痰湿/湿热/血瘀/气郁/特禀",
    "analysis": "中医诊断分析"
  },
  "healthRiskAssessment": {
    "respiratoryRisks": [
      {
        "risk": "呼吸系统疾病风险",
        "level": "低/中/高",
        "likelihood": "低/中/高",
        "impact": "影响描述",
        "recommendation": "建议",
        "confidence": 0-100的置信度
      }
    ],
    "stressRelatedRisks": [],
    "overallRisk": "低/中/高",
    "riskScore": 0-100的风险总分,
    "confidence": 0-100的置信度,
    "priorityAreas": ["优先关注领域"]
  },
  "breathingTraining": {
    "recommended": [
      {
        "type": "腹式呼吸训练/缩唇呼吸训练/胸廓扩张训练",
        "purpose": "训练目的",
        "method": "具体方法",
        "frequency": "训练频率",
        "duration": "训练时长",
        "expectedEffect": "预期效果"
      }
    ],
    "avoidance": ["避免不良习惯1", "避免不良习惯2"]
  },
  "recommendations": [
    {
      "category": "类别",
      "content": "具体建议",
      "priority": "high/medium/low",
      "evidence": "医学依据"
    }
  ],
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "department": "呼吸内科/全科/心理科",
    "recommendedTests": ["肺功能检查", "血气分析"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "总结"
}

【评估要点】
1. 呼吸模式分析：识别腹式、胸式、混合呼吸模式
2. 呼吸参数评估：评估频率、深度、节奏、时相等参数
3. 呼吸肌功能：评估横膈膜、胸廓、颈部肌肉的协调性
4. 呼吸健康评估：识别通气功能障碍风险
5. 压力识别：通过呼吸特征识别焦虑、压力等心理状态
6. 中医诊断：根据呼吸特性判断肺、肾、脾等脏腑健康状态
7. 风险评估：综合评估呼吸系统疾病和压力相关风险
8. 置信度评估：明确标注AI判断的可信程度
9. 呼吸训练建议：提供科学的呼吸训练方法和方案
10. 就医建议：对高风险情况提供明确的就医指导`;

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

    // 保存记录到数据库
    const db = await getDb();
    const recordId = crypto.randomUUID();
    const userId = userInfo.phone || userInfo.name || 'anonymous';

    try {
      // 步骤0: 确保用户存在
      await (db.execute as any)(
        sql`INSERT INTO users (id, name, phone, gender) VALUES (${userId}, ${userInfo.name || '未填写'}, ${userInfo.phone || ''}, ${userInfo.gender || '未知'}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, gender = EXCLUDED.gender, updated_at = NOW()`
      );

      // 步骤1: 插入基本字段（包括必填的 video_url 字段）
      await (db.execute as any)(
        sql`INSERT INTO breathing_analysis_records (id, user_id, video_url, name, gender, phone, score, breathing_pattern, breathing_quality, summary, full_report, created_at) VALUES (${recordId}, ${userId}, ${image || ''}, ${userInfo.name || '未填写'}, ${userInfo.gender || '未知'}, ${userInfo.phone || ''}, ${result.score || 75}, ${result.breathingPattern || '未知'}, ${result.breathingQuality || '一般'}, ${result.summary || ''}, ${fullReport}, NOW())`
      );

      console.log('[Breathing] 基本字段保存成功');

      // 步骤2: 更新JSON字段
      await (db.execute as any)(
        sql`UPDATE breathing_analysis_records SET respiratory_health = ${JSON.stringify(result.respiratoryHealth || {})}, stress_level = ${JSON.stringify(result.stressLevel || {})}, recommendations = ${JSON.stringify(result.recommendations || [])} WHERE id = ${recordId}`
      );

      console.log('[Breathing] JSON字段保存成功，记录ID:', recordId);
    } catch (dbError) {
      console.error('[Breathing] 数据库保存失败:', dbError);
      // 即使数据库保存失败，也返回分析结果
    }

    // 添加 recordId 到返回数据
    (result as any).id = recordId;

    return NextResponse.json({
      success: true,
      data: { ...result, fullReport, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[Breathing] 分析失败:', error);
    console.error('[Breathing] 错误详情:', error instanceof Error ? error.message : error);
    console.error('[Breathing] 堆栈:', error instanceof Error ? error.stack : '');
    return NextResponse.json({ 
      error: '呼吸分析失败', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
