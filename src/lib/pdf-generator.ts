/**
 * AI体态评估报告生成器 - 专业医疗版 v4.2
 * 使用 jsPDF + 中文字体生成 PDF 报告
 * 
 * 设计理念：
 * 1. 使用 jsPDF 确保文字清晰可复制
 * 2. 使用 jspdf-autotable 生成专业医疗表格
 * 3. 医学化专业术语和描述
 * 4. 完整的审核签名流程
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 扩展 jsPDF 类型
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

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
  
  healthPrediction?: {
    shortTerm?: string;
    midTerm?: string;
    longTerm?: string;
    preventiveMeasures?: string[];
  };
}

// ==================== 中文字体支持 ====================

// 使用在线加载中文字体的方式
let chineseFontLoaded = false;
const CHINESE_FONT_URL = 'https://cdn.jsdelivr.net/gh/Advplyr/jspdf-chinese-fonts@master/dist/SourceHanSansCN-Normal-bold.js';

/**
 * 加载中文字体
 */
async function loadChineseFont(): Promise<void> {
  if (chineseFontLoaded) return;
  
  try {
    // 动态加载中文字体脚本
    const script = document.createElement('script');
    script.src = CHINESE_FONT_URL;
    document.head.appendChild(script);
    
    await new Promise<void>((resolve, reject) => {
      script.onload = () => {
        chineseFontLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Chinese font'));
    });
  } catch (error) {
    console.warn('Chinese font loading failed, using fallback');
  }
}

// ==================== 配置常量 ====================

const COLORS: Record<string, [number, number, number]> = {
  primary: [30, 64, 175],
  primaryLight: [219, 234, 254],
  primaryDark: [30, 58, 138],
  success: [22, 163, 74],
  successLight: [220, 252, 231],
  warning: [217, 119, 6],
  warningLight: [254, 243, 199],
  danger: [220, 38, 38],
  dangerLight: [254, 226, 226],
  text: [31, 41, 55],
  textSecondary: [75, 85, 99],
  textMuted: [156, 163, 175],
  border: [229, 231, 235],
  background: [249, 250, 251],
};

const PAGE = {
  width: 210,
  height: 297,
  margin: 15,
  contentWidth: 180,
};

// ==================== 辅助函数 ====================

function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getSeverityText(severity: string): string {
  const map: Record<string, string> = { severe: 'Severe', moderate: 'Moderate', mild: 'Mild' };
  return map[severity] || 'Normal';
}

function getSeverityColor(severity: string): [number, number, number] {
  const map: Record<string, [number, number, number]> = {
    severe: COLORS.danger,
    moderate: COLORS.warning,
    mild: COLORS.success,
  };
  return map[severity] || COLORS.textMuted;
}

function getRiskText(risk: string): string {
  const map: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
  return map[risk] || 'Unknown';
}

function getGradeText(grade: string): string {
  const map: Record<string, string> = { A: 'Excellent', B: 'Good', C: 'Fair', D: 'Poor', E: 'Need Improvement' };
  return map[grade] || 'Unknown';
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

// ==================== 主生成函数 ====================

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  // 尝试加载中文字体
  try {
    await loadChineseFont();
  } catch (e) {
    console.warn('Font loading skipped');
  }
  
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = data.reportId || `PT${Date.now().toString(36).toUpperCase()}`;
  
  // 检查是否支持中文字体
  const hasChineseFont = typeof (window as any).SourceHanSansCN !== 'undefined';
  if (hasChineseFont) {
    doc.addFileToVFS('SourceHanSansCN-normal.ttf', (window as any).SourceHanSansCN);
    doc.addFont('SourceHanSansCN-normal.ttf', 'SourceHanSansCN', 'normal');
    doc.setFont('SourceHanSansCN');
  }
  
  const severeCount = data.issues.filter(i => i.severity === 'severe').length;
  const moderateCount = data.issues.filter(i => i.severity === 'moderate').length;
  const mildCount = data.issues.filter(i => i.severity === 'mild').length;
  
  let y = PAGE.margin;
  let pageNum = 1;
  const totalPages = 8;
  
  // ==================== 封面 ====================
  
  // 顶部蓝色条
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 50, 'F');
  
  // 标题
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Posture Assessment System', PAGE.width / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Posture Analysis and Health Assessment Report', PAGE.width / 2, 32, { align: 'center' });
  
  // 报告类型
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(PAGE.width / 2 - 35, 38, 70, 8, 2, 2, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.text('Posture Assessment Report', PAGE.width / 2, 43.5, { align: 'center' });
  
  // 条形码区域
  y = 60;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin + 20, y, PAGE.contentWidth - 40, 18);
  
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text('Report ID:', PAGE.margin + 25, y + 6);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont('courier', 'bold');
  doc.text(reportId, PAGE.margin + 25, y + 13);
  
  // 受检者信息表
  y = 85;
  
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin + 10, right: PAGE.margin + 10 },
    tableWidth: PAGE.contentWidth - 20,
    head: [[
      { content: 'Examinee Information', colSpan: 4, styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 11, fontStyle: 'bold', textColor: [255,255,255] } }
    ]],
    body: [
      [
        { content: 'Name', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userName || 'N/A', styles: { fontSize: 10 } },
        { content: 'Gender', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userGender || 'N/A', styles: { fontSize: 10 } },
      ],
      [
        { content: 'Age', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userAge || 'N/A', styles: { fontSize: 10 } },
        { content: 'Phone', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userPhone || 'N/A', styles: { fontSize: 10 } },
      ],
      [
        { content: 'Assessment Date', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: formatDate(data.assessmentDate), styles: { fontSize: 10 } },
        { content: 'Report ID', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: reportId, styles: { fontSize: 10 } },
      ],
    ],
    theme: 'grid',
    styles: { cellPadding: 3, lineColor: COLORS.border, lineWidth: 0.5, textColor: COLORS.text, font: 'helvetica' },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 45 }, 2: { cellWidth: 40 }, 3: { cellWidth: 45 } },
  });
  
  // 评估结果摘要
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 140;
  
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin + 10, right: PAGE.margin + 10 },
    tableWidth: PAGE.contentWidth - 20,
    head: [[
      { content: 'Assessment Summary', colSpan: 3, styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 11, fontStyle: 'bold', textColor: [255,255,255] } }
    ]],
    body: [
      [
        { 
          content: `Overall Score\n${data.overallScore} points`, 
          styles: { halign: 'center', fontSize: 12, fontStyle: 'bold', textColor: getScoreColor(data.overallScore) } 
        },
        { 
          content: `Grade\n${data.grade} (${getGradeText(data.grade)})`, 
          styles: { halign: 'center', fontSize: 12, fontStyle: 'bold' } 
        },
        { 
          content: `Abnormal Items\n${data.issues.length} items`, 
          styles: { halign: 'center', fontSize: 12, fontStyle: 'bold' } 
        },
      ],
    ],
    theme: 'grid',
    styles: { cellPadding: 5, lineColor: COLORS.border, lineWidth: 0.5, textColor: COLORS.text, font: 'helvetica' },
  });
  
  // 检测方法说明
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 180;
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin + 10, y, PAGE.contentWidth - 20, 22);
  
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Detection Method', PAGE.margin + 15, y + 6);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report uses MediaPipe visual analysis technology for precise positioning of human skeletal key points, ' +
    'combined with AI deep learning algorithms for posture assessment.',
    PAGE.margin + 15, y + 11, { maxWidth: PAGE.contentWidth - 30 }
  );
  
  // 底部声明
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text('This report is auto-generated by AI system, for reference only.', PAGE.width / 2, PAGE.height - 20, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Generated: ${formatDateTime(new Date())}`, PAGE.width / 2, PAGE.height - 15, { align: 'center' });
  
  // ==================== 第2页：目录 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Contents', PAGE.margin + 3, y + 5.5);
  
  y += 15;
  
  const tocItems = [
    { title: '1. Assessment Summary', page: '3' },
    { title: '2. Detailed Posture Analysis', page: '4' },
    { title: '3. Muscle Function Assessment', page: '5' },
    { title: '4. Health Risk Assessment', page: '5' },
    { title: '5. Health Development Prediction', page: '6' },
    { title: '6. Improvement Plan & Recommendations', page: '6' },
    { title: '7. TCM Constitution Analysis', page: '7' },
    { title: '8. Appendix & Reference Standards', page: '8' },
  ];
  
  tocItems.forEach((item) => {
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, PAGE.margin + 5, y);
    
    doc.setDrawColor(...COLORS.border);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(PAGE.margin + 70, y - 1, PAGE.width - PAGE.margin - 10, y - 1);
    doc.setLineDashPattern([], 0);
    
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(10);
    doc.text(item.page, PAGE.width - PAGE.margin - 5, y, { align: 'right' });
    y += 10;
  });
  
  // ==================== 第3页：评估摘要 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Assessment Summary', PAGE.margin + 3, y + 5.5);
  
  y += 15;
  
  // 评估结论
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const conclusionText = `Based on AI posture assessment analysis, the examinee's overall posture score is ${data.overallScore} points. ` +
    `According to standard assessment criteria, the grade is ${data.grade} (${getGradeText(data.grade)}). ` +
    `This assessment detected ${data.issues.length} posture abnormalities, including ${severeCount} severe, ${moderateCount} moderate, and ${mildCount} mild issues.`;
  
  const conclusionLines = doc.splitTextToSize(conclusionText, PAGE.contentWidth);
  doc.text(conclusionLines, PAGE.margin, y);
  y += conclusionLines.length * 5 + 10;
  
  // 异常项目汇总表
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Abnormal Items Summary', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.issues.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: 'No.', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Detection Item', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Value', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Reference Range', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Status', styles: { halign: 'center', fontSize: 9 } },
      ]],
      body: data.issues.map((issue, index) => [
        String(index + 1),
        issue.name,
        `${issue.angle.toFixed(1)} deg`,
        issue.referenceRange || 'Normal Range',
        getSeverityText(issue.severity),
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
      bodyStyles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: COLORS.background },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 50, halign: 'center' },
        4: { cellWidth: 30, halign: 'center' },
      },
      didParseCell: function(data) {
        if (data.column.index === 4 && data.section === 'body') {
          const text = data.cell.raw as string;
          if (text === 'Severe') {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Moderate') {
            data.cell.styles.textColor = COLORS.warning;
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Mild') {
            data.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });
  }
  
  // ==================== 第4页：详细分析 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Detailed Posture Analysis', PAGE.margin + 3, y + 5.5);
  
  y += 15;
  
  const sortedIssues = [...data.issues].sort((a, b) => {
    const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });
  
  sortedIssues.forEach((issue, index) => {
    if (y > 250) {
      doc.addPage();
      pageNum++;
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, PAGE.width, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('AI Posture Assessment System', PAGE.margin, 7);
      doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
      y = 20;
    }
    
    // 问题卡片
    const cardHeight = 25;
    
    // 左侧状态条
    doc.setFillColor(...getSeverityColor(issue.severity));
    doc.rect(PAGE.margin, y, 3, cardHeight, 'F');
    
    // 卡片边框
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.rect(PAGE.margin, y, PAGE.contentWidth, cardHeight);
    
    // 序号
    doc.setFillColor(...COLORS.primaryLight);
    doc.circle(PAGE.margin + 10, y + 8, 4, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, PAGE.margin + 10, y + 9.5, { align: 'center' });
    
    // 问题名称
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(issue.name, PAGE.margin + 16, y + 8);
    
    // 严重程度标签
    doc.setFillColor(...getSeverityColor(issue.severity));
    doc.roundedRect(PAGE.width - PAGE.margin - 25, y + 3, 22, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(getSeverityText(issue.severity), PAGE.width - PAGE.margin - 14, y + 7, { align: 'center' });
    
    // 检测值和参考范围
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Value: ${issue.angle.toFixed(1)} deg  |  Reference: ${issue.referenceRange || 'Normal Range'}`, PAGE.margin + 16, y + 16);
    
    y += cardHeight + 4;
  });
  
  // ==================== 第5页：肌肉与风险评估 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  
  // 肌肉功能评估
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Muscle Function Assessment', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    const maxLen = Math.max(data.muscles.tight.length, data.muscles.weak.length);
    const muscleData = [];
    for (let i = 0; i < maxLen; i++) {
      muscleData.push([data.muscles.tight[i] || '-', data.muscles.weak[i] || '-']);
    }
    
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: 'Tight Muscles', styles: { fillColor: COLORS.danger, halign: 'center', textColor: [255,255,255] } },
        { content: 'Weak Muscles', styles: { fillColor: COLORS.primary, halign: 'center', textColor: [255,255,255] } },
      ]],
      body: muscleData,
      theme: 'grid',
      headStyles: { fontStyle: 'bold', fontSize: 10, cellPadding: 4 },
      bodyStyles: { fontSize: 9, cellPadding: 3, halign: 'center' },
      alternateRowStyles: { fillColor: COLORS.background },
      columnStyles: { 0: { cellWidth: PAGE.contentWidth / 2 }, 1: { cellWidth: PAGE.contentWidth / 2 } },
    });
    
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;
  }
  
  // 健康风险评估
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Health Risk Assessment', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.risks && data.risks.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: 'Risk Category', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Potential Health Issue', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Risk Level', styles: { halign: 'center', fontSize: 9 } },
        { content: 'Reference Code', styles: { halign: 'center', fontSize: 9 } },
      ]],
      body: data.risks.map(risk => [
        risk.category,
        risk.condition,
        getRiskText(risk.risk),
        risk.icdCode || '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 3 },
      bodyStyles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: COLORS.background },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' },
      },
      didParseCell: function(data) {
        if (data.column.index === 2 && data.section === 'body') {
          const text = data.cell.raw as string;
          if (text === 'High') {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (text === 'Medium') {
            data.cell.styles.textColor = COLORS.warning;
          } else {
            data.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });
  }
  
  // ==================== 第6页：预测与建议 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  
  // 健康发展预测
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Health Development Prediction', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.healthPrediction) {
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: 'Prediction Period', styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 9, textColor: [255,255,255] } },
        { content: 'Development Prediction', styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 9, textColor: [255,255,255] } },
      ]],
      body: [
        ['Short-term (1-3 months)', data.healthPrediction.shortTerm || 'Regular check-up recommended'],
        ['Mid-term (6-12 months)', data.healthPrediction.midTerm || 'Continue monitoring posture changes'],
        ['Long-term (3+ years)', data.healthPrediction.longTerm || 'Prevent chronic pain development'],
      ],
      theme: 'grid',
      bodyStyles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 130 } },
    });
    
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;
  }
  
  // 改善方案
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Improvement Plan & Recommendations', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.recommendations) {
    // 立即行动
    if (data.recommendations.immediate?.length) {
      doc.setFillColor(...COLORS.dangerLight);
      doc.rect(PAGE.margin, y, PAGE.contentWidth, 6, 'F');
      doc.setTextColor(...COLORS.danger);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Immediate Action (Recommended to execute immediately)', PAGE.margin + 3, y + 4.5);
      y += 8;
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      data.recommendations.immediate.slice(0, 3).forEach((rec, i) => {
        doc.text(`${i + 1}. ${rec}`, PAGE.margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 短期计划
    if (data.recommendations.shortTerm?.length) {
      doc.setFillColor(...COLORS.warningLight);
      doc.rect(PAGE.margin, y, PAGE.contentWidth, 6, 'F');
      doc.setTextColor(...COLORS.warning);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Short-term Plan (1-4 weeks)', PAGE.margin + 3, y + 4.5);
      y += 8;
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      data.recommendations.shortTerm.slice(0, 3).forEach((rec, i) => {
        doc.text(`${i + 1}. ${rec}`, PAGE.margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 长期策略
    if (data.recommendations.longTerm?.length) {
      doc.setFillColor(...COLORS.primaryLight);
      doc.rect(PAGE.margin, y, PAGE.contentWidth, 6, 'F');
      doc.setTextColor(...COLORS.primaryDark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Long-term Strategy (1-3 months)', PAGE.margin + 3, y + 4.5);
      y += 8;
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      data.recommendations.longTerm.slice(0, 3).forEach((rec, i) => {
        doc.text(`${i + 1}. ${rec}`, PAGE.margin + 5, y);
        y += 5;
      });
    }
  }
  
  // ==================== 第7页：中医分析 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('7. TCM Constitution Analysis', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  if (data.tcmAnalysis) {
    // 体质判断
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor(...COLORS.warningLight);
      doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 15, 2, 2, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Constitution Type:', PAGE.margin + 5, y + 5);
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(14);
      doc.text(data.tcmAnalysis.constitution, PAGE.margin + 5, y + 11);
      y += 18;
    }
    
    // 经络状态
    if (data.tcmAnalysis.meridians?.length) {
      autoTable(doc, {
        startY: y,
        margin: { left: PAGE.margin },
        head: [[
          { content: 'Meridian', styles: { halign: 'center', textColor: [255,255,255] } },
          { content: 'Status', styles: { halign: 'center', textColor: [255,255,255] } },
          { content: 'Analysis', styles: { halign: 'center', textColor: [255,255,255] } },
        ]],
        body: data.tcmAnalysis.meridians.map(m => [
          m.name,
          m.status,
          (m.reason || '').substring(0, 40),
        ]),
        theme: 'grid',
        headStyles: { fillColor: COLORS.danger, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40, halign: 'center' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 110 },
        },
      });
      
      y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 20;
    }
    
    // 穴位建议
    if (data.tcmAnalysis.acupoints?.length) {
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Acupoint Recommendations:', PAGE.margin, y);
      y += 6;
      
      data.tcmAnalysis.acupoints.slice(0, 4).forEach((a, i) => {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${i + 1}. ${a.name} (${a.location}): ${a.benefit}`, PAGE.margin + 5, y);
        y += 5;
      });
    }
  }
  
  // ==================== 第8页：附录与签名 ====================
  
  doc.addPage();
  pageNum++;
  
  // 页眉
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment System', PAGE.margin, 7);
  doc.text(`Page ${pageNum}/${totalPages}`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  y = 20;
  
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('8. Appendix & Reference Standards', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  // 参考标准表
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin },
    head: [[
      { content: 'Assessment Indicator', styles: { halign: 'center', fontSize: 9, textColor: [255,255,255] } },
      { content: 'Normal Range', styles: { halign: 'center', fontSize: 9, textColor: [255,255,255] } },
      { content: 'Description', styles: { halign: 'center', fontSize: 9, textColor: [255,255,255] } },
    ]],
    body: [
      ['Head Forward Angle', '< 10 deg', 'Normal cervical-thoracic angle range'],
      ['Shoulder Tilt', '< 2 deg', 'Bilateral shoulder height difference'],
      ['Pelvic Tilt Angle', '5-15 deg', 'Angle between ASIS and PSIS line'],
      ['Knee Angle', '170-180 deg', 'Knee extension angle'],
      ['Spine Alignment', '> 90%', 'Spinal curvature assessment'],
      ['Scapular Position', 'Symmetric', 'Distance from scapula to spine'],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.primary, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, halign: 'center' },
    alternateRowStyles: { fillColor: COLORS.background },
  });
  
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : y + 50;
  
  // 签名区域
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Verification', PAGE.margin + 3, y + 5.5);
  y += 12;
  
  // 签名框
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 35);
  
  // 分隔线
  doc.line(PAGE.margin + PAGE.contentWidth / 3, y, PAGE.margin + PAGE.contentWidth / 3, y + 35);
  doc.line(PAGE.margin + PAGE.contentWidth * 2 / 3, y, PAGE.margin + PAGE.contentWidth * 2 / 3, y + 35);
  
  // 报告生成
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text('Report Generated', PAGE.margin + PAGE.contentWidth / 6, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('AI Posture Assessment', PAGE.margin + PAGE.contentWidth / 6, y + 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text(formatDateTime(new Date()), PAGE.margin + PAGE.contentWidth / 6, y + 26, { align: 'center' });
  
  // 技术审核
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('Technical Review', PAGE.margin + PAGE.contentWidth / 2, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('____________', PAGE.margin + PAGE.contentWidth / 2, y + 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Review Date: ________', PAGE.margin + PAGE.contentWidth / 2, y + 26, { align: 'center' });
  
  // 报告签发
  doc.setTextColor(...COLORS.textSecondary);
  doc.text('Report Issued', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('____________', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Issue Date: ________', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 26, { align: 'center' });
  
  y += 45;
  
  // 重要声明
  doc.setFillColor(...COLORS.warningLight);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 22, 'F');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Important Disclaimer', PAGE.margin + 5, y + 6);
  
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This report is auto-generated by AI Posture Assessment System for reference only, not for clinical diagnosis. ' +
    'Please consult a physician if you experience any discomfort. Report valid for 30 days.',
    PAGE.margin + 5, y + 11, { maxWidth: PAGE.contentWidth - 10 }
  );
  
  // 联系方式
  y += 30;
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text('For questions, please consult a professional physical therapist or physician.', PAGE.width / 2, y, { align: 'center' });
  
  return doc.output('blob');
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
  return `Posture-Assessment-Report-${date}-Score${score}.pdf`;
}
