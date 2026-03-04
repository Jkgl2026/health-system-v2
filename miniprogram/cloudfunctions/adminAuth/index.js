const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 简单哈希函数（云函数环境限制，使用简单哈希）
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}

// 初始化默认管理员账号
async function initDefaultAdmin() {
  const result = await db.collection('admin_users').count()
  
  if (result.total === 0) {
    // 创建默认管理员
    await db.collection('admin_users').add({
      data: {
        _id: 'admin_001',
        username: 'admin',
        passwordHash: simpleHash('admin123'),
        nickname: '管理员',
        role: 'super_admin',
        createdAt: db.serverDate(),
        lastLoginAt: null,
        loginCount: 0
      }
    })
    console.log('已创建默认管理员账号')
    return true
  }
  return false
}

exports.main = async (event, context) => {
  const { username, password } = event
  
  // 参数校验
  if (!username || !password) {
    return {
      success: false,
      error: '请输入用户名和密码'
    }
  }
  
  try {
    // 初始化默认管理员（如果不存在）
    await initDefaultAdmin()
    
    // 查询管理员
    const result = await db.collection('admin_users')
      .where({
        username: username
      })
      .get()
    
    if (result.data.length === 0) {
      return {
        success: false,
        error: '用户名或密码错误'
      }
    }
    
    const admin = result.data[0]
    const passwordHash = simpleHash(password)
    
    if (admin.passwordHash !== passwordHash) {
      return {
        success: false,
        error: '用户名或密码错误'
      }
    }
    
    // 检查账号状态
    if (admin.status === 'disabled') {
      return {
        success: false,
        error: '账号已被禁用'
      }
    }
    
    // 更新登录信息
    await db.collection('admin_users').doc(admin._id).update({
      data: {
        lastLoginAt: db.serverDate(),
        loginCount: db.command.inc(1)
      }
    })
    
    return {
      success: true,
      adminInfo: {
        id: admin._id,
        username: admin.username,
        nickname: admin.nickname,
        role: admin.role
      }
    }
  } catch (error) {
    console.error('管理员登录失败:', error)
    return {
      success: false,
      error: '登录失败，请稍后重试'
    }
  }
}
