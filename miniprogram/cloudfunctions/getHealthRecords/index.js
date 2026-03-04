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
      case 'getDashboardStats':
        return await getDashboardStats()
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

// 获取用户列表（后台管理用）- 优化版，不再有 N+1 查询
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
  
  // 获取数据 - 用户表中已存储 latestRecord，无需额外查询
  const listResult = await query
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(limit)
    .field({
      _id: true,
      name: true,
      phone: true,
      gender: true,
      age: true,
      createdAt: true,
      lastRecordTime: true,
      latestRecord: true
    })
    .get()
  
  return {
    success: true,
    data: listResult.data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total
    }
  }
}

// 获取仪表盘统计数据 - 使用聚合查询优化
async function getDashboardStats() {
  // 1. 基础统计
  const usersCount = await db.collection('health_users').count()
  const recordsCount = await db.collection('health_records').count()
  
  // 2. 今日数据
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayUsers = await db.collection('health_users')
    .where({ createdAt: _.gte(today) })
    .count()
  
  const todayRecords = await db.collection('health_records')
    .where({ createdAt: _.gte(today) })
    .count()
  
  // 3. 健康评分统计 - 使用聚合查询
  const scoreStats = await db.collection('health_users')
    .where({
      'latestRecord.healthScore': _.exists(true)
    })
    .field({
      'latestRecord.healthScore': true
    })
    .get()
  
  let totalScore = 0
  let scoreCount = 0
  let warningUsers = 0
  
  scoreStats.data.forEach(user => {
    const score = user.latestRecord?.healthScore
    if (score !== undefined && score !== null) {
      totalScore += score
      scoreCount++
      if (score < 60) {
        warningUsers++
      }
    }
  })
  
  const avgHealthScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
  
  // 4. 健康要素统计
  const elementStats = await db.collection('health_users')
    .where({
      'latestRecord.healthElements': _.exists(true)
    })
    .field({
      'latestRecord.healthElements': true
    })
    .get()
  
  const elementTotals = {}
  const elementCounts = {}
  
  elementStats.data.forEach(user => {
    const elements = user.latestRecord?.healthElements || []
    elements.forEach(el => {
      if (!elementTotals[el.name]) {
        elementTotals[el.name] = 0
        elementCounts[el.name] = 0
      }
      elementTotals[el.name] += el.count || 0
      elementCounts[el.name]++
    })
  })
  
  const healthElements = [
    { name: '气血', key: 'qiAndBlood', icon: '🔴', colorClass: 'fill-red' },
    { name: '循环', key: 'circulation', icon: '🔵', colorClass: 'fill-blue' },
    { name: '毒素', key: 'toxins', icon: '🟡', colorClass: 'fill-yellow' },
    { name: '血脂', key: 'bloodLipids', icon: '🟠', colorClass: 'fill-orange' },
    { name: '寒凉', key: 'coldness', icon: '🧊', colorClass: 'fill-cyan' },
    { name: '免疫', key: 'immunity', icon: '🛡️', colorClass: 'fill-green' },
    { name: '情绪', key: 'emotions', icon: '💜', colorClass: 'fill-purple' }
  ].map(el => ({
    ...el,
    value: elementCounts[el.name] > 0 
      ? Math.round(elementTotals[el.name] / elementCounts[el.name]) 
      : 0
  }))
  
  return {
    success: true,
    data: {
      totalUsers: usersCount.total,
      totalRecords: recordsCount.total,
      todayUsers: todayUsers.total,
      todayRecords: todayRecords.total,
      avgHealthScore,
      warningUsers,
      healthElements
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
  
  // 用户表中已有 latestRecord，无需额外查询
  const users = usersResult.data.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
  
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

// 获取统计数据（简化版）
async function getStatistics() {
  const usersCount = await db.collection('health_users').count()
  const recordsCount = await db.collection('health_records').count()
  
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
