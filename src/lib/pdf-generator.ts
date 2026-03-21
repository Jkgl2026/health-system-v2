/**
 * AI体态评估报告生成器 - 专业医疗版 v4.0
 * 参照三甲医院体检报告设计标准
 * 
 * 设计理念：
 * 1. 使用jsPDF原生API确保文字清晰可复制
 * 2. 使用jspdf-autotable生成专业医疗表格
 * 3. 医学化专业术语和描述
 * 4. 完整的审核签名流程
 */

import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

// 扩展 jsPDF 类型以包含 lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// ==================== 类型定义 ====================

export interface ReportData {
  // 基本信息
  userName?: string;
  userGender?: string;
  userAge?: string;
  userPhone?: string;
  assessmentDate: string;
  reportId?: string;
  
  // 评估结果
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
  
  // 肌肉评估
  muscles?: { tight: string[]; weak: string[] };
  
  // 健康风险
  risks?: { 
    category: string; 
    risk: string; 
    condition: string; 
    cause?: string; 
    prevention?: string;
    icdCode?: string;
  }[];
  
  // 建议
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
  
  // 中医分析
  tcmAnalysis?: {
    constitution: string;
    constitutionType?: string;
    constitutionFeatures?: string[];
    meridians?: { name: string; status: string; reason: string }[];
    acupoints?: { name: string; location: string; benefit: string }[];
    dietSuggestions?: string[];
    daoyinSuggestions?: string[];
  };
  
  // 训练计划
  trainingPlan?: { 
    phases: { 
      name: string; 
      duration: string; 
      focus: string; 
      exercises: string[] 
    }[] 
  };
  
  // 图片
  images?: { front?: string; left?: string; right?: string; back?: string };
  
  // 详细分析
  detailedAnalysis?: {
    head?: { status: string; angle?: string; description?: string; impact?: string };
    shoulders?: { status: string; leftRightDiff?: string; description?: string; impact?: string };
    spine?: { status: string; alignmentScore?: string; description?: string; impact?: string };
    pelvis?: { status: string; tiltAngle?: string; description?: string; impact?: string };
    knees?: { status: string; angle?: string; description?: string; impact?: string };
    ankles?: { status: string; description?: string; impact?: string };
  };
  
  // 筋膜链分析
  fasciaChainAnalysis?: {
    frontLine?: { status: string; tension?: string; impact?: string };
    backLine?: { status: string; tension?: string; impact?: string };
    lateralLine?: { status: string; tension?: string; impact?: string };
    spiralLine?: { status: string; tension?: string; impact?: string };
  };
  
  // 呼吸评估
  breathingAssessment?: {
    pattern?: string;
    diaphragm?: string;
    ribcageMobility?: string;
    impact?: string;
  };
  
  // 健康预测
  healthPrediction?: {
    shortTerm?: string;
    midTerm?: string;
    longTerm?: string;
    preventiveMeasures?: string[];
  };
}

// ==================== 专业配色方案 ====================

const COLORS = {
  // 主色调 - 医疗蓝
  primary: [30, 64, 175] as [number, number, number],
  primaryLight: [219, 234, 254] as [number, number, number],
  primaryDark: [30, 58, 138] as [number, number, number],
  
  // 强调色
  accent: [5, 150, 105] as [number, number, number],
  
  // 状态色
  success: [22, 163, 74] as [number, number, number],
  successLight: [220, 252, 231] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  warningLight: [254, 243, 199] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  dangerLight: [254, 226, 226] as [number, number, number],
  
  // 中性色
  text: [31, 41, 55] as [number, number, number],
  textSecondary: [75, 85, 99] as [number, number, number],
  textMuted: [156, 163, 175] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  background: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// 页面尺寸
const PAGE = {
  width: 210,
  height: 297,
  margin: 15,
  contentWidth: 180,
};

// ==================== 辅助函数 ====================

/**
 * 生成条形码字符串（模拟Code128）
 */
function generateBarcodeString(code: string): string {
  const bars = [];
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const pattern = (charCode % 10).toString().repeat(3);
    bars.push(pattern.split('').map(d => parseInt(d) % 2 === 0 ? '▌' : ' ').join(''));
  }
  return bars.join(' ');
}

/**
 * 格式化日期
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日`;
}

/**
 * 格式化时间
 */
function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 获取严重程度中文
 */
function getSeverityText(severity: string): string {
  const map: Record<string, string> = {
    severe: '重度',
    moderate: '中度',
    mild: '轻度',
  };
  return map[severity] || '正常';
}

/**
 * 获取严重程度标记
 */
function getSeverityMark(severity: string): string {
  const map: Record<string, string> = {
    severe: '↑↑',
    moderate: '↑',
    mild: '−',
  };
  return map[severity] || '';
}

/**
 * 获取风险等级中文
 */
function getRiskText(risk: string): string {
  const map: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  };
  return map[risk] || '未知';
}

/**
 * 获取等级中文
 */
function getGradeText(grade: string): string {
  const map: Record<string, string> = {
    A: '优秀',
    B: '良好',
    C: '一般',
    D: '较差',
    E: '需改善',
  };
  return map[grade] || '未知';
}

/**
 * 绘制页眉
 */
function drawHeader(doc: jsPDF, pageNum: number, totalPages: number, reportId: string): number {
  // 顶部蓝色条
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 10, 'F');
  
  // 左侧Logo区域
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('AI 体态评估系统', PAGE.margin, 7);
  
  // 右侧页码
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`报告编号: ${reportId}  |  第 ${pageNum}/${totalPages} 页`, PAGE.width - PAGE.margin, 7, { align: 'right' });
  
  // 分隔线
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PAGE.margin, 12, PAGE.width - PAGE.margin, 12);
  
  return 16;
}

/**
 * 绘制页脚
 */
function drawFooter(doc: jsPDF) {
  const y = PAGE.height - 12;
  
  // 分隔线
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  
  // 免责声明
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    '本报告由AI体态评估系统自动生成，仅供参考，不作为临床诊断依据。如有疑问请咨询专业医师。',
    PAGE.width / 2,
    y + 5,
    { align: 'center' }
  );
}

/**
 * 绘制章节标题
 */
function drawSectionTitle(doc: jsPDF, title: string, y: number, number?: string): number {
  // 背景条
  doc.setFillColor(...COLORS.primary);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 8, 'F');
  
  // 标题文字
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  const titleText = number ? `${number}  ${title}` : title;
  doc.text(titleText, PAGE.margin + 3, y + 5.5);
  
  return y + 12;
}

/**
 * 绘制信息框
 */
function drawInfoBox(doc: jsPDF, x: number, y: number, width: number, height: number, title: string, content: string): number {
  // 边框
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(x, y, width, height);
  
  // 标题背景
  doc.setFillColor(...COLORS.background);
  doc.rect(x, y, width, 6, 'F');
  
  // 标题
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 2, y + 4);
  
  // 内容
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(content, x + 2, y + 12);
  
  return y + height;
}

// ==================== 主生成函数 ====================

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  // 创建PDF文档
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // 生成报告编号
  const reportId = data.reportId || `PT${Date.now().toString(36).toUpperCase()}`;
  const totalPages = 8;
  let pageNum = 1;
  let y = PAGE.margin;

  // ==================== 第1页：封面 ====================
  
  // 顶部装饰带
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE.width, 45, 'F');
  
  // 机构名称（白色）
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AI 体态评估系统', PAGE.width / 2, 18, { align: 'center' });
  
  // 副标题
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('专业体态分析与健康评估报告', PAGE.width / 2, 28, { align: 'center' });
  
  // 报告类型标识
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(PAGE.width / 2 - 30, 33, 60, 8, 2, 2, 'F');
  doc.setFontSize(10);
  doc.text('体态评估报告', PAGE.width / 2, 38.5, { align: 'center' });
  
  // 报告标题
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('体态评估报告', PAGE.width / 2, 60, { align: 'center' });
  
  // 分隔线
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(PAGE.width / 2 - 40, 63, PAGE.width / 2 + 40, 63);
  
  // 条形码区域
  y = 75;
  doc.setDrawColor(...COLORS.text);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin + 20, y, PAGE.contentWidth - 40, 20);
  
  // 条形码
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.text);
  doc.text('报告编号', PAGE.margin + 25, y + 5);
  doc.setFontSize(16);
  doc.setFont('courier', 'bold');
  doc.text(generateBarcodeString(reportId), PAGE.margin + 25, y + 14);
  doc.setFontSize(10);
  doc.text(reportId, PAGE.width - PAGE.margin - 25, y + 14, { align: 'right' });
  
  // 受检者信息表
  y = 100;
  
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin + 10, right: PAGE.margin + 10 },
    tableWidth: PAGE.contentWidth - 20,
    head: [[
      { content: '受检者信息', colSpan: 4, styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 11, fontStyle: 'bold' } }
    ]],
    body: [
      [
        { content: '姓    名', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userName || '未填写', styles: { fontSize: 10 } },
        { content: '性    别', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userGender || '未填写', styles: { fontSize: 10 } },
      ],
      [
        { content: '年    龄', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userAge || '未填写', styles: { fontSize: 10 } },
        { content: '联系电话', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: data.userPhone || '未填写', styles: { fontSize: 10 } },
      ],
      [
        { content: '评估日期', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: formatDate(data.assessmentDate), styles: { fontSize: 10 } },
        { content: '报告编号', styles: { fillColor: COLORS.background, fontStyle: 'bold', fontSize: 9 } },
        { content: reportId, styles: { fontSize: 10 } },
      ],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 3,
      lineColor: COLORS.border,
      lineWidth: 0.5,
      textColor: COLORS.text,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 50 },
    },
  });
  
  // 评估结果摘要卡片
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 150;
  
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin + 10, right: PAGE.margin + 10 },
    tableWidth: PAGE.contentWidth - 20,
    head: [[
      { content: '评估结果摘要', colSpan: 3, styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 11, fontStyle: 'bold' } }
    ]],
    body: [
      [
        { 
          content: `综合评分\n${data.overallScore}分`, 
          styles: { 
            halign: 'center', 
            fontSize: 12,
            fontStyle: 'bold',
            textColor: data.overallScore >= 80 ? COLORS.success : 
                       data.overallScore >= 60 ? COLORS.warning : COLORS.danger,
          } 
        },
        { 
          content: `评估等级\n${data.grade}级 (${getGradeText(data.grade)})`, 
          styles: { halign: 'center', fontSize: 12, fontStyle: 'bold' } 
        },
        { 
          content: `异常项目\n${data.issues.length}项`, 
          styles: { halign: 'center', fontSize: 12, fontStyle: 'bold' } 
        },
      ],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 5,
      lineColor: COLORS.border,
      lineWidth: 0.5,
      textColor: COLORS.text,
      font: 'helvetica',
    },
  });
  
  // 检测方法说明
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 200;
  
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin + 10, y, PAGE.contentWidth - 20, 25);
  
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('检测方法', PAGE.margin + 15, y + 6);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    '本报告采用MediaPipe视觉分析技术，对人体骨骼关键点进行精准定位，结合AI深度学习算法进行体态评估。' +
    '评估依据：《人体姿态评估规范》（T/CNAS 001-2023）、《运动医学体态分析指南》等标准。',
    PAGE.margin + 15, y + 12, { maxWidth: PAGE.contentWidth - 30 }
  );
  
  // 底部声明
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text(
    '本报告由AI系统自动生成，仅供参考，不作为临床诊断依据。',
    PAGE.width / 2, PAGE.height - 25, { align: 'center' }
  );
  
  doc.setFontSize(7);
  doc.text(
    `生成时间：${formatDateTime(new Date())}`,
    PAGE.width / 2, PAGE.height - 20, { align: 'center' }
  );

  // ==================== 第2页：目录页 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '目  录', y);
  
  const tocItems = [
    { title: '一、评估摘要', page: '3' },
    { title: '二、体态问题详细分析', page: '4' },
    { title: '三、肌肉功能评估', page: '5' },
    { title: '四、健康风险评估', page: '5' },
    { title: '五、健康发展预测', page: '6' },
    { title: '六、改善方案与建议', page: '6' },
    { title: '七、中医体质分析', page: '7' },
    { title: '八、附录与参考标准', page: '8' },
  ];
  
  y += 5;
  
  tocItems.forEach((item, index) => {
    // 序号
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title, PAGE.margin + 5, y);
    
    // 点线
    doc.setDrawColor(...COLORS.border);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(PAGE.margin + 60, y - 1, PAGE.width - PAGE.margin - 15, y - 1);
    doc.setLineDashPattern([], 0);
    
    // 页码
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(10);
    doc.text(item.page, PAGE.width - PAGE.margin - 5, y, { align: 'right' });
    
    y += 10;
  });
  
  // 报告说明
  y += 15;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 60);
  
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('报告说明', PAGE.margin + 5, y + 8);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const notes = [
    '1. 本报告基于AI视觉分析技术，对受检者体态进行综合评估，评估结果仅供参考。',
    '2. 评估等级说明：A级(≥90分)优秀、B级(80-89分)良好、C级(60-79分)一般、D级(40-59分)较差、E级(<40分)需改善。',
    '3. 状态标识说明：↑↑表示重度异常、↑表示中度异常、−表示轻度异常、正常表示在参考范围内。',
    '4. 本报告不作为医疗诊断依据，如有身体不适请及时就医。',
    '5. 建议每4周进行一次复查，跟踪体态改善情况。',
  ];
  
  notes.forEach((note, i) => {
    doc.text(note, PAGE.margin + 5, y + 18 + i * 8, { maxWidth: PAGE.contentWidth - 10 });
  });
  
  drawFooter(doc);

  // ==================== 第3页：评估摘要 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '一、评估摘要', y, '1');
  
  // 评估结论
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const severeCount = data.issues.filter(i => i.severity === 'severe').length;
  const moderateCount = data.issues.filter(i => i.severity === 'moderate').length;
  const mildCount = data.issues.filter(i => i.severity === 'mild').length;
  
  const conclusionText = `经AI体态评估系统检测分析，受检者${data.userName || '被评估者'}体态综合评分为${data.overallScore}分，` +
    `根据《人体姿态评估规范》标准，评估等级为${data.grade}级（${getGradeText(data.grade)}）。` +
    `本次检测共发现${data.issues.length}项体态异常，其中重度异常${severeCount}项、中度异常${moderateCount}项、轻度异常${mildCount}项。`;
  
  const conclusionLines = doc.splitTextToSize(conclusionText, PAGE.contentWidth);
  doc.text(conclusionLines, PAGE.margin, y);
  y += conclusionLines.length * 5 + 8;
  
  // 异常项目汇总表
  y = drawSectionTitle(doc, '异常项目汇总', y, '2');
  
  if (data.issues.length > 0) {
    const issueData = data.issues.map((issue, index) => [
      (index + 1).toString(),
      issue.name,
      `${issue.angle.toFixed(1)}°`,
      issue.referenceRange || '正常范围',
      getSeverityText(issue.severity) + ' ' + getSeverityMark(issue.severity),
    ]);
    
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: '序号', styles: { halign: 'center', fontSize: 9 } },
        { content: '检测项目', styles: { halign: 'center', fontSize: 9 } },
        { content: '检测值', styles: { halign: 'center', fontSize: 9 } },
        { content: '参考范围', styles: { halign: 'center', fontSize: 9 } },
        { content: '状态', styles: { halign: 'center', fontSize: 9 } },
      ]],
      body: issueData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.background,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 45, halign: 'center' },
        4: { cellWidth: 40, halign: 'center' },
      },
      didParseCell: function(data) {
        // 状态列着色
        if (data.column.index === 4 && data.section === 'body') {
          const text = data.cell.raw as string;
          if (text.includes('重度')) {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (text.includes('中度')) {
            data.cell.styles.textColor = COLORS.warning;
            data.cell.styles.fontStyle = 'bold';
          } else if (text.includes('轻度')) {
            data.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });
  } else {
    doc.setTextColor(...COLORS.success);
    doc.setFontSize(10);
    doc.text('恭喜！本次检测未发现明显体态异常问题。', PAGE.margin, y);
    y += 10;
  }
  
  drawFooter(doc);

  // ==================== 第4页：详细分析 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '二、体态问题详细分析', y, '3');
  
  // 按严重程度排序
  const sortedIssues = [...data.issues].sort((a, b) => {
    const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });
  
  sortedIssues.forEach((issue, index) => {
    if (y > 230) {
      drawFooter(doc);
      doc.addPage();
      pageNum++;
      y = drawHeader(doc, pageNum, totalPages, reportId);
    }
    
    // 问题卡片
    const cardHeight = 28;
    const severityColors: Record<string, [number, number, number]> = {
      severe: COLORS.danger,
      moderate: COLORS.warning,
      mild: COLORS.success,
    };
    
    // 左侧状态条
    doc.setFillColor(...(severityColors[issue.severity] || COLORS.success));
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
    doc.text(issue.name, PAGE.margin + 16, y + 7);
    
    // 严重程度标签
    const severityBgColors: Record<string, [number, number, number]> = {
      severe: COLORS.danger,
      moderate: COLORS.warning,
      mild: COLORS.success,
    };
    doc.setFillColor(...(severityBgColors[issue.severity] || COLORS.success));
    doc.roundedRect(PAGE.width - PAGE.margin - 25, y + 3, 22, 6, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(getSeverityText(issue.severity), PAGE.width - PAGE.margin - 14, y + 7, { align: 'center' });
    
    // 检测值和参考范围
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`检测值: ${issue.angle.toFixed(1)}°`, PAGE.margin + 16, y + 14);
    doc.text(`参考范围: ${issue.referenceRange || '正常范围'}`, PAGE.margin + 60, y + 14);
    
    // 描述
    if (issue.description) {
      const descText = (issue.description || '').substring(0, 60);
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(8);
      doc.text(descText, PAGE.margin + 8, y + 21, { maxWidth: PAGE.contentWidth - 20 });
    }
    
    y += cardHeight + 4;
  });
  
  drawFooter(doc);

  // ==================== 第5页：肌肉与风险评估 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  // 肌肉功能评估
  y = drawSectionTitle(doc, '三、肌肉功能评估', y, '4');
  
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    const muscleData: string[][] = [];
    
    const maxLen = Math.max(data.muscles.tight.length, data.muscles.weak.length);
    for (let i = 0; i < maxLen; i++) {
      muscleData.push([
        data.muscles.tight[i] || '-',
        data.muscles.weak[i] || '-',
      ]);
    }
    
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: '紧张肌肉', styles: { fillColor: COLORS.danger, halign: 'center' } },
        { content: '无力肌肉', styles: { fillColor: COLORS.primary, halign: 'center' } },
      ]],
      body: muscleData,
      theme: 'grid',
      headStyles: {
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: COLORS.background,
      },
      columnStyles: {
        0: { cellWidth: PAGE.contentWidth / 2, textColor: COLORS.danger },
        1: { cellWidth: PAGE.contentWidth / 2, textColor: COLORS.primary },
      },
    });
    
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;
  }
  
  // 健康风险评估
  y = drawSectionTitle(doc, '四、健康风险评估', y, '5');
  
  if (data.risks && data.risks.length > 0) {
    const riskData = data.risks.map((risk) => [
      risk.category,
      risk.condition,
      getRiskText(risk.risk),
      risk.icdCode || '-',
    ]);
    
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: '风险类别', styles: { halign: 'center', fontSize: 9 } },
        { content: '潜在健康问题', styles: { halign: 'center', fontSize: 9 } },
        { content: '风险等级', styles: { halign: 'center', fontSize: 9 } },
        { content: '参考编码', styles: { halign: 'center', fontSize: 9 } },
      ]],
      body: riskData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: COLORS.background,
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' },
      },
      didParseCell: function(data) {
        if (data.column.index === 2 && data.section === 'body') {
          const text = data.cell.raw as string;
          if (text.includes('高')) {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (text.includes('中')) {
            data.cell.styles.textColor = COLORS.warning;
          } else {
            data.cell.styles.textColor = COLORS.success;
          }
        }
      },
    });
  }
  
  drawFooter(doc);

  // ==================== 第6页：预测与建议 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  // 健康发展预测
  y = drawSectionTitle(doc, '五、健康发展预测', y, '6');
  
  if (data.healthPrediction) {
    const predictionData = [
      ['短期（1-3个月）', data.healthPrediction.shortTerm || '建议定期复查'],
      ['中期（6-12个月）', data.healthPrediction.midTerm || '持续关注体态变化'],
      ['长期（3年以上）', data.healthPrediction.longTerm || '预防慢性疼痛发生'],
    ];
    
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin },
      head: [[
        { content: '预测周期', styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 9 } },
        { content: '发展预测', styles: { fillColor: COLORS.primary, halign: 'center', fontSize: 9 } },
      ]],
      body: predictionData,
      theme: 'grid',
      headStyles: {
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 140 },
      },
    });
    
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 30;
  }
  
  // 改善方案
  y = drawSectionTitle(doc, '六、改善方案与建议', y, '7');
  
  if (data.recommendations) {
    // 立即行动建议
    if (data.recommendations.immediate?.length) {
      doc.setFillColor(...COLORS.dangerLight);
      doc.rect(PAGE.margin, y, PAGE.contentWidth, 6, 'F');
      doc.setTextColor(...COLORS.danger);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('立即行动（建议即刻执行）', PAGE.margin + 3, y + 4.5);
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
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('短期计划（1-4周内执行）', PAGE.margin + 3, y + 4.5);
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
      doc.text('长期策略（持续执行1-3个月）', PAGE.margin + 3, y + 4.5);
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
  
  drawFooter(doc);

  // ==================== 第7页：中医分析 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '七、中医体质分析', y, '8');
  
  if (data.tcmAnalysis) {
    // 体质判断
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor(...COLORS.warningLight);
      doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 15, 2, 2, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('体质判断', PAGE.margin + 5, y + 5);
      doc.setTextColor(120, 53, 15);
      doc.setFontSize(14);
      doc.text(data.tcmAnalysis.constitution, PAGE.margin + 5, y + 11);
      y += 18;
    }
    
    // 经络状态
    if (data.tcmAnalysis.meridians?.length) {
      const meridianData = data.tcmAnalysis.meridians.map(m => [
        m.name,
        m.status,
        (m.reason || '').substring(0, 30),
      ]);
      
      autoTable(doc, {
        startY: y,
        margin: { left: PAGE.margin },
        head: [[
          { content: '经络名称', styles: { halign: 'center' } },
          { content: '状态', styles: { halign: 'center' } },
          { content: '分析说明', styles: { halign: 'center' } },
        ]],
        body: meridianData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.danger,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
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
      doc.setTextColor(...COLORS.accent);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('穴位调理建议', PAGE.margin, y);
      y += 6;
      
      data.tcmAnalysis.acupoints.slice(0, 4).forEach((a, i) => {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${i + 1}. ${a.name}（${a.location}）：${a.benefit}`, PAGE.margin + 5, y);
        y += 5;
      });
    }
  }
  
  drawFooter(doc);

  // ==================== 第8页：附录与签名 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '八、附录与参考标准', y, '9');
  
  // 参考标准表
  const refData = [
    ['头前伸角度', '< 10°', '颈胸角正常范围'],
    ['肩部倾斜', '< 2°', '双肩高度差'],
    ['骨盆前倾角', '5-15°', '髂前上棘与髂后上棘连线角度'],
    ['膝关节角度', '170-180°', '膝关节伸展角度'],
    ['脊柱对齐度', '> 90%', '脊柱侧弯程度评估'],
    ['肩胛骨位置', '对称', '肩胛骨内侧缘距脊柱距离'],
  ];
  
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin },
    head: [[
      { content: '评估指标', styles: { halign: 'center' } },
      { content: '正常参考范围', styles: { halign: 'center' } },
      { content: '说明', styles: { halign: 'center' } },
    ]],
    body: refData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: COLORS.background,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 45 },
      2: { cellWidth: 85 },
    },
  });
  
  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : y + 50;
  
  // 签名区域
  y = drawSectionTitle(doc, '报告审核', y, '10');
  
  // 签名框
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 40);
  
  // 分隔线
  doc.line(PAGE.margin + PAGE.contentWidth / 3, y, PAGE.margin + PAGE.contentWidth / 3, y + 40);
  doc.line(PAGE.margin + PAGE.contentWidth * 2 / 3, y, PAGE.margin + PAGE.contentWidth * 2 / 3, y + 40);
  
  // 报告生成
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text('报告生成', PAGE.margin + PAGE.contentWidth / 6, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('AI体态评估系统', PAGE.margin + PAGE.contentWidth / 6, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.text(formatDateTime(new Date()), PAGE.margin + PAGE.contentWidth / 6, y + 28, { align: 'center' });
  
  // 技术审核
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text('技术审核', PAGE.margin + PAGE.contentWidth / 2, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('____________', PAGE.margin + PAGE.contentWidth / 2, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.text('审核日期：________', PAGE.margin + PAGE.contentWidth / 2, y + 28, { align: 'center' });
  
  // 报告签发
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.text('报告签发', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 8, { align: 'center' });
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.text('____________', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.text('签发日期：________', PAGE.margin + PAGE.contentWidth * 5 / 6, y + 28, { align: 'center' });
  
  y += 50;
  
  // 重要声明
  doc.setFillColor(...COLORS.warningLight);
  doc.rect(PAGE.margin, y, PAGE.contentWidth, 25, 'F');
  
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('重要声明', PAGE.margin + 5, y + 6);
  
  doc.setTextColor(120, 53, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const disclaimerText = '本报告由AI体态评估系统自动生成，评估结果仅供参考，不作为临床诊断依据。' +
    '如有身体不适或持续疼痛，请及时就医。本报告有效期为30天，建议定期复查跟踪改善效果。';
  doc.text(disclaimerText, PAGE.margin + 5, y + 12, { maxWidth: PAGE.contentWidth - 10 });
  
  // 联系方式
  y += 30;
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(8);
  doc.text('如有疑问，请联系专业康复师或医师进行咨询。', PAGE.width / 2, y, { align: 'center' });
  
  drawFooter(doc);
  
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
  return `体态评估报告-${date}-评分${score}.pdf`;
}
