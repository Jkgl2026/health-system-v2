/**
 * AI体态评估报告生成器 - 专业医疗版 v4.4
 * 使用 html2canvas + jsPDF 生成支持中文的PDF报告
 * 直接渲染DOM元素，避免iframe问题
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ==================== 类型定义 ====================

export interface ReportData {
  userName?: string;
  userGender?: string;
  userAge?: string;
  userPhone?: string;
  assessmentDate: string;
  reportId?: string;
  
  overallScore: number;
  grade: string;
  issues: {
    type: string;
    name: string;
    severity: string;
    angle: number;
    description?: string;
    cause?: string;
    impact?: string;
    recommendation?: string;
    referenceRange?: string;
  }[];
  angles: Record<string, number>;
  
  muscles?: { tight: string[]; weak: string[] };
  
  risks?: { 
    category: string; 
    risk: string; 
    condition: string; 
    cause?: string; 
    prevention?: string;
    icdCode?: string;
  }[];
  
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    exercises?: { 
      name: string; 
      category: string; 
      purpose: string; 
      method: string;
      frequency?: string;
      duration?: string;
    }[];
  };
  
  tcmAnalysis?: {
    constitution: string;
    constitutionType?: string;
    constitutionFeatures?: string[];
    meridians?: { name: string; status: string; reason: string }[];
    acupoints?: { name: string; location: string; benefit: string }[];
    dietSuggestions?: string[];
    daoyinSuggestions?: string[];
  };
  
  trainingPlan?: { 
    phases: { 
      name: string; 
      duration: string; 
      focus: string; 
      exercises: string[] 
    }[] 
  };
  
  images?: { front?: string; left?: string; right?: string; back?: string };
  
  detailedAnalysis?: {
    head?: { status: string; angle?: string; description?: string; impact?: string };
    shoulders?: { status: string; leftRightDiff?: string; description?: string; impact?: string };
    spine?: { status: string; alignmentScore?: string; description?: string; impact?: string };
    pelvis?: { status: string; tiltAngle?: string; description?: string; impact?: string };
    knees?: { status: string; angle?: string; description?: string; impact?: string };
    ankles?: { status: string; description?: string; impact?: string };
  };
  
  healthPrediction?: {
    shortTerm?: string;
    midTerm?: string;
    longTerm?: string;
    preventiveMeasures?: string[];
  };
  
  fasciaChainAnalysis?: {
    frontLine?: { status: string; tension?: string; impact?: string };
    backLine?: { status: string; tension?: string; impact?: string };
    lateralLine?: { status: string; tension?: string; impact?: string };
    spiralLine?: { status: string; tension?: string; impact?: string };
  };
  
  breathingAssessment?: {
    pattern?: string;
    diaphragm?: string;
    ribcageMobility?: string;
    impact?: string;
  };
}

// ==================== 辅助函数 ====================

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日`;
}

function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getSeverityText(severity: string): string {
  const map: Record<string, string> = { severe: '重度', moderate: '中度', mild: '轻度' };
  return map[severity] || '正常';
}

function getRiskText(risk: string): string {
  const map: Record<string, string> = { high: '高风险', medium: '中风险', low: '低风险' };
  return map[risk] || '未知';
}

function getGradeText(grade: string): string {
  const map: Record<string, string> = { A: '优秀', B: '良好', C: '一般', D: '较差', E: '需改善' };
  return map[grade] || '未知';
}

// ==================== 样式定义 ====================

const STYLES = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    .report-page {
      width: 794px;
      min-height: 1123px;
      padding: 40px;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      position: relative;
    }
    
    .cover-header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 40px;
      margin: -40px -40px 30px -40px;
    }
    .cover-title { font-size: 32px; font-weight: bold; margin-bottom: 8px; }
    .cover-subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 15px; }
    .cover-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; font-size: 14px; }
    
    .barcode-box { border: 1px solid #e5e7eb; padding: 15px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .barcode-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .barcode-value { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; }
    
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th, .info-table td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; font-size: 13px; }
    .info-table th { background: #1e40af; color: white; font-weight: 600; }
    .info-table .label-cell { background: #f9fafb; font-weight: 600; width: 100px; }
    .info-table .striped-row { background: #f9fafb; }
    
    .summary-cards { display: flex; gap: 15px; margin-bottom: 20px; }
    .summary-card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
    .summary-card .label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
    .summary-card .value { font-size: 24px; font-weight: bold; }
    .score-excellent { color: #16a34a; }
    .score-good { color: #d97706; }
    .score-poor { color: #dc2626; }
    
    .method-box { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 20px; }
    .method-title { font-size: 13px; font-weight: 600; color: #6b7280; margin-bottom: 8px; }
    .method-text { font-size: 12px; color: #374151; line-height: 1.6; }
    
    .section-title { background: #1e40af; color: white; padding: 10px 15px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
    
    .page-header { background: #1e40af; color: white; padding: 8px 15px; margin: -40px -40px 20px -40px; display: flex; justify-content: space-between; font-size: 11px; }
    
    .page-footer { position: absolute; bottom: 20px; left: 40px; right: 40px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    
    .toc-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e5e7eb; font-size: 13px; }
    .toc-title { color: #1e40af; font-weight: 500; }
    .toc-page { color: #6b7280; }
    
    .body-text { font-size: 13px; line-height: 1.8; color: #374151; margin-bottom: 15px; }
    
    .issue-card { border: 1px solid #e5e7eb; padding: 12px 15px; margin-bottom: 10px; display: flex; align-items: flex-start; }
    .issue-card.severe { border-left: 4px solid #dc2626; }
    .issue-card.moderate { border-left: 4px solid #d97706; }
    .issue-card.mild { border-left: 4px solid #16a34a; }
    .issue-number { background: #dbeafe; color: #1e40af; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
    .issue-content { flex: 1; }
    .issue-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .issue-meta { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .issue-desc { font-size: 11px; color: #4b5563; }
    .severity-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 10px; }
    .severity-severe { background: #fee2e2; color: #dc2626; }
    .severity-moderate { background: #fef3c7; color: #d97706; }
    .severity-mild { background: #dcfce7; color: #16a34a; }
    
    .rec-block { margin-bottom: 15px; }
    .rec-header { padding: 6px 10px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    .rec-header-danger { background: #fee2e2; color: #dc2626; }
    .rec-header-warning { background: #fef3c7; color: #d97706; }
    .rec-header-primary { background: #dbeafe; color: #1e40af; }
    .rec-list { padding-left: 20px; font-size: 12px; line-height: 1.8; }
    
    .signature-box { border: 1px solid #e5e7eb; display: flex; margin-bottom: 20px; }
    .signature-item { flex: 1; padding: 20px; text-align: center; border-right: 1px solid #e5e7eb; }
    .signature-item:last-child { border-right: none; }
    .signature-label { font-size: 11px; color: #6b7280; margin-bottom: 8px; }
    .signature-value { font-size: 13px; margin-bottom: 5px; }
    .signature-date { font-size: 10px; color: #9ca3af; }
    
    .disclaimer { background: #fef3c7; padding: 12px 15px; margin-bottom: 15px; }
    .disclaimer-title { font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 5px; }
    .disclaimer-text { font-size: 11px; color: #78350f; line-height: 1.6; }
    
    .constitution-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .constitution-label { font-size: 12px; color: #92400e; font-weight: 600; margin-bottom: 5px; }
    .constitution-value { font-size: 18px; color: #78350f; font-weight: bold; }
    
    .muscle-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .muscle-table th, .muscle-table td { border: 1px solid #e5e7eb; padding: 10px; text-align: center; }
    .muscle-table th.tight { background: #dc2626; color: white; }
    .muscle-table th.weak { background: #1e40af; color: white; }
    
    .risk-high { color: #dc2626; font-weight: bold; }
    .risk-medium { color: #d97706; }
    .risk-low { color: #16a34a; }
  </style>
`;

// ==================== 页面生成函数 ====================

function generateCoverPage(data: ReportData, reportId: string): string {
  return `
    <div class="report-page">
      <div class="cover-header">
        <div class="cover-title">AI 体态评估系统</div>
        <div class="cover-subtitle">专业体态分析与健康评估报告</div>
        <div class="cover-badge">体态评估报告</div>
      </div>
      
      <div class="barcode-box">
        <div>
          <div class="barcode-label">报告编号</div>
          <div class="barcode-value">${reportId}</div>
        </div>
        <div style="text-align: right;">
          <div class="barcode-label">生成时间</div>
          <div style="font-size: 13px;">${formatDateTime(new Date())}</div>
        </div>
      </div>
      
      <table class="info-table">
        <tr><th colspan="4">受检者信息</th></tr>
        <tr>
          <td class="label-cell">姓　　名</td>
          <td>${data.userName || '未填写'}</td>
          <td class="label-cell">性　　别</td>
          <td>${data.userGender || '未填写'}</td>
        </tr>
        <tr class="striped-row">
          <td class="label-cell">年　　龄</td>
          <td>${data.userAge || '未填写'}</td>
          <td class="label-cell">联系电话</td>
          <td>${data.userPhone || '未填写'}</td>
        </tr>
        <tr>
          <td class="label-cell">评估日期</td>
          <td>${formatDate(data.assessmentDate)}</td>
          <td class="label-cell">报告编号</td>
          <td>${reportId}</td>
        </tr>
      </table>
      
      <table class="info-table" style="margin-bottom: 0;">
        <tr><th colspan="3">评估结果摘要</th></tr>
      </table>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="label">综合评分</div>
          <div class="value ${data.overallScore >= 80 ? 'score-excellent' : data.overallScore >= 60 ? 'score-good' : 'score-poor'}">${data.overallScore}分</div>
        </div>
        <div class="summary-card">
          <div class="label">评估等级</div>
          <div class="value">${data.grade}级 (${getGradeText(data.grade)})</div>
        </div>
        <div class="summary-card">
          <div class="label">异常项目</div>
          <div class="value">${data.issues.length}项</div>
        </div>
      </div>
      
      <div class="method-box">
        <div class="method-title">检测方法</div>
        <div class="method-text">本报告采用 MediaPipe 视觉分析技术，对人体骨骼关键点进行精准定位，结合 AI 深度学习算法进行体态评估。评估依据：《人体姿态评估规范》（T/CNAS 001-2023）、《运动医学体态分析指南》等标准。</div>
      </div>
      
      <div style="position: absolute; bottom: 40px; left: 40px; right: 40px; text-align: center; font-size: 11px; color: #9ca3af;">
        本报告由 AI 系统自动生成，仅供参考，不作为临床诊断依据。
      </div>
    </div>
  `;
}

function generateTocPage(): string {
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 2 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">目　录</div>
      
      <div class="toc-item"><span class="toc-title">一、评估摘要</span><span class="toc-page">3</span></div>
      <div class="toc-item"><span class="toc-title">二、体态问题详细分析</span><span class="toc-page">4</span></div>
      <div class="toc-item"><span class="toc-title">三、肌肉功能评估</span><span class="toc-page">5</span></div>
      <div class="toc-item"><span class="toc-title">四、健康风险评估</span><span class="toc-page">5</span></div>
      <div class="toc-item"><span class="toc-title">五、健康发展预测</span><span class="toc-page">6</span></div>
      <div class="toc-item"><span class="toc-title">六、改善方案与建议</span><span class="toc-page">6</span></div>
      <div class="toc-item"><span class="toc-title">七、中医体质分析</span><span class="toc-page">7</span></div>
      <div class="toc-item"><span class="toc-title">八、附录与参考标准</span><span class="toc-page">8</span></div>
      
      <div class="method-box" style="margin-top: 30px;">
        <div class="method-title">报告说明</div>
        <div class="method-text">
          1. 本报告基于 AI 视觉分析技术，对受检者体态进行综合评估，评估结果仅供参考。<br>
          2. 评估等级说明：A级(≥90分)优秀、B级(80-89分)良好、C级(60-79分)一般、D级(40-59分)较差、E级(<40分)需改善。<br>
          3. 状态标识说明：↑↑表示重度异常、↑表示中度异常、−表示轻度异常、正常表示在参考范围内。<br>
          4. 本报告不作为医疗诊断依据，如有身体不适请及时就医。<br>
          5. 建议每 4 周进行一次复查，跟踪体态改善情况。
        </div>
      </div>
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generateSummaryPage(data: ReportData): string {
  const severeCount = data.issues.filter(i => i.severity === 'severe').length;
  const moderateCount = data.issues.filter(i => i.severity === 'moderate').length;
  const mildCount = data.issues.filter(i => i.severity === 'mild').length;
  
  const issuesHtml = data.issues.length > 0 
    ? data.issues.map((issue, i) => `
        <tr class="${i % 2 === 1 ? 'striped-row' : ''}">
          <td style="text-align: center;">${i + 1}</td>
          <td>${issue.name}</td>
          <td style="text-align: center;">${issue.angle.toFixed(1)}°</td>
          <td style="text-align: center;">${issue.referenceRange || '正常范围'}</td>
          <td style="text-align: center; font-weight: ${issue.severity === 'severe' ? 'bold' : 'normal'}; color: ${issue.severity === 'severe' ? '#dc2626' : issue.severity === 'moderate' ? '#d97706' : '#16a34a'};">${getSeverityText(issue.severity)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" style="text-align: center; color: #16a34a; padding: 20px;">恭喜！本次检测未发现明显体态异常问题。</td></tr>';
  
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 3 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">一、评估摘要</div>
      
      <p class="body-text">
        经 AI 体态评估系统检测分析，受检者${data.userName || '被评估者'}体态综合评分为 <strong>${data.overallScore}分</strong>，根据《人体姿态评估规范》标准，评估等级为 <strong>${data.grade}级</strong>（${getGradeText(data.grade)}）。本次检测共发现 <strong>${data.issues.length}项</strong> 体态异常，其中重度异常 ${severeCount} 项、中度异常 ${moderateCount} 项、轻度异常 ${mildCount} 项。
      </p>
      
      <table class="info-table">
        <tr>
          <th style="width: 40px;">序号</th>
          <th>检测项目</th>
          <th style="width: 70px;">检测值</th>
          <th style="width: 100px;">参考范围</th>
          <th style="width: 60px;">状态</th>
        </tr>
        ${issuesHtml}
      </table>
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generateDetailPage(data: ReportData): string {
  const issuesHtml = data.issues.length > 0
    ? data.issues.map((issue, i) => `
        <div class="issue-card ${issue.severity}">
          <div class="issue-number">${i + 1}</div>
          <div class="issue-content">
            <div style="display: flex; align-items: center;">
              <span class="issue-title">${issue.name}</span>
              <span class="severity-badge severity-${issue.severity}">${getSeverityText(issue.severity)}</span>
            </div>
            <div class="issue-meta">检测值: ${issue.angle.toFixed(1)}°  |  参考范围: ${issue.referenceRange || '正常范围'}</div>
            ${issue.description ? `<div class="issue-desc">${issue.description}</div>` : ''}
          </div>
        </div>
      `).join('')
    : '<div style="text-align: center; padding: 40px; color: #16a34a;">无异常项目</div>';
  
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 4 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">二、体态问题详细分析</div>
      
      ${issuesHtml}
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generateMuscleRiskPage(data: ReportData): string {
  const muscleHtml = data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)
    ? `
      <table class="muscle-table">
        <tr>
          <th class="tight">紧张肌肉</th>
          <th class="weak">无力肌肉</th>
        </tr>
        ${Array.from({ length: Math.max(data.muscles?.tight.length || 0, data.muscles?.weak.length || 0) }).map((_, i) => `
          <tr>
            <td style="color: #dc2626;">${data.muscles?.tight[i] || '-'}</td>
            <td style="color: #1e40af;">${data.muscles?.weak[i] || '-'}</td>
          </tr>
        `).join('')}
      </table>
    `
    : '<div style="text-align: center; padding: 20px; color: #6b7280;">暂无肌肉评估数据</div>';
  
  const riskHtml = data.risks && data.risks.length > 0
    ? `
      <table class="info-table">
        <tr>
          <th style="width: 80px;">风险类别</th>
          <th>潜在健康问题</th>
          <th style="width: 70px;">风险等级</th>
          <th style="width: 90px;">参考编码</th>
        </tr>
        ${data.risks.map((risk, i) => `
          <tr class="${i % 2 === 1 ? 'striped-row' : ''}">
            <td style="text-align: center;">${risk.category}</td>
            <td>${risk.condition}</td>
            <td style="text-align: center;" class="${risk.risk === 'high' ? 'risk-high' : risk.risk === 'medium' ? 'risk-medium' : 'risk-low'}">${getRiskText(risk.risk)}</td>
            <td style="text-align: center;">${risk.icdCode || '-'}</td>
          </tr>
        `).join('')}
      </table>
    `
    : '<div style="text-align: center; padding: 20px; color: #6b7280;">暂无风险评估数据</div>';
  
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 5 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">三、肌肉功能评估</div>
      ${muscleHtml}
      
      <div class="section-title" style="margin-top: 25px;">四、健康风险评估</div>
      ${riskHtml}
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generatePredictionPage(data: ReportData): string {
  const predictionHtml = data.healthPrediction
    ? `
      <table class="info-table">
        <tr><th style="width: 120px;">预测周期</th><th>发展预测</th></tr>
        <tr><td style="text-align: center; font-weight: 600;">短期（1-3个月）</td><td>${data.healthPrediction.shortTerm || '建议定期复查'}</td></tr>
        <tr class="striped-row"><td style="text-align: center; font-weight: 600;">中期（6-12个月）</td><td>${data.healthPrediction.midTerm || '持续关注体态变化'}</td></tr>
        <tr><td style="text-align: center; font-weight: 600;">长期（3年以上）</td><td>${data.healthPrediction.longTerm || '预防慢性疼痛发生'}</td></tr>
      </table>
    `
    : '';
  
  const recHtml = data.recommendations
    ? `
      ${data.recommendations.immediate?.length ? `
        <div class="rec-block">
          <div class="rec-header rec-header-danger">立即行动（建议即刻执行）</div>
          <ol class="rec-list">
            ${data.recommendations.immediate.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      ${data.recommendations.shortTerm?.length ? `
        <div class="rec-block">
          <div class="rec-header rec-header-warning">短期计划（1-4周内执行）</div>
          <ol class="rec-list">
            ${data.recommendations.shortTerm.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      ${data.recommendations.longTerm?.length ? `
        <div class="rec-block">
          <div class="rec-header rec-header-primary">长期策略（持续执行1-3个月）</div>
          <ol class="rec-list">
            ${data.recommendations.longTerm.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
    `
    : '<div style="text-align: center; padding: 20px; color: #6b7280;">暂无建议数据</div>';
  
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 6 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">五、健康发展预测</div>
      ${predictionHtml}
      
      <div class="section-title" style="margin-top: 25px;">六、改善方案与建议</div>
      ${recHtml}
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generateTcmPage(data: ReportData): string {
  const tcmHtml = data.tcmAnalysis
    ? `
      ${data.tcmAnalysis.constitution ? `
        <div class="constitution-box">
          <div class="constitution-label">体质判断</div>
          <div class="constitution-value">${data.tcmAnalysis.constitution}</div>
        </div>
      ` : ''}
      
      ${data.tcmAnalysis.meridians?.length ? `
        <table class="info-table">
          <tr><th style="background: #dc2626; width: 100px;">经络名称</th><th style="background: #dc2626; width: 80px;">状态</th><th style="background: #dc2626;">分析说明</th></tr>
          ${data.tcmAnalysis.meridians.map((m, i) => `
            <tr class="${i % 2 === 1 ? 'striped-row' : ''}">
              <td style="text-align: center;">${m.name}</td>
              <td style="text-align: center;">${m.status}</td>
              <td>${(m.reason || '').substring(0, 50)}</td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
      
      ${data.tcmAnalysis.acupoints?.length ? `
        <div style="margin-top: 20px;">
          <div style="font-size: 13px; font-weight: 600; color: #059669; margin-bottom: 10px;">穴位调理建议</div>
          <ol style="padding-left: 20px; font-size: 12px; line-height: 1.8;">
            ${data.tcmAnalysis.acupoints.slice(0, 4).map(a => `<li><strong>${a.name}</strong>（${a.location}）：${a.benefit}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
    `
    : '<div style="text-align: center; padding: 40px; color: #6b7280;">暂无中医分析数据</div>';
  
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 7 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">七、中医体质分析</div>
      ${tcmHtml}
      
      <div class="page-footer">本报告由 AI 体态评估系统自动生成，仅供参考，不作为临床诊断依据。</div>
    </div>
  `;
}

function generateAppendixPage(): string {
  return `
    <div class="report-page">
      <div class="page-header">
        <span>AI 体态评估系统</span>
        <span>第 8 页 / 共 8 页</span>
      </div>
      
      <div class="section-title">八、附录与参考标准</div>
      
      <table class="info-table">
        <tr><th>评估指标</th><th style="width: 100px;">正常参考范围</th><th>说明</th></tr>
        <tr><td style="text-align: center;">头前伸角度</td><td style="text-align: center;">&lt; 10°</td><td>颈胸角正常范围</td></tr>
        <tr class="striped-row"><td style="text-align: center;">肩部倾斜</td><td style="text-align: center;">&lt; 2°</td><td>双肩高度差</td></tr>
        <tr><td style="text-align: center;">骨盆前倾角</td><td style="text-align: center;">5-15°</td><td>髂前上棘与髂后上棘连线角度</td></tr>
        <tr class="striped-row"><td style="text-align: center;">膝关节角度</td><td style="text-align: center;">170-180°</td><td>膝关节伸展角度</td></tr>
        <tr><td style="text-align: center;">脊柱对齐度</td><td style="text-align: center;">&gt; 90%</td><td>脊柱侧弯程度评估</td></tr>
        <tr class="striped-row"><td style="text-align: center;">肩胛骨位置</td><td style="text-align: center;">对称</td><td>肩胛骨内侧缘距脊柱距离</td></tr>
      </table>
      
      <div class="section-title" style="margin-top: 25px;">报告审核</div>
      
      <div class="signature-box">
        <div class="signature-item">
          <div class="signature-label">报告生成</div>
          <div class="signature-value">AI 体态评估系统</div>
          <div class="signature-date">${formatDateTime(new Date())}</div>
        </div>
        <div class="signature-item">
          <div class="signature-label">技术审核</div>
          <div class="signature-value">____________</div>
          <div class="signature-date">审核日期：________</div>
        </div>
        <div class="signature-item">
          <div class="signature-label">报告签发</div>
          <div class="signature-value">____________</div>
          <div class="signature-date">签发日期：________</div>
        </div>
      </div>
      
      <div class="disclaimer">
        <div class="disclaimer-title">重要声明</div>
        <div class="disclaimer-text">本报告由 AI 体态评估系统自动生成，评估结果仅供参考，不作为临床诊断依据。如有身体不适或持续疼痛，请及时就医。本报告有效期为 30 天，建议定期复查跟踪改善效果。</div>
      </div>
      
      <div style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 20px;">
        如有疑问，请联系专业康复师或医师进行咨询。
      </div>
    </div>
  `;
}

// ==================== 主生成函数 ====================

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  const reportId = data.reportId || `PT${Date.now().toString(36).toUpperCase()}`;
  
  // 创建临时容器
  const container = document.createElement('div');
  container.style.cssText = 'position: fixed; left: -10000px; top: 0; width: 794px; background: white;';
  document.body.appendChild(container);
  
  // 创建所有页面
  const pagesHtml = [
    generateCoverPage(data, reportId),
    generateTocPage(),
    generateSummaryPage(data),
    generateDetailPage(data),
    generateMuscleRiskPage(data),
    generatePredictionPage(data),
    generateTcmPage(data),
    generateAppendixPage(),
  ];
  
  // 添加样式和页面
  container.innerHTML = STYLES + pagesHtml.join('');
  
  // 等待渲染
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 创建 PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = 210;
  const pageHeight = 297;
  
  // 获取所有页面元素
  const pages = container.querySelectorAll('.report-page');
  
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    
    try {
      // 使用 html2canvas 渲染页面
      const canvas = await html2canvas(pages[i] as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });
      
      // 将 canvas 转换为图片
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // 添加到 PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    } catch (error) {
      console.error(`渲染第 ${i + 1} 页失败:`, error);
    }
  }
  
  // 清理
  document.body.removeChild(container);
  
  return pdf.output('blob');
}

// ==================== 辅助导出函数 ====================

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateReportFilename(score: number): string {
  const date = new Date().toISOString().split('T')[0];
  return `体态评估报告-${date}-评分${score}.pdf`;
}
