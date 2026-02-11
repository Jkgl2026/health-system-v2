/**
 * 健康评分计算器 - 科学严谨的评估模型
 *
 * 评分原则：
 * 1. 基于症状严重程度分级（紧急、严重、中等、轻微）
 * 2. 考虑症状的系统性和持续性
 * 3. 采用指数增长扣分机制，避免线性扣分导致的不合理现象
 * 4. 结合三个症状表，综合评估健康状况
 * 5. 评分范围：0-100分，分值越低表示健康状况越差
 */

// 症状严重程度级别
export enum SymptomSeverity {
  EMERGENCY = 'emergency',  // 紧急：危及生命或需立即就医（如心绞痛、呼吸困难）
  SEVERE = 'severe',         // 严重：显著影响生活质量，需长期关注（如三高、失眠、抑郁）
  MODERATE = 'moderate',     // 中等：影响日常活动，需调理改善（如关节痛、消化不良）
  MILD = 'mild',            // 轻微：轻微不适，可通过生活方式改善（如口干、皮肤痒）
}

// 症状权重配置
export const SYMPTOM_WEIGHTS = {
  [SymptomSeverity.EMERGENCY]: 5.0,  // 紧急症状每项扣5分
  [SymptomSeverity.SEVERE]: 2.0,     // 严重症状每项扣2分
  [SymptomSeverity.MODERATE]: 0.8,   // 中等症状每项扣0.8分
  [SymptomSeverity.MILD]: 0.3,       // 轻微症状每项扣0.3分
};

// 症状表权重（不同症状表的重要性）
export const SYMPTOM_TABLE_WEIGHTS = {
  BODY_LANGUAGE: 1.0,    // 身体语言简表：直接反映身体信号，权重1.0
  HABITS: 0.6,           // 不良生活习惯：间接影响健康，权重0.6
  SYMPTOMS_300: 0.8,     // 300症状表：全面评估，权重0.8
};

// 指数增长系数（症状数量越多，扣分越重）
export const EXPONENTIAL_FACTORS = {
  0: 1.0,    // 0-5项：系数1.0
  5: 1.2,    // 6-15项：系数1.2
  15: 1.5,   // 16-30项：系数1.5
  30: 2.0,   // 31-50项：系数2.0
  50: 2.5,   // 51-100项：系数2.5
  100: 3.0,  // 100项以上：系数3.0
};

// 严重症状列表（根据医学标准和实际影响判断）
export const SEVERE_SYMPTOM_IDS = {
  // 身体语言简表的严重症状
  bodyLanguage: new Set([
    40,   // 呼吸困难（紧急）
    48,   // 胸闷气短（严重）
    49,   // 心慌心悸（严重）
    50,   // 心绞痛（紧急）
    59,   // 静脉曲张（严重）
    71,   // 高血脂（严重）
    72,   // 高血压（严重）
    73,   // 高血糖（严重）
    74,   // 低血糖（紧急）
    75,   // 低血压（严重）
    81,   // 乳腺增生（严重）
    98,   // 淋巴肿大（紧急）
  ]),
  // 300症状表的严重症状（示例，需根据实际数据补充）
  symptoms300: new Set([
    // 紧急症状
    // 严重症状：三高、心血管、神经系统
  ]),
};

// 紧急症状列表（需立即就医）
export const EMERGENCY_SYMPTOM_IDS = {
  bodyLanguage: new Set([40, 50, 74, 98]),  // 呼吸困难、心绞痛、低血糖、淋巴肿大
  symptoms300: new Set([]),
};

// 根据症状ID获取严重程度
export function getSymptomSeverity(symptomId: number, tableType: 'bodyLanguage' | 'symptoms300'): SymptomSeverity {
  // 检查是否为紧急症状
  const emergencySet: Set<number> = EMERGENCY_SYMPTOM_IDS[tableType];
  if (emergencySet.has(symptomId)) {
    return SymptomSeverity.EMERGENCY;
  }

  // 检查是否为严重症状
  const severeSet: Set<number> = SEVERE_SYMPTOM_IDS[tableType];
  if (severeSet.has(symptomId)) {
    return SymptomSeverity.SEVERE;
  }

  // 根据症状类别判断严重程度（简化逻辑，可根据实际情况调整）
  // 身体语言简表的某些类别默认为中等严重程度
  const bodySymptom = require('@/lib/health-data').BODY_SYMPTOMS.find((s: any) => s.id === symptomId);
  if (bodySymptom) {
    const severeCategories = ['循环系统', '神经系统', '免疫系统', '妇科'];
    const moderateCategories = ['呼吸系统', '消化系统', '代谢', '五官'];
    const mildCategories = ['皮肤', '情绪'];

    if (severeCategories.includes(bodySymptom.category)) {
      return SymptomSeverity.SEVERE;
    } else if (moderateCategories.includes(bodySymptom.category)) {
      return SymptomSeverity.MODERATE;
    } else {
      return SymptomSeverity.MILD;
    }
  }

  // 300症状表的严重程度判断（可根据实际数据补充）
  const symptom300 = require('@/lib/health-data').BODY_SYMPTOMS_300.find((s: any) => s.id === symptomId);
  if (symptom300) {
    // 根据描述中的关键词判断
    const description = symptom300.description || '';
    if (description.includes('危及') || description.includes('立即')) {
      return SymptomSeverity.EMERGENCY;
    } else if (description.includes('严重') || description.includes('显著')) {
      return SymptomSeverity.SEVERE;
    } else if (description.includes('影响')) {
      return SymptomSeverity.MODERATE;
    } else {
      return SymptomSeverity.MILD;
    }
  }

  // 默认为中等严重程度
  return SymptomSeverity.MODERATE;
}

// 计算指数增长系数
export function getExponentialFactor(symptomCount: number): number {
  if (symptomCount <= 5) return EXPONENTIAL_FACTORS[0];
  if (symptomCount <= 15) return EXPONENTIAL_FACTORS[5];
  if (symptomCount <= 30) return EXPONENTIAL_FACTORS[15];
  if (symptomCount <= 50) return EXPONENTIAL_FACTORS[30];
  if (symptomCount <= 100) return EXPONENTIAL_FACTORS[50];
  return EXPONENTIAL_FACTORS[100];
}

// 计算单个症状表的扣分
export function calculateSymptomTableDeduction(
  symptomIds: number[],
  tableType: 'bodyLanguage' | 'habits' | 'symptoms300'
): {
  deduction: number;
  severityBreakdown: {
    emergency: number;
    severe: number;
    moderate: number;
    mild: number;
  };
  factor: number;
} {
  const severityBreakdown: {
    emergency: number;
    severe: number;
    moderate: number;
    mild: number;
  } = {
    emergency: 0,
    severe: 0,
    moderate: 0,
    mild: 0,
  };

  // 统计各个严重程度的症状数量
  (symptomIds as number[]).forEach(id => {
    const severity = tableType === 'habits' ? SymptomSeverity.MODERATE : getSymptomSeverity(id, tableType);
    switch (severity) {
      case SymptomSeverity.EMERGENCY:
        severityBreakdown.emergency++;
        break;
      case SymptomSeverity.SEVERE:
        severityBreakdown.severe++;
        break;
      case SymptomSeverity.MODERATE:
        severityBreakdown.moderate++;
        break;
      case SymptomSeverity.MILD:
        severityBreakdown.mild++;
        break;
    }
  });

  // 计算基础扣分
  const baseDeduction =
    severityBreakdown.emergency * SYMPTOM_WEIGHTS[SymptomSeverity.EMERGENCY] +
    severityBreakdown.severe * SYMPTOM_WEIGHTS[SymptomSeverity.SEVERE] +
    severityBreakdown.moderate * SYMPTOM_WEIGHTS[SymptomSeverity.MODERATE] +
    severityBreakdown.mild * SYMPTOM_WEIGHTS[SymptomSeverity.MILD];

  // 获取指数增长系数
  const totalSymptoms = symptomIds.length;
  const factor = getExponentialFactor(totalSymptoms);

  // 应用症状表权重
  const tableWeight = tableType === 'bodyLanguage' ? SYMPTOM_TABLE_WEIGHTS.BODY_LANGUAGE :
                     tableType === 'habits' ? SYMPTOM_TABLE_WEIGHTS.HABITS :
                     SYMPTOM_TABLE_WEIGHTS.SYMPTOMS_300;

  // 计算最终扣分：基础扣分 × 指数系数 × 症状表权重
  const deduction = baseDeduction * factor * tableWeight;

  return {
    deduction,
    severityBreakdown,
    factor,
  };
}

// 计算综合健康评分
export function calculateComprehensiveHealthScore(params: {
  bodySymptomIds: number[];      // 身体语言简表选中的症状ID
  habitIds: number[];            // 不良生活习惯选中的习惯ID
  symptom300Ids: number[];       // 300症状表选中的症状ID
}): {
  healthScore: number;           // 健康评分（0-100）
  totalDeduction: number;        // 总扣分
  breakdown: {
    bodyLanguage: {
      deduction: number;
      count: number;
      severityBreakdown: any;
      factor: number;
    };
    habits: {
      deduction: number;
      count: number;
      severityBreakdown: any;
      factor: number;
    };
    symptoms300: {
      deduction: number;
      count: number;
      severityBreakdown: any;
      factor: number;
    };
  };
  healthStatus: string;
  recommendations: string[];
} {
  const { bodySymptomIds, habitIds, symptom300Ids } = params;

  // 计算各个症状表的扣分
  const bodyLanguageResult = calculateSymptomTableDeduction(bodySymptomIds, 'bodyLanguage');
  const habitsResult = calculateSymptomTableDeduction(habitIds, 'habits');
  const symptoms300Result = calculateSymptomTableDeduction(symptom300Ids, 'symptoms300');

  // 计算总扣分
  const totalDeduction = bodyLanguageResult.deduction + habitsResult.deduction + symptoms300Result.deduction;

  // 计算健康评分（基础分100分）
  const healthScore = Math.max(0, Math.round(100 - totalDeduction));

  // 确定健康状态
  let healthStatus = '';
  if (healthScore >= 85) healthStatus = '优秀';
  else if (healthScore >= 70) healthStatus = '良好';
  else if (healthScore >= 50) healthStatus = '一般';
  else if (healthScore >= 30) healthStatus = '需关注';
  else healthStatus = '需调理';

  // 生成调理建议
  const recommendations: string[] = [];

  // 基于紧急症状的建议
  if (bodyLanguageResult.severityBreakdown.emergency > 0 || symptoms300Result.severityBreakdown.emergency > 0) {
    recommendations.push('检测到紧急症状，建议立即就医，进行全面体检。');
  }

  // 基于严重症状的建议
  if (bodyLanguageResult.severityBreakdown.severe > 0 || symptoms300Result.severityBreakdown.severe > 0) {
    recommendations.push('存在严重健康问题，建议尽快制定调理计划，必要时咨询专业医生。');
  }

  // 基于症状数量的建议
  const totalSymptoms = bodySymptomIds.length + habitIds.length + symptom300Ids.length;
  if (totalSymptoms > 50) {
    recommendations.push('症状较多，建议分阶段调理，优先处理紧急和严重症状。');
  } else if (totalSymptoms > 30) {
    recommendations.push('存在较多健康问题，建议制定系统性的调理方案。');
  } else if (totalSymptoms > 15) {
    recommendations.push('建议关注当前健康问题，适当调整生活方式。');
  }

  // 基于症状表的建议
  if (bodySymptomIds.length > 20) {
    recommendations.push('身体信号较多，建议从改善生活习惯入手，增强体质。');
  }
  if (habitIds.length > 50) {
    recommendations.push('不良生活习惯较多，建议逐步改善，培养健康的生活方式。');
  }
  if (symptom300Ids.length > 50) {
    recommendations.push('300症状表显示存在较多健康问题，建议进行全面调理。');
  }

  // 如果没有建议，提供默认建议
  if (recommendations.length === 0) {
    if (healthScore >= 70) {
      recommendations.push('健康状况良好，建议继续保持良好的生活习惯。');
    } else {
      recommendations.push('建议适当调整生活方式，定期进行健康检查。');
    }
  }

  return {
    healthScore,
    totalDeduction,
    breakdown: {
      bodyLanguage: {
        deduction: bodyLanguageResult.deduction,
        count: bodySymptomIds.length,
        severityBreakdown: bodyLanguageResult.severityBreakdown,
        factor: bodyLanguageResult.factor,
      },
      habits: {
        deduction: habitsResult.deduction,
        count: habitIds.length,
        severityBreakdown: habitsResult.severityBreakdown,
        factor: habitsResult.factor,
      },
      symptoms300: {
        deduction: symptoms300Result.deduction,
        count: symptom300Ids.length,
        severityBreakdown: symptoms300Result.severityBreakdown,
        factor: symptoms300Result.factor,
      },
    },
    healthStatus,
    recommendations,
  };
}

// 计算健康等级
export function getHealthLevel(score: number): {
  level: string;
  color: string;
  textColor: string;
  icon: string;
  description: string;
} {
  if (score >= 85) {
    return {
      level: '优秀',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      icon: 'CheckCircle2',
      description: '健康状况优秀，继续保持良好习惯',
    };
  } else if (score >= 70) {
    return {
      level: '良好',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      icon: 'CheckCircle',
      description: '健康状况良好，适当调整生活方式',
    };
  } else if (score >= 50) {
    return {
      level: '一般',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      icon: 'AlertCircle',
      description: '健康状况一般，建议关注健康问题',
    };
  } else if (score >= 30) {
    return {
      level: '需关注',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      icon: 'AlertTriangle',
      description: '健康状况需关注，建议制定调理计划',
    };
  } else {
    return {
      level: '需调理',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      icon: 'XCircle',
      description: '健康状况需调理，建议尽快就医',
    };
  }
}
