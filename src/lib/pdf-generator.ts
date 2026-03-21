/**
 * PDF报告生成器 - 专业版
 * 优化排版：封面设计、表格化数据、卡片样式、统一字体
 */

import { jsPDF } from 'jspdf';

// ==================== 类型定义 ====================

export interface ReportData {
  // 基本信息
  userName?: string;
  assessmentDate: string;
  
  // 评估结果
  overallScore: number;
  grade: string;
  
  // 检测到的问题
  issues: {
    type: string;
    name: string;
    severity: string;
    angle: number;
    description?: string;
    cause?: string;
    impact?: string;
    recommendation?: string;
  }[];
  
  // 角度数据
  angles: Record<string, number>;
  
  // 肌肉分析
  muscles?: {
    tight: string[];
    weak: string[];
  };
  
  // 健康风险
  risks?: {
    category: string;
    risk: string;
    condition: string;
    cause?: string;
    prevention?: string;
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
    }[];
  };
  
  // 中医分析
  tcmAnalysis?: {
    constitution: string;
    constitutionType?: string;
    constitutionFeatures?: string[];
    meridians?: {
      name: string;
      status: string;
      reason: string;
    }[];
    acupoints?: {
      name: string;
      location: string;
      benefit: string;
    }[];
    dietSuggestions?: string[];
  };
  
  // 训练方案
  trainingPlan?: {
    phases: {
      name: string;
      duration: string;
      focus: string;
      exercises: string[];
    }[];
  };
  
  // 图片
  images?: {
    front?: string;
    left?: string;
    right?: string;
    back?: string;
  };
}

// ==================== 样式配置 ====================

const COLORS = {
  // 主色调
  primary: '#1a56db',      // 主蓝色
  primaryLight: '#dbeafe', // 浅蓝背景
  
  // 状态色
  success: '#059669',      // 绿色
  successLight: '#d1fae5',
  warning: '#d97706',      // 橙色
  warningLight: '#fef3c7',
  danger: '#dc2626',       // 红色
  dangerLight: '#fee2e2',
  
  // 中性色
  text: '#111827',         // 主文字
  textSecondary: '#6b7280', // 次要文字
  border: '#e5e7eb',       // 边框
  background: '#f9fafb',   // 背景
  white: '#ffffff',
};

const PAGE = {
  width: 210,    // A4 宽度 mm
  height: 297,   // A4 高度 mm
  margin: 15,    // 页边距
  contentWidth: 180, // 内容宽度
};

// ==================== 工具函数 ====================

/**
 * 创建 Canvas 渲染中文文本
 */
function renderText(
  text: string,
  options: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    width?: number;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
    padding?: number;
  } = {}
): HTMLCanvasElement {
  const {
    fontSize = 10,
    fontWeight = 'normal',
    color = COLORS.text,
    backgroundColor,
    width = 360,
    lineHeight = 1.5,
    align = 'left',
    padding = 0,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const fontFamily = '"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const lines = wrapText(ctx, text, width - padding * 2);
  const height = lines.length * fontSize * lineHeight + padding * 2;

  canvas.width = width * 2;
  canvas.height = Math.max(height * 2, 2);
  ctx.scale(2, 2);

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';

  lines.forEach((line, index) => {
    const x = align === 'center' ? width / 2 : align === 'right' ? width - padding : padding;
    ctx.textAlign = align;
    ctx.fillText(line, x, padding + index * fontSize * lineHeight);
  });

  return canvas;
}

/**
 * 文本换行
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach(paragraph => {
    if (paragraph === '') {
      lines.push('');
      return;
    }

    let currentLine = '';
    for (const char of paragraph) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  });

  return lines;
}

/**
 * Canvas 转 Base64
 */
function toBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * 获取 Canvas 高度 (mm)
 */
function getCanvasHeight(canvas: HTMLCanvasElement): number {
  return (canvas.height / 2) * 0.264583;
}

/**
 * 添加文本并返回新 Y 坐标
 */
function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: Parameters<typeof renderText>[1] & { maxWidth?: number } = {}
): number {
  const { maxWidth = 360, ...renderOptions } = options;
  const canvas = renderText(text, { width: maxWidth, ...renderOptions });
  const height = getCanvasHeight(canvas);
  doc.addImage(toBase64(canvas), 'PNG', x, y, maxWidth * 0.264583, height);
  return y + height;
}

/**
 * 绘制章节标题
 */
function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  // 标题文字
  const titleCanvas = renderText(title, {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    width: 360,
  });
  const titleHeight = getCanvasHeight(titleCanvas);
  doc.addImage(toBase64(titleCanvas), 'PNG', PAGE.margin, y, 180, titleHeight);

  // 下划线
  const lineY = y + titleHeight + 2;
  doc.setDrawColor(COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(PAGE.margin, lineY, PAGE.margin + 40, lineY);

  return lineY + 6;
}

/**
 * 绘制数据表格
 */
function drawDataTable(
  doc: jsPDF,
  data: { label: string; value: string; color?: string }[],
  x: number,
  y: number,
  colWidth: number = 60
): number {
  const rowHeight = 12;
  const headerHeight = 10;

  // 表头背景
  doc.setFillColor(COLORS.primaryLight);
  doc.roundedRect(x, y, colWidth * data.length, headerHeight, 2, 2);

  // 表头文字
  data.forEach((item, i) => {
    const labelCanvas = renderText(item.label, {
      fontSize: 9,
      fontWeight: 'bold',
      color: COLORS.primary,
      width: colWidth * 3.78,
      align: 'center',
    });
    doc.addImage(toBase64(labelCanvas), 'PNG', x + i * colWidth, y + 2, colWidth, 6);
  });

  // 数据行
  const dataY = y + headerHeight + 2;
  data.forEach((item, i) => {
    const valueCanvas = renderText(item.value, {
      fontSize: 14,
      fontWeight: 'bold',
      color: item.color || COLORS.text,
      width: colWidth * 3.78,
      align: 'center',
    });
    doc.addImage(toBase64(valueCanvas), 'PNG', x + i * colWidth, dataY, colWidth, 10);
  });

  return dataY + rowHeight + 5;
}

/**
 * 绘制问题卡片
 */
function drawIssueCard(
  doc: jsPDF,
  issue: ReportData['issues'][0],
  index: number,
  y: number
): number {
  const cardHeight = 35;
  const leftBarWidth = 4;

  // 确定颜色
  const severityColors: Record<string, { bar: string; bg: string }> = {
    severe: { bar: COLORS.danger, bg: COLORS.dangerLight },
    moderate: { bar: COLORS.warning, bg: COLORS.warningLight },
    mild: { bar: COLORS.success, bg: COLORS.successLight },
  };
  const colors = severityColors[issue.severity] || severityColors.mild;

  // 卡片背景
  doc.setFillColor(COLORS.white);
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, cardHeight, 3, 3);

  // 左侧颜色条
  doc.setFillColor(colors.bar);
  doc.roundedRect(PAGE.margin, y, leftBarWidth, cardHeight, 3, 3);

  // 问题标题
  const severityText = { severe: '重度', moderate: '中度', mild: '轻度' }[issue.severity] || '无';
  const titleText = `${index + 1}. ${issue.name} (${severityText})`;
  y = addText(doc, titleText, PAGE.margin + leftBarWidth + 3, y + 3, {
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 340,
  });

  // 测量角度
  y = addText(doc, `测量角度: ${issue.angle.toFixed(1)}°`, PAGE.margin + leftBarWidth + 3, y, {
    fontSize: 9,
    color: COLORS.textSecondary,
    maxWidth: 340,
  });

  // 原因
  if (issue.cause) {
    y = addText(doc, `原因: ${issue.cause.substring(0, 40)}`, PAGE.margin + leftBarWidth + 3, y, {
      fontSize: 8,
      color: COLORS.text,
      maxWidth: 340,
    });
  }

  return y + 5;
}

// ==================== 主函数 ====================

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = PAGE.margin;
  let pageNum = 1;

  // ==================== 封面 ====================
  
  // 封面背景渐变效果（用矩形模拟）
  doc.setFillColor(26, 86, 219); // primary blue
  doc.rect(0, 0, PAGE.width, 90, 'F');

  // 标题
  const mainTitleCanvas = renderText('AI 体态评估报告', {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    width: 400,
    align: 'center',
  });
  doc.addImage(toBase64(mainTitleCanvas), 'PNG', 0, 30, PAGE.width, 20);

  // 副标题
  const subtitleCanvas = renderText('专业体态分析与改善方案', {
    fontSize: 14,
    color: '#bfdbfe',
    width: 400,
    align: 'center',
  });
  doc.addImage(toBase64(subtitleCanvas), 'PNG', 0, 55, PAGE.width, 10);

  // 报告编号
  const reportId = `PT-${Date.now().toString(36).toUpperCase()}`;
  const idCanvas = renderText(`报告编号: ${reportId}`, {
    fontSize: 11,
    color: '#93c5fd',
    width: 400,
    align: 'center',
  });
  doc.addImage(toBase64(idCanvas), 'PNG', 0, 72, PAGE.width, 8);

  // 基本信息卡片
  y = 105;
  doc.setFillColor(COLORS.white);
  doc.setDrawColor(COLORS.border);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 30, 4, 4);

  // 评估日期
  y = addText(doc, `评估日期: ${data.assessmentDate}`, PAGE.margin + 8, y + 5, {
    fontSize: 11,
    fontWeight: 'bold',
    maxWidth: 160,
  });

  // 姓名
  if (data.userName) {
    y = addText(doc, `姓名: ${data.userName}`, PAGE.margin + 8, y, {
      fontSize: 11,
      maxWidth: 160,
    });
  }

  y = 145;

  // ==================== 一、综合评估结果 ====================
  
  y = drawSectionTitle(doc, '一、综合评估结果', y);

  // 评分卡片组
  const scoreColor = data.overallScore >= 80 ? COLORS.success :
                     data.overallScore >= 60 ? COLORS.warning : COLORS.danger;
  const gradeText = { A: '优秀', B: '良好', C: '一般', D: '较差', E: '需改善' }[data.grade] || '未知';

  y = drawDataTable(
    doc,
    [
      { label: '综合评分', value: `${data.overallScore}分`, color: scoreColor },
      { label: '评估等级', value: `${data.grade}级 (${gradeText})`, color: scoreColor },
      { label: '问题数量', value: `${data.issues.length}个`, color: COLORS.danger },
    ],
    PAGE.margin,
    y,
    60
  );

  y += 10;

  // ==================== 二、详细问题分析 ====================
  
  y = drawSectionTitle(doc, '二、详细问题分析', y);

  if (data.issues.length > 0) {
    // 按严重程度排序
    const sortedIssues = [...data.issues].sort((a, b) => {
      const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    sortedIssues.slice(0, 6).forEach((issue, index) => {
      if (y > 250) {
        addPageFooter(doc, pageNum, reportId);
        doc.addPage();
        pageNum++;
        y = PAGE.margin;
      }
      y = drawIssueCard(doc, issue, index, y);
    });
  } else {
    y = addText(doc, '未检测到明显的体态问题！', PAGE.margin, y, {
      fontSize: 12,
      color: COLORS.success,
    });
  }

  // ==================== 三、肌肉功能评估 ====================
  
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    if (y > 220) {
      addPageFooter(doc, pageNum, reportId);
      doc.addPage();
      pageNum++;
      y = PAGE.margin;
    }

    y = drawSectionTitle(doc, '三、肌肉功能评估', y);

    const colWidth = 87;
    const cardHeight = 15 + Math.max(data.muscles.tight.length, data.muscles.weak.length) * 5;

    // 紧张肌肉
    doc.setFillColor(COLORS.dangerLight);
    doc.roundedRect(PAGE.margin, y, colWidth, cardHeight, 3, 3);
    y = addText(doc, `紧张肌肉 (${data.muscles.tight.length})`, PAGE.margin + 3, y + 3, {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.danger,
      maxWidth: 280,
    });
    data.muscles.tight.slice(0, 6).forEach(m => {
      y = addText(doc, `• ${m}`, PAGE.margin + 3, y, { fontSize: 8, maxWidth: 280 });
    });

    // 无力肌肉
    y = PAGE.margin + 30; // 重置 y 为第二列
    doc.setFillColor(COLORS.primaryLight);
    doc.roundedRect(PAGE.margin + colWidth + 6, y, colWidth, cardHeight, 3, 3);
    let y2 = addText(doc, `无力肌肉 (${data.muscles.weak.length})`, PAGE.margin + colWidth + 9, y + 3, {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.primary,
      maxWidth: 280,
    });
    data.muscles.weak.slice(0, 6).forEach(m => {
      y2 = addText(doc, `• ${m}`, PAGE.margin + colWidth + 9, y2, { fontSize: 8, maxWidth: 280 });
    });

    y = Math.max(y + cardHeight + 10, y2 + 10);
  }

  // ==================== 四、改善方案 ====================
  
  if (data.recommendations) {
    if (y > 180) {
      addPageFooter(doc, pageNum, reportId);
      doc.addPage();
      pageNum++;
      y = PAGE.margin;
    }

    y = drawSectionTitle(doc, '四、改善方案', y);

    // 立即行动
    if (data.recommendations.immediate?.length) {
      y = addText(doc, '▶ 立即行动', PAGE.margin, y, {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.danger,
        maxWidth: 340,
      });
      data.recommendations.immediate.slice(0, 3).forEach((rec, i) => {
        y = addText(doc, `  ${i + 1}. ${rec}`, PAGE.margin, y, {
          fontSize: 9,
          maxWidth: 340,
        });
      });
      y += 3;
    }

    // 短期计划
    if (data.recommendations.shortTerm?.length) {
      y = addText(doc, '▶ 短期计划 (1-4周)', PAGE.margin, y, {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.warning,
        maxWidth: 340,
      });
      data.recommendations.shortTerm.slice(0, 3).forEach((rec, i) => {
        y = addText(doc, `  ${i + 1}. ${rec}`, PAGE.margin, y, {
          fontSize: 9,
          maxWidth: 340,
        });
      });
      y += 3;
    }

    // 长期策略
    if (data.recommendations.longTerm?.length) {
      y = addText(doc, '▶ 长期策略 (1-3月)', PAGE.margin, y, {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.success,
        maxWidth: 340,
      });
      data.recommendations.longTerm.slice(0, 3).forEach((rec, i) => {
        y = addText(doc, `  ${i + 1}. ${rec}`, PAGE.margin, y, {
          fontSize: 9,
          maxWidth: 340,
        });
      });
    }
  }

  // ==================== 五、中医体质分析 ====================
  
  if (data.tcmAnalysis) {
    if (y > 180) {
      addPageFooter(doc, pageNum, reportId);
      doc.addPage();
      pageNum++;
      y = PAGE.margin;
    }

    y = drawSectionTitle(doc, '五、中医体质分析', y);

    // 体质类型
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor(COLORS.warningLight);
      doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 20, 3, 3);
      y = addText(doc, `体质类型: ${data.tcmAnalysis.constitution}`, PAGE.margin + 5, y + 3, {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#92400e',
        maxWidth: 340,
      });
      y += 25;
    }

    // 经络分析
    if (data.tcmAnalysis.meridians?.length) {
      y = addText(doc, '相关经络:', PAGE.margin, y, {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.danger,
        maxWidth: 340,
      });
      data.tcmAnalysis.meridians.slice(0, 3).forEach(m => {
        y = addText(doc, `  • ${m.name}: ${m.status}`, PAGE.margin, y, {
          fontSize: 9,
          maxWidth: 340,
        });
      });
      y += 3;
    }

    // 食疗建议
    if (data.tcmAnalysis.dietSuggestions?.length) {
      y = addText(doc, '食疗建议:', PAGE.margin, y, {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.warning,
        maxWidth: 340,
      });
      data.tcmAnalysis.dietSuggestions.slice(0, 3).forEach(s => {
        y = addText(doc, `  • ${s}`, PAGE.margin, y, {
          fontSize: 9,
          maxWidth: 340,
        });
      });
    }
  }

  // ==================== 六、总结与建议 ====================
  
  if (y > 200) {
    addPageFooter(doc, pageNum, reportId);
    doc.addPage();
    pageNum++;
    y = PAGE.margin;
  }

  y = drawSectionTitle(doc, '六、总结与建议', y);

  // 评估总结
  const summaryText = `您的体态评估得分为 ${data.overallScore} 分，属于 ${data.grade} 级（${gradeText}）。`;
  y = addText(doc, summaryText, PAGE.margin, y, {
    fontSize: 10,
    maxWidth: 340,
  });

  if (data.issues.length > 0) {
    const severeCount = data.issues.filter(i => i.severity === 'severe').length;
    const moderateCount = data.issues.filter(i => i.severity === 'moderate').length;
    y = addText(doc, `检测到 ${data.issues.length} 个体态问题，其中重度 ${severeCount} 个，中度 ${moderateCount} 个。`, PAGE.margin, y, {
      fontSize: 9,
      color: COLORS.textSecondary,
      maxWidth: 340,
    });
  }

  y += 5;

  // 注意事项卡片
  doc.setFillColor(COLORS.warningLight);
  doc.roundedRect(PAGE.margin, y, PAGE.contentWidth, 25, 3, 3);
  y = addText(doc, '⚠️ 注意事项', PAGE.margin + 5, y + 3, {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
    maxWidth: 340,
  });
  y = addText(doc, '训练过程中如出现疼痛加重，请立即停止并咨询专业人士。', PAGE.margin + 5, y, {
    fontSize: 8,
    color: '#78350f',
    maxWidth: 340,
  });
  y = addText(doc, '本报告仅供参考，不作为医疗诊断依据。建议4周后复查。', PAGE.margin + 5, y, {
    fontSize: 8,
    color: '#78350f',
    maxWidth: 340,
  });

  // 页脚
  addPageFooter(doc, pageNum, reportId);

  return doc.output('blob');
}

/**
 * 添加页脚
 */
function addPageFooter(doc: jsPDF, pageNum: number, reportId: string) {
  const footerY = 285;

  // 分隔线
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, footerY - 3, PAGE.width - PAGE.margin, footerY - 3);

  // 页脚文字
  const footerCanvas = renderText(`AI 体态评估系统  |  报告编号: ${reportId}  |  第 ${pageNum} 页`, {
    fontSize: 8,
    color: COLORS.textSecondary,
    width: 400,
    align: 'center',
  });
  doc.addImage(toBase64(footerCanvas), 'PNG', 0, footerY, PAGE.width, 6);
}

// ==================== 导出函数 ====================

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
