/**
 * 生活质量评估模块
 * 包含身体功能、心理功能、社会功能、情绪健康、整体健康感知评估
 */

// 生活质量评估结果
export interface QualityOfLife {
  physicalFunction: number;    // 身体功能
  mentalFunction: number;      // 心理功能
  socialFunction: number;      // 社会功能
  emotionalWellbeing: number;  // 情绪健康
  generalHealth: number;       // 整体健康感知
  overallScore: number;        // 综合评分
  domainScores: {
    physical: DomainScore;
    mental: DomainScore;
    social: DomainScore;
    emotional: DomainScore;
  };
}

// 领域评分
export interface DomainScore {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  recommendations: string[];
}

/**
 * 计算生活质量
 */
export function calculateQualityOfLife(data: {
  healthQuestionnaire?: any;
  constitutionQuestionnaire?: any;
  personalInfo: any;
}): QualityOfLife {
  const health = data.healthQuestionnaire || {};
  const constitution = data.constitutionQuestionnaire?.primaryConstitution || '平和质';
  
  // 身体功能
  const physicalFunction = calculatePhysicalFunction(health, data.personalInfo);
  
  // 心理功能
  const mentalFunction = calculateMentalFunction(health, constitution);
  
  // 社会功能
  const socialFunction = calculateSocialFunction(health);
  
  // 情绪健康
  const emotionalWellbeing = calculateEmotionalWellbeing(health, constitution);
  
  // 整体健康感知
  const generalHealth = calculateGeneralHealth(health, data.personalInfo, constitution);
  
  // 综合评分
  const overallScore = Math.round(
    (physicalFunction + mentalFunction + socialFunction + emotionalWellbeing + generalHealth) / 5
  );
  
  // 领域评分
  const domainScores = {
    physical: getDomainScore(physicalFunction, '身体功能'),
    mental: getDomainScore(mentalFunction, '心理功能'),
    social: getDomainScore(socialFunction, '社会功能'),
    emotional: getDomainScore(emotionalWellbeing, '情绪健康')
  };
  
  return {
    physicalFunction,
    mentalFunction,
    socialFunction,
    emotionalWellbeing,
    generalHealth,
    overallScore,
    domainScores
  };
}

/**
 * 计算身体功能
 */
function calculatePhysicalFunction(health: any, personalInfo: any): number {
  let score = 70; // 基础分
  
  // 运动能力
  if (health.exercise_frequency) {
    const exerciseBonus: Record<string, number> = {
      '从不运动': 0,
      '每周1-2次': 10,
      '每周3-5次': 20,
      '每周6次以上': 30
    };
    score += exerciseBonus[health.exercise_frequency] || 0;
  }
  
  // 睡眠质量
  if (health.sleep_quality) {
    const sleepBonus: Record<string, number> = {
      '很差': -15,
      '较差': -5,
      '一般': 5,
      '很好': 15
    };
    score += sleepBonus[health.sleep_quality] || 0;
  }
  
  // 慢性疾病影响
  const chronicConditions = [
    health.has_hypertension,
    health.has_diabetes,
    health.has_hyperlipidemia
  ].filter(Boolean).length;
  
  score -= chronicConditions * 10;
  
  // 症状影响
  if (health.symptoms && health.symptoms.length > 0) {
    score -= health.symptoms.length * 3;
  }
  
  // 年龄影响
  const age = personalInfo.age || 40;
  if (age > 60) {
    score -= 10;
  } else if (age > 45) {
    score -= 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 计算心理功能
 */
function calculateMentalFunction(health: any, constitution: string): number {
  let score = 75; // 基础分
  
  // 压力水平
  if (health.stressLevel) {
    const stressPenalty: Record<string, number> = {
      '很低': 10,
      '低': 5,
      '中等': 0,
      '高': -10,
      '很高': -20
    };
    score += stressPenalty[health.stressLevel] || 0;
  }
  
  // 睡眠对心理的影响
  if (health.sleep_quality) {
    if (health.sleep_quality === '很好') {
      score += 5;
    } else if (health.sleep_quality === '很差') {
      score -= 15;
    }
  }
  
  // 体质影响
  if (constitution === '气郁质') {
    score -= 15;
  } else if (constitution === '阴虚质') {
    score -= 10;
  } else if (constitution === '平和质') {
    score += 10;
  }
  
  // 症状影响
  if (health.symptoms) {
    if (health.symptoms.includes('失眠')) {
      score -= 15;
    }
    if (health.symptoms.includes('健忘')) {
      score -= 10;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 计算社会功能
 */
function calculateSocialFunction(health: any): number {
  let score = 70; // 基础分
  
  // 压力来源
  if (health.stressSource && health.stressSource.length > 0) {
    const sourceCount = health.stressSource.length;
    if (sourceCount >= 3) {
      score -= 15;
    } else if (sourceCount >= 2) {
      score -= 8;
    } else if (sourceCount >= 1) {
      score -= 3;
    }
  }
  
  // 症状影响
  if (health.symptoms) {
    if (health.symptoms.includes('乏力')) {
      score -= 10;
    }
    if (health.symptoms.includes('头晕')) {
      score -= 8;
    }
  }
  
  // 运动对社交的影响
  if (health.exercise_frequency === '每周3-5次' || health.exercise_frequency === '每周6次以上') {
    score += 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 计算情绪健康
 */
function calculateEmotionalWellbeing(health: any, constitution: string): number {
  let score = 75; // 基础分
  
  // 睡眠质量对情绪的影响
  if (health.sleep_quality) {
    const sleepImpact: Record<string, number> = {
      '很差': -20,
      '较差': -10,
      '一般': 0,
      '很好': 10
    };
    score += sleepImpact[health.sleep_quality] || 0;
  }
  
  // 压力水平
  if (health.stressLevel) {
    const stressImpact: Record<string, number> = {
      '很低': 10,
      '低': 5,
      '中等': 0,
      '高': -15,
      '很高': -25
    };
    score += stressImpact[health.stressLevel] || 0;
  }
  
  // 体质影响
  if (constitution === '气郁质') {
    score -= 20;
  } else if (constitution === '阴虚质') {
    score -= 15;
  } else if (constitution === '阳虚质') {
    score -= 10;
  } else if (constitution === '平和质') {
    score += 10;
  }
  
  // 运动对情绪的积极影响
  if (health.exercise_frequency === '每周3-5次' || health.exercise_frequency === '每周6次以上') {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 计算整体健康感知
 */
function calculateGeneralHealth(health: any, personalInfo: any, constitution: string): number {
  let score = 70; // 基础分
  
  // 慢性疾病
  const chronicConditions = [
    health.has_hypertension,
    health.has_diabetes,
    health.has_hyperlipidemia
  ].filter(Boolean).length;
  score -= chronicConditions * 15;
  
  // 症状数量
  if (health.symptoms) {
    score -= health.symptoms.length * 5;
  }
  
  // 体质影响
  if (constitution === '平和质') {
    score += 15;
  } else {
    score -= 10;
  }
  
  // 生活方式
  if (health.exercise_frequency === '从不运动') {
    score -= 15;
  } else if (health.exercise_frequency === '每周3-5次' || health.exercise_frequency === '每周6次以上') {
    score += 10;
  }
  
  if (health.sleep_quality === '很好') {
    score += 10;
  } else if (health.sleep_quality === '较差' || health.sleep_quality === '很差') {
    score -= 10;
  }
  
  // 年龄影响
  const age = personalInfo.age || 40;
  if (age > 70) {
    score -= 15;
  } else if (age > 60) {
    score -= 10;
  } else if (age > 45) {
    score -= 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * 获取领域评分
 */
function getDomainScore(score: number, domainName: string): DomainScore {
  let level: 'excellent' | 'good' | 'fair' | 'poor';
  let description: string;
  let recommendations: string[] = [];
  
  if (score >= 85) {
    level = 'excellent';
    description = `${domainName}状况优秀`;
    recommendations = ['继续保持当前良好的生活习惯'];
  } else if (score >= 70) {
    level = 'good';
    description = `${domainName}状况良好`;
    recommendations = ['适当注意保持当前状况', '定期进行健康检查'];
  } else if (score >= 50) {
    level = 'fair';
    description = `${domainName}状况一般，需要改善`;
    recommendations = ['注意相关健康问题', '适当调整生活方式', '必要时咨询专业医生'];
  } else {
    level = 'poor';
    description = `${domainName}状况较差，需要重点关注`;
    recommendations = ['尽快寻求专业医疗建议', '制定详细的改善计划', '密切监测相关指标'];
  }
  
  return {
    score,
    level,
    description,
    recommendations
  };
}

/**
 * 生成生活质量改善建议
 */
export function generateQualityOfLifeImprovements(qol: QualityOfLife): string[] {
  const recommendations: string[] = [];
  
  // 身体功能建议
  if (qol.physicalFunction < 70) {
    recommendations.push('增加身体活动，每周至少进行3次中等强度运动');
    recommendations.push('改善睡眠质量，保证7-8小时优质睡眠');
    recommendations.push('定期进行健康体检，及时发现潜在问题');
  }
  
  // 心理功能建议
  if (qol.mentalFunction < 70) {
    recommendations.push('学习压力管理技巧，如冥想、深呼吸');
    recommendations.push('保持积极乐观的心态，多与人交流');
    recommendations.push('必要时寻求心理咨询师的帮助');
  }
  
  // 社会功能建议
  if (qol.socialFunction < 70) {
    recommendations.push('积极参与社交活动，扩大社交圈');
    recommendations.push('与家人朋友保持良好沟通');
    recommendations.push('培养兴趣爱好，丰富业余生活');
  }
  
  // 情绪健康建议
  if (qol.emotionalWellbeing < 70) {
    recommendations.push('学会情绪调节技巧，保持情绪稳定');
    recommendations.push('规律作息，避免过度疲劳');
    recommendations.push('适当进行户外活动，接触自然');
  }
  
  // 整体健康建议
  if (qol.overallScore < 70) {
    recommendations.push('制定综合健康改善计划');
    recommendations.push('建立健康的生活方式习惯');
    recommendations.push('定期监测身体状况，及时调整');
  }
  
  return recommendations;
}
