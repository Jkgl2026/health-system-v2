const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { password } = event
  
  try {
    const result = await db.collection('admin_config')
      .where({
        _id: 'admin_config'
      })
      .get()
    
    if (result.data.length === 0) {
      await db.collection('admin_config').add({
        data: {
          _id: 'admin_config',
          password: 'admin123',
          createdAt: db.serverDate()
        }
      })
      
      return {
        success: password === 'admin123',
        isFirstLogin: true
      }
    }
    
    const adminConfig = result.data[0]
    
    if (adminConfig.password === password) {
      return {
        success: true,
        isFirstLogin: false
      }
    } else {
      return {
        success: false,
        error: '密码错误'
      }
    }
  } catch (error) {
    console.error('管理员登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
