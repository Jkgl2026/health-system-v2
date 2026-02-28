// utils/cloud-db.js
// 云数据库操作工具类
// 注意：此文件已废弃，改用云函数处理数据库操作
// 保留此文件仅为兼容旧代码，新代码请使用 cloud-functions.js

let db = null;
let _ = null;

/**
 * 获取数据库实例（延迟初始化）
 * @returns {Object} 数据库实例
 */
function getDb() {
  if (!db) {
    if (!wx.cloud) {
      console.error('云开发未初始化，请确保基础库版本 >= 2.2.3');
      return null;
    }
    db = wx.cloud.database();
    _ = db.command;
  }
  return db;
}

// 数据库集合名称
const COLLECTIONS = {
  USERS: 'health_users',           // 用户信息表
  RECORDS: 'health_records',       // 健康检测记录表
  ADMIN: 'admin_config'            // 管理员配置表
};

/**
 * 初始化数据库集合（首次使用时调用）
 */
async function initDatabase() {
  const database = getDb();
  if (!database) return false;
  
  try {
    // 检查是否已初始化
    const adminConfig = await database.collection(COLLECTIONS.ADMIN).get();
    if (adminConfig.data.length === 0) {
      // 创建默认管理员配置
      await database.collection(COLLECTIONS.ADMIN).add({
        data: {
          _id: 'admin_config',
          password: 'admin123', // 默认密码，建议首次登录后修改
          createdAt: database.serverDate()
        }
      });
      console.log('管理员配置初始化成功');
    }
    return true;
  } catch (error) {
    console.error('初始化数据库失败:', error);
    return false;
  }
}

/**
 * 保存或更新用户信息
 * @param {Object} userInfo 用户信息
 * @returns {Object} 保存结果
 */
async function saveUserInfo(userInfo) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化' };
  
  try {
    const { phone } = userInfo;
    
    // 查找是否已存在该用户
    const existingUser = await database.collection(COLLECTIONS.USERS)
      .where({ phone })
      .get();
    
    if (existingUser.data.length > 0) {
      // 更新用户信息
      const userId = existingUser.data[0]._id;
      await database.collection(COLLECTIONS.USERS).doc(userId).update({
        data: {
          ...userInfo,
          updatedAt: database.serverDate()
        }
      });
      return { success: true, userId, isNew: false };
    } else {
      // 创建新用户
      const result = await database.collection(COLLECTIONS.USERS).add({
        data: {
          ...userInfo,
          createdAt: database.serverDate(),
          updatedAt: database.serverDate()
        }
      });
      return { success: true, userId: result._id, isNew: true };
    }
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 保存健康检测记录
 * @param {Object} record 健康记录数据
 * @returns {Object} 保存结果
 */
async function saveHealthRecord(record) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化' };
  
  try {
    const result = await database.collection(COLLECTIONS.RECORDS).add({
      data: {
        ...record,
        createdAt: database.serverDate()
      }
    });
    return { success: true, recordId: result._id };
  } catch (error) {
    console.error('保存健康记录失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取所有用户列表（后台管理用）
 * @param {Object} options 分页和搜索参数
 * @returns {Object} 用户列表
 */
async function getUserList(options = {}) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化', data: [] };
  
  const { page = 1, limit = 20, search = '' } = options;
  const skip = (page - 1) * limit;
  
  try {
    let query = database.collection(COLLECTIONS.USERS);
    
    // 搜索条件
    if (search) {
      query = query.where(_.or([
        { name: database.RegExp({ regexp: search, options: 'i' }) },
        { phone: database.RegExp({ regexp: search, options: 'i' }) }
      ]));
    }
    
    // 获取总数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 获取数据
    const listResult = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    // 为每个用户获取最新的健康记录
    const users = await Promise.all(listResult.data.map(async (user) => {
      const latestRecord = await getLatestRecordByUserId(user._id);
      return {
        ...user,
        latestRecord
      };
    }));
    
    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * 获取用户详情
 * @param {string} userId 用户ID
 * @returns {Object} 用户详情
 */
async function getUserDetail(userId) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化' };
  
  try {
    // 获取用户基本信息
    const userResult = await database.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userResult.data) {
      return { success: false, error: '用户不存在' };
    }
    
    const user = userResult.data;
    
    // 获取用户所有健康记录
    const recordsResult = await database.collection(COLLECTIONS.RECORDS)
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get();
    
    return {
      success: true,
      data: {
        user,
        records: recordsResult.data
      }
    };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取用户历史记录（用于数据对比）
 * @param {string} phone 手机号
 * @returns {Object} 历史记录列表
 */
async function getUserHistory(phone) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化', users: [] };
  
  try {
    // 查找该手机号对应的所有用户记录
    const usersResult = await database.collection(COLLECTIONS.USERS)
      .where({ phone })
      .get();
    
    if (usersResult.data.length === 0) {
      return { success: true, users: [] };
    }
    
    const users = await Promise.all(usersResult.data.map(async (user) => {
      const latestRecord = await getLatestRecordByUserId(user._id);
      return {
        ...user,
        latestRecord
      };
    }));
    
    return { success: true, users };
  } catch (error) {
    console.error('获取用户历史记录失败:', error);
    return { success: false, error: error.message, users: [] };
  }
}

/**
 * 根据用户ID获取最新记录
 * @param {string} userId 用户ID
 * @returns {Object|null} 最新记录
 */
async function getLatestRecordByUserId(userId) {
  const database = getDb();
  if (!database) return null;
  
  try {
    const result = await database.collection(COLLECTIONS.RECORDS)
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    return result.data.length > 0 ? result.data[0] : null;
  } catch (error) {
    console.error('获取最新记录失败:', error);
    return null;
  }
}

/**
 * 获取统计数据
 * @returns {Object} 统计数据
 */
async function getStatistics() {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化' };
  
  try {
    const usersCount = await database.collection(COLLECTIONS.USERS).count();
    const recordsCount = await database.collection(COLLECTIONS.RECORDS).count();
    
    return {
      success: true,
      data: {
        totalUsers: usersCount.total,
        totalRecords: recordsCount.total
      }
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除用户及其所有记录
 * @param {string} userId 用户ID
 * @returns {Object} 删除结果
 */
async function deleteUser(userId) {
  const database = getDb();
  if (!database) return { success: false, error: '云开发未初始化' };
  
  try {
    // 删除用户的所有记录
    const records = await database.collection(COLLECTIONS.RECORDS)
      .where({ userId })
      .get();
    
    for (const record of records.data) {
      await database.collection(COLLECTIONS.RECORDS).doc(record._id).remove();
    }
    
    // 删除用户
    await database.collection(COLLECTIONS.USERS).doc(userId).remove();
    
    return { success: true };
  } catch (error) {
    console.error('删除用户失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  initDatabase,
  saveUserInfo,
  saveHealthRecord,
  getUserList,
  getUserDetail,
  getUserHistory,
  getLatestRecordByUserId,
  getStatistics,
  deleteUser,
  COLLECTIONS
};
