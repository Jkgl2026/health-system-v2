// utils/storage.js
// 本地存储管理

const STORAGE_KEYS = {
  HEALTH_DATA: 'healthData',
  ADMIN_TOKEN: 'adminToken',
  USER_INFO: 'userInfo',
  DEMO_MODE: 'demoMode'
};

/**
 * 获取存储数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*}
 */
const get = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    return value !== '' ? value : defaultValue;
  } catch (e) {
    console.error('Storage get error:', e);
    return defaultValue;
  }
};

/**
 * 设置存储数据
 * @param {string} key - 存储键名
 * @param {*} value - 存储值
 * @returns {boolean}
 */
const set = (key, value) => {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('Storage set error:', e);
    return false;
  }
};

/**
 * 删除存储数据
 * @param {string} key - 存储键名
 * @returns {boolean}
 */
const remove = (key) => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('Storage remove error:', e);
    return false;
  }
};

/**
 * 清空所有存储数据
 * @returns {boolean}
 */
const clear = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('Storage clear error:', e);
    return false;
  }
};

/**
 * 获取健康数据
 * @returns {object}
 */
const getHealthData = () => {
  return get(STORAGE_KEYS.HEALTH_DATA, {
    personalInfo: null,
    selectedSymptoms: [],
    selectedHabits: [],
    targetSymptoms: [],
    choices: null,
    requirements: null,
    analysisResult: null,
    createdAt: null,
    updatedAt: null
  });
};

/**
 * 保存健康数据
 * @param {object} data - 健康数据
 * @returns {boolean}
 */
const saveHealthData = (data) => {
  const currentData = getHealthData();
  const newData = {
    ...currentData,
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  if (!currentData.createdAt) {
    newData.createdAt = new Date().toISOString();
  }
  
  return set(STORAGE_KEYS.HEALTH_DATA, newData);
};

/**
 * 清空健康数据
 * @returns {boolean}
 */
const clearHealthData = () => {
  return saveHealthData({
    personalInfo: null,
    selectedSymptoms: [],
    selectedHabits: [],
    targetSymptoms: [],
    choices: null,
    requirements: null,
    analysisResult: null
  });
};

/**
 * 更新个人信息
 * @param {object} personalInfo - 个人信息
 * @returns {boolean}
 */
const updatePersonalInfo = (personalInfo) => {
  const data = getHealthData();
  return saveHealthData({ ...data, personalInfo });
};

/**
 * 更新选中症状
 * @param {array} symptoms - 症状列表
 * @returns {boolean}
 */
const updateSelectedSymptoms = (symptoms) => {
  const data = getHealthData();
  return saveHealthData({ ...data, selectedSymptoms: symptoms });
};

/**
 * 更新选中习惯
 * @param {array} habits - 习惯列表
 * @returns {boolean}
 */
const updateSelectedHabits = (habits) => {
  const data = getHealthData();
  return saveHealthData({ ...data, selectedHabits: habits });
};

/**
 * 更新重点症状
 * @param {array} symptoms - 重点症状列表
 * @returns {boolean}
 */
const updateTargetSymptoms = (symptoms) => {
  const data = getHealthData();
  return saveHealthData({ ...data, targetSymptoms: symptoms });
};

/**
 * 更新三个选择
 * @param {object} choices - 选择数据
 * @returns {boolean}
 */
const updateChoices = (choices) => {
  const data = getHealthData();
  return saveHealthData({ ...data, choices });
};

/**
 * 更新四个要求
 * @param {object} requirements - 要求数据
 * @returns {boolean}
 */
const updateRequirements = (requirements) => {
  const data = getHealthData();
  return saveHealthData({ ...data, requirements });
};

/**
 * 更新分析结果
 * @param {object} result - 分析结果
 * @returns {boolean}
 */
const updateAnalysisResult = (result) => {
  const data = getHealthData();
  return saveHealthData({ ...data, analysisResult: result });
};

/**
 * 获取管理员Token
 * @returns {string|null}
 */
const getAdminToken = () => {
  return get(STORAGE_KEYS.ADMIN_TOKEN);
};

/**
 * 保存管理员Token
 * @param {string} token - Token值
 * @returns {boolean}
 */
const saveAdminToken = (token) => {
  return set(STORAGE_KEYS.ADMIN_TOKEN, token);
};

/**
 * 删除管理员Token
 * @returns {boolean}
 */
const removeAdminToken = () => {
  return remove(STORAGE_KEYS.ADMIN_TOKEN);
};

/**
 * 检查是否已登录
 * @returns {boolean}
 */
const isAdminLoggedIn = () => {
  return !!getAdminToken();
};

/**
 * 获取演示模式状态
 * @returns {boolean}
 */
const getDemoMode = () => {
  return get(STORAGE_KEYS.DEMO_MODE, false);
};

/**
 * 设置演示模式
 * @param {boolean} enabled - 是否启用
 * @returns {boolean}
 */
const setDemoMode = (enabled) => {
  return set(STORAGE_KEYS.DEMO_MODE, enabled);
};

module.exports = {
  // 基础方法
  get,
  set,
  remove,
  clear,
  
  // 健康数据方法
  getHealthData,
  saveHealthData,
  clearHealthData,
  updatePersonalInfo,
  updateSelectedSymptoms,
  updateSelectedHabits,
  updateTargetSymptoms,
  updateChoices,
  updateRequirements,
  updateAnalysisResult,
  
  // 管理员认证
  getAdminToken,
  saveAdminToken,
  removeAdminToken,
  isAdminLoggedIn,
  
  // 演示模式
  getDemoMode,
  setDemoMode,
  
  // 常量
  STORAGE_KEYS
};
