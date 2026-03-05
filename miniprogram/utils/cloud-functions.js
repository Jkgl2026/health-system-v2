// utils/cloud-functions.js
// 云函数调用工具类

/**
 * 调用云函数
 * @param {string} name 云函数名称
 * @param {Object} data 参数
 * @returns {Promise<Object>} 结果
 */
function callFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result)
      },
      fail: (err) => {
        console.error(`云函数 ${name} 调用失败:`, err)
        reject(err)
      }
    })
  })
}

/**
 * 管理员登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns {Promise<Object>} 登录结果
 */
async function adminLogin(username, password) {
  return await callFunction('adminAuth', { username, password })
}

/**
 * 修改管理员密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @returns {Promise<Object>} 修改结果
 */
async function adminChangePassword(oldPassword, newPassword) {
  return await callFunction('adminChangePassword', { oldPassword, newPassword })
}

/**
 * 保存健康记录
 * @param {Object} recordData 记录数据
 * @returns {Promise<Object>} 保存结果
 */
async function saveHealthRecord(recordData) {
  return await callFunction('saveHealthRecord', recordData)
}

/**
 * 获取用户列表
 * @param {Object} options 分页和搜索参数
 * @returns {Promise<Object>} 用户列表
 */
async function getUserList(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getUserList',
    data: options
  })
}

/**
 * 获取用户详情
 * @param {string} userId 用户ID
 * @returns {Promise<Object>} 用户详情
 */
async function getUserDetail(userId) {
  return await callFunction('getHealthRecords', {
    action: 'getUserDetail',
    data: { userId }
  })
}

/**
 * 获取用户历史记录
 * @param {string} phone 手机号
 * @param {string} name 姓名
 * @returns {Promise<Object>} 历史记录
 */
async function getUserHistory(phone, name) {
  return await callFunction('getHealthRecords', {
    action: 'getUserHistory',
    data: { phone, name }
  })
}

/**
 * 获取记录详情
 * @param {string} recordId 记录ID
 * @returns {Promise<Object>} 记录详情
 */
async function getRecordDetail(recordId) {
  return await callFunction('getHealthRecords', {
    action: 'getRecordDetail',
    data: { recordId }
  })
}

/**
 * 获取统计数据（简化版）
 * @returns {Promise<Object>} 统计数据
 */
async function getStatistics() {
  return await callFunction('getHealthRecords', {
    action: 'getStatistics'
  })
}

/**
 * 获取仪表盘统计数据（完整版，含健康要素、平均分等）
 * @returns {Promise<Object>} 仪表盘统计数据
 */
async function getDashboardStats() {
  return await callFunction('getHealthRecords', {
    action: 'getDashboardStats'
  })
}

/**
 * 删除用户
 * @param {string} userId 用户ID
 * @returns {Promise<Object>} 删除结果
 */
async function deleteUser(userId) {
  return await callFunction('getHealthRecords', {
    action: 'deleteUser',
    data: { userId }
  })
}

/**
 * 生成健康报告PDF
 * @param {string} recordId 记录ID
 * @param {string} userId 用户ID
 * @returns {Promise<Object>} PDF文件信息
 */
async function generateHealthPDF(recordId, userId) {
  return await callFunction('generateHealthPDF', { recordId, userId })
}

/**
 * 获取文件临时访问链接
 * @param {Array} fileIDs 文件ID列表
 * @returns {Promise<Object>} 文件链接列表
 */
async function getTempFileURL(fileIDs) {
  return await callFunction('uploadFile', {
    action: 'getTempFileURL',
    data: { fileIDs }
  })
}

/**
 * 删除文件
 * @param {Array} fileIDs 文件ID列表
 * @returns {Promise<Object>} 删除结果
 */
async function deleteFile(fileIDs) {
  return await callFunction('uploadFile', {
    action: 'deleteFile',
    data: { fileIDs }
  })
}

// ==================== 数据分析功能 ====================

/**
 * 获取症状分类统计
 * @param {Object} options 查询参数
 * @returns {Promise<Object>} 症状统计数据
 */
async function getSymptomStats(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getSymptomStats',
    data: options
  })
}

/**
 * 获取体质分布统计
 * @param {Object} options 查询参数
 * @returns {Promise<Object>} 体质统计数据
 */
async function getConstitutionStats(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getConstitutionStats',
    data: options
  })
}

/**
 * 获取调理方案使用统计
 * @param {Object} options 查询参数
 * @returns {Promise<Object>} 方案统计数据
 */
async function getPlanStats(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getPlanStats',
    data: options
  })
}

/**
 * 获取时间趋势数据
 * @param {Object} options 查询参数
 * @returns {Promise<Object>} 趋势数据
 */
async function getTrendData(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getTrendData',
    data: options
  })
}

/**
 * 获取异常用户列表
 * @param {Object} options 查询参数
 * @returns {Promise<Object>} 异常用户列表
 */
async function getAbnormalUsers(options = {}) {
  return await callFunction('getHealthRecords', {
    action: 'getAbnormalUsers',
    data: options
  })
}

module.exports = {
  callFunction,
  adminLogin,
  adminChangePassword,
  saveHealthRecord,
  getUserList,
  getUserDetail,
  getUserHistory,
  getRecordDetail,
  getStatistics,
  getDashboardStats,
  deleteUser,
  generateHealthPDF,
  getTempFileURL,
  deleteFile,
  // 新增
  getSymptomStats,
  getConstitutionStats,
  getPlanStats,
  getTrendData,
  getAbnormalUsers
}
