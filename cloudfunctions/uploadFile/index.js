// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  
  try {
    switch (action) {
      case 'getTempFileURL':
        return await getTempFileURL(data)
      case 'deleteFile':
        return await deleteFile(data)
      case 'getFileInfo':
        return await getFileInfo(data)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (error) {
    console.error('文件操作失败:', error)
    return { success: false, error: error.message }
  }
}

// 获取临时访问链接
async function getTempFileURL(data) {
  const { fileIDs } = data
  
  const result = await cloud.getTempFileURL({
    fileList: fileIDs
  })
  
  return {
    success: true,
    fileList: result.fileList
  }
}

// 删除文件
async function deleteFile(data) {
  const { fileIDs } = data
  
  const result = await cloud.deleteFile({
    fileList: fileIDs
  })
  
  return {
    success: true,
    fileList: result.fileList
  }
}

// 获取文件信息
async function getFileInfo(data) {
  const { fileIDs } = data
  
  const result = await cloud.getTempFileURL({
    fileList: fileIDs
  })
  
  return {
    success: true,
    fileList: result.fileList
  }
}
