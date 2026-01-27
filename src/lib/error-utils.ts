/**
 * 安全错误处理工具
 * 防止敏感信息泄露，统一错误格式
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: string; // 仅在开发环境返回
}

/**
 * 生产环境安全的错误消息
 */
export function getSafeErrorMessage(error: unknown): ApiError {
  const isDev = process.env.NODE_ENV === 'development';

  if (error instanceof Error) {
    // 开发环境：返回详细错误信息
    if (isDev) {
      return {
        error: error.message || '操作失败',
        code: error.constructor.name,
        details: error.stack,
      };
    }

    // 生产环境：只返回通用错误消息
    return {
      error: getGenericErrorMessage(error),
    };
  }

  if (typeof error === 'string') {
    return {
      error: error,
    };
  }

  return {
    error: '操作失败，请稍后重试',
  };
}

/**
 * 将技术错误转换为用户友好的消息
 */
function getGenericErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // 数据库相关错误
  if (message.includes('duplicate key') || message.includes('unique constraint')) {
    return '数据已存在';
  }
  if (message.includes('not found') || message.includes('does not exist')) {
    return '数据不存在';
  }
  if (message.includes('connection') || message.includes('timeout')) {
    return '连接失败，请检查网络';
  }

  // 验证相关错误
  if (message.includes('validation') || message.includes('invalid')) {
    return '数据格式错误';
  }

  // 权限相关错误
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return '权限不足';
  }

  // 默认消息
  return '操作失败，请稍后重试';
}

/**
 * 记录错误到控制台
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);

  // TODO: 发送到错误监控系统（如 Sentry）
  // if (typeof window !== 'undefined') {
  //   // 前端错误上报
  // } else {
  //   // 后端错误上报
  // }
}

/**
 * 创建统一的错误响应
 */
export function createErrorResponse(error: unknown, status: number = 500): Response {
  const safeError = getSafeErrorMessage(error);
  logError('API_ERROR', error);

  return new Response(JSON.stringify(safeError), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 验证环境变量是否存在
 */
export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
