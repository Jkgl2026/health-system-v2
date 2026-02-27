// utils/history-manager.js
// 历史记录管理工具 - 用于保存和管理用户自检历史记录

const MAX_HISTORY_COUNT = 20; // 最多保存20条历史记录

/**
 * 保存一条历史记录
 * @returns {boolean} 是否保存成功
 */
function saveHistoryRecord() {
  try {
    // 获取当前所有数据
    const userInfo = wx.getStorageSync('userInfo') || null;
    const selectedSymptoms = wx.getStorageSync('selectedSymptoms') || [];
    const badHabits = wx.getStorageSync('selectedHabitsRequirements') || [];
    const symptoms300 = wx.getStorageSync('selectedSymptoms300') || [];
    const sevenQuestions = wx.getStorageSync('sevenQuestionsAnswers') || {};
    const targetSymptoms = wx.getStorageSync('targetSymptoms') || [];
    const selectedChoice = wx.getStorageSync('selectedChoice') || '';
    const healthScore = wx.getStorageSync('healthScore') || 0;

    // 获取健康要素
    const healthElements = calculateHealthElements(selectedSymptoms);

    // 获取症状名称
    const healthData = require('./health-data');
    const symptomNames = selectedSymptoms.map(id => {
      const s = healthData.BODY_SYMPTOMS.find(item => item.id === id);
      return s ? { id, name: s.name, category: s.category } : null;
    }).filter(s => s);

    const badHabitNames = badHabits.map(id => {
      for (const category of Object.keys(healthData.BAD_HABITS_CHECKLIST)) {
        const habits = healthData.BAD_HABITS_CHECKLIST[category];
        const habit = habits.find(h => h.id === id);
        if (habit) return { id, name: habit.habit, category };
      }
      return null;
    }).filter(h => h);

    const symptoms300Names = symptoms300.map(id => {
      const s = healthData.BODY_SYMPTOMS_300.find(item => item.id === id);
      return s ? { id, name: s.name, category: s.category } : null;
    }).filter(s => s);

    const targetSymptomNames = targetSymptoms.map(id => {
      const s = healthData.BODY_SYMPTOMS.find(item => item.id === id);
      return s ? { id, name: s.name } : null;
    }).filter(s => s);

    // 创建记录对象
    const record = {
      id: Date.now(), // 使用时间戳作为唯一ID
      timestamp: Date.now(),
      dateStr: formatDate(new Date()),
      userInfo,
      selectedSymptoms,
      symptomNames,
      badHabits,
      badHabitNames,
      symptoms300,
      symptoms300Names,
      sevenQuestions,
      targetSymptoms,
      targetSymptomNames,
      healthElements,
      selectedChoice,
      healthScore,
      summary: {
        symptomCount: selectedSymptoms.length,
        badHabitCount: badHabits.length,
        symptoms300Count: symptoms300.length,
        targetCount: targetSymptoms.length,
        score: healthScore
      }
    };

    // 获取现有历史记录
    let history = wx.getStorageSync('healthHistory') || [];
    
    // 添加新记录到开头
    history.unshift(record);
    
    // 最多保存20条
    if (history.length > MAX_HISTORY_COUNT) {
      history = history.slice(0, MAX_HISTORY_COUNT);
    }

    // 保存
    wx.setStorageSync('healthHistory', history);
    
    console.log('历史记录保存成功，当前共', history.length, '条');
    return true;
  } catch (error) {
    console.error('保存历史记录失败:', error);
    return false;
  }
}

/**
 * 获取所有历史记录
 * @returns {Array} 历史记录列表
 */
function getAllHistory() {
  try {
    return wx.getStorageSync('healthHistory') || [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
}

/**
 * 根据ID获取单条历史记录
 * @param {number} id 记录ID
 * @returns {Object|null} 历史记录
 */
function getHistoryById(id) {
  const history = getAllHistory();
  return history.find(record => record.id === id) || null;
}

/**
 * 删除单条历史记录
 * @param {number} id 记录ID
 * @returns {boolean} 是否删除成功
 */
function deleteHistoryRecord(id) {
  try {
    let history = getAllHistory();
    history = history.filter(record => record.id !== id);
    wx.setStorageSync('healthHistory', history);
    console.log('删除历史记录成功，ID:', id);
    return true;
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return false;
  }
}

/**
 * 清空所有历史记录
 * @returns {boolean} 是否清空成功
 */
function clearAllHistory() {
  try {
    wx.removeStorageSync('healthHistory');
    return true;
  } catch (error) {
    console.error('清空历史记录失败:', error);
    return false;
  }
}

/**
 * 计算健康要素
 * @param {Array} selectedSymptoms 选中的症状ID
 * @returns {Array} 健康要素列表
 */
function calculateHealthElements(selectedSymptoms) {
  const elements = [
    { name: '气血', symptoms: [1,2,3,4,5,6,7,8,9,14,16,17,18,19,23,24,25,26,34,41,35,43,44,45,48,50,51,52,53,54,55,56,74,75,85,68,90,87,91,92,94,93] },
    { name: '循环', symptoms: [46,47,48,49,55,56,57,59,60,61,62,63,71,72,73,75,76,77,78,79,80] },
    { name: '毒素', symptoms: [41,42,43,44,45,46,47,68,69,70,97] },
    { name: '血脂', symptoms: [71,72,73,74,75] },
    { name: '寒凉', symptoms: [55,63] },
    { name: '免疫', symptoms: [34,94,98] },
    { name: '情绪', symptoms: [85] }
  ];

  const results = elements.map(el => {
    const count = el.symptoms.filter(id => selectedSymptoms.includes(id)).length;
    return { name: el.name, count };
  }).filter(el => el.count > 0).sort((a, b) => b.count - a.count);

  return results;
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

/**
 * 获取历史记录统计信息
 * @returns {Object} 统计信息
 */
function getHistoryStats() {
  const history = getAllHistory();
  if (history.length === 0) {
    return { count: 0, firstDate: null, lastDate: null, avgScore: 0 };
  }

  const scores = history.map(h => h.healthScore || h.summary?.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return {
    count: history.length,
    firstDate: history[0]?.dateStr || null,
    lastDate: history[history.length - 1]?.dateStr || null,
    avgScore,
    latestScore: scores[0] || 0
  };
}

module.exports = {
  saveHistoryRecord,
  getAllHistory,
  getHistoryById,
  deleteHistoryRecord,
  clearAllHistory,
  getHistoryStats,
  MAX_HISTORY_COUNT
};
