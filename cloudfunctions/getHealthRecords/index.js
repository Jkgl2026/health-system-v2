// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { action, data } = event
  
  try {
    switch (action) {
      case 'getUserList':
        return await getUserList(data)
      case 'getUserDetail':
        return await getUserDetail(data)
      case 'getUserHistory':
        return await getUserHistory(data)
      case 'getRecordDetail':
        return await getRecordDetail(data)
      case 'getStatistics':
        return await getStatistics()
      case 'deleteUser':
        return await deleteUser(data)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (error) {
    console.error('获取健康记录失败:', error)
    return { success: false, error: error.message }
  }
}

// 获取用户列表（后台管理用）
async function getUserList(data) {
  const { page = 1, limit = 20, search = '' } = data
  const skip = (page - 1) * limit
  
  let query = db.collection('health_users')
  
  // 搜索条件
  if (search) {
    query = query.where(_.or([
      { name: db.RegExp({ regexp: search, options: 'i' }) },
      { phone: db.RegExp({ regexp: search, options: 'i' }) }
    ]))
  }
  
  // 获取总数
  const countResult = await query.count()
  const total = countResult.total
  
  // 获取数据
  const listResult = await query
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(limit)
    .get()
  
  // 为每个用户获取最新记录
  const users = await Promise.all(listResult.data.map(async (user) => {
    const latestRecord = await getLatestRecordByUserId(user._id)
    return {
      ...user,
      latestRecord
    }
  }))
  
  return {
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total
    }
  }
}

// 获取用户详情
async function getUserDetail(data) {
  const { userId } = data
  
  // 获取用户基本信息
  const userResult = await db.collection('health_users').doc(userId).get()
  if (!userResult.data) {
    return { success: false, error: '用户不存在' }
  }
  
  const user = userResult.data
  
  // 获取用户所有健康记录
  const recordsResult = await db.collection('health_records')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .get()
  
  return {
    success: true,
    data: {
      user,
      records: recordsResult.data
    }
  }
}

// 获取用户历史记录（用于数据对比）
async function getUserHistory(data) {
  const { phone, name } = data
  let query = {}
  
  if (phone) {
    query.phone = phone
  } else if (name) {
    query.name = name
  } else {
    return { success: false, error: '缺少查询条件' }
  }
  
  const usersResult = await db.collection('health_users')
    .where(query)
    .get()
  
  if (usersResult.data.length === 0) {
    return { success: true, users: [] }
  }
  
  const users = await Promise.all(usersResult.data.map(async (user) => {
    const latestRecord = await getLatestRecordByUserId(user._id)
    return {
      ...user,
      latestRecord
    }
  }))
  
  // 按创建时间排序
  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (users.length > 0) {
    users[0].isLatest = true
  }
  
  return { success: true, users }
}

// 获取单条记录详情
async function getRecordDetail(data) {
  const { recordId } = data
  
  const result = await db.collection('health_records').doc(recordId).get()
  return { success: true, data: result.data }
}

// 获取统计数据
async function getStatistics() {
  // 获取用户总数
  const usersCount = await db.collection('health_users').count()
  
  // 获取记录总数
  const recordsCount = await db.collection('health_records').count()
  
  // 获取今日新增
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayUsers = await db.collection('health_users')
    .where({ createdAt: _.gte(today) })
    .count()
  
  const todayRecords = await db.collection('health_records')
    .where({ createdAt: _.gte(today) })
    .count()
  
  return {
    success: true,
    data: {
      totalUsers: usersCount.total,
      totalRecords: recordsCount.total,
      todayUsers: todayUsers.total,
      todayRecords: todayRecords.total
    }
  }
}

// 删除用户
async function deleteUser(data) {
  const { userId } = data
  
  // 删除用户的所有记录
  const records = await db.collection('health_records')
    .where({ userId })
    .get()
  
  for (const record of records.data) {
    await db.collection('health_records').doc(record._id).remove()
  }
  
  // 删除用户
  await db.collection('health_users').doc(userId).remove()
  
  return { success: true }
}

// 获取用户最新的健康记录
async function getLatestRecordByUserId(userId) {
  const result = await db.collection('health_records')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()
  
  return result.data.length > 0 ? result.data[0] : null
}
