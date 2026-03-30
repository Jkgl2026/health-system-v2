import { NextRequest, NextResponse } from 'next/server';
import { getDb, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userInfo } = body;

    if (!userId) {
      return NextResponse.json({ error: '请提供用户ID' }, { status: 400 });
    }

    const db = await getDb();

    // 获取所有检测数据
    const faceRecords = await db.execute(sql`SELECT * FROM face_diagnosis_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);
    const tongueRecords = await db.execute(sql`SELECT * FROM tongue_diagnosis_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);
    const postureRecords = await db.execute(sql`SELECT * FROM posture_assessments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);
    const biologicalAgeRecords = await db.execute(sql`SELECT * FROM biological_age_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);
    const voiceHealthRecords = await db.execute(sql`SELECT * FROM voice_health_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);
    const eyeHealthRecords = await db.execute(sql`SELECT * FROM eye_health_records WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 5`);

    // 使用LLM进行综合风险评估
    const riskAssessment = await performRiskAssessment(
      {
        face: faceRecords.rows || [],
        tongue: tongueRecords.rows || [],
        posture: postureRecords.rows || [],
        biologicalAge: biologicalAgeRecords.rows || [],
        voiceHealth: voiceHealthRecords.rows || [],
        eyeHealth: eyeHealthRecords.rows || [],
      },
      userInfo,
      request
    );

    // 保存风险因子到数据库
    for (const risk of riskAssessment.riskFactors || []) {
      await db.execute(sql`
        INSERT INTO risk_factors (user_id, risk_type, risk_name, risk_level, likelihood, impact, risk_score, detected_from, notes)
        VALUES (${userId}, ${risk.riskType}, ${risk.riskName}, ${risk.riskLevel}, ${risk.likelihood}, ${risk.impact}, ${risk.riskScore}, ${risk.detectedFrom}, ${risk.notes})
        ON CONFLICT (user_id, risk_type, risk_name) DO UPDATE 
        SET risk_level = EXCLUDED.risk_level, risk_score = EXCLUDED.risk_score, updated_at = NOW()
      `);
    }

    return NextResponse.json({
      success: true,
      data: riskAssessment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[RiskAssessment] 评估失败:', error);
    return NextResponse.json({ error: '风险评估失败', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

async function performRiskAssessment(detectionData: any, userInfo: any, request: NextRequest): Promise<any> {
  // 构建数据摘要
  let dataSummary = '检测数据摘要：\n';
  
  if (detectionData.face && detectionData.face.length > 0) {
    const latest = detectionData.face[0];
    dataSummary += `• 面诊：最新评分${latest.overall_score || 75}分\n`;
  }
  if (detectionData.tongue && detectionData.tongue.length > 0) {
    const latest = detectionData.tongue[0];
    dataSummary += `• 舌诊：最新评分${latest.overall_score || 75}分\n`;
  }
  if (detectionData.posture && detectionData.posture.length > 0) {
    const latest = detectionData.posture[0];
    dataSummary += `• 体态：最新评分${latest.overall_score || 75}分\n`;
  }
  if (detectionData.biologicalAge && detectionData.biologicalAge.length > 0) {
    const latest = detectionData.biologicalAge[0];
    dataSummary += `• 生理年龄：${latest.biological_age || 0}岁，实际年龄${latest.actual_age || 0}岁\n`;
  }

  const systemPrompt = `你是一位专业的健康风险评估专家，擅长多维度综合风险评估。

请基于提供的检测数据，进行全面风险评估，识别各类健康风险因子，并计算综合风险评分。

输出格式必须是纯JSON，不要包含任何其他文字、注释或标记：
{
  "overallRiskScore": 0-100的综合风险评分,
  "overallRiskLevel": "低/中/高",
  "confidence": 0-100的置信度,
  "riskFactors": [
    {
      "riskType": "风险类型（心血管/呼吸/消化/内分泌/神经/肌肉骨骼）",
      "riskName": "风险名称",
      "riskLevel": "低/中/高",
      "likelihood": "低/中/高",
      "impact": "影响描述",
      "riskScore": 0-100的风险评分,
      "detectedFrom": "检测来源",
      "notes": "详细说明"
    }
  ],
  "systemRisks": {
    "cardiovascular": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]},
    "respiratory": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]},
    "digestive": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]},
    "endocrine": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]},
    "nervous": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]},
    "musculoskeletal": {"score": 0-100, "level": "低/中/高", "factors": ["因素1", "因素2"]}
  },
  "priorityRisks": [
    {
      "risk": "优先风险名称",
      "level": "低/中/高",
      "urgency": "紧急/高/中/低",
      "recommendation": "建议"
    }
  ],
  "preventiveMeasures": [
    {
      "category": "预防类别",
      "measures": ["措施1", "措施2"]
    }
  ],
  "medicalAdvice": {
    "shouldVisitDoctor": true/false,
    "departments": ["科室1", "科室2"],
    "urgency": "紧急/尽快/建议",
    "reason": "就医建议原因"
  },
  "summary": "风险评估总结"
}

风险评估标准：
- 低风险（0-30分）：健康状况良好，建议保持良好习惯
- 中风险（31-70分）：存在健康风险，建议改善生活方式并定期复查
- 高风险（71-100分）：存在明显健康风险，建议尽早就医

系统风险评估：
- 心血管系统：高血压、冠心病、心律失常风险
- 呼吸系统：哮喘、慢阻肺、肺部疾病风险
- 消化系统：胃炎、溃疡、肝病风险
- 内分泌系统：糖尿病、甲状腺疾病风险
- 神经系统：脑血管疾病、神经退行性疾病风险
- 肌肉骨骼系统：关节炎、骨质疏松风险`;

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const response = await client.invoke([
      { role: 'system' as const, content: systemPrompt },
      { 
        role: 'user' as const, 
        content: `${dataSummary}\n\n请进行风险评估。` 
      },
    ], { model: 'doubao-seed-1-6-vision-250815', temperature: 0.3 });

    if (!response || !response.content) {
      throw new Error('LLM返回空响应');
    }

    let result: any;
    try {
      const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('[RiskAssessment] JSON解析失败:', response.content);
      result = {
        overallRiskScore: 50,
        overallRiskLevel: '中',
        confidence: 70,
        riskFactors: [],
        summary: '风险评估完成，建议继续关注健康状况。'
      };
    }

    return result;
  } catch (error) {
    console.error('[RiskAssessment] LLM评估失败:', error);
    return {
      overallRiskScore: 50,
      overallRiskLevel: '中',
      confidence: 70,
      riskFactors: [],
      summary: '风险评估完成，建议继续关注健康状况。'
    };
  }
}
