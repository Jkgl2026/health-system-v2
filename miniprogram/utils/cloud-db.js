// utils/cloud-db.js
// 云数据库操作工具类

const db = wx.cloud.database();
const _ = db.command;

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
  try {
    // 检查是否已初始化
    const adminConfig = await db.collection(COLLECTIONS.ADMIN).get();
    if (adminConfig.data.length === 0) {
      // 创建默认管理员配置
      await db.collection(COLLECTIONS.ADMIN).add({
        data: {
          _id: 'admin_config',
          password: 'admin123', // 默认密码，建议首次登录后修改
          createdAt: db.serverDate()
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
  try {
    const { phone } = userInfo;
    
    // 查找是否已存在该用户
    const existingUser = await db.collection(COLLECTIONS.USERS)
      .where({ phone })
      .get();
    
    if (existingUser.data.length > 0) {
      // 更新用户信息
      const userId = existingUser.data[0]._id;
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        data: {
          ...userInfo,
          updatedAt: db.serverDate()
        }
      });
      return { success: true, userId, isNew: false };
    } else {
      // 创建新用户
      const result = await db.collection(COLLECTIONS.USERS).add({
        data: {
          ...userInfo,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
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
  try {
    const result = await db.collection(COLLECTIONS.RECORDS).add({
      data: {
        ...record,
        createdAt: db.serverDate()
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
  const { page = 1, limit = 20, search = '' } = options;
  const skip = (page - 1) * limit;
  
  try {
    let query = db.collection(COLLECTIONS.USERS);
    
    // 搜索条件
    if (search) {
      query = query.where(_.or([
        { name: db.RegExp({ regexp: search, options: 'i' }) },
        { phone: db.RegExp({ regexp: search, options: 'i' }) }
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
  try {
    // 获取用户基本信息
    const userResult = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!userResult.data) {
      return { success: false, error: '用户不存在' };
    }
    
    const user = userResult.data;
    
    // 获取用户所有健康记录
    const recordsResult = await db.collection(COLLECTIONS.RECORDS)
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
  try {
    // 查找该手机号对应的所有用户记录
    const usersResult = await db.collection(COLLECTIONS.USERS)
      .where({ phone })
      .get();
    
    if (usersResult.data.length === 0) {
      return { success: true, users: [] };
    }
    
    // 获取每个用户的最新记录
    const users = await Promise.all(usersResult.data.map(async (user) => {
      const latestRecord = await getLatestRecordByUserId(user._id);
      return {
        ...user,
        latestRecord,
        isLatest: false // 后续标记
      };
    }));
    
    // 按创建时间排序，标记最新的
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (users.length > 0) {
      users[0].isLatest = true;
    }
    
    return { success: true, users };
  } catch (error) {
    console.error('获取用户历史记录失败:', error);
    return { success: false, error: error.message, users: [] };
  }
}

/**
 * 根据姓名获取用户历史记录
 * @param {string} name 姓名
 * @returns {Object} 历史记录列表
 */
async function getUserHistoryByName(name) {
  try {
    const usersResult = await db.collection(COLLECTIONS.USERS)
      .where({ name })
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
    
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (users.length > 0) {
      users[0].isLatest = true;
    }
    
    return { success: true, users };
  } catch (error) {
    console.error('获取用户历史记录失败:', error);
    return { success: false, error: error.message, users: [] };
  }
}

/**
 * 获取用户最新的健康记录
 * @param {string} userId 用户ID
 * @returns {Object} 最新记录
 */
async function getLatestRecordByUserId(userId) {
  try {
    const result = await db.collection(COLLECTIONS.RECORDS)
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
 * 获取单条健康记录详情
 * @param {string} recordId 记录ID
 * @returns {Object} 记录详情
 */
async function getRecordDetail(recordId) {
  try {
    const result = await db.collection(COLLECTIONS.RECORDS).doc(recordId).get();
    return { success: true, data: result.data };
  } catch (error) {
    console.error('获取记录详情失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除用户
 * @param {string} userId 用户ID
 * @returns {Object} 删除结果
 */
async function deleteUser(userId) {
  try {
    // 删除用户的所有记录
    const records = await db.collection(COLLECTIONS.RECORDS)
      .where({ userId })
      .get();
    
    for (const record of records.data) {
      await db.collection(COLLECTIONS.RECORDS).doc(record._id).remove();
    }
    
    // 删除用户
    await db.collection(COLLECTIONS.USERS).doc(userId).remove();
    
    return { success: true };
  } catch (error) {
    console.error('删除用户失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 管理员登录验证
 * @param {string} password 密码
 * @returns {Object} 验证结果
 */
async function adminLogin(password) {
  try {
    const result = await db.collection(COLLECTIONS.ADMIN)
      .where({ _id: 'admin_config' })
      .get();
    
    if (result.data.length === 0) {
      // 如果没有配置，初始化
      await initDatabase();
      return adminLogin(password);
    }
    
    const adminConfig = result.data[0];
    if (adminConfig.password === password) {
      return { success: true };
    } else {
      return { success: false, error: '密码错误' };
    }
  } catch (error) {
    console.error('管理员登录失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 修改管理员密码
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @returns {Object} 修改结果
 */
async function changeAdminPassword(oldPassword, newPassword) {
  try {
    const loginResult = await adminLogin(oldPassword);
    if (!loginResult.success) {
      return loginResult;
    }
    
    await db.collection(COLLECTIONS.ADMIN)
      .where({ _id: 'admin_config' })
      .update({
        data: { password: newPassword }
      });
    
    return { success: true };
  } catch (error) {
    console.error('修改密码失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取统计数据
 * @returns {Object} 统计数据
 */
async function getStatistics() {
  try {
    // 获取用户总数
    const usersCount = await db.collection(COLLECTIONS.USERS).count();
    
    // 获取记录总数
    const recordsCount = await db.collection(COLLECTIONS.RECORDS).count();
    
    // 获取今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await db.collection(COLLECTIONS.USERS)
      .where({
        createdAt: _.gte(today)
      })
      .count();
    
    // 获取今日检测数
    const todayRecords = await db.collection(COLLECTIONS.RECORDS)
      .where({
        createdAt: _.gte(today)
      })
      .count();
    
    return {
      success: true,
      data: {
        totalUsers: usersCount.total,
        totalRecords: recordsCount.total,
        todayUsers: todayUsers.total,
        todayRecords: todayRecords.total
      }
    };
  } catch (error) {
    console.error('获取统计数据失败:', error);
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
  getUserHistoryByName,
  getLatestRecordByUserId,
  getRecordDetail,
  deleteUser,
  adminLogin,
  changeAdminPassword,
  getStatistics,
  COLLECTIONS
};
