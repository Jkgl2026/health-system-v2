// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 计算健康评分
function calculateHealthScore(bodySymptoms, badHabits, symptoms300) {
  const bodyScore = Math.max(0, 100 - (bodySymptoms.length / 100 * 100))
  const habitScore = Math.max(0, 100 - (badHabits.length / 252 * 100))
  const symptomScore = Math.max(0, 100 - (symptoms300.length / 300 * 100))
  const healthScore = Math.round(bodyScore * 0.3 + habitScore * 0.2 + symptomScore * 0.1 + 40)
  return Math.min(100, Math.max(0, healthScore))
}

// 计算健康要素
function calculateHealthElements(selectedSymptoms) {
  const elements = [
    { name: '气血', symptoms: [1,2,3,4,5,6,7,8,9,14,16,17,18,19,23,24,25,26,34,41,35,43,44,45,48,50,51,52,53,54,55,56,74,75,85,68,90,87,91,92,94,93] },
    { name: '循环', symptoms: [46,47,48,49,55,56,57,59,60,61,62,63,71,72,73,75,76,77,78,79,80] },
    { name: '毒素', symptoms: [41,42,43,44,45,46,47,68,69,70,97] },
    { name: '血脂', symptoms: [71,72,73,74,75] },
    { name: '寒凉', symptoms: [55,63] },
    { name: '免疫', symptoms: [34,94,98] },
    { name: '情绪', symptoms: [85] }
  ]

  return elements.map(el => {
    const count = el.symptoms.filter(id => selectedSymptoms.includes(id)).length
    return { name: el.name, count }
  }).filter(el => el.count > 0).sort((a, b) => b.count - a.count)
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { 
    userInfo,
    selectedSymptoms = [],
    badHabits = [],
    symptoms300 = [],
    sevenQuestions = {},
    targetSymptoms = [],
    selectedChoice = ''
  } = event
  
  try {
    // 数据校验
    if (!userInfo || !userInfo.phone) {
      return {
        success: false,
        error: '缺少用户信息'
      }
    }
    
    // 计算健康评分
    const healthScore = calculateHealthScore(selectedSymptoms, badHabits, symptoms300)
    
    // 计算健康要素
    const healthElements = calculateHealthElements(selectedSymptoms)
    
    // 查找或创建用户
    let userId
    const existingUser = await db.collection('health_users')
      .where({ phone: userInfo.phone })
      .get()
    
    if (existingUser.data.length > 0) {
      // 更新用户信息
      userId = existingUser.data[0]._id
      await db.collection('health_users').doc(userId).update({
        data: {
          ...userInfo,
          lastRecordTime: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
    } else {
      // 创建新用户
      const userResult = await db.collection('health_users').add({
        data: {
          ...userInfo,
          createdAt: db.serverDate(),
          lastRecordTime: db.serverDate(),
          updatedAt: db.serverDate()
        }
      })
      userId = userResult._id
    }
    
    // 格式化日期
    const now = new Date()
    const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // 保存健康记录
    const recordResult = await db.collection('health_records').add({
      data: {
        userId,
        openid: wxContext.OPENID,
        phone: userInfo.phone,
        name: userInfo.name,
        
        // 症状数据
        selectedSymptoms,
        badHabits,
        symptoms300,
        sevenQuestions,
        targetSymptoms,
        selectedChoice,
        
        // 计算结果
        healthScore,
        healthElements,
        
        // 统计摘要
        summary: {
          symptomCount: selectedSymptoms.length,
          badHabitCount: badHabits.length,
          symptoms300Count: symptoms300.length,
          targetCount: targetSymptoms.length,
          score: healthScore
        },
        
        // 时间
        timestamp: Date.now(),
        dateStr,
        createdAt: db.serverDate()
      }
    })
    
    // ========== 方案A: 同步数据到 adminUsers 集合供后台读取 ==========
    // 后台管理页面直接从 adminUsers 读取完整数据
    const adminUserData = {
      // 用户基本信息
      phone: userInfo.phone,
      name: userInfo.name,
      gender: userInfo.gender,
      age: userInfo.age,
      
      // 完整自检数据
      selectedSymptoms,
      badHabits,
      symptoms300,
      sevenQuestions,
      targetSymptoms,
      selectedChoice,
      
      // 计算结果
      healthScore,
      healthElements,
      
      // 统计摘要
      summary: {
        symptomCount: selectedSymptoms.length,
        badHabitCount: badHabits.length,
        symptoms300Count: symptoms300.length,
        targetCount: targetSymptoms.length,
        score: healthScore
      },
      
      // 关联信息
      userId,
      latestRecordId: recordResult._id,
      
      // 时间戳
      lastRecordTime: db.serverDate(),
      dateStr,
      updatedAt: db.serverDate()
    }
    
    // 检查 adminUsers 中是否已存在该用户
    const existingAdminUser = await db.collection('adminUsers')
      .where({ phone: userInfo.phone })
      .get()
    
    if (existingAdminUser.data.length > 0) {
      // 更新现有记录
      await db.collection('adminUsers').doc(existingAdminUser.data[0]._id).update({
        data: adminUserData
      })
    } else {
      // 创建新记录
      await db.collection('adminUsers').add({
        data: {
          ...adminUserData,
          createdAt: db.serverDate()
        }
      })
    }
    // ========== 同步结束 ==========
    
    return {
      success: true,
      recordId: recordResult._id,
      userId,
      healthScore
    }
  } catch (error) {
    console.error('保存健康记录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
