/**
 * 个性化系数系统模块
 * 基于年龄、性别、BMI、体质等个人特征的调整系数
 */

/**
 * 年龄系数
 * 根据年龄分组返回各健康要素的调整系数
 */
export function getAgeCoefficient(age: number): number {
  if (age < 30) {
    // 年轻人：气血旺盛，免疫力好
    return 1.05;
  } else if (age < 45) {
    // 青壮年：各项指标正常
    return 1.0;
  } else if (age < 60) {
    // 中年：各项指标开始下降
    return 0.95;
  } else {
    // 老年：各项指标明显下降
    return 0.9;
  }
}

/**
 * 年龄详细系数
 * 返回各健康要素的具体年龄系数
 */
export function getAgeCoefficients(age: number): Record<string, number> {
  if (age < 30) {
    return {
      immunity: 1.1,      // 年轻人免疫力较好
      circulation: 1.05, 
      qiAndBlood: 1.0,
      emotions: 1.05,     // 年轻人情绪较好
      recovery: 1.1       // 年轻人恢复能力强
    };
  } else if (age < 45) {
    return {
      immunity: 1.0,
      circulation: 1.0,
      qiAndBlood: 1.0,
      emotions: 1.0,
      recovery: 1.0
    };
  } else if (age < 60) {
    return {
      immunity: 0.9,      // 中年人免疫力开始下降
      circulation: 0.95,
      qiAndBlood: 0.95,
      emotions: 0.95,
      recovery: 0.9
    };
  } else {
    return {
      immunity: 0.8,      // 老年人免疫力明显下降
      circulation: 0.9,
      qiAndBlood: 0.9,
      emotions: 0.9,
      recovery: 0.8
    };
  }
}

/**
 * 性别系数
 * 根据性别返回各健康要素的调整系数
 */
export function getGenderCoefficient(gender: string): number {
  // 性别差异相对较小，整体影响不大
  return 1.0;
}

/**
 * 性别详细系数
 * 返回各健康要素的具体性别系数
 */
export function getGenderCoefficients(gender: string): Record<string, number> {
  if (gender === 'male') {
    return {
      circulation: 1.05,   // 男性循环系统通常较好
      immunity: 1.0,
      emotions: 0.95,      // 男性情绪管理可能较弱
      bloodLipids: 0.95,   // 男性血脂风险较高
      qiAndBlood: 1.0,
      toxins: 1.0,
      coldness: 1.0,
      overallHealth: 1.0
    };
  } else {
    return {
      circulation: 1.0,
      immunity: 1.05,      // 女性免疫力通常较好
      emotions: 1.05,      // 女性情绪管理较好
      bloodLipids: 1.0,
      qiAndBlood: 1.0,
      toxins: 1.0,
      coldness: 1.0,
      overallHealth: 1.0
    };
  }
}

/**
 * BMI系数
 * 根据BMI值返回各健康要素的调整系数
 */
export function getBMICoefficient(bmi: number): number {
  if (bmi < 18.5) {
    // 体重过轻
    return 0.9;
  } else if (bmi < 24) {
    // 正常体重
    return 1.0;
  } else if (bmi < 28) {
    // 超重
    return 0.95;
  } else {
    // 肥胖
    return 0.85;
  }
}

/**
 * BMI详细系数
 * 返回各健康要素的具体BMI系数
 */
export function getBMICoefficients(bmi: number): Record<string, number> {
  if (bmi < 18.5) {
    return {
      immunity: 0.85,
      circulation: 0.95,
      overallHealth: 0.9,
      qiAndBlood: 0.95,
      recovery: 0.9,
      toxins: 1.0,
      bloodLipids: 1.0,
      emotions: 0.95
    };
  } else if (bmi < 24) {
    return {
      immunity: 1.0,
      circulation: 1.0,
      overallHealth: 1.0,
      qiAndBlood: 1.0,
      recovery: 1.0,
      toxins: 1.0,
      bloodLipids: 1.0,
      emotions: 1.0
    };
  } else if (bmi < 28) {
    return {
      immunity: 0.95,
      circulation: 0.95,
      overallHealth: 0.95,
      bloodLipids: 0.9,
      toxins: 0.95,
      qiAndBlood: 0.95,
      recovery: 0.95,
      emotions: 0.95
    };
  } else {
    return {
      immunity: 0.85,
      circulation: 0.9,
      overallHealth: 0.85,
      bloodLipids: 0.8,
      toxins: 0.9,
      qiAndBlood: 0.9,
      recovery: 0.85,
      emotions: 0.9
    };
  }
}

/**
 * 体质系数
 * 根据中医体质返回各健康要素的调整系数
 */
export function getConstitutionCoefficient(constitution: string): number {
  const coefficients: Record<string, number> = {
    '平和质': 1.1,
    '气虚质': 0.8,
    '阳虚质': 0.75,
    '阴虚质': 0.85,
    '痰湿质': 0.75,
    '湿热质': 0.8,
    '血瘀质': 0.75,
    '气郁质': 0.8,
    '特禀质': 0.85
  };
  
  return coefficients[constitution] || 1.0;
}

/**
 * 体质详细系数
 * 返回各健康要素的具体体质系数
 */
export function getConstitutionCoefficients(constitution: string): Record<string, number> {
  const coefficients: Record<string, Record<string, number>> = {
    '平和质': {
      qiAndBlood: 1.1,
      circulation: 1.05,
      immunity: 1.05,
      emotions: 1.05,
      overallHealth: 1.1,
      toxins: 1.0,
      bloodLipids: 1.0,
      coldness: 1.0
    },
    '气虚质': {
      qiAndBlood: 0.75,    // 气虚导致气血不足
      immunity: 0.8,      // 气虚导致免疫力下降
      circulation: 0.85,  // 气虚导致循环不畅
      overallHealth: 0.8,
      toxins: 1.0,
      bloodLipids: 1.0,
      coldness: 1.0,
      emotions: 0.9
    },
    '阳虚质': {
      coldness: 0.6,      // 阳虚导致寒性明显
      immunity: 0.85,
      circulation: 0.8,   // 阳虚导致血液循环差
      overallHealth: 0.75,
      qiAndBlood: 0.9,
      toxins: 0.95,
      bloodLipids: 0.9,
      emotions: 0.85
    },
    '阴虚质': {
      emotions: 0.85,     // 阴虚容易情绪波动
      immunity: 0.85,
      overallHealth: 0.85,
      qiAndBlood: 0.9,
      circulation: 0.95,
      toxins: 0.95,
      bloodLipids: 0.95,
      coldness: 1.1       // 阴虚可能偏热
    },
    '痰湿质': {
      toxins: 0.7,        // 痰湿导致毒素堆积
      bloodLipids: 0.7,   // 痰湿导致血脂异常
      circulation: 0.85,
      overallHealth: 0.75,
      qiAndBlood: 0.85,
      immunity: 0.85,
      coldness: 0.9,
      emotions: 0.85
    },
    '湿热质': {
      toxins: 0.75,
      immunity: 0.85,
      overallHealth: 0.8,
      qiAndBlood: 0.9,
      circulation: 0.9,
      bloodLipids: 0.85,
      coldness: 1.05,     // 湿热偏热
      emotions: 0.85
    },
    '血瘀质': {
      circulation: 0.7,   // 血瘀导致循环严重不畅
      qiAndBlood: 0.8,
      overallHealth: 0.75,
      immunity: 0.85,
      toxins: 0.85,
      bloodLipids: 0.9,
      coldness: 0.9,
      emotions: 0.85
    },
    '气郁质': {
      emotions: 0.7,      // 气郁导致情绪问题严重
      immunity: 0.85,
      overallHealth: 0.8,
      qiAndBlood: 0.85,
      circulation: 0.9,
      toxins: 0.9,
      bloodLipids: 0.9,
      coldness: 1.0
    },
    '特禀质': {
      immunity: 0.8,      // 特禀质通常免疫系统敏感
      overallHealth: 0.85,
      qiAndBlood: 0.9,
      circulation: 0.95,
      toxins: 0.95,
      bloodLipids: 0.95,
      coldness: 1.0,
      emotions: 0.9
    }
  };
  
  return coefficients[constitution] || coefficients['平和质'];
}

/**
 * 综合系数计算
 * 综合考虑年龄、性别、BMI、体质的影响
 */
export function calculateComprehensiveCoefficients(data: {
  age: number;
  gender: string;
  bmi: number;
  constitution: string;
}): Record<string, number> {
  const ageCoeffs = getAgeCoefficients(data.age);
  const genderCoeffs = getGenderCoefficients(data.gender);
  const bmiCoeffs = getBMICoefficients(data.bmi);
  const constitutionCoeffs = getConstitutionCoefficients(data.constitution);
  
  const dimensions = [
    'qiAndBlood', 'circulation', 'toxins', 'bloodLipids',
    'coldness', 'immunity', 'emotions', 'overallHealth'
  ] as const;
  
  const comprehensiveCoeffs: Record<string, number> = {};
  
  dimensions.forEach(dimension => {
    // 加权计算：年龄40% + 性别20% + BMI20% + 体质20%
    comprehensiveCoeffs[dimension] = 
      (ageCoeffs[dimension] || 1.0) * 0.4 +
      (genderCoeffs[dimension] || 1.0) * 0.2 +
      (bmiCoeffs[dimension] || 1.0) * 0.2 +
      (constitutionCoeffs[dimension] || 1.0) * 0.2;
  });
  
  return comprehensiveCoeffs;
}

/**
 * 计算综合调整系数（单一数值）
 */
export function calculateOverallCoefficient(data: {
  age: number;
  gender: string;
  bmi: number;
  constitution: string;
}): number {
  const ageCoeff = getAgeCoefficient(data.age);
  const genderCoeff = getGenderCoefficient(data.gender);
  const bmiCoeff = getBMICoefficient(data.bmi);
  const constitutionCoeff = getConstitutionCoefficient(data.constitution);
  
  // 加权计算
  return ageCoeff * 0.4 + genderCoeff * 0.2 + bmiCoeff * 0.2 + constitutionCoeff * 0.2;
}

/**
 * 运动评分算法
 */
export function calculateExerciseScore(
  frequency: string,
  duration: string,
  types: string[]
): number {
  // 基础分
  let baseScore = 50;
  
  // 频率评分
  const frequencyScores: Record<string, number> = {
    '从不运动': 0,
    '每周1-2次': 60,
    '每周3-5次': 85,
    '每周6次以上': 100
  };
  baseScore = frequencyScores[frequency] || baseScore;
  
  // 时长调整
  const durationMultiplier: Record<string, number> = {
    '30分钟以内': 0.8,
    '30-60分钟': 1.0,
    '60分钟以上': 1.1
  };
  baseScore *= durationMultiplier[duration] || 1.0;
  
  // 运动类型多样性加分
  if (types.length >= 3) {
    baseScore *= 1.05; // 多样化运动加分5%
  }
  
  return Math.min(100, Math.round(baseScore));
}

/**
 * 睡眠评分算法
 */
export function calculateSleepScore(
  hours: string,
  quality: string,
  issues: string[]
): number {
  // 基础分
  let baseScore = 50;
  
  // 时长评分
  const hoursNum = parseFloat(hours);
  if (hoursNum >= 7 && hoursNum <= 8) {
    baseScore = 100; // 最佳睡眠时长
  } else if (hoursNum >= 6 && hoursNum <= 9) {
    baseScore = 90;  // 良好睡眠时长
  } else if (hoursNum >= 5 && hoursNum <= 10) {
    baseScore = 70;  // 可接受睡眠时长
  } else {
    baseScore = 50;  // 睡眠不足或过多
  }
  
  // 质量调整
  const qualityMultiplier: Record<string, number> = {
    '很好': 1.0,
    '一般': 0.85,
    '较差': 0.65,
    '很差': 0.5
  };
  baseScore *= qualityMultiplier[quality] || 0.85;
  
  // 睡眠问题扣分
  if (issues.includes('睡眠呼吸暂停')) {
    baseScore *= 0.85;
  }
  if (issues.includes('失眠') || issues.includes('早醒')) {
    baseScore *= 0.9;
  }
  
  return Math.min(100, Math.round(baseScore));
}

/**
 * 饮食评分算法
 */
export function calculateDietScore(
  habits: string,
  issues: string[]
): number {
  let baseScore = 50;
  
  // 饮食习惯评分
  const habitScores: Record<string, number> = {
    '很规律': 100,
    '规律': 85,
    '一般': 70,
    '不规律': 50,
    '暴饮暴食': 30
  };
  baseScore = habitScores[habits] || baseScore;
  
  // 饮食问题扣分
  if (issues.includes('暴饮暴食')) {
    baseScore -= 20;
  }
  if (issues.includes('夜宵')) {
    baseScore -= 10;
  }
  if (issues.includes('挑食')) {
    baseScore -= 5;
  }
  
  return Math.min(100, Math.max(0, baseScore));
}

/**
 * 压力评分算法
 */
export function calculateStressScore(
  level: string,
  sources: string[]
): number {
  let baseScore = 50;
  
  // 压力水平评分
  const levelScores: Record<string, number> = {
    '很低': 100,
    '低': 90,
    '中等': 70,
    '高': 50,
    '很高': 30
  };
  baseScore = levelScores[level] || baseScore;
  
  // 压力来源数量扣分
  const sourceCount = sources.length;
  if (sourceCount >= 3) {
    baseScore -= 15;
  } else if (sourceCount >= 2) {
    baseScore -= 8;
  } else if (sourceCount >= 1) {
    baseScore -= 3;
  }
  
  return Math.min(100, Math.max(0, baseScore));
}
