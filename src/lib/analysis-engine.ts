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
  TCMClassification
} from './tcm-classification';

import {
  calculateQualityOfLife,
  QualityOfLife as QoL
} from './quality-of-life';

import {
  calculateLifeExpectancy,
  LifeExpectancy
} from './life-expectancy';

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
        organ: tcmClassification.organDifferentiation,
        qiBloodFluid: tcmClassification.qiBloodFluid,
        overallPattern: tcmClassification.primarySyndrome || '无明显证候'
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
    
    try {
      // 基于健康评分的建议
      const healthScores = await this.calculateHealthScores();
      if (healthScores.overallHealth < 60) {
        recommendations.push('您需要重点关注健康管理，建议制定详细的改善计划');
      }
      
      // 基于风险的建议
      const risks = await this.calculateRiskAssessment();
      if (risks.overallRiskLevel === 'high') {
        recommendations.push('您存在较高健康风险，建议尽快就医咨询');
      }
      
      // 基于体质的建议
      const constitution = this.input.constitutionQuestionnaire.primaryConstitution;
      if (constitution && constitution !== '平和质') {
        recommendations.push(`建议调理${constitution}体质`);
      }
      
      // 基于生活质量的建议
      const qol = await this.assessQualityOfLife();
      if (qol.overallScore < 70) {
        recommendations.push('您的生活质量有待改善，建议从身体、心理、社交等多方面进行调整');
      }
      
      // 基于预期寿命的建议
      const lifeExp = await this.calculateLifeExpectancy();
      if (lifeExp.potentialGain > 5) {
        recommendations.push('通过健康管理，您有潜力显著延长寿命');
      }
      
      return recommendations;
    } catch (error) {
      console.error('Recommendations generation error:', error);
      return ['建议咨询专业医生获取个性化健康建议'];
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
          personalInfo: this.input.personalInfo,
          constitutionQuestionnaire: this.input.constitutionQuestionnaire
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

    return {
      sessionId: '', // 会在API中设置
      healthScores,
      riskAssessment,
      constitutionAnalysis,
      qualityOfLife,
      lifeExpectancy,
      tcmDiagnosis,
      recommendations,
      personalizedCoefficients,
      summary,
      confidence
    };
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
        primaryConcerns.push(`${key}风险较高`);
      }
    });
    
    // 体质问题
    if (constitutionAnalysis.primarySyndrome && constitutionAnalysis.primarySyndrome !== '平和质') {
      primaryConcerns.push(`体质倾向:${constitutionAnalysis.primarySyndrome}`);
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
}
