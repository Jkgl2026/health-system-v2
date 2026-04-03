/**
 * 预期寿命评估模块
 * 基于当前健康状况评估预期寿命和健康改善潜力
 */

// 预期寿命评估结果
export interface LifeExpectancy {
  currentAge: number;
  expectedAge: number;
  potentialGain: number;        // 通过健康管理可延长的年限
  lifeExpectancyByHealth: number; // 基于健康状况的预期寿命
  keyFactors: {
    positive: string[];         // 有利因素
    negative: string[];         // 不利因素
  };
  riskFactors: {
    highRisk: string[];
    moderateRisk: string[];
  };
  recommendations: string[];
  confidenceLevel: number;     // 评估置信度
}

/**
 * 计算预期寿命
 */
export function calculateLifeExpectancy(data: {
  healthQuestionnaire?: any;
  constitutionQuestionnaire?: any;
  personalInfo: {
    age: number;
    gender: string;
    height: number;
    weight: number;
  };
  healthScores?: {
    overallHealth: number;
    immunity: number;
    circulation: number;
  };
}): LifeExpectancy {
  const personalInfo = data.personalInfo;
  const health = data.healthQuestionnaire || {};
  const constitution = data.constitutionQuestionnaire?.primaryConstitution || '平和质';

  // 确保 age 是数字类型
  const currentAge = Number(personalInfo.age) || 0;

  // 基础预期寿命（基于性别和当前年龄）
  const baseLifeExpectancy = getBaseLifeExpectancy(personalInfo.gender, currentAge);
  
  // 健康因素调整
  const healthAdjustment = calculateHealthAdjustment(health, constitution, data.healthScores);
  
  // 计算基于健康的预期寿命
  const lifeExpectancyByHealth = Math.round(baseLifeExpectancy + healthAdjustment);
  
  // 计算改善潜力
  const potentialGain = calculatePotentialGain(health, constitution, personalInfo);

  // 计算预期寿命（基于健康的预期寿命 + 改善潜力）
  const expectedAge = Math.round(lifeExpectancyByHealth + potentialGain);
  
  // 关键因素
  const keyFactors = identifyKeyFactors(health, constitution, personalInfo);
  
  // 风险因素
  const riskFactors = identifyRiskFactors(health, constitution, personalInfo);
  
  // 生成建议
  const recommendations = generateLifeExpectancyRecommendations(health, constitution, potentialGain);
  
  // 置信度
  const confidenceLevel = calculateLifeExpectancyConfidence(health, constitution, personalInfo);
  
  return {
    currentAge,
    expectedAge,
    potentialGain,
    lifeExpectancyByHealth,
    keyFactors,
    riskFactors,
    recommendations,
    confidenceLevel
  };
}

/**
 * 获取基础预期寿命
 */
function getBaseLifeExpectancy(gender: string, age: number): number {
  // 中国2020年平均预期寿命
  const baseExpectancy: Record<string, number> = {
    male: 75,
    female: 81
  };
  
  // 考虑当前年龄的剩余寿命
  const expectancy = baseExpectancy[gender] || 78;
  
  // 如果已经超过平均预期寿命，使用当前年龄+5作为基础
  return Math.max(age, expectancy);
}

/**
 * 计算健康因素调整
 */
function calculateHealthAdjustment(health: any, constitution: string, healthScores?: any): number {
  let adjustment = 0;
  
  // 慢性疾病影响
  const chronicConditions = [
    health.has_hypertension,
    health.has_diabetes,
    health.has_hyperlipidemia
  ].filter(Boolean).length;
  
  adjustment -= chronicConditions * 5;
  
  // 体质影响
  const constitutionImpact: Record<string, number> = {
    '平和质': 5,
    '气虚质': -3,
    '阳虚质': -4,
    '阴虚质': -2,
    '痰湿质': -5,
    '湿热质': -3,
    '血瘀质': -4,
    '气郁质': -3,
    '特禀质': -2
  };
  adjustment += constitutionImpact[constitution] || 0;
  
  // 运动影响
  if (health.exercise_frequency) {
    const exerciseImpact: Record<string, number> = {
      '从不运动': -5,
      '每周1-2次': 2,
      '每周3-5次': 5,
      '每周6次以上': 7
    };
    adjustment += exerciseImpact[health.exercise_frequency] || 0;
  }
  
  // 睡眠影响
  if (health.sleep_quality) {
    const sleepImpact: Record<string, number> = {
      '很差': -5,
      '较差': -2,
      '一般': 0,
      '很好': 3
    };
    adjustment += sleepImpact[health.sleep_quality] || 0;
  }
  
  // 症状影响
  if (health.symptoms && health.symptoms.length > 0) {
    adjustment -= Math.min(health.symptoms.length * 2, 10);
  }
  
  // 健康评分影响
  if (healthScores && healthScores.overallHealth) {
    if (healthScores.overallHealth >= 85) {
      adjustment += 5;
    } else if (healthScores.overallHealth < 50) {
      adjustment -= 5;
    }
  }
  
  return adjustment;
}

/**
 * 计算改善潜力
 */
function calculatePotentialGain(health: any, constitution: string, personalInfo: any): number {
  let potential = 0;
  
  // 年龄因素：年轻人改善潜力大
  const age = personalInfo.age;
  if (age < 30) {
    potential += 8;
  } else if (age < 45) {
    potential += 5;
  } else if (age < 60) {
    potential += 3;
  }
  
  // 生活方式改善潜力
  if (health.exercise_frequency === '从不运动') {
    potential += 4;
  }
  
  if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    potential += 3;
  }
  
  if (health.stressLevel === '高' || health.stressLevel === '很高') {
    potential += 2;
  }
  
  // 慢性疾病控制潜力
  if (health.has_hypertension || health.has_diabetes || health.has_hyperlipidemia) {
    potential += 5;
  }
  
  // 体质改善潜力
  if (constitution !== '平和质') {
    potential += 3;
  }
  
  return Math.min(15, potential); // 最大改善15年
}

/**
 * 识别关键因素
 */
function identifyKeyFactors(health: any, constitution: string, personalInfo: any): {
  positive: string[];
  negative: string[];
} {
  const positive: string[] = [];
  const negative: string[] = [];

  // 体质因素
  if (constitution === '平和质') {
    positive.push('体质平衡，有利于长寿');
  } else {
    negative.push(`${constitution}体质，需要调理`);
  }

  // 年龄因素
  const age = Number(personalInfo.age) || 0;
  if (age < 45) {
    positive.push('年龄较轻，改善潜力大');
  } else if (age > 65) {
    negative.push('年龄较大，需更加注意健康');
  }
  
  // 运动因素
  if (health.exercise_frequency === '每周3-5次' || health.exercise_frequency === '每周6次以上') {
    positive.push('运动习惯良好');
  } else if (health.exercise_frequency === '从不运动') {
    negative.push('缺乏运动');
  }
  
  // 睡眠因素
  if (health.sleep_quality === '很好') {
    positive.push('睡眠质量良好');
  } else if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    negative.push('睡眠质量不佳');
  }
  
  // 慢性疾病
  if (health.has_hypertension || health.has_diabetes || health.has_hyperlipidemia) {
    negative.push('存在慢性疾病');
  } else {
    positive.push('无重大慢性疾病');
  }
  
  // 症状
  if (!health.symptoms || health.symptoms.length === 0) {
    positive.push('无明显症状');
  } else {
    negative.push(`存在${health.symptoms.length}项症状`);
  }
  
  return { positive, negative };
}

/**
 * 识别风险因素
 */
function identifyRiskFactors(health: any, constitution: string, personalInfo: any): {
  highRisk: string[];
  moderateRisk: string[];
} {
  const highRisk: string[] = [];
  const moderateRisk: string[] = [];
  
  // 高风险因素
  if (health.has_hypertension) {
    highRisk.push('高血压');
  }
  if (health.has_diabetes) {
    highRisk.push('糖尿病');
  }
  if (constitution === '血瘀质' || constitution === '痰湿质') {
    highRisk.push(`${constitution}体质`);
  }
  if (health.smokingStatus === '目前吸烟') {
    highRisk.push('吸烟');
  }
  
  // 中等风险因素
  if (health.has_hyperlipidemia) {
    moderateRisk.push('高血脂');
  }
  if (health.exercise_frequency === '从不运动') {
    moderateRisk.push('缺乏运动');
  }
  if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    moderateRisk.push('睡眠质量差');
  }
  if (health.stressLevel === '高' || health.stressLevel === '很高') {
    moderateRisk.push('高压力');
  }
  const age = Number(personalInfo.age) || 0;
  if (age > 65) {
    moderateRisk.push('高龄');
  }

  return { highRisk, moderateRisk };
}

/**
 * 生成预期寿命建议
 */
function generateLifeExpectancyRecommendations(health: any, constitution: string, potentialGain: number): string[] {
  const recommendations: string[] = [];
  
  // 基于改善潜力的建议
  if (potentialGain > 5) {
    recommendations.push('通过健康管理，您有潜力显著延长寿命');
    recommendations.push('建议制定详细的长寿计划');
  }
  
  // 生活方式建议
  if (health.exercise_frequency === '从不运动') {
    recommendations.push('开始规律运动，每周至少3次');
  }
  
  if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    recommendations.push('改善睡眠质量和作息规律');
  }
  
  if (health.stressLevel === '高' || health.stressLevel === '很高') {
    recommendations.push('学习压力管理，保持心理平衡');
  }
  
  if (health.smokingStatus === '目前吸烟') {
    recommendations.push('戒烟是延长寿命的关键措施');
  }
  
  // 体质调理建议
  if (constitution !== '平和质') {
    recommendations.push(`根据${constitution}特点进行体质调理`);
  }
  
  // 慢性疾病管理
  if (health.has_hypertension || health.has_diabetes || health.has_hyperlipidemia) {
    recommendations.push('严格控制慢性疾病，定期复查');
  }
  
  // 定期体检
  recommendations.push('定期进行全面健康检查，及早发现问题');
  
  return recommendations;
}

/**
 * 计算预期寿命评估置信度
 */
function calculateLifeExpectancyConfidence(health: any, constitution: string, personalInfo: any): number {
  let confidence = 0;
  
  // 数据完整性
  if (health.exercise_frequency && health.sleep_quality && health.symptoms) {
    confidence += 30;
  }
  
  // 慢性疾病信息
  if (health.has_hypertension !== undefined || health.has_diabetes !== undefined) {
    confidence += 20;
  }
  
  // 体质信息
  if (constitution && constitution !== '平和质') {
    confidence += 20;
  }
  
  // 个人信息
  if (personalInfo.age && personalInfo.gender) {
    confidence += 15;
  }
  
  // 基础置信度
  confidence += 15;
  
  return Math.min(100, confidence);
}
