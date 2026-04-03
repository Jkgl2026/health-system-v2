/**
 * 健康分析引擎
 * 整合所有分析算法，提供统一的健康分析服务
 */

import {
  calculateHealthAnalysis,
  calculateRiskAssessment,
  HealthAnalysisScores,
  RiskAssessmentResult,
  AnalysisInputData
} from './analysis-algorithms';

import {
  calculateComprehensiveCoefficients
} from './personalization-coefficients';

import {
  calculateTCMClassification,
  TCMClassification,
  generateTCMRecommendations
} from './tcm-classification';

import {
  calculateQualityOfLife,
  QualityOfLife as QoL
} from './quality-of-life';

import {
  calculateLifeExpectancy,
  LifeExpectancy
} from './life-expectancy';

import {
  generateComprehensiveRegimen
} from './tcm-methods-database';

// 分析结果类型
export interface AnalysisResult {
  sessionId: string;
  healthScores: HealthAnalysisScores;
  riskAssessment: RiskAssessmentResult;
  constitutionAnalysis: TCMClassification;
  qualityOfLife: QoL;
  lifeExpectancy: LifeExpectancy;
  tcmDiagnosis: any;
  recommendations: string[];
  personalizedCoefficients: any;
  medicalHistory?: {
    hasHypertension: boolean;
    hypertensionYears?: number;
    hypertensionMedications?: string[];
    hasDiabetes: boolean;
    diabetesYears?: number;
    diabetesType?: string;
    diabetesMedications?: string[];
    hasHyperlipidemia: boolean;
    hyperlipidemiaYears?: number;
    hyperlipidemiaMedications?: string[];
    otherDiseases?: string[];
    symptoms?: string[];
  };
  constitutionResult?: {
    primaryConstitution: string;
    secondaryConstitutions: string[];
    scores: Record<string, number>;
  };
  summary: {
    overallHealth: string;
    primaryConcerns: string[];
    keyImprovements: string[];
    priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
  };
  confidence: {
    healthScore: number;
    riskAssessment: number;
    constitution: number;
    overall: number;
  };
  comprehensiveRegimen?: {
    internalMethods: any[];
    externalMethods: any[];
    mindBodyMethods: any[];
    exerciseMethods: any[];
    summary: string;
  };
}

export interface AnalysisInput {
  healthQuestionnaire: any;
  constitutionQuestionnaire: any;
  personalInfo: any;
}

/**
 * 分析引擎类
 */
export class AnalysisEngine {
  private input: AnalysisInput;
  private options: any;

  constructor(input: AnalysisInput, options?: any) {
    this.input = input;
    this.options = options || {
      enableCache: true,
      enablePersonalization: true,
      enableTCM: true
    };
  }

  /**
   * 计算健康评分
   */
  async calculateHealthScores(): Promise<HealthAnalysisScores> {
    try {
      const data: AnalysisInputData = {
        healthQuestionnaire: this.input.healthQuestionnaire,
        constitutionQuestionnaire: this.input.constitutionQuestionnaire,
        personalInfo: this.input.personalInfo
      };
      const scores = calculateHealthAnalysis(data);
      return scores;
    } catch (error) {
      console.error('Health scores calculation error:', error);
      throw error;
    }
  }

  /**
   * 计算风险评估
   */
  async calculateRiskAssessment(): Promise<RiskAssessmentResult> {
    try {
      const data: AnalysisInputData = {
        healthQuestionnaire: this.input.healthQuestionnaire,
        constitutionQuestionnaire: this.input.constitutionQuestionnaire,
        personalInfo: this.input.personalInfo
      };
      const healthScores = calculateHealthAnalysis(data);
      const risks = calculateRiskAssessment(healthScores, data);
      return risks;
    } catch (error) {
      console.error('Risk assessment calculation error:', error);
      throw error;
    }
  }

  /**
   * 体质分析
   */
  async analyzeConstitution(): Promise<TCMClassification> {
    try {
      const data = {
        healthQuestionnaire: this.input.healthQuestionnaire,
        constitutionQuestionnaire: this.input.constitutionQuestionnaire,
        personalInfo: this.input.personalInfo
      };
      const classification = calculateTCMClassification(data);
      return classification;
    } catch (error) {
      console.error('Constitution analysis error:', error);
      throw error;
    }
  }

  /**
   * 生活质量评估
   */
  async assessQualityOfLife(): Promise<QoL> {
    try {
      const qol = calculateQualityOfLife(this.input);
      return qol;
    } catch (error) {
      console.error('Quality of life assessment error:', error);
      throw error;
    }
  }

  /**
   * 预期寿命评估
   */
  async calculateLifeExpectancy(): Promise<LifeExpectancy> {
    try {
      const data = {
        healthQuestionnaire: this.input.healthQuestionnaire,
        constitutionQuestionnaire: this.input.constitutionQuestionnaire,
        personalInfo: this.input.personalInfo,
        healthScores: await this.calculateHealthScores()
      };
      const lifeExp = calculateLifeExpectancy(data);
      return lifeExp;
    } catch (error) {
      console.error('Life expectancy calculation error:', error);
      throw error;
    }
  }

  /**
   * 中医辨证
   */
  async performTCMDiagnosis(): Promise<any> {
    try {
      const tcmClassification = await this.analyzeConstitution();

      const diagnosis = {
        eightPrinciple: tcmClassification.eightPrinciples,
        organ: {
          primaryImbalance: tcmClassification.organDifferentiation.primaryImbalance,
          organDifferentiation: tcmClassification.organDifferentiation.affectedOrgans || []
        },
        qiBloodFluid: tcmClassification.qiBloodFluid,
        overallPattern: tcmClassification.syndromeType || '无明显证候',
        treatmentPrinciple: tcmClassification.treatmentPrinciple,
        herbalFormula: tcmClassification.herbalFormula,
        acupuncturePoints: tcmClassification.acupuncturePoints || []
      };

      return diagnosis;
    } catch (error) {
      console.error('TCM diagnosis error:', error);
      throw error;
    }
  }

  /**
   * 生成建议
   */
  async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const health = this.input.healthQuestionnaire || {};
    const constitution = this.input.constitutionQuestionnaire?.primaryConstitution || '平和质';

    try {
      // 基于疾病史的建议（三高）
      if (health.has_hypertension) {
        recommendations.push('建议定期监测血压，每日测量并记录血压值');
        recommendations.push('高血压患者应遵循低盐饮食，每日食盐摄入量控制在6克以内');
        recommendations.push('遵医嘱规律服用降压药物，不要随意停药或调整剂量');
        if (health.hypertension_years > 5) {
          recommendations.push('高血压病程较长，建议定期进行心血管检查');
        }
      }

      if (health.has_diabetes) {
        recommendations.push('糖尿病需要定期监测血糖，包括空腹血糖和餐后2小时血糖');
        recommendations.push('严格控制碳水化合物摄入，选择低升糖指数（GI）食物');
        recommendations.push('遵医嘱服用降糖药物或注射胰岛素，定期复查糖化血红蛋白');
        if (health.diabetes_type === '1型') {
          recommendations.push('1型糖尿病患者需要终身胰岛素治疗，务必掌握胰岛素注射技巧');
        }
      }

      if (health.has_hyperlipidemia) {
        recommendations.push('高血脂需要控制饮食，减少动物性脂肪和胆固醇摄入');
        recommendations.push('适当增加运动量，每周至少150分钟中等强度有氧运动');
        recommendations.push('遵医嘱服用降脂药物，定期复查血脂指标');
      }

      // 基于体质的建议
      const constitutionRecommendations: Record<string, string[]> = {
        '平和质': [
          '保持良好的生活习惯，规律作息，均衡饮食',
          '适度运动，每周3-5次，每次30-60分钟',
          '定期体检，预防疾病'
        ],
        '气虚质': [
          '建议多食益气健脾的食物，如山药、大枣、糯米、鸡肉',
          '避免过度劳累，保证充足睡眠',
          '适当进行轻柔运动，如散步、太极拳',
          '避免食用生冷食物'
        ],
        '阳虚质': [
          '建议多食温补食物，如羊肉、韭菜、生姜、核桃',
          '注意保暖，避免受凉，特别是腰部和脚部',
          '适当进行温补运动，如慢跑、瑜伽',
          '避免食用生冷寒凉食物'
        ],
        '阴虚质': [
          '建议多食滋阴润燥食物，如梨、银耳、百合、绿豆',
          '避免熬夜，保证充足睡眠',
          '避免食用辛辣燥热食物',
          '适当进行舒缓运动，如游泳、太极'
        ],
        '痰湿质': [
          '建议多食健脾祛湿食物，如薏米、冬瓜、赤小豆、山楂',
          '加强运动，每周4-6次，促进新陈代谢',
          '控制体重，避免肥胖',
          '避免食用油腻、甜腻食物'
        ],
        '湿热质': [
          '建议多食清热利湿食物，如绿豆、苦瓜、黄瓜、芹菜',
          '保持居住环境干燥通风',
          '避免食用辛辣、油腻、煎炸食物',
          '适当进行中等强度运动，促进排汗'
        ],
        '血瘀质': [
          '建议多食活血化瘀食物，如山楂、桃仁、黑木耳、玫瑰花',
          '适当运动促进血液循环',
          '注意保暖，避免受凉',
          '保持心情舒畅，避免情志抑郁'
        ],
        '气郁质': [
          '建议多食疏肝理气食物，如佛手、橙子、玫瑰花、荞麦',
          '保持心情舒畅，适当参加社交活动',
          '培养兴趣爱好，释放压力',
          '适当进行舒缓运动，如瑜伽、舞蹈'
        ],
        '特禀质': [
          '注意避免接触过敏原',
          '增强免疫力，适当运动，规律作息',
          '饮食均衡，避免食用过敏食物',
          '出现过敏症状及时就医'
        ]
      };

      if (constitutionRecommendations[constitution]) {
        recommendations.push(...constitutionRecommendations[constitution]);
      }

      // 基于症状的建议
      if (health.symptoms && health.symptoms.length > 0) {
        if (health.symptoms.includes('头晕')) {
          recommendations.push('出现头晕症状，建议检查血压，避免突然站起');
        }
        if (health.symptoms.includes('乏力')) {
          recommendations.push('感觉乏力，建议适当休息，补充营养，避免过度劳累');
        }
        if (health.symptoms.includes('失眠')) {
          recommendations.push('存在失眠问题，建议建立规律作息，睡前避免使用电子产品');
        }
      }

      // 基于健康评分的建议
      const healthScores = await this.calculateHealthScores();
      if (healthScores.overallHealth < 60) {
        recommendations.push('您的整体健康状况有待改善，建议制定详细的健康管理计划');
        recommendations.push('建议定期进行健康检查，及时了解身体状况');
      } else if (healthScores.overallHealth < 75) {
        recommendations.push('您的健康状况一般，建议加强健康管理，改善生活方式');
      }

      // 基于生活质量评估的建议
      const qol = await this.assessQualityOfLife();
      if (qol.overallScore < 70) {
        recommendations.push('您的生活质量有待改善，建议从身体、心理、社交等多方面进行调整');
        recommendations.push('建议培养健康的生活习惯，保持积极乐观的心态');
      }

      // 基于预期寿命的建议
      const lifeExp = await this.calculateLifeExpectancy();
      if (lifeExp.potentialGain > 5) {
        recommendations.push('通过健康管理，您有潜力显著延长寿命');
        recommendations.push('建议制定详细的健康改善计划，充分利用改善潜力');
      }

      // 基于风险评估的建议
      const risks = await this.calculateRiskAssessment();
      if (risks.overallRiskLevel === 'high') {
        recommendations.push('您存在较高健康风险，建议尽快就医咨询，制定专业的健康管理方案');
      } else if (risks.overallRiskLevel === 'medium') {
        recommendations.push('您存在中等健康风险，建议积极改善生活方式，定期体检');
      }

      // 确保至少有几条建议
      if (recommendations.length === 0) {
        recommendations.push('保持良好的生活习惯，均衡饮食，适量运动');
        recommendations.push('定期进行健康检查，预防疾病');
        recommendations.push('保持积极乐观的心态，合理调节压力');
      }

      return recommendations.slice(0, 12); // 最多返回12条建议
    } catch (error) {
      console.error('Recommendations generation error:', error);
      return [
        '建议咨询专业医生获取个性化健康建议',
        '保持良好的生活习惯，均衡饮食，适量运动',
        '定期进行健康检查，预防疾病'
      ];
    }
  }

  /**
   * 整合结果
   */
  async integrateResults(results: any): Promise<AnalysisResult> {
    const {
      healthScores,
      riskAssessment,
      constitutionAnalysis,
      qualityOfLife,
      lifeExpectancy,
      tcmDiagnosis,
      recommendations
    } = results;

    // 计算个性化系数
    const personalizedCoefficients = this.options.enablePersonalization
      ? calculateComprehensiveCoefficients({
          age: Number(this.input.personalInfo.age) || 0,
          gender: this.input.personalInfo.gender || '男',
          bmi: this.calculateBMI(),
          constitution: this.input.constitutionQuestionnaire?.primaryConstitution || '平和质'
        })
      : null;

    // 生成摘要
    const summary = this.generateSummary(
      healthScores,
      riskAssessment,
      constitutionAnalysis,
      recommendations
    );

    // 计算置信度
    const confidence = this.calculateConfidence(
      healthScores,
      riskAssessment,
      constitutionAnalysis
    );

    // 生成综合调理方案
    const diseaseList: string[] = [];
    if (this.input.healthQuestionnaire?.has_hypertension) {
      diseaseList.push('has_hypertension');
    }
    if (this.input.healthQuestionnaire?.has_diabetes) {
      diseaseList.push('has_diabetes');
    }
    if (this.input.healthQuestionnaire?.has_hyperlipidemia) {
      diseaseList.push('has_hyperlipidemia');
    }

    const comprehensiveRegimen = generateComprehensiveRegimen({
      constitution: this.input.constitutionQuestionnaire?.primaryConstitution,
      diseases: diseaseList,
      symptoms: this.input.healthQuestionnaire?.symptoms || [],
      age: Number(this.input.personalInfo.age) || 0
    });

    // 格式化体质分析数据，供前端使用
    const formattedConstitutionAnalysis: any = {
      eightPrinciple: constitutionAnalysis.eightPrinciples,
      organ: {
        primaryImbalance: constitutionAnalysis.organDifferentiation.primaryImbalance,
        organDifferentiation: constitutionAnalysis.organDifferentiation.affectedOrgans || []
      },
      qiBloodFluid: constitutionAnalysis.qiBloodFluid,
      overallPattern: constitutionAnalysis.syndromeType,
      syndromeType: constitutionAnalysis.syndromeType,
      syndromeDescription: constitutionAnalysis.syndromeDescription,
      treatmentPrinciple: constitutionAnalysis.treatmentPrinciple,
      herbalFormula: constitutionAnalysis.herbalFormula,
      acupuncturePoints: constitutionAnalysis.acupuncturePoints || [],
      recommendations: generateTCMRecommendations(constitutionAnalysis)
    };

    return {
      sessionId: '', // 会在API中设置
      healthScores,
      riskAssessment,
      constitutionAnalysis: formattedConstitutionAnalysis,
      qualityOfLife,
      lifeExpectancy,
      tcmDiagnosis,
      recommendations,
      personalizedCoefficients,
      // 添加疾病史信息
      medicalHistory: {
        hasHypertension: this.input.healthQuestionnaire?.has_hypertension || false,
        hypertensionYears: this.input.healthQuestionnaire?.hypertension_years,
        hypertensionMedications: this.input.healthQuestionnaire?.hypertension_medications,
        hasDiabetes: this.input.healthQuestionnaire?.has_diabetes || false,
        diabetesYears: this.input.healthQuestionnaire?.diabetes_years,
        diabetesType: this.input.healthQuestionnaire?.diabetes_type,
        diabetesMedications: this.input.healthQuestionnaire?.diabetes_medications,
        hasHyperlipidemia: this.input.healthQuestionnaire?.has_hyperlipidemia || false,
        hyperlipidemiaYears: this.input.healthQuestionnaire?.hyperlipidemia_years,
        hyperlipidemiaMedications: this.input.healthQuestionnaire?.hyperlipidemia_medications,
        otherDiseases: this.input.healthQuestionnaire?.other_diseases,
        symptoms: this.input.healthQuestionnaire?.symptoms
      },
      // 添加体质问卷结果
      constitutionResult: {
        primaryConstitution: this.input.constitutionQuestionnaire?.primaryConstitution || '平和质',
        secondaryConstitutions: this.input.constitutionQuestionnaire?.secondaryConstitutions || [],
        scores: this.input.constitutionQuestionnaire?.scores || {}
      },
      summary,
      confidence,
      // 添加综合调理方案
      comprehensiveRegimen
    };
  }

  /**
   * 术语映射（英文 → 中文）
   */
  private getRiskFactorName(key: string): string {
    const nameMap: Record<string, string> = {
      cardiovascular: '心血管',
      metabolic: '代谢',
      lifestyle: '生活方式',
      recovery: '恢复',
      constitution: '体质'
    };
    return nameMap[key] || key;
  }

  /**
   * 生成摘要
   */
  private generateSummary(
    healthScores: HealthAnalysisScores,
    riskAssessment: RiskAssessmentResult,
    constitutionAnalysis: TCMClassification,
    recommendations: string[]
  ): any {
    let overallHealth: string;
    
    if (healthScores.overallHealth >= 85) {
      overallHealth = '健康状况优秀';
    } else if (healthScores.overallHealth >= 70) {
      overallHealth = '健康状况良好';
    } else if (healthScores.overallHealth >= 50) {
      overallHealth = '健康状况一般';
    } else {
      overallHealth = '健康状况较差';
    }

    const primaryConcerns: string[] = [];
    
    // 风险关注
    if (riskAssessment.overallRiskLevel === 'high') {
      primaryConcerns.push('整体健康风险较高');
    }
    
    // 高风险因素
    Object.entries(riskAssessment.riskFactors).forEach(([key, factor]: [string, any]) => {
      if (factor.level === 'high') {
        primaryConcerns.push(`${this.getRiskFactorName(key)}风险较高`);
      }
    });
    
    // 体质问题
    if (constitutionAnalysis.syndromeType && constitutionAnalysis.syndromeType !== '平和质') {
      primaryConcerns.push(`体质倾向:${constitutionAnalysis.syndromeType}`);
    }

    const keyImprovements = recommendations.slice(0, 5);

    let priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
    
    if (riskAssessment.overallRiskLevel === 'high' || healthScores.overallHealth < 50) {
      priorityLevel = 'high';
    } else if (healthScores.overallHealth < 70) {
      priorityLevel = 'medium';
    } else {
      priorityLevel = 'low';
    }

    return {
      overallHealth,
      primaryConcerns,
      keyImprovements,
      priorityLevel
    };
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    healthScores: HealthAnalysisScores,
    riskAssessment: RiskAssessmentResult,
    constitutionAnalysis: TCMClassification
  ): any {
    let healthScoreConfidence = 60;
    let riskAssessmentConfidence = 60;
    let constitutionConfidence = 70;
    
    // 基于数据完整性
    if (this.input.healthQuestionnaire) {
      healthScoreConfidence += 20;
      riskAssessmentConfidence += 20;
    }
    
    if (this.input.constitutionQuestionnaire) {
      constitutionConfidence += 15;
      healthScoreConfidence += 10;
    }
    
    if (this.input.personalInfo) {
      healthScoreConfidence += 10;
      riskAssessmentConfidence += 10;
      constitutionConfidence += 10;
    }
    
    // 归一化到100
    healthScoreConfidence = Math.min(100, healthScoreConfidence);
    riskAssessmentConfidence = Math.min(100, riskAssessmentConfidence);
    constitutionConfidence = Math.min(100, constitutionConfidence);
    
    const overall = Math.round(
      (healthScoreConfidence + riskAssessmentConfidence + constitutionConfidence) / 3
    );
    
    return {
      healthScore: Math.round(healthScoreConfidence),
      riskAssessment: Math.round(riskAssessmentConfidence),
      constitution: Math.round(constitutionConfidence),
      overall
    };
  }

  /**
   * 计算BMI
   */
  private calculateBMI(): number {
    const personalInfo = this.input.personalInfo;
    if (!personalInfo.height || !personalInfo.weight) {
      return 22; // 默认值
    }
    const heightInMeters = Number(personalInfo.height) / 100;
    const weight = Number(personalInfo.weight);
    return weight / (heightInMeters * heightInMeters);
  }
}
