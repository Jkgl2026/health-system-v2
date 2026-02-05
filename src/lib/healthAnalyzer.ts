/**
 * 健康分析自动生成器
 * 根据用户的健康数据自动生成详细、专业的健康分析报告
 */

export interface UserData {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  job: string;
  sleep: string;
  drink_smoke: string;
  exercise: string;
  diet: string;
  pressure_state: string;
  allergy: string;
  sickness: string;
  family_sickness: string;
  symptom: string;
  health_score: number;
  score_life: number;
  score_sleep: number;
  score_stress: number;
  score_body: number;
  score_risk: number;
  health_status: string;
  complete: number;
}

export function generateHealthAnalysis(userData: UserData): string {
  const analysis: string[] = [];

  // 1. 综合健康评价
  analysis.push('【综合健康评价】');
  analysis.push('');
  analysis.push(`尊敬的${userData.name}先生/女士，感谢您完成本次健康自检。`);
  analysis.push('');
  analysis.push(`根据您提供的健康信息，您的综合健康评分为${userData.health_score}分，健康状态被评定为"${userData.health_status}"。`);
  analysis.push('');
  analysis.push('本次评估基于您的生活方式、睡眠质量、压力状态、体质指数和健康风险等多个维度进行综合分析。以下是根据您的具体情况生成的详细健康分析报告。');
  analysis.push('');

  // 2. 风险等级与预警
  analysis.push('【风险等级与预警】');
  analysis.push('');

  if (userData.health_score >= 80) {
    analysis.push(`您的整体健康状况良好（优秀）。各项健康指标基本处于正常范围内，继续保持当前的健康生活方式。`);
  } else if (userData.health_score >= 60) {
    analysis.push(`您的整体健康状况一般（良好）。部分健康指标存在一定的改善空间，建议您关注以下方面，及时调整生活方式。`);
  } else {
    analysis.push(`您的整体健康状况需要重点关注（异常）。多项健康指标显示存在一定的健康风险，强烈建议您尽快采取行动改善健康状况，必要时及时就医检查。`);
  }
  analysis.push('');

  // 3. 异常指标提示
  analysis.push('【异常指标提示】');
  analysis.push('');

  let hasAbnormal = false;

  if (userData.score_life < 60) {
    analysis.push(`⚠️ 生活方式得分偏低（${userData.score_life}分）：您的生活方式存在较多不健康的因素，需要重点关注和改善。`);
    hasAbnormal = true;
  } else if (userData.score_life < 80) {
    analysis.push(`💡 生活方式得分一般（${userData.score_life}分）：您的生活方式有部分需要改进的地方。`);
  } else {
    analysis.push(`✅ 生活方式得分良好（${userData.score_life}分）：您的生活方式总体较为健康。`);
  }
  analysis.push('');

  if (userData.score_sleep < 60) {
    analysis.push(`⚠️ 睡眠质量得分偏低（${userData.score_sleep}分）：您的睡眠质量存在明显问题，长期可能影响身体健康，建议优先改善。`);
    hasAbnormal = true;
  } else if (userData.score_sleep < 80) {
    analysis.push(`💡 睡眠质量得分一般（${userData.score_sleep}分）：您的睡眠质量有待提升，建议优化睡眠习惯。`);
  } else {
    analysis.push(`✅ 睡眠质量得分良好（${userData.score_sleep}分）：您的睡眠质量总体较好。`);
  }
  analysis.push('');

  if (userData.score_stress < 60) {
    analysis.push(`⚠️ 压力状态得分偏低（${userData.score_stress}分）：您当前承受较大的心理压力，建议学会有效缓解压力的方法。`);
    hasAbnormal = true;
  } else if (userData.score_stress < 80) {
    analysis.push(`💡 压力状态得分一般（${userData.score_stress}分）：您需要更好地管理压力，避免长期处于高压状态。`);
  } else {
    analysis.push(`✅ 压力状态得分良好（${userData.score_stress}分）：您的心理状态总体较为平衡。`);
  }
  analysis.push('');

  if (userData.score_body < 60) {
    analysis.push(`⚠️ 体质指数得分偏低（${userData.score_body}分）：您的身体体质需要关注，建议加强锻炼、改善体质。`);
    hasAbnormal = true;
  } else if (userData.score_body < 80) {
    analysis.push(`💡 体质指数得分一般（${userData.score_body}分）：您的体质有提升空间，建议加强身体锻炼。`);
  } else {
    analysis.push(`✅ 体质指数得分良好（${userData.score_body}分）：您的身体体质总体较好。`);
  }
  analysis.push('');

  if (userData.score_risk < 60) {
    analysis.push(`⚠️ 健康风险得分偏低（${userData.score_risk}分）：您存在较高的健康风险因素，需要高度重视并采取针对性措施。`);
    hasAbnormal = true;
  } else if (userData.score_risk < 80) {
    analysis.push(`💡 健康风险得分一般（${userData.score_risk}分）：您存在一定的健康风险因素，建议关注并积极改善。`);
  } else {
    analysis.push(`✅ 健康风险得分良好（${userData.score_risk}分）：您的健康风险因素较低。`);
  }
  analysis.push('');

  // 4. 生活习惯改善建议
  analysis.push('【生活习惯改善建议】');
  analysis.push('');

  // 作息建议
  if (userData.sleep) {
    analysis.push('📌 作息建议：');
    analysis.push(`您目前的作息情况为：${userData.sleep}。`);
    if (userData.score_sleep < 80) {
      analysis.push('建议：');
      analysis.push('- 保持规律的作息时间，尽量每天在同一时间入睡和起床');
      analysis.push('- 每晚保证7-8小时的充足睡眠');
      analysis.push('- 睡前1小时避免使用电子设备，创造良好的睡眠环境');
      analysis.push('- 避免睡前饮用咖啡、浓茶等刺激性饮料');
    }
    analysis.push('');
  }

  // 烟酒建议
  if (userData.drink_smoke) {
    analysis.push('📌 烟酒建议：');
    analysis.push(`您目前的烟酒习惯为：${userData.drink_smoke}。`);
    if (userData.drink_smoke.includes('抽烟') || userData.drink_smoke.includes('喝酒')) {
      analysis.push('建议：');
      analysis.push('- 尽量戒烟，减少二手烟暴露');
      analysis.push('- 控制饮酒量，建议男性每日酒精摄入量不超过25克，女性不超过15克');
      analysis.push('- 避免空腹饮酒，尽量不与碳酸饮料同饮');
      analysis.push('- 如无法戒烟戒酒，应定期进行相关检查');
    } else {
      analysis.push('✅ 您没有抽烟饮酒的习惯，请继续保持！');
    }
    analysis.push('');
  }

  // 运动建议
  if (userData.exercise) {
    analysis.push('📌 运动建议：');
    analysis.push(`您目前的运动习惯为：${userData.exercise}。`);
    if (userData.score_life < 80) {
      analysis.push('建议：');
      analysis.push('- 每周至少进行150分钟中等强度有氧运动（如快走、慢跑、游泳等）');
      analysis.push('- 每周进行2-3次力量训练，增强肌肉力量');
      analysis.push('- 避免久坐，每工作1小时起身活动5-10分钟');
      analysis.push('- 根据个人情况选择合适的运动方式，循序渐进');
    }
    analysis.push('');
  }

  // 饮食建议
  if (userData.diet) {
    analysis.push('📌 饮食建议：');
    analysis.push(`您目前的饮食习惯为：${userData.diet}。`);
    analysis.push('建议：');
    analysis.push('- 保持饮食多样化，确保营养均衡');
    analysis.push('- 多吃新鲜蔬菜水果，减少高油、高盐、高糖食物摄入');
    analysis.push('- 控制饮食量，避免暴饮暴食');
    analysis.push('- 规律三餐，定时定量，避免不吃早餐');
    analysis.push('- 适量饮水，每天至少1500-2000毫升');
    analysis.push('');
  }

  // 5. 睡眠质量分析
  analysis.push('【睡眠质量深度分析】');
  analysis.push('');

  if (userData.score_sleep < 80) {
    analysis.push('根据您的睡眠质量得分，我们注意到您可能存在以下问题：');
    analysis.push('- 睡眠时间不足或不规律');
    analysis.push('- 睡眠质量不高，可能伴有失眠、多梦等情况');
    analysis.push('');
    analysis.push('改善建议：');
    analysis.push('1. 建立固定的睡眠时间表，周末也尽量保持一致');
    analysis.push('2. 创造舒适的睡眠环境：保持卧室安静、黑暗、凉爽');
    analysis.push('3. 睡前放松：可以尝试冥想、深呼吸、泡热水澡等');
    analysis.push('4. 避免午睡过久（不超过30分钟）');
    analysis.push('5. 如果持续存在严重睡眠问题，建议及时就医');
  } else {
    analysis.push('您的睡眠质量总体较好，请继续保持良好的睡眠习惯。');
  }
  analysis.push('');

  // 6. 压力与心理状态分析
  analysis.push('【压力与心理状态分析】');
  analysis.push('');

  if (userData.pressure_state) {
    analysis.push(`您当前的压力状态为：${userData.pressure_state}。`);
  }

  if (userData.score_stress < 80) {
    analysis.push('');
    analysis.push('压力管理建议：');
    analysis.push('1. 学会识别压力源，分析压力来源');
    analysis.push('2. 培养兴趣爱好，适当转移注意力');
    analysis.push('3. 学习深呼吸、冥想等放松技巧');
    analysis.push('4. 与家人朋友多交流，寻求情感支持');
    analysis.push('5. 合理安排工作和休息，避免过度劳累');
    analysis.push('6. 必要时寻求专业心理咨询帮助');
  }
  analysis.push('');

  // 7. 运动与饮食指导
  analysis.push('【运动与饮食专业指导】');
  analysis.push('');

  // BMI计算
  const heightInMeters = userData.height / 100;
  const bmi = userData.weight / (heightInMeters * heightInMeters);
  analysis.push(`您的BMI指数为：${bmi.toFixed(1)}。`);

  if (bmi < 18.5) {
    analysis.push('体重偏轻，建议适当增加营养摄入，增强体质。');
  } else if (bmi >= 18.5 && bmi < 24) {
    analysis.push('体重正常，请继续保持。');
  } else if (bmi >= 24 && bmi < 28) {
    analysis.push('体重超重，建议控制饮食热量摄入，增加运动量。');
  } else {
    analysis.push('肥胖，需要重点关注，建议制定科学的减重计划。');
  }
  analysis.push('');

  // 8. 复查/就医提醒
  analysis.push('【复查与就医提醒】');
  analysis.push('');

  if (userData.symptom && userData.symptom !== '无') {
    analysis.push(`⚠️ 您当前存在症状：${userData.symptom}`);
    analysis.push('');
    analysis.push('建议：');
    analysis.push('- 如果症状持续或加重，建议及时就医');
    analysis.push('- 记录症状出现的时间、频率和严重程度');
    analysis.push('- 向医生详细描述症状情况，配合检查');
    analysis.push('');
  }

  if (userData.sickness && userData.sickness !== '无') {
    analysis.push(`⚠️ 您的既往病史：${userData.sickness}`);
    analysis.push('');
    analysis.push('建议：');
    analysis.push('- 定期复查相关疾病');
    analysis.push('- 按时服药，不要自行停药');
    analysis.push('- 注意观察病情变化，异常及时就医');
    analysis.push('');
  }

  if (userData.family_sickness && userData.family_sickness !== '无') {
    analysis.push(`⚠️ 您的家族病史：${userData.family_sickness}`);
    analysis.push('');
    analysis.push('建议：');
    analysis.push('- 家族病史提示您可能存在遗传风险，需要重点关注');
    analysis.push('- 定期进行相关疾病筛查');
    analysis.push('- 保持健康的生活方式，降低发病风险');
    analysis.push('');
  }

  // 9. 个性化健康方案
  analysis.push('【个性化健康改善方案】');
  analysis.push('');
  analysis.push(`基于您的健康状况分析，为您制定以下个性化改善方案：`);
  analysis.push('');

  analysis.push('第一阶段（1-3个月）：基础改善期');
  analysis.push('- 目标：改善最突出的健康问题');
  analysis.push('- 重点：调整作息、改善睡眠、增加运动');
  analysis.push('- 预期：初步建立健康的生活方式');
  analysis.push('');

  analysis.push('第二阶段（3-6个月）：巩固提升期');
  analysis.push('- 目标：巩固已取得的改善成果');
  analysis.push('- 重点：优化饮食结构、进一步减压');
  analysis.push('- 预期：各项健康指标显著提升');
  analysis.push('');

  analysis.push('第三阶段（6个月以上）：稳定维持期');
  analysis.push('- 目标：形成长期稳定的健康习惯');
  analysis.push('- 重点：保持规律的生活方式、定期检查');
  analysis.push('- 预期：达到并维持最佳健康状态');
  analysis.push('');

  // 10. 总结与鼓励
  analysis.push('【总结与鼓励】');
  analysis.push('');
  analysis.push(`亲爱的${userData.name}，健康是一生的财富，改善健康是一个持续的过程。`);
  analysis.push('');
  analysis.push('本次健康分析为您提供了一份详细的健康报告，包含了您的健康状况评估、风险提示和改善建议。请您认真阅读，并根据自己的实际情况，制定可行的健康改善计划。');
  analysis.push('');
  analysis.push('记住：');
  analysis.push('- 健康改善不是一蹴而就的，需要持续的努力和坚持');
  analysis.push('- 每一个小的改变都值得肯定，积少成多，终会看到效果');
  analysis.push('- 不要因为一时的懈怠而放弃，重新开始永远不晚');
  analysis.push('- 定期复查和评估健康状况，及时调整改善方案');
  analysis.push('');
  analysis.push('我们建议您每隔3-6个月进行一次健康自检，及时了解自己的健康状况变化。');
  analysis.push('');
  analysis.push('祝您身体健康，生活愉快！');

  return analysis.join('\n');
}

/**
 * 根据健康分数计算健康状态
 */
export function calculateHealthStatus(score: number): string {
  if (score >= 90) return '优秀';
  if (score >= 75) return '良好';
  if (score >= 60) return '一般';
  return '异常';
}

/**
 * 根据各维度得分计算综合健康分数
 */
export function calculateHealthScore(scores: {
  score_life: number;
  score_sleep: number;
  score_stress: number;
  score_body: number;
  score_risk: number;
}): number {
  const { score_life, score_sleep, score_stress, score_body, score_risk } = scores;
  return Math.round(
    (score_life * 0.2 + 
     score_sleep * 0.25 + 
     score_stress * 0.15 + 
     score_body * 0.2 + 
     score_risk * 0.2)
  );
}
