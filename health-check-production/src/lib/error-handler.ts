/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // 维护正确的原型链
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      error: {
        type: this.type,
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        severity: this.severity,
        timestamp: this.timestamp.toISOString(),
        details: this.details,
        requestId: this.requestId,
      },
    };
  }

  /**
   * 转换为NextResponse
   */
  toResponse() {
    return new Response(JSON.stringify(this.toJSON()), {
      status: this.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': this.code,
        'X-Error-Type': this.type,
        'X-Error-Severity': this.severity,
      },
    });
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ErrorType.VALIDATION,
      400,
      'VALIDATION_ERROR',
      details,
      ErrorSeverity.LOW
    );
    this.name = 'ValidationError';
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(
      message,
      ErrorType.AUTHENTICATION,
      401,
      'AUTHENTICATION_ERROR',
      undefined,
      ErrorSeverity.MEDIUM
    );
    this.name = 'AuthenticationError';
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(
      message,
      ErrorType.AUTHORIZATION,
      403,
      'AUTHORIZATION_ERROR',
      undefined,
      ErrorSeverity.MEDIUM
    );
    this.name = 'AuthorizationError';
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(
      `${resource}不存在`,
      ErrorType.NOT_FOUND,
      404,
      'NOT_FOUND',
      { resource },
      ErrorSeverity.LOW
    );
    this.name = 'NotFoundError';
  }
}

/**
 * 冲突错误
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ErrorType.CONFLICT,
      409,
      'CONFLICT_ERROR',
      details,
      ErrorSeverity.MEDIUM
    );
    this.name = 'ConflictError';
  }
}

/**
 * 速率限制错误
 */
export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super(
      '请求过于频繁，请稍后再试',
      ErrorType.RATE_LIMIT,
      429,
      'RATE_LIMIT_EXCEEDED',
      { retryAfter },
      ErrorSeverity.LOW
    );
    this.name = 'RateLimitError';
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ErrorType.DATABASE,
      500,
      'DATABASE_ERROR',
      details,
      ErrorSeverity.HIGH
    );
    this.name = 'DatabaseError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AppError {
  constructor(message: string = '网络请求失败') {
    super(
      message,
      ErrorType.NETWORK,
      503,
      'NETWORK_ERROR',
      undefined,
      ErrorSeverity.MEDIUM
    );
    this.name = 'NetworkError';
  }
}

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  logToConsole?: boolean;
  logToDatabase?: boolean;
  includeStackTrace?: boolean;
  notifyAdmin?: boolean;
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private options: ErrorHandlerOptions;

  constructor(options: ErrorHandlerOptions = {}) {
    this.options = {
      logToConsole: true,
      logToDatabase: false,
      includeStackTrace: process.env.NODE_ENV === 'development',
      notifyAdmin: false,
      ...options,
    };
  }

  /**
   * 处理错误
   */
  async handle(error: Error | AppError, requestId?: string): Promise<AppError> {
    // 如果不是AppError，转换为AppError
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      // 根据错误类型推断
      if (error.message.includes('not found')) {
        appError = new NotFoundError(error.message);
      } else if (error.message.includes('validation')) {
        appError = new ValidationError(error.message);
      } else {
        appError = new AppError(
          error.message || '发生未知错误',
          ErrorType.INTERNAL,
          500,
          'INTERNAL_ERROR',
          undefined,
          ErrorSeverity.HIGH
        );
      }
    }

    // 添加请求ID
    if (requestId) {
      (appError as any).requestId = requestId;
    }

    // 记录错误
    await this.logError(appError);

    // 发送通知
    if (this.options.notifyAdmin && appError.severity >= ErrorSeverity.HIGH) {
      await this.notifyAdmin(appError);
    }

    return appError;
  }

  /**
   * 记录错误日志
   */
  private async logError(error: AppError): Promise<void> {
    const logData = {
      timestamp: error.timestamp,
      type: error.type,
      code: error.code,
      message: error.message,
      severity: error.severity,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    };

    // 控制台日志
    if (this.options.logToConsole) {
      console.error(`[ErrorHandler] ${error.type}:`, {
        ...logData,
        stack: this.options.includeStackTrace ? error.stack : undefined,
      });
    }

    // 数据库日志（如果启用）
    if (this.options.logToDatabase) {
      try {
        // TODO: 实现数据库日志记录
        // await errorLogRepository.create(logData);
      } catch (logError) {
        console.error('[ErrorHandler] 记录错误日志失败:', logError);
      }
    }
  }

  /**
   * 通知管理员
   */
  private async notifyAdmin(error: AppError): Promise<void> {
    // TODO: 实现管理员通知（邮件、钉钉、企业微信等）
    console.error(`[ErrorHandler] 需要通知管理员:`, {
      type: error.type,
      code: error.code,
      message: error.message,
      severity: error.severity,
    });
  }

  /**
   * 处理API错误并返回响应
   */
  async handleApiResponse(error: Error | AppError, requestId?: string): Promise<Response> {
    const appError = await this.handle(error, requestId);
    return appError.toResponse();
  }

  /**
   * 包装异步函数，自动处理错误
   */
  wrap<T extends any[]>(
    fn: (...args: T) => Promise<any>
  ): (...args: T) => Promise<any> {
    return async (...args: T) => {
      try {
        return await fn(...args);
      } catch (error) {
        throw await this.handle(error as Error);
      }
    };
  }
}

/**
 * 创建全局错误处理器实例
 */
export const errorHandler = new ErrorHandler({
  logToConsole: true,
  includeStackTrace: process.env.NODE_ENV === 'development',
});

/**
 * 辅助函数：处理API路由错误
 */
export async function handleApiError(
  error: Error | AppError,
  requestId?: string
): Promise<Response> {
  return errorHandler.handleApiResponse(error, requestId);
}

/**
 * 辅助函数：验证必需参数
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(key => !params[key]);
  if (missing.length > 0) {
    throw new ValidationError(`缺少必需参数: ${missing.join(', ')}`);
  }
}

/**
 * 辅助函数：验证参数类型
 */
export function validateParamType(
  params: Record<string, any>,
  validations: Record<string, string>
): void {
  const errors: string[] = [];

  for (const [key, type] of Object.entries(validations)) {
    const value = params[key];
    
    if (value === undefined || value === null) {
      continue; // 由validateRequiredParams处理
    }

    let isValid = false;
    switch (type) {
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = typeof value === 'boolean';
        break;
      case 'array':
        isValid = Array.isArray(value);
        break;
      case 'object':
        isValid = typeof value === 'object' && !Array.isArray(value);
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      errors.push(`参数 ${key} 应为 ${type} 类型`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('参数类型错误', { errors });
  }
}

export default AppError;
