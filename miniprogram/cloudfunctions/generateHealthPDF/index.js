// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { recordId, userId } = event
  
  try {
    // 获取记录数据
    let record
    if (recordId) {
      const result = await db.collection('health_records').doc(recordId).get()
      record = result.data
    } else if (userId) {
      // 获取用户最新记录
      const result = await db.collection('health_records')
        .where({ userId })
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get()
      record = result.data[0]
    } else {
      return { success: false, error: '缺少记录ID或用户ID' }
    }
    
    if (!record) {
      return { success: false, error: '记录不存在' }
    }
    
    // 生成PDF内容（HTML格式）
    const htmlContent = generatePDFHTML(record)
    
    // 上传到云存储
    const fileName = `reports/${record.userId}_${Date.now()}.html`
    const uploadResult = await cloud.uploadFile({
      cloudPath: fileName,
      fileContent: Buffer.from(htmlContent, 'utf-8')
    })
    
    // 获取临时访问链接
    const urlResult = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    })
    
    return {
      success: true,
      fileID: uploadResult.fileID,
      tempFileURL: urlResult.fileList[0].tempFileURL,
      fileName
    }
  } catch (error) {
    console.error('生成PDF失败:', error)
    return { success: false, error: error.message }
  }
}

// 生成PDF HTML内容
function generatePDFHTML(record) {
  const healthLevel = record.healthScore >= 80 ? '优秀' : 
                      record.healthScore >= 60 ? '良好' : 
                      record.healthScore >= 40 ? '一般' : '较差'
  
  const healthColor = record.healthScore >= 80 ? '#22c55e' : 
                      record.healthScore >= 60 ? '#eab308' : 
                      record.healthScore >= 40 ? '#f97316' : '#ef4444'
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>健康自检报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .content { padding: 40px; }
    .score-section { text-align: center; margin-bottom: 40px; }
    .score-circle { width: 180px; height: 180px; border-radius: 50%; border: 10px solid ${healthColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .score-value { font-size: 56px; font-weight: 700; color: ${healthColor}; }
    .score-level { font-size: 18px; color: ${healthColor}; font-weight: 600; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .info-item { padding: 16px; background: #f8fafc; border-radius: 12px; }
    .info-label { font-size: 14px; color: #64748b; margin-bottom: 4px; }
    .info-value { font-size: 18px; font-weight: 600; color: #1e293b; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { padding: 8px 16px; background: #eff6ff; color: #3b82f6; border-radius: 20px; font-size: 14px; }
    .element-bar { display: flex; align-items: center; margin-bottom: 12px; }
    .element-name { width: 80px; font-size: 14px; color: #475569; }
    .element-progress { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; margin: 0 12px; overflow: hidden; }
    .element-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); border-radius: 4px; }
    .element-count { width: 40px; text-align: right; font-size: 14px; color: #64748b; }
    .footer { text-align: center; padding: 30px; background: #f8fafc; color: #64748b; font-size: 14px; }
    .print-btn { display: none; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>健康自检报告</h1>
      <p>生成时间：${record.dateStr}</p>
    </div>
    
    <div class="content">
      <div class="score-section">
        <div class="score-circle">
          <span class="score-value">${record.healthScore}</span>
          <span class="score-level">${healthLevel}</span>
        </div>
        <p style="color: #64748b; font-size: 16px;">综合健康评分</p>
      </div>
      
      <div class="section">
        <h2 class="section-title">基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">姓名</div>
            <div class="info-value">${record.name || '未填写'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">${record.phone || '未填写'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">症状数量</div>
            <div class="info-value">${record.summary?.symptomCount || 0} 个</div>
          </div>
          <div class="info-item">
            <div class="info-label">不良习惯</div>
            <div class="info-value">${record.summary?.badHabitCount || 0} 个</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">健康要素分析</h2>
        ${(record.healthElements || []).map(el => `
          <div class="element-bar">
            <span class="element-name">${el.name}</span>
            <div class="element-progress">
              <div class="element-fill" style="width: ${Math.min(el.count * 10, 100)}%"></div>
            </div>
            <span class="element-count">${el.count}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <h2 class="section-title">调理方案</h2>
        <div class="info-item">
          <div class="info-label">选择方案</div>
          <div class="info-value">
            ${record.selectedChoice === 'choice1' ? '自我调理' : 
              record.selectedChoice === 'choice2' ? '产品调理' : 
              record.selectedChoice === 'choice3' ? '系统调理' : '未选择'}
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">检测摘要</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身体症状</div>
            <div class="info-value">${record.selectedSymptoms?.length || 0} 个</div>
          </div>
          <div class="info-item">
            <div class="info-label">300症状</div>
            <div class="info-value">${record.symptoms300?.length || 0} 个</div>
          </div>
          <div class="info-item">
            <div class="info-label">重点症状</div>
            <div class="info-value">${record.targetSymptoms?.length || 0} 个</div>
          </div>
          <div class="info-item">
            <div class="info-label">不良习惯</div>
            <div class="info-value">${record.badHabits?.length || 0} 个</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>本报告由健康自检系统自动生成，仅供参考</p>
      <p>如有疑问，请咨询专业医生</p>
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
  `
}
