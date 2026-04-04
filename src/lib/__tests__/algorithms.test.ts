/**
 * 分析算法单元测试
 * 测试多层级评分算法、风险评估、个性化系数等
 */

import {
  calculateHealthScores,
  calculateRiskAssessment,
  calculatePersonalizationCoefficients,
  analyzeConstitutionType
} from '../analysis-algorithms';

import {
  calculateQualityOfLife
} from '../quality-of-life';

import {
  calculateLifeExpectancy
} from '../life-expectancy';

/**
 * 测试数据
 */
const mockHealthQuestionnaire = {
  symptoms: ['失眠', '乏力'],
  exercise_frequency: '每周1-2次',
  sleep_quality: '一般',
  stressLevel: '中等',
  has_hypertension: false,
  has_diabetes: false,
  has_hyperlipidemia: false
};

const mockConstitutionQuestionnaire = {
  primaryConstitution: '气虚质',
  answers: {}
};

const mockPersonalInfo = {
  age: 35,
  gender: 'male',
  height: 175,
  weight: 70
};

const mockInput = {
  healthQuestionnaire: mockHealthQuestionnaire,
  constitutionQuestionnaire: mockConstitutionQuestionnaire,
  personalInfo: mockPersonalInfo
};

/**
 * 测试健康评分计算
 */
export function testHealthScores() {
  console.log('=== 测试健康评分 ===');
  
  try {
    const scores = calculateHealthScores(mockInput);
    
    console.log('✅ 健康评分计算成功');
    console.log('  整体健康评分:', scores.overallHealth);
    console.log('  免疫力:', scores.immunity);
    console.log('  循环系统:', scores.circulation);
    console.log('  消化系统:', scores.digestion);
    console.log('  神经系统:', scores.nervousSystem);
    console.log('  能量水平:', scores.energyLevel);
    
    // 验证分数范围
    if (scores.overallHealth < 0 || scores.overallHealth > 100) {
      console.error('❌ 整体健康评分超出范围');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 健康评分测试失败:', error);
    return false;
  }
}

/**
 * 测试风险评估计算
 */
export function testRiskAssessment() {
  console.log('\n=== 测试风险评估 ===');
  
  try {
    const risks = calculateRiskAssessment(mockInput);
    
    console.log('✅ 风险评估计算成功');
    console.log('  风险等级:', risks.riskLevel);
    console.log('  总体风险评分:', risks.totalRiskScore);
    console.log('  高风险因素:', risks.highRiskFactors);
    console.log('  中等风险因素:', risks.moderateRiskFactors);
    
    // 验证风险等级
    const validRiskLevels = ['low', 'medium', 'high', 'severe'];
    if (!validRiskLevels.includes(risks.riskLevel)) {
      console.error('❌ 风险等级无效');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 风险评估测试失败:', error);
    return false;
  }
}

/**
 * 测试个性化系数
 */
export function testPersonalizationCoefficients() {
  console.log('\n=== 测试个性化系数 ===');
  
  try {
    const coeffs = calculatePersonalizationCoefficients(mockInput);
    
    console.log('✅ 个性化系数计算成功');
    console.log('  年龄系数:', coeffs.ageCoefficient);
    console.log('  性别系数:', coeffs.genderCoefficient);
    console.log('  BMI系数:', coeffs.bmiCoefficient);
    console.log('  体质系数:', coeffs.constitutionCoefficient);
    console.log('  整体系数:', coeffs.overallCoefficient);
    
    // 验证系数合理性
    if (coeffs.overallCoefficient <= 0 || coeffs.overallCoefficient >= 2) {
      console.error('❌ 整体系数超出合理范围');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 个性化系数测试失败:', error);
    return false;
  }
}

/**
 * 测试体质分析
 */
export function testConstitutionAnalysis() {
  console.log('\n=== 测试体质分析 ===');
  
  try {
    const analysis = analyzeConstitutionType(mockConstitutionQuestionnaire);
    
    console.log('✅ 体质分析成功');
    console.log('  主要体质:', analysis.primaryConstitution);
    console.log('  倾向:', analysis.tendency);
    console.log('  调理建议:', analysis.recommendations);
    
    return true;
  } catch (error) {
    console.error('❌ 体质分析测试失败:', error);
    return false;
  }
}

/**
 * 测试生活质量评估
 */
export function testQualityOfLife() {
  console.log('\n=== 测试生活质量评估 ===');
  
  try {
    const qol = calculateQualityOfLife(mockInput);
    
    console.log('✅ 生活质量评估成功');
    console.log('  身体功能:', qol.physicalFunction);
    console.log('  心理功能:', qol.mentalFunction);
    console.log('  社会功能:', qol.socialFunction);
    console.log('  情绪健康:', qol.emotionalWellbeing);
    console.log('  整体健康:', qol.generalHealth);
    console.log('  综合评分:', qol.overallScore);
    
    // 验证分数范围
    if (qol.overallScore < 0 || qol.overallScore > 100) {
      console.error('❌ 生活质量综合评分超出范围');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 生活质量评估测试失败:', error);
    return false;
  }
}

/**
 * 测试预期寿命评估
 */
export function testLifeExpectancy() {
  console.log('\n=== 测试预期寿命评估 ===');
  
  try {
    const lifeExp = calculateLifeExpectancy(mockInput);
    
    console.log('✅ 预期寿命评估成功');
    console.log('  当前年龄:', lifeExp.currentAge);
    console.log('  预期年龄:', lifeExp.expectedAge);
    console.log('  改善潜力:', lifeExp.potentialGain, '年');
    console.log('  有利因素:', lifeExp.keyFactors.positive);
    console.log('  不利因素:', lifeExp.keyFactors.negative);
    console.log('  高风险因素:', lifeExp.riskFactors.highRisk);
    console.log('  置信度:', lifeExp.confidenceLevel, '%');
    
    // 验证逻辑合理性
    if (lifeExp.expectedAge <= lifeExp.currentAge) {
      console.error('❌ 预期年龄不合理');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 预期寿命评估测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
export function runAllTests(): boolean {
  console.log('🧪 开始运行单元测试...\n');
  
  const tests = [
    testHealthScores,
    testRiskAssessment,
    testPersonalizationCoefficients,
    testConstitutionAnalysis,
    testQualityOfLife,
    testLifeExpectancy
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`❌ 测试执行异常:`, error);
      failed++;
    }
  });
  
  console.log('\n====================');
  console.log(`测试完成: ${passed} 通过, ${failed} 失败`);
  console.log('====================\n');
  
  return failed === 0;
}

// 如果直接运行此文件，执行测试
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}
