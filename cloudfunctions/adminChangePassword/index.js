// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { oldPassword, newPassword } = event
  
  try {
    // 查询管理员配置
    const result = await db.collection('admin_config')
      .where({
        _id: 'admin_config'
      })
      .get()
    
    if (result.data.length === 0) {
      return {
        success: false,
        error: '配置不存在'
      }
    }
    
    const adminConfig = result.data[0]
    
    // 验证旧密码
    if (adminConfig.password !== oldPassword) {
      return {
        success: false,
        error: '原密码错误'
      }
    }
    
    // 更新密码
    await db.collection('admin_config')
      .where({
        _id: 'admin_config'
      })
      .update({
        data: {
          password: newPassword,
          updatedAt: db.serverDate()
        }
      })
    
    return {
      success: true,
      message: '密码修改成功'
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
