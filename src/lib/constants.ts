/**
 * 应用常量定义
 * 避免魔法数字，提高代码可维护性
 */

// ==================== 健康数据常量 ====================

export const HEALTH_DATA = {
  // 身体语言简表
  BODY_SYMPTOMS_COUNT: 100,

  // 不良生活习惯
  BAD_HABITS_COUNT: 252,

  // 300症状表
  SYMPTOMS_300_COUNT: 300,

  // 健康评分
  MAX_HEALTH_SCORE: 100,
  MIN_HEALTH_SCORE: 0,

  // 重点症状
  MAX_TARGET_SYMPTOMS: 3,
  MIN_TARGET_SYMPTOMS: 1,

  // 七问
  SEVEN_QUESTIONS_COUNT: 7,

  // 健康要素
  HEALTH_ELEMENTS_COUNT: 7,
} as const;

// ==================== 健康评分权重 ====================

export const SCORE_WEIGHTS = {
  BODY_LANGUAGE: 1.0,
  SYMPTOMS_300: 0.8,
  BAD_HABITS: 0.6,
} as const;

// ==================== 症状严重程度权重 ====================

export const SEVERITY_WEIGHTS = {
  EMERGENCY: 5,   // 紧急症状
  SEVERE: 2,      // 严重症状
  MODERATE: 0.8,  // 中等症状
  MILD: 0.3,      // 轻微症状
} as const;

// ==================== 指数系数范围 ====================

export const FACTOR_RANGE = {
  MIN: 1.0,
  MAX: 3.0,
  STEPS: [
    { max: 5, factor: 1.0 },
    { max: 10, factor: 1.2 },
    { max: 20, factor: 1.5 },
    { max: 50, factor: 2.0 },
    { max: 100, factor: 2.5 },
    { max: Infinity, factor: 3.0 },
  ],
} as const;

// ==================== UI 常量 ====================

export const UI = {
  // 移动端
  MIN_TOUCH_TARGET_SIZE: 44, // px
  MIN_FONT_SIZE: 14, // px
  MAX_FONT_SIZE: 24, // px

  // 桌面端
  DESKTOP_MIN_WIDTH: 1024, // px
  TABLET_MIN_WIDTH: 768, // px
  MOBILE_MAX_WIDTH: 767, // px

  // 布局
  MAX_CONTENT_WIDTH: 1200, // px
  CONTAINER_PADDING: {
    MOBILE: 16, // px
    TABLET: 24, // px
    DESKTOP: 32, // px
  },

  // 动画
  TRANSITION_DURATION: {
    FAST: 150, // ms
    NORMAL: 300, // ms
    SLOW: 500, // ms
  },

  // 延迟
  DEBOUNCE_DELAY: 300, // ms
  THROTTLE_DELAY: 1000, // ms
} as const;

// ==================== 缓存常量 ====================

export const CACHE = {
  // localStorage 过期时间
  USER_INFO_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30天
  SYMPTOMS_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
  HEALTH_SCORE_EXPIRY: 1 * 24 * 60 * 60 * 1000, // 1天

  // 缓存键前缀
  PREFIX: 'health_app_',
} as const;

// ==================== API 常量 ====================

export const API = {
  // 超时时间
  TIMEOUT: 30000, // 30秒

  // 重试次数
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1秒

  // 分页
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // 文件上传
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
} as const;

// ==================== 速率限制常量 ====================

export const RATE_LIMIT = {
  // 严格模式（登录等敏感操作）
  STRICT: {
    WINDOW_MS: 15 * 60 * 1000, // 15分钟
    MAX_REQUESTS: 5,
  },

  // 中等模式（一般API）
  MODERATE: {
    WINDOW_MS: 60 * 1000, // 1分钟
    MAX_REQUESTS: 30,
  },

  // 宽松模式（公开API）
  LOOSE: {
    WINDOW_MS: 60 * 1000, // 1分钟
    MAX_REQUESTS: 100,
  },
} as const;

// ==================== 健康状态常量 ====================

export const HEALTH_STATUS = {
  EXCELLENT: {
    MIN: 80,
    MAX: 100,
    LABEL: '优秀',
    COLOR: 'bg-green-500',
  },
  GOOD: {
    MIN: 60,
    MAX: 79,
    LABEL: '良好',
    COLOR: 'bg-blue-500',
  },
  AVERAGE: {
    MIN: 40,
    MAX: 59,
    LABEL: '一般',
    COLOR: 'bg-yellow-500',
  },
  NEEDS_ATTENTION: {
    MIN: 20,
    MAX: 39,
    LABEL: '需关注',
    COLOR: 'bg-orange-500',
  },
  NEEDS_IMPROVEMENT: {
    MIN: 0,
    MAX: 19,
    LABEL: '需改善',
    COLOR: 'bg-red-500',
  },
} as const;

// ==================== 错误消息常量 ====================

export const ERROR_MESSAGES = {
  // 通用
  UNKNOWN_ERROR: '操作失败，请稍后重试',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请重试',

  // 用户
  USER_NOT_FOUND: '用户不存在',
  USER_ALREADY_EXISTS: '用户已存在',
  INVALID_CREDENTIALS: '用户名或密码错误',

  // 数据
  DATA_NOT_FOUND: '数据不存在',
  DATA_ALREADY_EXISTS: '数据已存在',
  INVALID_DATA_FORMAT: '数据格式错误',

  // 权限
  UNAUTHORIZED: '未授权，请先登录',
  FORBIDDEN: '权限不足',
  SESSION_EXPIRED: '会话已过期，请重新登录',

  // 验证
  REQUIRED_FIELD_MISSING: '必填字段不能为空',
  INVALID_EMAIL: '邮箱格式不正确',
  INVALID_PHONE: '手机号格式不正确',

  // 速率限制
  RATE_LIMIT_EXCEEDED: '请求过于频繁，请稍后再试',
} as const;

// ==================== 本地化常量 ====================

export const LOCALE = {
  DEFAULT: 'zh-CN',
  SUPPORTED: ['zh-CN', 'en-US'],
} as const;

// ==================== 性能优化常量 ====================

export const PERFORMANCE = {
  // 虚拟滚动
  VIRTUAL_LIST_ITEM_SIZE: 50, // px
  VIRTUAL_LIST_OVERSCAN: 5, // 额外渲染的项目数

  // 图片懒加载
  IMAGE_LAZY_LOAD_THRESHOLD: 200, // px

  // 防抖和节流
  SCROLL_THROTTLE: 100, // ms
  RESIZE_DEBOUNCE: 200, // ms
  INPUT_DEBOUNCE: 300, // ms
} as const;

// ==================== 调试常量 ====================

export const DEBUG = {
  ENABLED: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
} as const;

// ==================== 辅助函数 ====================

/**
 * 获取健康状态
 */
export function getHealthStatus(score: number): { label: string; color: string } {
  if (score >= HEALTH_STATUS.EXCELLENT.MIN) {
    return { label: HEALTH_STATUS.EXCELLENT.LABEL, color: HEALTH_STATUS.EXCELLENT.COLOR };
  }
  if (score >= HEALTH_STATUS.GOOD.MIN) {
    return { label: HEALTH_STATUS.GOOD.LABEL, color: HEALTH_STATUS.GOOD.COLOR };
  }
  if (score >= HEALTH_STATUS.AVERAGE.MIN) {
    return { label: HEALTH_STATUS.AVERAGE.LABEL, color: HEALTH_STATUS.AVERAGE.COLOR };
  }
  if (score >= HEALTH_STATUS.NEEDS_ATTENTION.MIN) {
    return { label: HEALTH_STATUS.NEEDS_ATTENTION.LABEL, color: HEALTH_STATUS.NEEDS_ATTENTION.COLOR };
  }
  return { label: HEALTH_STATUS.NEEDS_IMPROVEMENT.LABEL, color: HEALTH_STATUS.NEEDS_IMPROVEMENT.COLOR };
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals);
}

/**
 * 格式化百分比
 */
export function formatPercentage(num: number, total: number, decimals: number = 1): string {
  const percentage = total > 0 ? (num / total) * 100 : 0;
  return `${formatNumber(percentage, decimals)}%`;
}

/**
 * 限制数字范围
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}
