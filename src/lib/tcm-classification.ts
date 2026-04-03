/**
 * 中医辨证系统模块
 * 包含八纲辨证、脏腑辨证、气血津液辨证等
 */

// 八纲辨证接口
export interface EightPrinciples {
  yinYang: string;          // 阴阳属性
  coldHeat: string;         // 寒热属性
  deficiencyExcess: string; // 虚实属性
  interiorExterior: string; // 表里属性
}

// 脏腑辨证接口
export interface OrganDifferentiation {
  affectedOrgans: string[];       // 受累脏腑
  organImbalance: Record<string, number>; // 脏腑失衡程度
  primaryImbalance: string;       // 主要失衡
}

// 气血津液辨证接口
export interface QiBloodFluid {
  qiStatus: string;      // 气的状态
  bloodStatus: string;   // 血的状态
  fluidStatus: string;   // 津液状态
}

// 中医辨证结果
export interface TCMClassification {
  eightPrinciples: EightPrinciples;
  organDifferentiation: OrganDifferentiation;
  qiBloodFluid: QiBloodFluid;
  syndromeType: string;
  syndromeDescription: string;
  treatmentPrinciple: string;
  herbalFormula?: string;
  acupuncturePoints?: string[];
}

/**
 * 执行中医辨证
 */
export function calculateTCMClassification(data: {
  healthQuestionnaire?: any;
  constitutionQuestionnaire?: any;
  personalInfo: any;
}): TCMClassification {
  const constitution = data.constitutionQuestionnaire?.primaryConstitution || '平和质';
  const health = data.healthQuestionnaire || {};
  
  // 八纲辨证
  const eightPrinciples = analyzeEightPrinciples(constitution, health);
  
  // 脏腑辨证
  const organDifferentiation = analyzeOrgans(constitution, health);
  
  // 气血津液辨证
  const qiBloodFluid = analyzeQiBloodFluid(constitution, health);
  
  // 综合证型
  const syndrome = determineSyndrome(eightPrinciples, organDifferentiation, qiBloodFluid, constitution);
  
  // 治疗原则
  const treatmentPrinciple = determineTreatmentPrinciple(syndrome, eightPrinciples, organDifferentiation);
  
  // 推荐方剂
  const herbalFormula = recommendHerbalFormula(syndrome, constitution);
  
  // 推荐穴位
  const acupuncturePoints = recommendAcupuncturePoints(syndrome, organDifferentiation);
  
  return {
    eightPrinciples,
    organDifferentiation,
    qiBloodFluid,
    syndromeType: syndrome.type,
    syndromeDescription: syndrome.description,
    treatmentPrinciple,
    herbalFormula,
    acupuncturePoints
  };
}

/**
 * 八纲辨证分析
 */
function analyzeEightPrinciples(constitution: string, health: any): EightPrinciples {
  // 阴阳属性
  let yinYang = '阴阳平衡';
  if (constitution === '阳虚质' || constitution === '气虚质') {
    yinYang = '偏阳虚';
  } else if (constitution === '阴虚质') {
    yinYang = '偏阴虚';
  }
  
  // 寒热属性
  let coldHeat = '寒热适中';
  if (constitution === '阳虚质' || constitution === '寒湿质') {
    coldHeat = '偏寒';
  } else if (constitution === '阴虚质' || constitution === '湿热质') {
    coldHeat = '偏热';
  }
  
  // 检查症状
  if (health.symptoms) {
    if (health.symptoms.includes('怕冷') || health.symptoms.includes('手脚冰凉')) {
      coldHeat = '偏寒';
    }
    if (health.symptoms.includes('怕热') || health.symptoms.includes('盗汗')) {
      coldHeat = '偏热';
    }
  }
  
  // 虚实属性
  let deficiencyExcess = '虚实平衡';
  if (['气虚质', '阳虚质', '阴虚质', '血虚质'].includes(constitution)) {
    deficiencyExcess = '偏虚';
  } else if (['痰湿质', '湿热质', '血瘀质'].includes(constitution)) {
    deficiencyExcess = '偏实';
  }
  
  // 表里属性
  let interiorExterior = '表里平衡';
  if (health.symptoms && health.symptoms.length > 3) {
    interiorExterior = '偏里';
  }
  
  return {
    yinYang,
    coldHeat,
    deficiencyExcess,
    interiorExterior
  };
}

/**
 * 脏腑辨证分析
 */
function analyzeOrgans(constitution: string, health: any): OrganDifferentiation {
  const affectedOrgans: string[] = [];
  const organImbalance: Record<string, number> = {};
  
  // 脾
  let spleenScore = 0;
  if (constitution === '痰湿质' || constitution === '气虚质') {
    spleenScore += 30;
  }
  if (health.dietIssues && health.dietIssues.length > 0) {
    spleenScore += 20;
  }
  if (health.symptoms && health.symptoms.includes('食欲不振')) {
    spleenScore += 20;
  }
  if (spleenScore > 0) {
    affectedOrgans.push('脾');
    organImbalance['脾'] = Math.min(100, spleenScore);
  }
  
  // 肺
  let lungScore = 0;
  if (health.smokingStatus === '目前吸烟') {
    lungScore += 30;
  }
  if (health.symptoms && (health.symptoms.includes('咳嗽') || health.symptoms.includes('气短'))) {
    lungScore += 25;
  }
  if (lungScore > 0) {
    affectedOrgans.push('肺');
    organImbalance['肺'] = Math.min(100, lungScore);
  }
  
  // 心
  let heartScore = 0;
  if (health.has_hypertension || health.cardiovascular_diseases) {
    heartScore += 35;
  }
  if (health.symptoms && (health.symptoms.includes('心悸') || health.symptoms.includes('失眠'))) {
    heartScore += 25;
  }
  if (constitution === '气郁质') {
    heartScore += 15;
  }
  if (heartScore > 0) {
    affectedOrgans.push('心');
    organImbalance['心'] = Math.min(100, heartScore);
  }
  
  // 肝
  let liverScore = 0;
  if (constitution === '气郁质' || constitution === '肝火质') {
    liverScore += 30;
  }
  if (health.stressLevel === '高' || health.stressLevel === '很高') {
    liverScore += 25;
  }
  if (health.symptoms && (health.symptoms.includes('易怒') || health.symptoms.includes('头晕'))) {
    liverScore += 20;
  }
  if (liverScore > 0) {
    affectedOrgans.push('肝');
    organImbalance['肝'] = Math.min(100, liverScore);
  }
  
  // 肾
  let kidneyScore = 0;
  if (health.personalInfo && health.personalInfo.age > 50) {
    kidneyScore += 20;
  }
  if (constitution === '阳虚质' || constitution === '阴虚质') {
    kidneyScore += 30;
  }
  if (health.symptoms && (health.symptoms.includes('腰酸') || health.symptoms.includes('耳鸣'))) {
    kidneyScore += 25;
  }
  if (kidneyScore > 0) {
    affectedOrgans.push('肾');
    organImbalance['肾'] = Math.min(100, kidneyScore);
  }
  
  // 胃
  let stomachScore = 0;
  if (health.dietHabits === '不规律' || health.dietHabits === '暴饮暴食') {
    stomachScore += 25;
  }
  if (health.dietIssues && health.dietIssues.includes('暴饮暴食')) {
    stomachScore += 20;
  }
  if (stomachScore > 0) {
    affectedOrgans.push('胃');
    organImbalance['胃'] = Math.min(100, stomachScore);
  }
  
  // 确定主要失衡
  let primaryImbalance = '无明显失衡';
  let maxScore = 0;
  for (const [organ, score] of Object.entries(organImbalance)) {
    if (score > maxScore) {
      maxScore = score;
      primaryImbalance = organ;
    }
  }
  
  return {
    affectedOrgans,
    organImbalance,
    primaryImbalance
  };
}

/**
 * 气血津液辨证分析
 */
function analyzeQiBloodFluid(constitution: string, health: any): QiBloodFluid {
  // 气的状态
  let qiStatus = '气机调畅';
  if (constitution === '气虚质') {
    qiStatus = '气虚';
  } else if (constitution === '气郁质') {
    qiStatus = '气滞';
  }
  
  // 血的状态
  let bloodStatus = '血行通畅';
  if (constitution === '血瘀质') {
    bloodStatus = '血瘀';
  } else if (constitution === '血虚质') {
    bloodStatus = '血虚';
  }
  
  // 津液的状态
  let fluidStatus = '津液调和';
  if (constitution === '痰湿质' || constitution === '湿热质') {
    fluidStatus = '水湿内停';
  } else if (constitution === '阴虚质') {
    fluidStatus = '津液亏损';
  } else if (constitution === '阳虚质') {
    fluidStatus = '水液不化';
  }
  
  return {
    qiStatus,
    bloodStatus,
    fluidStatus
  };
}

/**
 * 确定综合证型
 */
function determineSyndrome(
  eightPrinciples: EightPrinciples,
  organDifferentiation: OrganDifferentiation,
  qiBloodFluid: QiBloodFluid,
  constitution: string
): { type: string; description: string } {
  const syndromeParts: string[] = [];
  
  // 添加体质
  syndromeParts.push(constitution);
  
  // 添加脏腑失衡
  if (organDifferentiation.primaryImbalance !== '无明显失衡') {
    syndromeParts.push(`${organDifferentiation.primaryImbalance}失调`);
  }
  
  // 添加气血津液状态
  if (qiBloodFluid.qiStatus !== '气机调畅') {
    syndromeParts.push(qiBloodFluid.qiStatus);
  }
  if (qiBloodFluid.bloodStatus !== '血行通畅') {
    syndromeParts.push(qiBloodFluid.bloodStatus);
  }
  
  const type = syndromeParts.join('、');
  
  // 生成描述
  let description = `${constitution}体质`;
  
  if (organDifferentiation.affectedOrgans.length > 0) {
    description += `，主要涉及${organDifferentiation.affectedOrgans.join('、')}`;
  }
  
  if (qiBloodFluid.qiStatus !== '气机调畅') {
    description += `，表现为${qiBloodFluid.qiStatus}`;
  }
  
  if (eightPrinciples.coldHeat !== '寒热适中') {
    description += `，整体${eightPrinciples.coldHeat}`;
  }
  
  return {
    type,
    description
  };
}

/**
 * 确定治疗原则
 */
function determineTreatmentPrinciple(
  syndrome: { type: string },
  eightPrinciples: EightPrinciples,
  organDifferentiation: OrganDifferentiation
): string {
  const principles: string[] = [];
  
  // 基于寒热
  if (eightPrinciples.coldHeat === '偏寒') {
    principles.push('温阳散寒');
  } else if (eightPrinciples.coldHeat === '偏热') {
    principles.push('清热泻火');
  }
  
  // 基于虚实
  if (eightPrinciples.deficiencyExcess === '偏虚') {
    principles.push('补虚扶正');
  } else if (eightPrinciples.deficiencyExcess === '偏实') {
    principles.push('祛邪泻实');
  }
  
  // 基于脏腑
  if (organDifferentiation.primaryImbalance !== '无明显失衡') {
    const organ = organDifferentiation.primaryImbalance;
    const organTreatments: Record<string, string> = {
      '脾': '健脾益气',
      '肺': '宣肺化痰',
      '心': '养心安神',
      '肝': '疏肝理气',
      '肾': '补肾固精',
      '胃': '和胃降逆'
    };
    if (organTreatments[organ]) {
      principles.push(organTreatments[organ]);
    }
  }
  
  // 基于气血
  if (syndrome.type.includes('气虚')) {
    principles.push('补气');
  }
  if (syndrome.type.includes('血瘀')) {
    principles.push('活血化瘀');
  }
  
  return principles.join('、') || '调和气血，平衡阴阳';
}

/**
 * 推荐方剂
 */
function recommendHerbalFormula(syndrome: { type: string }, constitution: string): string | undefined {
  const formulaMap: Record<string, string> = {
    '气虚质': '四君子汤、补中益气汤',
    '阳虚质': '右归丸、金匮肾气丸',
    '阴虚质': '六味地黄丸、左归丸',
    '痰湿质': '二陈汤、平胃散',
    '湿热质': '三仁汤、龙胆泻肝汤',
    '血瘀质': '血府逐瘀汤、桃红四物汤',
    '气郁质': '逍遥散、柴胡疏肝散',
    '特禀质': '玉屏风散、过敏煎'
  };
  
  return formulaMap[constitution];
}

/**
 * 推荐穴位
 */
function recommendAcupuncturePoints(syndrome: { type: string }, organDifferentiation: OrganDifferentiation): string[] {
  const points: string[] = [];
  
  // 基于体质
  if (syndrome.type.includes('气虚')) {
    points.push('足三里', '气海', '关元');
  }
  if (syndrome.type.includes('阳虚')) {
    points.push('命门', '关元', '气海');
  }
  if (syndrome.type.includes('阴虚')) {
    points.push('三阴交', '太溪', '复溜');
  }
  if (syndrome.type.includes('痰湿')) {
    points.push('丰隆', '中脘', '足三里');
  }
  if (syndrome.type.includes('血瘀')) {
    points.push('血海', '膈俞', '三阴交');
  }
  if (syndrome.type.includes('气郁')) {
    points.push('太冲', '内关', '期门');
  }
  
  // 基于脏腑
  const organPoints: Record<string, string[]> = {
    '脾': ['太白', '三阴交', '足三里'],
    '肺': ['太渊', '肺俞', '尺泽'],
    '心': ['神门', '内关', '心俞'],
    '肝': ['太冲', '期门', '肝俞'],
    '肾': ['太溪', '肾俞', '涌泉'],
    '胃': ['中脘', '足三里', '内庭']
  };
  
  for (const organ of organDifferentiation.affectedOrgans) {
    if (organPoints[organ]) {
      points.push(...organPoints[organ]);
    }
  }
  
  // 去重
  return [...new Set(points)];
}

/**
 * 中医养生建议
 */
export function generateTCMRecommendations(tcmClassification: TCMClassification): string[] {
  const recommendations: string[] = [];
  
  const { eightPrinciples, organDifferentiation, qiBloodFluid, syndromeType } = tcmClassification;
  
  // 基于寒热
  if (eightPrinciples.coldHeat === '偏寒') {
    recommendations.push('饮食宜温热，多食生姜、羊肉、桂圆等温补食物');
    recommendations.push('注意保暖，避免受寒');
  } else if (eightPrinciples.coldHeat === '偏热') {
    recommendations.push('饮食宜清淡，多食绿豆、黄瓜、梨等清热食物');
    recommendations.push('避免辛辣刺激食物');
  }
  
  // 基于虚实
  if (eightPrinciples.deficiencyExcess === '偏虚') {
    recommendations.push('适当进补，如人参、黄芪、当归等');
    recommendations.push('避免过度劳累，注意休息');
  } else if (eightPrinciples.deficiencyExcess === '偏实') {
    recommendations.push('适当运动，促进气血运行');
    recommendations.push('可考虑拔罐、刮痧等祛邪方法');
  }
  
  // 基于脏腑
  if (organDifferentiation.primaryImbalance === '脾') {
    recommendations.push('健脾养胃：规律饮食，少食生冷');
    recommendations.push('可多食山药、小米、扁豆等健脾食物');
  } else if (organDifferentiation.primaryImbalance === '肺') {
    recommendations.push('养肺润燥：多吃白色食物，如百合、雪梨');
    recommendations.push('坚持适度有氧运动');
  } else if (organDifferentiation.primaryImbalance === '心') {
    recommendations.push('养心安神：保持心情舒畅，避免过度思虑');
    recommendations.push('可适当午休，晚上11点前入睡');
  } else if (organDifferentiation.primaryImbalance === '肝') {
    recommendations.push('疏肝理气：保持情绪稳定，避免暴怒');
    recommendations.push('多食绿色蔬菜，如菠菜、芹菜');
  } else if (organDifferentiation.primaryImbalance === '肾') {
    recommendations.push('补肾固精：节制房事，避免过度劳累');
    recommendations.push('可多食黑芝麻、核桃、枸杞等补肾食物');
  }
  
  // 基于气血津液
  if (qiBloodFluid.qiStatus === '气虚') {
    recommendations.push('补气：适当进行八段锦、太极拳等运动');
  }
  if (qiBloodFluid.bloodStatus === '血瘀') {
    recommendations.push('活血：适当按摩、热敷促进血液循环');
  }
  if (qiBloodFluid.fluidStatus === '津液亏损') {
    recommendations.push('养津：多喝水，多吃水果蔬菜');
  }
  
  return recommendations;
}
