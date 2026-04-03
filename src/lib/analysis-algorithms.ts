/**
 * 健康评估系统分析算法模块
 * 包含多层级评分、风险评估、置信度计算等核心算法
 */

import { getAgeCoefficient, getGenderCoefficient, getBMICoefficient, getConstitutionCoefficient } from './personalization-coefficients';

// 健康要素分析接口
export interface HealthAnalysisScores {
  qiAndBlood: number;        // 气血
  circulation: number;       // 循环
  toxins: number;            // 毒素
  bloodLipids: number;       // 血脂
  coldness: number;          // 寒性
  immunity: number;          // 免疫
  emotions: number;          // 情绪
  overallHealth: number;     // 整体健康
}

// 风险评估接口
export interface RiskAssessmentResult {
  overallRiskLevel: 'low' | 'medium' | 'high';
  healthScore: number;
  riskFactors: {
    cardiovascular: RiskFactor;
    metabolic: RiskFactor;
    lifestyle: RiskFactor;
    recovery: RiskFactor;
    constitution?: RiskFactor;
  };
  recommendations: string[];
  notes: string;
}

// 风险因子接口
export interface RiskFactor {
  level: 'low' | 'medium' | 'high';
  description: string;
  score?: number;
  factors?: string[];
}

// 分析输入数据接口
export interface AnalysisInputData {
  healthQuestionnaire?: any;
  constitutionQuestionnaire?: any;
  personalInfo: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    bmi?: number;
  };
}

/**
 * 多层级健康要素分析算法
 */
export function calculateHealthAnalysis(data: AnalysisInputData): HealthAnalysisScores {
  // 第一层：基础评分
  const baseScores = calculateBaseScores(data);
  
  // 第二层：获取调整系数
  const coefficients = getAdjustmentCoefficients(data);
  
  // 第三层：加权评分
  const weightedScores = applyAdjustments(baseScores, coefficients);
  
  // 第四层：综合评分
  const finalScores = normalizeScores(weightedScores);
  
  return finalScores;
}

/**
 * 计算基础评分
 */
function calculateBaseScores(data: AnalysisInputData): HealthAnalysisScores {
  const health = data.healthQuestionnaire || {};
  const constitution = data.constitutionQuestionnaire || {};

  let scores: HealthAnalysisScores = {
    qiAndBlood: 75,
    circulation: 70,
    toxins: 65,
    bloodLipids: 70,
    coldness: 68,
    immunity: 72,
    emotions: 75,
    overallHealth: 72
  };
  
  // 运动评分
  if (health.exercise_frequency) {
    const exerciseScores: Record<string, number> = {
      '从不运动': 0,
      '每周1-2次': 60,
      '每周3-5次': 85,
      '每周6次以上': 100
    };
    const exerciseBonus = (exerciseScores[health.exercise_frequency] || 50) / 100;
    scores.circulation += 10 * exerciseBonus;
    scores.immunity += 10 * exerciseBonus;
  }
  
  // 睡眠评分
  if (health.sleep_quality) {
    const sleepMultiplier: Record<string, number> = {
      '很好': 1.1,
      '一般': 1.0,
      '较差': 0.85,
      '很差': 0.7
    };
    const multiplier = sleepMultiplier[health.sleep_quality] || 1.0;
    scores.immunity *= multiplier;
    scores.emotions *= multiplier;
  }
  
  // 疾病史影响
  if (health.has_hypertension || health.has_diabetes || health.has_hyperlipidemia) {
    scores.circulation -= 20;
    scores.bloodLipids -= 15;
  }
  
  // BMI影响
  const bmi = data.personalInfo.bmi || calculateBMI(data.personalInfo.weight, data.personalInfo.height);
  if (bmi < 18.5 || bmi > 28) {
    scores.immunity -= 10;
  }
  
  // 体质影响
  if (constitution.primaryConstitution) {
    scores = applyConstitutionImpact(scores, constitution.primaryConstitution);
  }
  
  return scores;
}

/**
 * 获取调整系数
 */
function getAdjustmentCoefficients(data: AnalysisInputData): Record<string, number> {
  const { personalInfo, constitutionQuestionnaire } = data;
  const constitution = constitutionQuestionnaire?.primaryConstitution || '平和质';
  
  return {
    ageFactor: getAgeCoefficient(personalInfo.age),
    genderFactor: getGenderCoefficient(personalInfo.gender),
    bmiFactor: getBMICoefficient(personalInfo.bmi || calculateBMI(personalInfo.weight, personalInfo.height)),
    constitutionFactor: getConstitutionCoefficient(constitution)
  };
}

/**
 * 应用调整系数
 */
function applyAdjustments(
  scores: HealthAnalysisScores,
  coefficients: Record<string, number>
): HealthAnalysisScores {
  return {
    qiAndBlood: scores.qiAndBlood * coefficients.ageFactor * coefficients.constitutionFactor,
    circulation: scores.circulation * coefficients.ageFactor * coefficients.genderFactor * coefficients.constitutionFactor,
    toxins: scores.toxins * coefficients.bmiFactor,
    bloodLipids: scores.bloodLipids * coefficients.bmiFactor * coefficients.genderFactor * coefficients.constitutionFactor,
    coldness: scores.coldness * coefficients.ageFactor * coefficients.constitutionFactor,
    immunity: scores.immunity * coefficients.ageFactor * coefficients.constitutionFactor,
    emotions: scores.emotions * coefficients.genderFactor * coefficients.constitutionFactor,
    overallHealth: scores.overallHealth * coefficients.ageFactor * coefficients.bmiFactor * coefficients.constitutionFactor
  };
}

/**
 * 归一化评分（确保在0-100之间）
 */
function normalizeScores(scores: HealthAnalysisScores): HealthAnalysisScores {
  const normalized: HealthAnalysisScores = {} as any;
  
  for (const key in scores) {
    normalized[key as keyof HealthAnalysisScores] = 
      Math.max(0, Math.min(100, scores[key as keyof HealthAnalysisScores]));
  }
  
  return normalized;
}

/**
 * 风险评估算法（多因子模型）
 */
export function calculateRiskAssessment(
  healthScores: HealthAnalysisScores,
  data: AnalysisInputData
): RiskAssessmentResult {
  const health = data.healthQuestionnaire || {};
  const constitution = data.constitutionQuestionnaire?.primaryConstitution || '平和质';
  
  // 心血管风险评估
  const cardiovascularRisk = calculateCardiovascularRisk(health, data.personalInfo, constitution);
  
  // 代谢风险评估
  const metabolicRisk = calculateMetabolicRisk(health, data.personalInfo, constitution);
  
  // 生活方式风险评估
  const lifestyleRisk = calculateLifestyleRisk(health);
  
  // 恢复风险评估
  const recoveryRisk = calculateRecoveryRisk(health);
  
  // 体质风险评估
  const constitutionRisk = calculateConstitutionRisk(constitution);
  
  // 综合风险等级
  const overallRiskLevel = determineOverallRiskLevel(
    cardiovascularRisk,
    metabolicRisk,
    lifestyleRisk,
    recoveryRisk,
    constitutionRisk,
    healthScores.overallHealth
  );
  
  // 健康评分
  const healthScore = Math.round(
    100 - (
      cardiovascularRisk.score * 0.25 +
      metabolicRisk.score * 0.25 +
      lifestyleRisk.score * 0.2 +
      recoveryRisk.score * 0.15 +
      constitutionRisk.score * 0.15
    )
  );
  
  // 生成建议
  const recommendations = generateRecommendations({
    cardiovascular: cardiovascularRisk,
    metabolic: metabolicRisk,
    lifestyle: lifestyleRisk,
    recovery: recoveryRisk,
    constitution: constitutionRisk
  });
  
  return {
    overallRiskLevel,
    healthScore,
    riskFactors: {
      cardiovascular: cardiovascularRisk,
      metabolic: metabolicRisk,
      lifestyle: lifestyleRisk,
      recovery: recoveryRisk,
      constitution: constitutionRisk
    },
    recommendations,
    notes: ''
  };
}

/**
 * 心血管风险评估
 */
function calculateCardiovascularRisk(
  health: any,
  personalInfo: any,
  constitution: string
): RiskFactor {
  let riskScore = 0;
  const factors: string[] = [];
  
  // 基础病史
  if (health.has_hypertension) {
    riskScore += 40;
    factors.push('高血压病史');
    
    const years = parseInt(health.hypertensionYears) || 0;
    if (years > 10) {
      riskScore += 15;
      factors.push('高血压病程长（>10年）');
    }
    
    if (!health.hypertensionMedications || health.hypertensionMedications.length === 0) {
      riskScore += 20;
      factors.push('未规律服药');
    }
  }
  
  // 年龄影响
  if (personalInfo.age > 60) {
    riskScore += 15;
  } else if (personalInfo.age > 45) {
    riskScore += 10;
  }
  
  // 性别影响
  if (personalInfo.gender === 'male') {
    riskScore += 5;
  }
  
  // 吸烟影响
  if (health.smokingStatus === '目前吸烟') {
    riskScore += 15;
    factors.push('吸烟');
  } else if (health.smokingStatus === '已戒烟') {
    riskScore += 5;
  }
  
  // BMI影响
  const bmi = personalInfo.bmi || calculateBMI(personalInfo.weight, personalInfo.height);
  if (bmi > 28) {
    riskScore += 10;
    factors.push('肥胖');
  } else if (bmi > 24) {
    riskScore += 5;
  }
  
  // 体质影响
  if (constitution === '血瘀质' || constitution === '痰湿质') {
    riskScore += 10;
    factors.push(`${constitution}体质`);
  }
  
  const level = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  
  return {
    level,
    description: `心血管风险${level === 'high' ? '较高' : level === 'medium' ? '中等' : '较低'}`,
    score: Math.min(100, riskScore),
    factors
  };
}

/**
 * 代谢风险评估
 */
function calculateMetabolicRisk(
  health: any,
  personalInfo: any,
  constitution: string
): RiskFactor {
  let riskScore = 0;
  const factors: string[] = [];
  
  // 糖尿病史
  if (health.has_diabetes) {
    riskScore += 45;
    factors.push('糖尿病病史');
    
    if (health.diabetesType === '1型') {
      riskScore += 15;
      factors.push('1型糖尿病');
    }
    
    const years = parseInt(health.diabetesYears) || 0;
    if (years > 10) {
      riskScore += 15;
      factors.push('糖尿病病程长（>10年）');
    }
  }
  
  // 家族史
  if (health.familyDiabetes) {
    riskScore += 10;
    factors.push('糖尿病家族史');
  }
  
  // BMI影响
  const bmi = personalInfo.bmi || calculateBMI(personalInfo.weight, personalInfo.height);
  if (bmi > 28) {
    riskScore += 15;
    factors.push('肥胖');
  } else if (bmi > 24) {
    riskScore += 8;
  }
  
  // 体质影响
  if (constitution === '痰湿质') {
    riskScore += 12;
    factors.push('痰湿体质');
  } else if (constitution === '阴虚质') {
    riskScore += 8;
  }
  
  // 饮食习惯
  if (health.dietHabits === '不规律') {
    riskScore += 10;
    factors.push('饮食不规律');
  }
  
  const level = riskScore >= 65 ? 'high' : riskScore >= 35 ? 'medium' : 'low';
  
  return {
    level,
    description: `代谢风险${level === 'high' ? '较高' : level === 'medium' ? '中等' : '较低'}`,
    score: Math.min(100, riskScore),
    factors
  };
}

/**
 * 生活方式风险评估
 */
function calculateLifestyleRisk(health: any): RiskFactor {
  let riskScore = 0;
  const factors: string[] = [];
  
  // 运动
  if (health.exercise_frequency === '从不运动') {
    riskScore += 30;
    factors.push('缺乏运动');
  } else if (health.exercise_frequency === '每周1-2次') {
    riskScore += 10;
  }
  
  // 睡眠
  if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    riskScore += 20;
    factors.push('睡眠质量不佳');
  }
  
  // 吸烟
  if (health.smokingStatus === '目前吸烟') {
    riskScore += 25;
    factors.push('吸烟');
  }
  
  // 饮酒
  if (health.drinkingStatus === '经常饮酒' || health.drinkingStatus === '每日饮酒') {
    riskScore += 15;
    factors.push('饮酒');
  }
  
  // 饮食
  if (health.dietHabits === '不规律' || health.dietHabits === '暴饮暴食') {
    riskScore += 10;
    factors.push('饮食不规律');
  }
  
  const level = riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';
  
  return {
    level,
    description: `生活方式风险${level === 'high' ? '较高' : level === 'medium' ? '中等' : '较低'}`,
    score: Math.min(100, riskScore),
    factors
  };
}

/**
 * 恢复风险评估
 */
function calculateRecoveryRisk(health: any): RiskFactor {
  let riskScore = 0;
  const factors: string[] = [];
  
  // 睡眠时长
  const hours = parseFloat(health.sleepHours) || 7;
  if (hours < 6 || hours > 9) {
    riskScore += 20;
    factors.push('睡眠时长不当');
  }
  
  // 睡眠质量
  if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    riskScore += 25;
    factors.push('睡眠质量差');
  } else if (health.sleep_quality === '一般') {
    riskScore += 10;
  }
  
  // 睡眠问题
  if (health.sleepIssues && health.sleepIssues.length > 0) {
    riskScore += 15;
    factors.push('存在睡眠问题');
  }
  
  // 压力水平
  if (health.stressLevel === '很高' || health.stressLevel === '高') {
    riskScore += 20;
    factors.push('压力水平高');
  } else if (health.stressLevel === '中等') {
    riskScore += 10;
  }
  
  const level = riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';
  
  return {
    level,
    description: `恢复能力风险${level === 'high' ? '较高' : level === 'medium' ? '中等' : '较低'}`,
    score: Math.min(100, riskScore),
    factors
  };
}

/**
 * 体质风险评估
 */
function calculateConstitutionRisk(constitution: string): RiskFactor {
  const risks: Record<string, RiskFactor> = {
    '平和质': {
      level: 'low',
      description: '体质平衡，风险较低',
      score: 5,
      factors: []
    },
    '气虚质': {
      level: 'medium',
      description: '气虚体质，易疲劳，免疫力偏低',
      score: 35,
      factors: ['气虚', '易疲劳', '免疫力偏低']
    },
    '阳虚质': {
      level: 'medium',
      description: '阳虚体质，畏寒怕冷',
      score: 40,
      factors: ['阳虚', '畏寒怕冷', '循环差']
    },
    '阴虚质': {
      level: 'medium',
      description: '阴虚体质，易口干，情绪易波动',
      score: 35,
      factors: ['阴虚', '易口干', '情绪波动']
    },
    '痰湿质': {
      level: 'high',
      description: '痰湿体质，易肥胖，代谢慢',
      score: 55,
      factors: ['痰湿', '易肥胖', '代谢慢']
    },
    '湿热质': {
      level: 'medium',
      description: '湿热体质，易长痘，消化不良',
      score: 40,
      factors: ['湿热', '易长痘', '消化不良']
    },
    '血瘀质': {
      level: 'high',
      description: '血瘀体质，血液循环不畅',
      score: 60,
      factors: ['血瘀', '血液循环不畅', '易疼痛']
    },
    '气郁质': {
      level: 'medium',
      description: '气郁体质，情绪易波动',
      score: 35,
      factors: ['气郁', '情绪波动', '易抑郁']
    },
    '特禀质': {
      level: 'medium',
      description: '特禀体质，易过敏',
      score: 30,
      factors: ['特禀', '易过敏']
    }
  };
  
  return risks[constitution] || risks['平和质'];
}

/**
 * 确定整体风险等级
 */
function determineOverallRiskLevel(
  cardiovascular: RiskFactor,
  metabolic: RiskFactor,
  lifestyle: RiskFactor,
  recovery: RiskFactor,
  constitution: RiskFactor,
  overallHealth: number
): 'low' | 'medium' | 'high' {
  // 高风险条件
  if (
    cardiovascular.level === 'high' ||
    metabolic.level === 'high' ||
    overallHealth < 50
  ) {
    return 'high';
  }
  
  // 中等风险条件
  if (
    cardiovascular.level === 'medium' ||
    metabolic.level === 'medium' ||
    lifestyle.level === 'medium' ||
    recovery.level === 'medium' ||
    constitution.level === 'medium' ||
    overallHealth < 70
  ) {
    return 'medium';
  }
  
  // 低风险
  return 'low';
}

/**
 * 生成健康建议
 */
function generateRecommendations(risks: {
  cardiovascular: RiskFactor;
  metabolic: RiskFactor;
  lifestyle: RiskFactor;
  recovery: RiskFactor;
  constitution: RiskFactor;
}): string[] {
  const recommendations: string[] = [];
  
  // 心血管建议
  if (risks.cardiovascular.level === 'high') {
    recommendations.push('定期监测血压和心率，遵医嘱用药');
    recommendations.push('减少高盐高脂食物摄入');
  } else if (risks.cardiovascular.level === 'medium') {
    recommendations.push('关注血压变化，保持健康饮食');
  }
  
  // 代谢建议
  if (risks.metabolic.level === 'high') {
    recommendations.push('控制饮食，定期监测血糖');
    recommendations.push('控制体重，避免肥胖');
  } else if (risks.metabolic.level === 'medium') {
    recommendations.push('注意饮食均衡，控制糖分摄入');
  }
  
  // 生活方式建议
  if (risks.lifestyle.level === 'high') {
    recommendations.push('每周进行至少3次中等强度运动');
    recommendations.push('戒烟限酒，保持健康生活习惯');
  } else if (risks.lifestyle.level === 'medium') {
    recommendations.push('增加运动量，保持规律作息');
  }
  
  // 恢复建议
  if (risks.recovery.level === 'high') {
    recommendations.push('保证7-8小时优质睡眠');
    recommendations.push('学会压力管理，进行放松训练');
  } else if (risks.recovery.level === 'medium') {
    recommendations.push('改善睡眠质量，适当减轻压力');
  }
  
  // 体质建议
  if (risks.constitution.level === 'high' || risks.constitution.level === 'medium') {
    recommendations.push(`根据${risks.constitution.description}的特点进行针对性调理`);
  }
  
  return recommendations;
}

/**
 * 计算BMI
 */
function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

/**
 * 应用体质影响
 */
function applyConstitutionImpact(scores: HealthAnalysisScores, constitution: string): HealthAnalysisScores {
  const impacts: Record<string, Partial<HealthAnalysisScores>> = {
    '平和质': {
      qiAndBlood: 10,
      circulation: 5,
      immunity: 5,
      emotions: 5,
      overallHealth: 10
    },
    '气虚质': {
      qiAndBlood: -25,
      immunity: -20,
      circulation: -15,
      overallHealth: -20
    },
    '阳虚质': {
      coldness: -40,
      immunity: -15,
      circulation: -20,
      overallHealth: -25
    },
    '阴虚质': {
      emotions: -15,
      immunity: -15,
      overallHealth: -15
    },
    '痰湿质': {
      toxins: -30,
      bloodLipids: -30,
      circulation: -15,
      overallHealth: -25
    },
    '湿热质': {
      toxins: -25,
      immunity: -15,
      overallHealth: -20
    },
    '血瘀质': {
      circulation: -30,
      qiAndBlood: -20,
      overallHealth: -25
    },
    '气郁质': {
      emotions: -30,
      immunity: -15,
      overallHealth: -20
    },
    '特禀质': {
      immunity: -20,
      overallHealth: -15
    }
  };
  
  const impact = impacts[constitution] || {};
  
  return {
    qiAndBlood: scores.qiAndBlood + (impact.qiAndBlood || 0),
    circulation: scores.circulation + (impact.circulation || 0),
    toxins: scores.toxins + (impact.toxins || 0),
    bloodLipids: scores.bloodLipids + (impact.bloodLipids || 0),
    coldness: scores.coldness + (impact.coldness || 0),
    immunity: scores.immunity + (impact.immunity || 0),
    emotions: scores.emotions + (impact.emotions || 0),
    overallHealth: scores.overallHealth + (impact.overallHealth || 0)
  };
}

/**
 * 计算置信度
 */
export function calculateConfidence(
  data: AnalysisInputData,
  calculationTime: number
): number {
  let confidence = 0;
  
  // 数据完整性评分（40%）
  let completenessScore = 0;
  if (data.healthQuestionnaire) completenessScore += 0.3;
  if (data.constitutionQuestionnaire) completenessScore += 0.4;
  if (data.personalInfo.age && data.personalInfo.gender) completenessScore += 0.3;
  confidence += completenessScore * 40;
  
  // 数据准确性评分（30%）
  let accuracyScore = 1.0;
  if (data.healthQuestionnaire) {
    const answers = Object.values(data.healthQuestionnaire).filter(v => v !== undefined && v !== null && v !== '');
    const totalFields = Object.keys(data.healthQuestionnaire).length;
    accuracyScore = Math.min(1.0, answers.length / Math.max(1, totalFields * 0.7));
  }
  confidence += accuracyScore * 30;
  
  // 算法版本评分（20%）
  confidence += 0.9 * 20;
  
  // 计算时间评分（10%）- 越快越好
  const timeScore = calculationTime < 500 ? 1.0 : calculationTime < 1000 ? 0.9 : 0.8;
  confidence += timeScore * 10;
  
  return Math.min(100, Math.round(confidence));
}
