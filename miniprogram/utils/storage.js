// utils/storage.js - 本地存储工具

/**
 * 存储键名常量
 */
const STORAGE_KEYS = {
  USER_INFO: 'userInfo',                    // 用户基本信息
  PERSONAL_INFO: 'personalInfo',            // 个人信息
  SELECTED_SYMPTOMS: 'selectedSymptoms',    // 身体语言简表（100项）
  SELECTED_HABITS: 'selectedHabitsRequirements', // 不良生活习惯（252项）
  SELECTED_SYMPTOMS_300: 'selectedSymptoms300',  // 300症状表
  TARGET_SYMPTOMS: 'targetSymptoms',        // 重点症状
  SELECTED_CHOICE: 'selectedChoice',        // 选择方案
  THREE_CHOICES: 'threeChoices',            // 三个选择
  FOUR_REQUIREMENTS: 'fourRequirements',    // 四个要求
  SEVEN_QUESTIONS: 'sevenQuestions',        // 健康七问
  ADMIN_TOKEN: 'admin_access_token',        // 管理员访问令牌
  ADMIN_REFRESH_TOKEN: 'admin_refresh_token' // 管理员刷新令牌
};

/**
 * 设置存储
 */
function setItem(key, value) {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('存储失败:', key, e);
    return false;
  }
}

/**
 * 获取存储
 */
function getItem(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key);
    if (value) {
      return JSON.parse(value);
    }
    return defaultValue;
  } catch (e) {
    console.error('读取失败:', key, e);
    return defaultValue;
  }
}

/**
 * 删除存储
 */
function removeItem(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('删除失败:', key, e);
    return false;
  }
}

/**
 * 清空所有存储
 */
function clearAll() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('清空失败:', e);
    return false;
  }
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return getItem(STORAGE_KEYS.USER_INFO);
}

/**
 * 保存用户信息
 */
function saveUserInfo(userInfo) {
  return setItem(STORAGE_KEYS.USER_INFO, userInfo);
}

/**
 * 获取选中的身体语言简表症状
 */
function getSelectedSymptoms() {
  return getItem(STORAGE_KEYS.SELECTED_SYMPTOMS, []);
}

/**
 * 保存选中的身体语言简表症状
 */
function saveSelectedSymptoms(symptoms) {
  return setItem(STORAGE_KEYS.SELECTED_SYMPTOMS, symptoms);
}

/**
 * 获取选中的不良生活习惯
 */
function getSelectedHabits() {
  return getItem(STORAGE_KEYS.SELECTED_HABITS, []);
}

/**
 * 保存选中的不良生活习惯
 */
function saveSelectedHabits(habits) {
  return setItem(STORAGE_KEYS.SELECTED_HABITS, habits);
}

/**
 * 获取选中的300症状表
 */
function getSelectedSymptoms300() {
  return getItem(STORAGE_KEYS.SELECTED_SYMPTOMS_300, []);
}

/**
 * 保存选中的300症状表
 */
function saveSelectedSymptoms300(symptoms) {
  return setItem(STORAGE_KEYS.SELECTED_SYMPTOMS_300, symptoms);
}

/**
 * 获取重点症状
 */
function getTargetSymptoms() {
  return getItem(STORAGE_KEYS.TARGET_SYMPTOMS, []);
}

/**
 * 保存重点症状
 */
function saveTargetSymptoms(symptoms) {
  return setItem(STORAGE_KEYS.TARGET_SYMPTOMS, symptoms);
}

/**
 * 获取选择的方案
 */
function getSelectedChoice() {
  return getItem(STORAGE_KEYS.SELECTED_CHOICE, '');
}

/**
 * 保存选择的方案
 */
function saveSelectedChoice(choice) {
  return setItem(STORAGE_KEYS.SELECTED_CHOICE, choice);
}

/**
 * 获取健康七问
 */
function getSevenQuestions() {
  return getItem(STORAGE_KEYS.SEVEN_QUESTIONS, {});
}

/**
 * 保存健康七问
 */
function saveSevenQuestions(questions) {
  return setItem(STORAGE_KEYS.SEVEN_QUESTIONS, questions);
}

/**
 * 获取个人信息
 */
function getPersonalInfo() {
  return getItem(STORAGE_KEYS.PERSONAL_INFO);
}

/**
 * 保存个人信息
 */
function savePersonalInfo(info) {
  return setItem(STORAGE_KEYS.PERSONAL_INFO, info);
}

/**
 * 获取三个选择
 */
function getThreeChoices() {
  return getItem(STORAGE_KEYS.THREE_CHOICES, []);
}

/**
 * 保存三个选择
 */
function saveThreeChoices(choices) {
  return setItem(STORAGE_KEYS.THREE_CHOICES, choices);
}

/**
 * 获取四个要求
 */
function getFourRequirements() {
  return getItem(STORAGE_KEYS.FOUR_REQUIREMENTS, []);
}

/**
 * 保存四个要求
 */
function saveFourRequirements(requirements) {
  return setItem(STORAGE_KEYS.FOUR_REQUIREMENTS, requirements);
}

/**
 * 获取所有健康数据
 */
function getAllHealthData() {
  return {
    userInfo: getUserInfo(),
    bodySymptoms: getSelectedSymptoms(),
    badHabits: getSelectedHabits(),
    symptoms300: getSelectedSymptoms300(),
    targetSymptoms: getTargetSymptoms(),
    selectedChoice: getSelectedChoice(),
    sevenQuestions: getSevenQuestions()
  };
}

/**
 * 清除所有健康数据
 */
function clearHealthData() {
  removeItem(STORAGE_KEYS.USER_INFO);
  removeItem(STORAGE_KEYS.SELECTED_SYMPTOMS);
  removeItem(STORAGE_KEYS.SELECTED_HABITS);
  removeItem(STORAGE_KEYS.SELECTED_SYMPTOMS_300);
  removeItem(STORAGE_KEYS.TARGET_SYMPTOMS);
  removeItem(STORAGE_KEYS.SELECTED_CHOICE);
  removeItem(STORAGE_KEYS.SEVEN_QUESTIONS);
}

/**
 * 检查是否有健康数据
 */
function hasHealthData() {
  const data = getAllHealthData();
  return data.bodySymptoms.length > 0 || 
         data.badHabits.length > 0 || 
         data.symptoms300.length > 0;
}

module.exports = {
  STORAGE_KEYS,
  setItem,
  getItem,
  removeItem,
  clearAll,
  getUserInfo,
  saveUserInfo,
  getPersonalInfo,
  savePersonalInfo,
  getSelectedSymptoms,
  saveSelectedSymptoms,
  getSelectedHabits,
  saveSelectedHabits,
  getSelectedSymptoms300,
  saveSelectedSymptoms300,
  getTargetSymptoms,
  saveTargetSymptoms,
  getSelectedChoice,
  saveSelectedChoice,
  getThreeChoices,
  saveThreeChoices,
  getFourRequirements,
  saveFourRequirements,
  getSevenQuestions,
  saveSevenQuestions,
  getAllHealthData,
  clearHealthData,
  hasHealthData,
  clearAllData: clearAll
};
