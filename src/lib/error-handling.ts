/**
 * 健康评估系统错误处理模块
 * 提供错误分类、处理、日志记录等功能
 */

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',           // 网络错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',     // 数据验证错误
  API_ERROR = 'API_ERROR',                   // API错误
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',           // 超时错误
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY', // 数据不一致
  CALCULATION_ERROR = 'CALCULATION_ERROR',   // 计算错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'            // 未知错误
}

// 错误严重度枚举
export enum ErrorSeverity {
  LOW = 'low',       // 低严重度：不影响主流程
  MEDIUM = 'medium', // 中严重度：影响部分功能
  HIGH = 'high',     // 高严重度：阻止主流程
  CRITICAL = 'critical' // 严重错误：系统不可用
}

// 健康分析错误接口
export interface HealthAnalysisError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: any;
  timestamp: number;
  retryable: boolean;
  suggestion?: string; // 给用户的建议
  code?: string;       // 错误代码
}

// 重试配置接口
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;      // 初始延迟（毫秒）
  maxDelay: number;          // 最大延迟（毫秒）
  backoffMultiplier: number; // 退避乘数
  retryableErrors: ErrorType[];
}

// 默认重试配置
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.API_ERROR
  ]
};

/**
 * 错误处理器类
 */
export class ErrorHandler {
  // 错误分类
  static classifyError(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN_ERROR;
    
    // 网络错误
    if (error instanceof TypeError && 
        (error.message.includes('fetch') || 
         error.message.includes('Network') ||
         error.message.includes('Failed to fetch'))) {
      return ErrorType.NETWORK_ERROR;
    }
    
    // 超时错误
    if (error instanceof TypeError && 
        (error.message.includes('timeout') || 
         error.message.includes('Timeout'))) {
      return ErrorType.TIMEOUT_ERROR;
    }
    
    // API错误
    if (error.response) {
      if (error.response.status >= 400 && error.response.status < 500) {
        return ErrorType.VALIDATION_ERROR;
      }
      if (error.response.status >= 500) {
        return ErrorType.API_ERROR;
      }
    }
    
    // 验证错误
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    // 计算错误
    if (error.message && 
        (error.message.includes('calculation') || 
         error.message.includes('computation'))) {
      return ErrorType.CALCULATION_ERROR;
    }
    
    // 数据不一致
    if (error.message && 
        (error.message.includes('inconsistency') || 
         error.message.includes('mismatch'))) {
      return ErrorType.DATA_INCONSISTENCY;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }
  
  // 错误严重度评估
  static assessSeverity(error: HealthAnalysisError): ErrorSeverity {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorType.VALIDATION_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.API_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.TIMEOUT_ERROR:
        return ErrorSeverity.MEDIUM;
      case ErrorType.DATA_INCONSISTENCY:
        return ErrorSeverity.LOW;
      case ErrorType.CALCULATION_ERROR:
        return ErrorSeverity.HIGH;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }
  
  // 生成用户友好的错误信息
  static generateUserMessage(error: HealthAnalysisError): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查您的网络设置',
      [ErrorType.VALIDATION_ERROR]: '数据格式不正确，请检查填写内容',
      [ErrorType.API_ERROR]: '服务器错误，请稍后重试',
      [ErrorType.TIMEOUT_ERROR]: '请求超时，请检查网络连接',
      [ErrorType.DATA_INCONSISTENCY]: '数据不一致，部分功能可能受到影响',
      [ErrorType.CALCULATION_ERROR]: '分析计算出错，请稍后重试',
      [ErrorType.UNKNOWN_ERROR]: '发生未知错误，请联系客服'
    };
    return messages[error.type] || '发生错误，请稍后重试';
  }
  
  // 生成建议
  static generateSuggestion(error: HealthAnalysisError): string | undefined {
    const suggestions: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: '建议：1. 检查网络连接 2. 刷新页面重试 3. 稍后再试',
      [ErrorType.VALIDATION_ERROR]: '建议：请检查所有必填项是否完整填写',
      [ErrorType.API_ERROR]: '建议：1. 等待几秒后重试 2. 清除浏览器缓存 3. 联系客服',
      [ErrorType.TIMEOUT_ERROR]: '建议：1. 检查网络速度 2. 关闭其他占用网络的程序 3. 稍后再试',
      [ErrorType.DATA_INCONSISTENCY]: '建议：部分数据可能未正确加载，建议刷新页面',
      [ErrorType.CALCULATION_ERROR]: '建议：请刷新页面重新提交',
      [ErrorType.UNKNOWN_ERROR]: '建议：请截图错误信息，联系客服获取帮助'
    };
    return suggestions[error.type];
  }
  
  // 生成错误代码
  static generateErrorCode(error: HealthAnalysisError): string {
    const prefix = 'HA'; // Health Analysis
    const typeCode = {
      [ErrorType.NETWORK_ERROR]: 'NET',
      [ErrorType.VALIDATION_ERROR]: 'VAL',
      [ErrorType.API_ERROR]: 'API',
      [ErrorType.TIMEOUT_ERROR]: 'TMO',
      [ErrorType.DATA_INCONSISTENCY]: 'DAT',
      [ErrorType.CALCULATION_ERROR]: 'CAL',
      [ErrorType.UNKNOWN_ERROR]: 'UNK'
    };
    const severityCode = {
      [ErrorSeverity.LOW]: 'L',
      [ErrorSeverity.MEDIUM]: 'M',
      [ErrorSeverity.HIGH]: 'H',
      [ErrorSeverity.CRITICAL]: 'C'
    };
    const timestamp = Date.now().toString(36);
    return `${prefix}_${typeCode[error.type]}_${severityCode[error.severity]}_${timestamp}`.toUpperCase();
  }
  
  // 创建标准错误对象
  static createError(error: any, context?: string): HealthAnalysisError {
    const type = this.classifyError(error);
    const message = error.message || 'Unknown error';
    
    const healthError: HealthAnalysisError = {
      type,
      severity: this.assessSeverity({
        type,
        severity: 'medium' as ErrorSeverity,
        message,
        timestamp: Date.now(),
        retryable: false
      }),
      message,
      details: error,
      timestamp: Date.now(),
      retryable: DEFAULT_RETRY_CONFIG.retryableErrors.includes(type),
      code: context ? `${context}_${type}` : undefined
    };
    
    healthError.suggestion = this.generateSuggestion(healthError);
    healthError.code = this.generateErrorCode(healthError);
    
    return healthError;
  }
}

/**
 * 错误日志记录器
 */
export class ErrorLogger {
  private static readonly STORAGE_KEY = 'health_analysis_error_logs';
  private static readonly MAX_LOGS = 100;
  
  // 本地日志记录
  static logToClient(error: HealthAnalysisError, context?: any): void {
    const logEntry = {
      ...error,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: new Date().toISOString()
    };
    
    // 存储到 localStorage
    try {
      const logs = this.getLocalLogs();
      logs.push(logEntry);
      
      // 限制日志数量
      if (logs.length > this.MAX_LOGS) {
        logs.shift();
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log to localStorage:', e);
    }
    
    // 发送到日志服务
    this.sendToServer(logEntry);
    
    // 控制台输出
    console.error('[HealthAnalysis Error]', logEntry);
  }
  
  // 获取本地日志
  static getLocalLogs(): any[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  }
  
  // 清除本地日志
  static clearLocalLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear error logs:', e);
    }
  }
  
  // 发送到服务器
  static async sendToServer(error: any): Promise<void> {
    try {
      await fetch('/api/error-logging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'HEALTH_ANALYSIS_ERROR',
          error,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Failed to send error log:', e);
    }
  }
}

/**
 * 带重试的异步函数执行器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context?: string
): Promise<T> {
  let lastError: HealthAnalysisError | null = null;
  let delay = config.initialDelay;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const healthError = ErrorHandler.createError(error, context);
      lastError = healthError;
      
      // 记录错误
      ErrorLogger.logToClient(healthError, { attempt, maxRetries: config.maxRetries });
      
      // 如果不可重试或已达到最大重试次数，抛出错误
      if (!healthError.retryable || attempt === config.maxRetries) {
        throw healthError;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      
      console.warn(`[Retry] Attempt ${attempt + 1}/${config.maxRetries} after ${delay}ms`);
    }
  }
  
  throw lastError;
}

/**
 * 批量错误处理器
 */
export class BatchErrorHandler {
  private errors: HealthAnalysisError[] = [];
  
  // 添加错误
  addError(error: HealthAnalysisError): void {
    this.errors.push(error);
  }
  
  // 获取所有错误
  getErrors(): HealthAnalysisError[] {
    return this.errors;
  }
  
  // 按严重度分组
  groupBySeverity(): Record<ErrorSeverity, HealthAnalysisError[]> {
    return this.errors.reduce((acc, error) => {
      if (!acc[error.severity]) {
        acc[error.severity] = [];
      }
      acc[error.severity].push(error);
      return acc;
    }, {} as Record<ErrorSeverity, HealthAnalysisError[]>);
  }
  
  // 获取最严重的错误
  getMostSevereError(): HealthAnalysisError | null {
    if (this.errors.length === 0) return null;
    
    const severityOrder = [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH, ErrorSeverity.MEDIUM, ErrorSeverity.LOW];
    
    for (const severity of severityOrder) {
      const error = this.errors.find(e => e.severity === severity);
      if (error) return error;
    }
    
    return this.errors[0];
  }
  
  // 清除错误
  clear(): void {
    this.errors = [];
  }
  
  // 是否有严重错误
  hasSevereError(): boolean {
    return this.errors.some(e => 
      e.severity === ErrorSeverity.HIGH || 
      e.severity === ErrorSeverity.CRITICAL
    );
  }
  
  // 批量记录错误
  logAll(context?: string): void {
    this.errors.forEach(error => {
      ErrorLogger.logToClient(error, context);
    });
  }
}
