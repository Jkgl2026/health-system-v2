/**
 * 健康分析引擎
 * 整合所有分析算法，提供统一的健康分析服务
 */

import {
  calculateHealthScores,
  calculateRiskAssessment,
  HealthScores,
  RiskAssessment
} from './analysis-algorithms';

import {
  calculatePersonalizationCoefficients,
  PersonalizationCoefficients
} from './personalization-coefficients';

import {
  analyzeConstitutionType,
  ConstitutionAnalysis
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
  AnalysisError,
  AnalysisProgress,
  AnalysisOptions
} from './analysis-algorithms';

// 分析结果类型
export interface AnalysisResult {
  sessionId: string;
  healthScores: HealthScores;
  riskAssessment: RiskAssessment;
  constitutionAnalysis: ConstitutionAnalysis;
  qualityOfLife: QoL;
  lifeExpectancy: LifeExpectancy;
  tcmDiagnosis: any;
  recommendations: string[];
  personalizedCoefficients: PersonalizationCoefficients;
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
  private progress: AnalysisProgress;
  private options: AnalysisOptions;

  constructor(input: AnalysisInput, options?: AnalysisOptions) {
    this.input = input;
    this.progress = {
      stage: 'initializing',
      percentage: 0,
      message: '初始化分析引擎'
    };
    this.options = options || {
      enableCache: true,
      enablePersonalization: true,
      enableTCM: true
    };
  }

  /**
   * 计算健康评分
   */
  async calculateHealthScores(): Promise<HealthScores> {
    this.updateProgress('calculating_scores', 10, '计算健康评分');
    
    try {
      const scores = calculateHealthScores(this.input);
      this.updateProgress('scores_calculated', 20, '健康评分完成');
      return scores;
    } catch (error) {
      this.handleError('health_scores', error);
      throw error;
    }
  }

  /**
   * 计算风险评估
   */
  async calculateRiskAssessment(): Promise<RiskAssessment> {
    this.updateProgress('calculating_risks', 30, '计算风险评估');
    
    try {
      const risks = calculateRiskAssessment(this.input);
      this.updateProgress('risks_calculated', 40, '风险评估完成');
      return risks;
    } catch (error) {
      this.handleError('risk_assessment', error);
      throw error;
    }
  }

  /**
   * 体质分析
   */
  async analyzeConstitution(): Promise<ConstitutionAnalysis> {
    this.updateProgress('analyzing_constitution', 50, '分析体质');
    
    try {
      const constitution = analyzeConstitutionType(
        this.input.constitutionQuestionnaire
      );
      this.updateProgress('constitution_analyzed', 60, '体质分析完成');
      return constitution;
    } catch (error) {
      this.handleError('constitution_analysis', error);
      throw error;
    }
  }

  /**
   * 生活质量评估
   */
  async assessQualityOfLife(): Promise<QoL> {
    this.updateProgress('assessing_quality_of_life', 65, '评估生活质量');
    
    try {
      const qol = calculateQualityOfLife(this.input);
      this.updateProgress('quality_assessed', 70, '生活质量评估完成');
      return qol;
    } catch (error) {
      this.handleError('quality_of_life', error);
      throw error;
    }
  }

  /**
   * 预期寿命评估
   */
  async calculateLifeExpectancy(): Promise<LifeExpectancy> {
    this.updateProgress('calculating_life_expectancy', 75, '计算预期寿命');
    
    try {
      const lifeExp = calculateLifeExpectancy(this.input);
      this.updateProgress('life_expectancy_calculated', 80, '预期寿命计算完成');
      return lifeExp;
    } catch (error) {
      this.handleError('life_expectancy', error);
      throw error;
    }
  }

  /**
   * 中医辨证
   */
  async performTCMDiagnosis(): Promise<any> {
    this.updateProgress('performing_tcm_diagnosis', 85, '执行中医辨证');
    
    try {
      const { performEightPrincipleDiagnosis, performOrganDiagnosis } = require('./tcm-classification');
      
      const eightPrinciple = performEightPrincipleDiagnosis(this.input);
      const organ = performOrganDiagnosis(this.input);
      
      const diagnosis = {
        eightPrinciple,
        organ,
        overallPattern: this.determineOverallPattern(eightPrinciple, organ)
      };
      
      this.updateProgress('tcm_diagnosis_performed', 90, '中医辨证完成');
      return diagnosis;
    } catch (error) {
      this.handleError('tcm_diagnosis', error);
      throw error;
    }
  }

  /**
   * 生成建议
   */
  async generateRecommendations(): Promise<string[]> {
    this.updateProgress('generating_recommendations', 95, '生成建议');
    
    const recommendations: string[] = [];
    
    try {
      // 基于健康评分的建议
      const healthScores = calculateHealthScores(this.input);
      if (healthScores.overallHealth < 60) {
        recommendations.push('您需要重点关注健康管理，建议制定详细的改善计划');
      }
      
      // 基于风险的建议
      const risks = calculateRiskAssessment(this.input);
      if (risks.riskLevel === 'high' || risks.riskLevel === 'severe') {
        recommendations.push('您存在较高健康风险，建议尽快就医咨询');
      }
      
      // 基于体质的建议
      const constitution = this.input.constitutionQuestionnaire.primaryConstitution;
      recommendations.push(`建议调理${constitution}体质`);
      
      // 基于生活质量的建议
      const qol = calculateQualityOfLife(this.input);
      const { generateQualityOfLifeImprovements } = require('./quality-of-life');
      recommendations.push(...generateQualityOfLifeImprovements(qol));
      
      this.updateProgress('recommendations_generated', 100, '建议生成完成');
      return recommendations;
    } catch (error) {
      this.handleError('recommendations', error);
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
      ? calculatePersonalizationCoefficients(this.input)
      : {
          ageCoefficient: 1.0,
          genderCoefficient: 1.0,
          bmiCoefficient: 1.0,
          constitutionCoefficient: 1.0,
          overallCoefficient: 1.0
        };

    // 生成摘要
    const summary = this.generateSummary(
      healthScores,
      riskAssessment,
      constitutionAnalysis,
      recommendations
    );

    // 计算置信度
    const confidence = this.calculateConfidence(
      this.input,
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
   * 更新进度
   */
  private updateProgress(stage: string, percentage: number, message: string): void {
    this.progress = {
      stage,
      percentage,
      message
    };
  }

  /**
   * 处理错误
   */
  private handleError(stage: string, error: any): void {
    const analysisError: AnalysisError = {
      code: `ANALYSIS_${stage.toUpperCase()}_ERROR`,
      message: `${stage}分析失败`,
      details: error.message,
      recoverable: true,
      severity: 'medium'
    };
    
    console.error(`[分析引擎] ${stage}错误:`, analysisError);
  }

  /**
   * 确定整体证候
   */
  private determineOverallPattern(eightPrinciple: any, organ: any): string {
    const patterns: string[] = [];
    
    if (eightPrinciple.primaryPattern) {
      patterns.push(eightPrinciple.primaryPattern);
    }
    
    if (organ.affectedOrgans && organ.affectedOrgans.length > 0) {
      patterns.push(organ.affectedOrgans.join(''));
    }
    
    return patterns.join('·') || '无明显证候';
  }

  /**
   * 生成摘要
   */
  private generateSummary(
    healthScores: HealthScores,
    riskAssessment: RiskAssessment,
    constitutionAnalysis: ConstitutionAnalysis,
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
    if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'severe') {
      primaryConcerns.push(`整体健康风险${riskAssessment.riskLevel === 'severe' ? '极高' : '较高'}`);
    }
    
    // 高风险因素
    riskAssessment.highRiskFactors.forEach(factor => {
      primaryConcerns.push(`${factor}风险较高`);
    });
    
    // 体质问题
    if (constitutionAnalysis.tendency && constitutionAnalysis.tendency.length > 0) {
      constitutionAnalysis.tendency.forEach(tendency => {
        primaryConcerns.push(`体质倾向:${tendency}`);
      });
    }

    const keyImprovements = recommendations.slice(0, 5); // 前5条建议

    let priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
    
    if (riskAssessment.riskLevel === 'severe') {
      priorityLevel = 'urgent';
    } else if (riskAssessment.riskLevel === 'high' || healthScores.overallHealth < 50) {
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
    input: AnalysisInput,
    healthScores: HealthScores,
    riskAssessment: RiskAssessment,
    constitutionAnalysis: ConstitutionAnalysis
  ): any {
    let healthScoreConfidence = 0;
    let riskAssessmentConfidence = 0;
    let constitutionConfidence = 0;
    
    // 基于数据完整性
    if (input.healthQuestionnaire) {
      healthScoreConfidence += 30;
      riskAssessmentConfidence += 30;
    }
    
    if (input.constitutionQuestionnaire) {
      constitutionConfidence += 40;
      healthScoreConfidence += 20;
    }
    
    if (input.personalInfo) {
      healthScoreConfidence += 15;
      riskAssessmentConfidence += 15;
      constitutionConfidence += 10;
    }
    
    // 基于评分置信度
    if (healthScores.confidence) {
      healthScoreConfidence += healthScores.confidence;
    }
    
    if (riskAssessment.confidence) {
      riskAssessmentConfidence += riskAssessment.confidence;
    }
    
    // 归一化到100
    healthScoreConfidence = Math.min(100, healthScoreConfidence);
    riskAssessmentConfidence = Math.min(100, riskAssessmentConfidence);
    constitutionConfidence = Math.min(100, constitutionConfidence);
    
    // 整体置信度（平均）
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
