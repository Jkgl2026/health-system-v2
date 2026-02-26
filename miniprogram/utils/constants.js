// utils/constants.js
// 全局常量配置

// ==================== 健康数据常量 ====================
const HEALTH_DATA = {
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
  HEALTH_ELEMENTS_COUNT: 8,
};

// ==================== 健康评分权重 ====================
const SCORE_WEIGHTS = {
  BODY_LANGUAGE: 1.0,
  SYMPTOMS_300: 0.8,
  BAD_HABITS: 0.6,
};

// ==================== 症状严重程度权重 ====================
const SEVERITY_WEIGHTS = {
  EMERGENCY: 5,   // 紧急症状
  SEVERE: 2,      // 严重症状
  MODERATE: 0.8,  // 中等症状
  MILD: 0.3,      // 轻微症状
};

// ==================== 指数系数范围 ====================
const FACTOR_RANGE = {
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
};

// ==================== UI 常量 ====================
const UI = {
  // 移动端
  MIN_TOUCH_TARGET_SIZE: 88, // rpx
  MIN_FONT_SIZE: 24, // rpx
  MAX_FONT_SIZE: 48, // rpx

  // 布局
  MAX_CONTENT_WIDTH: 750, // rpx
  CONTAINER_PADDING: {
    MOBILE: 32, // rpx
    TABLET: 48, // rpx
    DESKTOP: 64, // rpx
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
};

// ==================== 缓存常量 ====================
const CACHE = {
  // localStorage 过期时间
  USER_INFO_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30天
  SYMPTOMS_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
  HEALTH_SCORE_EXPIRY: 1 * 24 * 60 * 60 * 1000, // 1天

  // 缓存键前缀
  PREFIX: 'health_app_',
};

// ==================== API 常量 ====================
const API = {
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
};

// ==================== 速率限制常量 ====================
const RATE_LIMIT = {
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
};

// ==================== 健康状态常量 ====================
const HEALTH_STATUS = {
  EXCELLENT: {
    MIN: 80,
    MAX: 100,
    LABEL: '优秀',
    COLOR: '#22c55e',
    BG_COLOR: '#dcfce7',
  },
  GOOD: {
    MIN: 60,
    MAX: 79,
    LABEL: '良好',
    COLOR: '#3b82f6',
    BG_COLOR: '#dbeafe',
  },
  AVERAGE: {
    MIN: 40,
    MAX: 59,
    LABEL: '一般',
    COLOR: '#eab308',
    BG_COLOR: '#fef9c3',
  },
  NEEDS_ATTENTION: {
    MIN: 20,
    MAX: 39,
    LABEL: '需关注',
    COLOR: '#f97316',
    BG_COLOR: '#ffedd5',
  },
  NEEDS_IMPROVEMENT: {
    MIN: 0,
    MAX: 19,
    LABEL: '需改善',
    COLOR: '#ef4444',
    BG_COLOR: '#fee2e2',
  },
};

// ==================== 错误消息常量 ====================
const ERROR_MESSAGES = {
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
  DATA_INVALID: '数据格式不正确',
  DATA_SAVE_FAILED: '数据保存失败',

  // 权限
  PERMISSION_DENIED: '没有权限执行此操作',
  SESSION_EXPIRED: '登录已过期，请重新登录',

  // 表单
  REQUIRED_FIELD: '此字段为必填项',
  INVALID_PHONE: '手机号格式不正确',
  INVALID_EMAIL: '邮箱格式不正确',
  INVALID_AGE: '年龄必须在1-150之间',
};

// ==================== 成功消息常量 ====================
const SUCCESS_MESSAGES = {
  // 通用
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  SUBMIT_SUCCESS: '提交成功',

  // 用户
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  REGISTER_SUCCESS: '注册成功',

  // 数据
  SYNC_SUCCESS: '同步成功',
  BACKUP_SUCCESS: '备份成功',
  RESTORE_SUCCESS: '恢复成功',
};

// ==================== 本地存储键名 ====================
const STORAGE_KEYS = {
  // 用户相关
  USER_ID: 'userId',
  USER_DATA: 'userData',
  USER_PHONE: 'userPhone',

  // 管理员相关
  ADMIN_TOKEN: 'adminToken',
  ADMIN_INFO: 'adminInfo',

  // 表单数据
  SELECTED_SYMPTOMS: 'selectedSymptoms',
  SELECTED_SYMPTOMS_300: 'selectedSymptoms300',
  SELECTED_HABITS: 'selectedHabits',
  CHOICE_DATA: 'choiceData',
  REQUIREMENTS_DATA: 'requirementsData',
  SEVEN_QUESTIONS_ANSWERS: 'sevenQuestionsAnswers',

  // 缓存
  HEALTH_SCORE_CACHE: 'healthScoreCache',
  STATISTICS_CACHE: 'statisticsCache',
};

// ==================== 页面路径 ====================
const PAGE_PATHS = {
  // 首页
  INDEX: '/pages/index/index',

  // 用户流程
  PERSONAL_INFO: '/pages/personal-info/personal-info',
  CHECK: '/pages/check/check',
  HABITS: '/pages/habits/habits',
  SYMPTOMS_300: '/pages/symptoms300/symptoms300',
  TARGET: '/pages/target/target',
  CHOICES: '/pages/choices/choices',
  REQUIREMENTS: '/pages/requirements/requirements',
  HEALING: '/pages/healing/healing',
  HEALTH_RESULT: '/pages/health-result/health-result',
  MY_SOLUTION: '/pages/my-solution/my-solution',
  STORY: '/pages/story/story',
  QUESTIONS: '/pages/questions/questions',
  SEVEN_QUESTIONS: '/pages/seven-questions/seven-questions',

  // 后台管理
  ADMIN_LOGIN: '/pages/admin-login/admin-login',
  ADMIN_DASHBOARD: '/pages/admin-dashboard/admin-dashboard',
  ADMIN_USER_DETAIL: '/pages/admin-user-detail/admin-user-detail',
  ADMIN_MAINTENANCE: '/pages/admin-maintenance/admin-maintenance',
  ADMIN_COMPARE: '/pages/admin-compare/admin-compare',
  ADMIN_SEVEN_QUESTIONS: '/pages/admin-seven-questions/admin-seven-questions',

  // 调试工具
  DIAGNOSE: '/pages/diagnose/diagnose',
  DIAGNOSIS_TOOLS: '/pages/diagnosis-tools/diagnosis-tools',
  DATA_RESET: '/pages/data-reset/data-reset',
  LOCAL_DATA_RECOVERY: '/pages/local-data-recovery/local-data-recovery',
};

// ==================== Tab Bar 配置 ====================
const TAB_BAR = {
  HOME: 0,
  MY_SOLUTION: 1,
  ADMIN: 2,
};

// ==================== 日期格式 ====================
const DATE_FORMAT = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  CHINESE: 'YYYY年MM月DD日',
};

// ==================== 三个选择常量 ====================
const THREE_CHOICES_KEYS = {
  CHOICE1: 'choice1', // 不花钱的方法
  CHOICE2: 'choice2', // 带产品来免费服务
  CHOICE3: 'choice3', // 使用我的产品和服务
};

// ==================== 四个要求常量 ====================
const FOUR_REQUIREMENTS_KEYS = {
  REQUIREMENT1: 'requirement1', // 找病因
  REQUIREMENT2: 'requirement2', // 建立身体恢复档案
  REQUIREMENT3: 'requirement3', // 跟着学习健康观念
  REQUIREMENT4: 'requirement4', // 学会健康自我管理
};

module.exports = {
  // 健康数据
  HEALTH_DATA,
  SCORE_WEIGHTS,
  SEVERITY_WEIGHTS,
  FACTOR_RANGE,

  // UI
  UI,

  // 缓存
  CACHE,

  // API
  API,
  RATE_LIMIT,

  // 状态
  HEALTH_STATUS,

  // 消息
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,

  // 存储
  STORAGE_KEYS,

  // 路径
  PAGE_PATHS,
  TAB_BAR,

  // 日期
  DATE_FORMAT,

  // 业务常量
  THREE_CHOICES_KEYS,
  FOUR_REQUIREMENTS_KEYS,
};
