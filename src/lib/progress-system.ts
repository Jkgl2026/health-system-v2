/**
 * 健康评估系统进度提示模块
 * 提供多阶段进度管理和可视化
 */

// 进度步骤状态
export type StepStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 进度步骤接口
export interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  duration: number; // 预计耗时（毫秒）
  error?: string;
}

// 分析进度接口
export interface AnalysisProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  estimatedTimeRemaining: number; // 预计剩余时间（毫秒）
  steps: ProgressStep[];
  startTime: number;
}

// 健康问卷提交时的进度步骤
export const HEALTH_QUESTIONNAIRE_PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'save-questionnaire',
    name: '保存问卷数据',
    description: '正在保存您填写的健康问卷...',
    status: 'pending',
    duration: 500
  },
  {
    id: 'check-constitution',
    name: '检查体质问卷',
    description: '正在检查是否已填写体质问卷...',
    status: 'pending',
    duration: 300
  },
  {
    id: 'calculate-analysis',
    name: '计算健康要素分析',
    description: '正在分析您的健康状况（气血、循环、毒素等8个维度）...',
    status: 'pending',
    duration: 800
  },
  {
    id: 'save-analysis',
    name: '保存分析结果',
    description: '正在保存健康要素分析结果...',
    status: 'pending',
    duration: 400
  },
  {
    id: 'calculate-risk',
    name: '计算风险评估',
    description: '正在评估您的健康风险（心血管、代谢、生活方式等）...',
    status: 'pending',
    duration: 600
  },
  {
    id: 'save-risk',
    name: '保存风险评估',
    description: '正在保存风险评估结果...',
    status: 'pending',
    duration: 400
  },
  {
    id: 'update-session',
    name: '更新会话状态',
    description: '正在更新评估会话关联...',
    status: 'pending',
    duration: 300
  }
];

// 体质问卷提交时的进度步骤
export const CONSTITUTION_QUESTIONNAIRE_PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'save-questionnaire',
    name: '保存问卷数据',
    description: '正在保存您填写的体质问卷...',
    status: 'pending',
    duration: 600
  },
  {
    id: 'check-health',
    name: '检查健康问卷',
    description: '正在检查是否已填写健康问卷...',
    status: 'pending',
    duration: 300
  },
  {
    id: 'calculate-analysis',
    name: '计算健康要素分析',
    description: '正在分析您的健康状况（气血、循环、毒素等8个维度）...',
    status: 'pending',
    duration: 800
  },
  {
    id: 'save-analysis',
    name: '保存分析结果',
    description: '正在保存健康要素分析结果...',
    status: 'pending',
    duration: 400
  },
  {
    id: 'calculate-risk',
    name: '计算风险评估',
    description: '正在评估您的健康风险（心血管、代谢、生活方式等）...',
    status: 'pending',
    duration: 600
  },
  {
    id: 'save-risk',
    name: '保存风险评估',
    description: '正在保存风险评估结果...',
    status: 'pending',
    duration: 400
  },
  {
    id: 'update-session',
    name: '更新会话状态',
    description: '正在更新评估会话关联...',
    status: 'pending',
    duration: 300
  }
];

// 后端分析引擎的进度步骤
export const BACKEND_ANALYSIS_ENGINE_PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'validate-data',
    name: '验证数据',
    description: '正在验证输入数据的完整性和正确性...',
    status: 'pending',
    duration: 200
  },
  {
    id: 'calculate-base-scores',
    name: '计算基础评分',
    description: '正在计算健康要素基础评分...',
    status: 'pending',
    duration: 300
  },
  {
    id: 'apply-coefficients',
    name: '应用个性化系数',
    description: '正在应用年龄、性别、BMI等个性化系数...',
    status: 'pending',
    duration: 200
  },
  {
    id: 'calculate-weighted-scores',
    name: '计算加权评分',
    description: '正在计算加权后的健康评分...',
    status: 'pending',
    duration: 250
  },
  {
    id: 'calculate-risk-factors',
    name: '计算风险因子',
    description: '正在分析心血管、代谢等风险因子...',
    status: 'pending',
    duration: 400
  },
  {
    id: 'calculate-confidence',
    name: '计算置信度',
    description: '正在评估分析结果的置信度...',
    status: 'pending',
    duration: 150
  },
  {
    id: 'generate-recommendations',
    name: '生成建议',
    description: '正在根据分析结果生成健康建议...',
    status: 'pending',
    duration: 300
  },
  {
    id: 'save-to-database',
    name: '保存到数据库',
    description: '正在保存分析结果到数据库...',
    status: 'pending',
    duration: 400
  }
];

/**
 * 格式化时间
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${Math.round(ms / 1000)}秒`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
  }
}

/**
 * 进度管理器类
 */
export class ProgressManager {
  private steps: ProgressStep[];
  private startTime: number;
  
  constructor(steps: ProgressStep[]) {
    this.steps = steps.map(s => ({ ...s, status: 'pending' as StepStatus }));
    this.startTime = Date.now();
  }
  
  // 更新步骤状态
  updateStepStatus(stepId: string, status: StepStatus, error?: string): void {
    this.steps = this.steps.map(step =>
      step.id === stepId 
        ? { ...step, status, error } 
        : step
    );
  }
  
  // 获取当前进度
  getProgress(): AnalysisProgress {
    const completedSteps = this.steps.filter(s => s.status === 'completed');
    const processingSteps = this.steps.filter(s => s.status === 'processing');
    
    const currentStep = completedSteps.length + processingSteps.length;
    const totalSteps = this.steps.length;
    
    // 计算进度百分比
    const percentage = Math.round(
      ((completedSteps.length + processingSteps.length * 0.5) / totalSteps) * 100
    );
    
    // 计算预计剩余时间
    const elapsedTime = Date.now() - this.startTime;
    const completedDuration = completedSteps.reduce((sum, step) => sum + step.duration, 0);
    
    let estimatedTimeRemaining = 0;
    if (completedSteps.length > 0) {
      const avgTimePerStep = elapsedTime / completedSteps.length;
      const remainingSteps = totalSteps - currentStep;
      estimatedTimeRemaining = remainingSteps * avgTimePerStep;
    }
    
    return {
      currentStep,
      totalSteps,
      percentage,
      estimatedTimeRemaining,
      steps: this.steps,
      startTime: this.startTime
    };
  }
  
  // 重置进度
  reset(): void {
    this.steps = this.steps.map(s => ({ ...s, status: 'pending' as StepStatus, error: undefined }));
    this.startTime = Date.now();
  }
  
  // 获取步骤
  getSteps(): ProgressStep[] {
    return this.steps;
  }
  
  // 获取当前正在处理的步骤
  getCurrentStep(): ProgressStep | null {
    return this.steps.find(s => s.status === 'processing') || null;
  }
  
  // 获取已完成步骤数量
  getCompletedCount(): number {
    return this.steps.filter(s => s.status === 'completed').length;
  }
  
  // 获取失败步骤数量
  getFailedCount(): number {
    return this.steps.filter(s => s.status === 'failed').length;
  }
}
