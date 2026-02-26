// utils/health-score-calculator.js
// 健康评分计算器 - 科学严谨的评估模型

const { BODY_SYMPTOMS, BODY_SYMPTOMS_300 } = require('./health-data');

// 症状严重程度级别
const SymptomSeverity = {
  EMERGENCY: 'emergency',  // 紧急：危及生命或需立即就医
  SEVERE: 'severe',        // 严重：显著影响生活质量，需长期关注
  MODERATE: 'moderate',    // 中等：影响日常活动，需调理改善
  MILD: 'mild',           // 轻微：轻微不适，可通过生活方式改善
};

// 症状权重配置
const SYMPTOM_WEIGHTS = {
  [SymptomSeverity.EMERGENCY]: 5.0,  // 紧急症状每项扣5分
  [SymptomSeverity.SEVERE]: 2.0,     // 严重症状每项扣2分
  [SymptomSeverity.MODERATE]: 0.8,   // 中等症状每项扣0.8分
  [SymptomSeverity.MILD]: 0.3,       // 轻微症状每项扣0.3分
};

// 症状表权重（不同症状表的重要性）
const SYMPTOM_TABLE_WEIGHTS = {
  BODY_LANGUAGE: 1.0,    // 身体语言简表：直接反映身体信号，权重1.0
  HABITS: 0.6,           // 不良生活习惯：间接影响健康，权重0.6
  SYMPTOMS_300: 0.8,     // 300症状表：全面评估，权重0.8
};

// 指数增长系数（症状数量越多，扣分越重）
const EXPONENTIAL_FACTORS = {
  0: 1.0,    // 0-5项：系数1.0
  5: 1.2,    // 6-15项：系数1.2
  15: 1.5,   // 16-30项：系数1.5
  30: 2.0,   // 31-50项：系数2.0
  50: 2.5,   // 51-100项：系数2.5
  100: 3.0,  // 100项以上：系数3.0
};

// 严重症状列表（根据医学标准和实际影响判断）
const SEVERE_SYMPTOM_IDS = {
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
  // 300症状表的严重症状
  symptoms300: new Set([
    422,  // 低血压
    423,  // 高血压
    424,  // 低血糖
    425,  // 高血糖
    426,  // 高血脂
    428,  // 心绞痛
    442,  // 抑郁症
    554,  // 不孕不育
  ]),
};

// 紧急症状列表（需立即就医）
const EMERGENCY_SYMPTOM_IDS = {
  bodyLanguage: new Set([40, 50, 74, 98]),  // 呼吸困难、心绞痛、低血糖、淋巴肿大
  symptoms300: new Set([428, 442]),  // 心绞痛、抑郁症
};

/**
 * 根据症状ID获取严重程度
 * @param {number} symptomId - 症状ID
 * @param {string} tableType - 表类型 'bodyLanguage' | 'symptoms300'
 * @returns {string} 严重程度
 */
function getSymptomSeverity(symptomId, tableType) {
  // 检查是否为紧急症状
  const emergencySet = EMERGENCY_SYMPTOM_IDS[tableType];
  if (emergencySet && emergencySet.has(symptomId)) {
    return SymptomSeverity.EMERGENCY;
  }

  // 检查是否为严重症状
  const severeSet = SEVERE_SYMPTOM_IDS[tableType];
  if (severeSet && severeSet.has(symptomId)) {
    return SymptomSeverity.SEVERE;
  }

  // 根据症状类别判断严重程度
  if (tableType === 'bodyLanguage') {
    const bodySymptom = BODY_SYMPTOMS.find(s => s.id === symptomId);
    if (bodySymptom) {
      const severeCategories = ['循环系统', '神经系统', '免疫系统', '妇科'];
      const moderateCategories = ['呼吸系统', '消化系统', '代谢', '五官', '头部', '胸部', '腹部'];
      const mildCategories = ['皮肤', '情绪', '四肢'];

      if (severeCategories.includes(bodySymptom.category)) {
        return SymptomSeverity.SEVERE;
      } else if (moderateCategories.includes(bodySymptom.category)) {
        return SymptomSeverity.MODERATE;
      } else {
        return SymptomSeverity.MILD;
      }
    }
  }

  // 300症状表的严重程度判断
  if (tableType === 'symptoms300') {
    const symptom300 = BODY_SYMPTOMS_300.find(s => s.id === symptomId);
    if (symptom300) {
      // 根据分类判断严重程度
      const severeCategories = ['循环系统', '肿瘤', '妇科', '泌尿生殖'];
      const moderateCategories = ['消化系统', '头部', '五官', '咽喉', '颈肩腰腿'];
      const mildCategories = ['四肢关节', '指甲', '其他'];

      if (severeCategories.includes(symptom300.category)) {
        return SymptomSeverity.SEVERE;
      } else if (moderateCategories.includes(symptom300.category)) {
        return SymptomSeverity.MODERATE;
      } else {
        return SymptomSeverity.MILD;
      }
    }
  }

  // 默认为中等严重程度
  return SymptomSeverity.MODERATE;
}

/**
 * 计算指数增长系数
 * @param {number} symptomCount - 症状数量
 * @returns {number} 指数系数
 */
function getExponentialFactor(symptomCount) {
  if (symptomCount <= 5) return EXPONENTIAL_FACTORS[0];
  if (symptomCount <= 15) return EXPONENTIAL_FACTORS[5];
  if (symptomCount <= 30) return EXPONENTIAL_FACTORS[15];
  if (symptomCount <= 50) return EXPONENTIAL_FACTORS[30];
  if (symptomCount <= 100) return EXPONENTIAL_FACTORS[50];
  return EXPONENTIAL_FACTORS[100];
}

/**
 * 计算单个症状表的扣分
 * @param {Array} symptomIds - 症状ID数组
 * @param {string} tableType - 表类型
 * @returns {Object} 扣分结果
 */
function calculateSymptomTableDeduction(symptomIds, tableType) {
  const severityBreakdown = {
    emergency: 0,
    severe: 0,
    moderate: 0,
    mild: 0,
  };

  // 统计各个严重程度的症状数量
  symptomIds.forEach(id => {
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

/**
 * 计算综合健康评分
 * @param {Object} params - 参数对象
 * @param {Array} params.bodySymptomIds - 身体语言简表选中的症状ID
 * @param {Array} params.habitIds - 不良生活习惯选中的习惯ID
 * @param {Array} params.symptom300Ids - 300症状表选中的症状ID
 * @returns {Object} 评分结果
 */
function calculateComprehensiveHealthScore(params) {
  const { bodySymptomIds = [], habitIds = [], symptom300Ids = [] } = params;

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
  let healthStatusColor = '';
  if (healthScore >= 85) {
    healthStatus = '优秀';
    healthStatusColor = '#22c55e';
  } else if (healthScore >= 70) {
    healthStatus = '良好';
    healthStatusColor = '#3b82f6';
  } else if (healthScore >= 50) {
    healthStatus = '一般';
    healthStatusColor = '#eab308';
  } else if (healthScore >= 30) {
    healthStatus = '需关注';
    healthStatusColor = '#f97316';
  } else {
    healthStatus = '需调理';
    healthStatusColor = '#ef4444';
  }

  // 生成调理建议
  const recommendations = [];

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
    healthStatusColor,
    recommendations,
    totalSymptoms,
  };
}

/**
 * 获取健康状态描述
 * @param {number} score - 健康评分
 * @returns {Object} 状态信息
 */
function getHealthStatusInfo(score) {
  if (score >= 85) {
    return {
      level: '优秀',
      color: '#22c55e',
      bgColor: '#dcfce7',
      description: '健康状况优秀，继续保持良好的生活习惯。',
    };
  } else if (score >= 70) {
    return {
      level: '良好',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      description: '健康状况良好，注意维持健康的生活方式。',
    };
  } else if (score >= 50) {
    return {
      level: '一般',
      color: '#eab308',
      bgColor: '#fef9c3',
      description: '健康状况一般，建议改善生活习惯。',
    };
  } else if (score >= 30) {
    return {
      level: '需关注',
      color: '#f97316',
      bgColor: '#ffedd5',
      description: '健康状况需要关注，建议制定调理计划。',
    };
  } else {
    return {
      level: '需调理',
      color: '#ef4444',
      bgColor: '#fee2e2',
      description: '健康状况较差，建议立即开始调理。',
    };
  }
}

module.exports = {
  // 常量
  SymptomSeverity,
  SYMPTOM_WEIGHTS,
  SYMPTOM_TABLE_WEIGHTS,
  EXPONENTIAL_FACTORS,

  // 函数
  getSymptomSeverity,
  getExponentialFactor,
  calculateSymptomTableDeduction,
  calculateComprehensiveHealthScore,
  getHealthStatusInfo,
};
