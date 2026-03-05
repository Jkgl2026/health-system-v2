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
      // 新增：数据分析相关
      case 'getSymptomStats':
        return await getSymptomStats(data)
      case 'getConstitutionStats':
        return await getConstitutionStats(data)
      case 'getPlanStats':
        return await getPlanStats(data)
      case 'getTrendData':
        return await getTrendData(data)
      case 'getAbnormalUsers':
        return await getAbnormalUsers(data)
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

// ==================== 数据分析功能 ====================

// 症状分类统计
async function getSymptomStats(data) {
  const { startDate, endDate, limit = 20 } = data || {}
  
  // 构建时间查询条件
  let timeQuery = {}
  if (startDate && endDate) {
    timeQuery.createdAt = _.and(_.gte(new Date(startDate)), _.lte(new Date(endDate)))
  }
  
  // 获取所有用户的最新记录中的症状数据
  const usersResult = await db.collection('health_users')
    .where({
      'latestRecord': _.exists(true),
      ...timeQuery
    })
    .field({
      'latestRecord.selectedSymptoms': true,
      'latestRecord.symptoms300': true,
      'latestRecord.badHabits': true
    })
    .limit(1000)
    .get()
  
  // 症状ID到名称的映射（简化版）
  const symptomNames = {
    // 100项症状
    1: '头疼', 2: '头晕', 3: '偏头痛', 4: '头麻', 5: '脑鸣',
    6: '失眠', 7: '多梦', 8: '健忘', 9: '嗜睡', 10: '易醒',
    11: '眼睛干涩', 12: '眼睛疲劳', 13: '视力模糊', 14: '眼睛发红', 15: '眼睛胀痛',
    21: '耳鸣', 22: '耳聋', 26: '鼻塞', 27: '流鼻涕',
    31: '口干', 32: '口苦', 33: '口臭', 34: '口腔溃疡',
    41: '咽喉干', 42: '咽喉痛', 43: '咽喉痒',
    46: '颈椎痛', 47: '颈部僵硬', 51: '肩痛', 56: '胸闷', 57: '胸痛',
    61: '胃痛', 62: '胃胀', 63: '腹胀', 65: '腹泻', 66: '便秘',
    71: '腰痛', 72: '腰酸', 76: '手脚冰凉', 77: '手脚麻木',
    86: '皮肤干燥', 87: '皮肤瘙痒', 91: '疲劳乏力', 92: '怕冷', 94: '自汗'
  }
  
  // 统计症状出现次数
  const symptomCounts = {}
  const categoryCounts = {
    '头部': 0, '眼部': 0, '耳部': 0, '鼻部': 0, '口腔': 0,
    '咽喉': 0, '颈部': 0, '肩部': 0, '胸部': 0, '腹部': 0,
    '腰部': 0, '四肢': 0, '皮肤': 0, '全身': 0
  }
  
  usersResult.data.forEach(user => {
    const symptoms = user.latestRecord?.selectedSymptoms || []
    symptoms.forEach(id => {
      const name = symptomNames[id] || `症状${id}`
      symptomCounts[name] = (symptomCounts[name] || 0) + 1
    })
  })
  
  // 排序取TOP N
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count, percentage: Math.round(count / usersResult.data.length * 100) }))
  
  return {
    success: true,
    data: {
      totalUsers: usersResult.data.length,
      topSymptoms: sortedSymptoms,
      categoryCounts
    }
  }
}

// 体质分布统计
async function getConstitutionStats(data) {
  const { startDate, endDate } = data || {}
  
  let timeQuery = {}
  if (startDate && endDate) {
    timeQuery.createdAt = _.and(_.gte(new Date(startDate)), _.lte(new Date(endDate)))
  }
  
  // 获取健康要素数据来推断体质
  const usersResult = await db.collection('health_users')
    .where({
      'latestRecord.healthElements': _.exists(true),
      ...timeQuery
    })
    .field({
      'latestRecord.healthElements': true,
      'latestRecord.healthScore': true,
      gender: true,
      age: true
    })
    .limit(1000)
    .get()
  
  // 根据健康要素分布推断体质
  const constitutionCounts = {
    '气虚质': 0, '阳虚质': 0, '阴虚质': 0, '痰湿质': 0,
    '湿热质': 0, '血瘀质': 0, '气郁质': 0, '特禀质': 0, '平和质': 0
  }
  
  const genderStats = { male: 0, female: 0, unknown: 0 }
  const ageGroups = { '18-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0 }
  
  usersResult.data.forEach(user => {
    // 统计性别
    if (user.gender === '男') genderStats.male++
    else if (user.gender === '女') genderStats.female++
    else genderStats.unknown++
    
    // 统计年龄段
    const age = user.age
    if (age >= 18 && age <= 30) ageGroups['18-30']++
    else if (age <= 40) ageGroups['31-40']++
    else if (age <= 50) ageGroups['41-50']++
    else if (age <= 60) ageGroups['51-60']++
    else if (age > 60) ageGroups['60+']++
    
    // 根据健康要素推断体质（简化版）
    const elements = user.latestRecord?.healthElements || []
    const score = user.latestRecord?.healthScore || 50
    
    // 找出得分最高的要素
    const topElement = elements.length > 0 ? elements[0].name : ''
    
    if (score >= 80) {
      constitutionCounts['平和质']++
    } else if (topElement === '气血') {
      constitutionCounts['气虚质']++
    } else if (topElement === '寒凉') {
      constitutionCounts['阳虚质']++
    } else if (topElement === '毒素') {
      constitutionCounts['湿热质']++
    } else if (topElement === '血脂') {
      constitutionCounts['痰湿质']++
    } else if (topElement === '情绪') {
      constitutionCounts['气郁质']++
    } else if (topElement === '循环') {
      constitutionCounts['血瘀质']++
    } else {
      constitutionCounts['气虚质']++
    }
  })
  
  return {
    success: true,
    data: {
      totalUsers: usersResult.data.length,
      constitutionCounts,
      genderStats,
      ageGroups
    }
  }
}

// 调理方案使用统计
async function getPlanStats(data) {
  const { startDate, endDate } = data || {}
  
  let timeQuery = {}
  if (startDate && endDate) {
    timeQuery.createdAt = _.and(_.gte(new Date(startDate)), _.lte(new Date(endDate)))
  }
  
  const recordsResult = await db.collection('health_records')
    .where(timeQuery)
    .field({
      selectedChoice: true,
      userId: true
    })
    .limit(1000)
    .get()
  
  // 统计方案选择
  const choiceStats = {
    choice1: { count: 0, label: '不花钱的方法' },
    choice2: { count: 0, label: '带产品免费服务' },
    choice3: { count: 0, label: '使用产品和服务' },
    none: { count: 0, label: '未选择' }
  }
  
  const userChoices = {}
  
  recordsResult.data.forEach(record => {
    const choice = record.selectedChoice
    if (choice === 'choice1') choiceStats.choice1.count++
    else if (choice === 'choice2') choiceStats.choice2.count++
    else if (choice === 'choice3') choiceStats.choice3.count++
    else choiceStats.none.count++
    
    // 统计用户数
    if (record.userId) {
      userChoices[record.userId] = choice || 'none'
    }
  })
  
  return {
    success: true,
    data: {
      totalRecords: recordsResult.data.length,
      uniqueUsers: Object.keys(userChoices).length,
      choiceStats,
      choiceDetails: Object.values(choiceStats).map(c => ({
        label: c.label,
        count: c.count,
        percentage: Math.round(c.count / recordsResult.data.length * 100) || 0
      }))
    }
  }
}

// 时间趋势分析
async function getTrendData(data) {
  const { type = 'daily', days = 30 } = data || {}
  
  const now = new Date()
  const result = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    
    // 统计当日新增用户
    const newUsers = await db.collection('health_users')
      .where({
        createdAt: _.and(_.gte(date), _.lt(nextDate))
      })
      .count()
    
    // 统计当日检测记录
    const newRecords = await db.collection('health_records')
      .where({
        createdAt: _.and(_.gte(date), _.lt(nextDate))
      })
      .count()
    
    result.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      fullDate: date.toISOString().split('T')[0],
      newUsers: newUsers.total,
      newRecords: newRecords.total
    })
  }
  
  return {
    success: true,
    data: {
      type,
      days,
      trend: result
    }
  }
}

// 异常用户筛选
async function getAbnormalUsers(data) {
  const { 
    page = 1, 
    limit = 20, 
    scoreThreshold = 60,
    elementThreshold = {}
  } = data || {}
  
  const skip = (page - 1) * limit
  
  // 构建查询条件
  let query = db.collection('health_users')
    .where({
      'latestRecord.healthScore': _.lt(scoreThreshold)
    })
  
  // 获取总数
  const countResult = await query.count()
  const total = countResult.total
  
  // 获取数据
  const listResult = await query
    .orderBy('lastRecordTime', 'desc')
    .skip(skip)
    .limit(limit)
    .field({
      _id: true,
      name: true,
      phone: true,
      gender: true,
      age: true,
      lastRecordTime: true,
      'latestRecord.healthScore': true,
      'latestRecord.healthElements': true,
      'latestRecord.summary': true
    })
    .get()
  
  // 处理数据
  const users = listResult.data.map(user => ({
    id: user._id,
    name: user.name || '未知',
    phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '--',
    gender: user.gender || '--',
    age: user.age || '--',
    healthScore: user.latestRecord?.healthScore || 0,
    elements: user.latestRecord?.healthElements || [],
    symptomCount: user.latestRecord?.summary?.symptomCount || 0,
    lastRecordTime: user.lastRecordTime
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
