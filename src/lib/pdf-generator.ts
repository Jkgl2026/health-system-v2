/**
 * PDF报告生成器 - 中文版
 * 使用Canvas渲染中文内容为图片，解决jsPDF不支持中文的问题
 */

import { jsPDF } from 'jspdf';
import { ANGLE_NAMES_CN } from './pose-detection-enhanced';

// 报告数据接口
export interface ReportData {
  // 基本信息
  userName?: string;
  assessmentDate: string;
  
  // 评估结果
  overallScore: number;
  grade: string;
  
  // 检测到的问题
  issues: {
    name: string;
    severity: string;
    angle: number;
    description?: string;
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
  }[];
  
  // 建议
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  
  // 中医分析
  tcmAnalysis?: {
    constitution: string;
    constitutionType?: string;
    meridians: string[];
    acupoints: string[];
    meridianSymptoms?: string[];
    acupointContraindications?: string[];
    daoyinSuggestions?: string[];
    dietSuggestions?: string[];
    seasonalAdvice?: string[];
    dailySchedule?: string[];
  };
  
  // 训练方案
  trainingPlan?: {
    phases: {
      name: string;
      duration: string;
      focus: string;
      weeklyPlan: {
        week: number;
        sessions: {
          day: string;
          exercises: string[];
        }[];
      }[];
    }[];
  };
  
  // 图片（Base64）
  images?: {
    front?: string;
    left?: string;
    right?: string;
    back?: string;
  };
}

// 颜色配置
const COLORS = {
  primary: '#6366f1', // indigo
  secondary: '#22c55e', // green
  warning: '#eab308', // yellow
  danger: '#ef4444', // red
  text: '#1f2937', // gray-800
  lightText: '#6b7280', // gray-500
  background: '#f9fafb', // gray-50
  tcm: '#8b4513', // saddlebrown
};

/**
 * 创建Canvas并渲染文本
 */
function createTextCanvas(
  text: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    width?: number;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
  } = {}
): HTMLCanvasElement {
  const {
    fontSize = 14,
    fontFamily = 'Noto Sans SC, Microsoft YaHei, PingFang SC, sans-serif',
    color = '#1f2937',
    backgroundColor = 'transparent',
    bold = false,
    width = 500,
    lineHeight = 1.4,
    align = 'left',
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 设置字体
  const fontWeight = bold ? 'bold' : 'normal';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // 计算文本高度
  const lines = wrapText(ctx, text, width - 20);
  const height = lines.length * fontSize * lineHeight + 20;

  // 设置canvas尺寸 (2x for retina)
  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);

  // 绘制背景
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // 绘制文字
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  
  lines.forEach((line, index) => {
    const x = align === 'center' ? width / 2 : align === 'right' ? width - 10 : 10;
    ctx.textAlign = align;
    ctx.fillText(line, x, 10 + index * fontSize * lineHeight);
  });

  return canvas;
}

/**
 * 文本换行处理
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
    if (currentLine) {
      lines.push(currentLine);
    }
  });
  
  return lines;
}

/**
 * Canvas转Base64
 */
function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * 生成PDF报告
 */
export async function generatePDFReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  
  let y = margin;
  let pageNum = 1;
  
  // ==================== 封面 ====================
  // 标题背景
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 70, 'F');
  
  // 标题（使用Canvas渲染中文）
  const titleCanvas = createTextCanvas('AI 体态评估报告', {
    fontSize: 26,
    color: '#ffffff',
    bold: true,
    width: 400,
    align: 'center',
  });
  const titleImg = canvasToBase64(titleCanvas);
  doc.addImage(titleImg, 'PNG', 0, 15, pageWidth, 20);
  
  const subtitleCanvas = createTextCanvas('专业体态分析与改善方案', {
    fontSize: 14,
    color: '#e0e7ff',
    width: 400,
    align: 'center',
  });
  const subtitleImg = canvasToBase64(subtitleCanvas);
  doc.addImage(subtitleImg, 'PNG', 0, 38, pageWidth, 12);
  
  // 日期
  const dateCanvas = createTextCanvas(`评估日期: ${data.assessmentDate}`, {
    fontSize: 12,
    color: '#c7d2fe',
    width: 400,
    align: 'center',
  });
  const dateImg = canvasToBase64(dateCanvas);
  doc.addImage(dateImg, 'PNG', 0, 52, pageWidth, 10);
  
  if (data.userName) {
    const userCanvas = createTextCanvas(`用户: ${data.userName}`, {
      fontSize: 12,
      color: '#c7d2fe',
      width: 400,
      align: 'center',
    });
    const userImg = canvasToBase64(userCanvas);
    doc.addImage(userImg, 'PNG', 0, 62, pageWidth, 10);
  }
  
  y = 85;
  
  // ==================== 评分区域 ====================
  // 评分卡片背景
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 45, 3, 3);
  
  // 综合评分标签
  const scoreLabelCanvas = createTextCanvas('综合评分', {
    fontSize: 12,
    bold: true,
    width: 100,
  });
  doc.addImage(canvasToBase64(scoreLabelCanvas), 'PNG', margin + 5, y + 5, 30, 8);
  
  // 评分数字
  const scoreColor = data.overallScore >= 80 ? COLORS.secondary : 
                     data.overallScore >= 60 ? COLORS.warning : COLORS.danger;
  const scoreCanvas = createTextCanvas(`${data.overallScore}`, {
    fontSize: 32,
    bold: true,
    color: scoreColor,
    width: 80,
  });
  doc.addImage(canvasToBase64(scoreCanvas), 'PNG', margin + 15, y + 18, 25, 20);
  
  const scoreUnitCanvas = createTextCanvas('/ 100', {
    fontSize: 12,
    color: COLORS.lightText,
    width: 50,
  });
  doc.addImage(canvasToBase64(scoreUnitCanvas), 'PNG', margin + 45, y + 30, 20, 8);
  
  // 等级卡片
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 45, 3, 3);
  
  const gradeLabelCanvas = createTextCanvas('评估等级', {
    fontSize: 12,
    bold: true,
    width: 100,
  });
  doc.addImage(canvasToBase64(gradeLabelCanvas), 'PNG', margin + contentWidth / 2 + 10, y + 5, 30, 8);
  
  const gradeCanvas = createTextCanvas(data.grade, {
    fontSize: 26,
    bold: true,
    color: scoreColor,
    width: 50,
  });
  doc.addImage(canvasToBase64(gradeCanvas), 'PNG', margin + contentWidth / 2 + 15, y + 18, 20, 18);
  
  const gradeTextCanvas = createTextCanvas(`(${getGradeText(data.grade)})`, {
    fontSize: 10,
    color: COLORS.text,
    width: 60,
  });
  doc.addImage(canvasToBase64(gradeTextCanvas), 'PNG', margin + contentWidth / 2 + 40, y + 28, 25, 8);
  
  y += 60;
  
  // ==================== 检测到的问题 ====================
  addSection(doc, '检测到的体态问题', y);
  y += 12;
  
  if (data.issues.length > 0) {
    data.issues.forEach((issue, index) => {
      if (y > pageHeight - 45) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = margin;
      }
      
      // 问题卡片背景
      const severityColor = issue.severity === 'severe' ? COLORS.danger :
                           issue.severity === 'moderate' ? COLORS.warning : COLORS.secondary;
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2);
      
      // 严重程度指示条
      doc.setFillColor(severityColor);
      doc.roundedRect(margin, y, 4, 18, 2, 2);
      
      // 问题名称
      const issueNameCanvas = createTextCanvas(`${index + 1}. ${issue.name}`, {
        fontSize: 10,
        bold: true,
        width: 300,
      });
      doc.addImage(canvasToBase64(issueNameCanvas), 'PNG', margin + 6, y + 3, 60, 7);
      
      // 严重程度和角度
      const issueDetailCanvas = createTextCanvas(
        `严重程度: ${getSeverityText(issue.severity)} | 角度: ${issue.angle.toFixed(1)}°`,
        { fontSize: 9, color: COLORS.lightText, width: 300 }
      );
      doc.addImage(canvasToBase64(issueDetailCanvas), 'PNG', margin + 6, y + 10, 80, 6);
      
      y += 22;
    });
  } else {
    const noIssueCanvas = createTextCanvas('未检测到明显的体态问题！', {
      fontSize: 11,
      color: COLORS.secondary,
      width: 300,
    });
    doc.addImage(canvasToBase64(noIssueCanvas), 'PNG', margin + 5, y, 100, 8);
    y += 15;
  }
  
  y += 10;
  
  // ==================== 角度数据 ====================
  if (data.angles && Object.keys(data.angles).length > 0) {
    if (y > pageHeight - 60) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '关节角度测量数据', y);
    y += 12;
    
    const angleEntries = Object.entries(data.angles).slice(0, 12);
    const colWidth = contentWidth / 2;
    
    angleEntries.forEach(([key, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * colWidth;
      const currentY = y + row * 10;
      
      if (currentY > pageHeight - 25) return;
      
      const angleName = ANGLE_NAMES_CN[key] || key;
      const angleCanvas = createTextCanvas(`${angleName}: ${value.toFixed(1)}°`, {
        fontSize: 9,
        width: 150,
      });
      doc.addImage(canvasToBase64(angleCanvas), 'PNG', x + 2, currentY, 80, 7);
    });
    
    y += Math.ceil(angleEntries.length / 2) * 10 + 15;
  }
  
  // ==================== 肌肉分析 ====================
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    if (y > pageHeight - 70) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '肌肉功能分析', y);
    y += 12;
    
    const tightCount = data.muscles.tight.length;
    const weakCount = data.muscles.weak.length;
    const cardHeight = 15 + Math.max(tightCount, weakCount) * 7;
    
    // 紧张肌肉卡片
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin, y, contentWidth / 2 - 5, cardHeight, 2, 2);
    
    const tightLabelCanvas = createTextCanvas('紧张肌肉', {
      fontSize: 11,
      bold: true,
      color: '#b91c1c',
      width: 80,
    });
    doc.addImage(canvasToBase64(tightLabelCanvas), 'PNG', margin + 3, y + 3, 25, 8);
    
    data.muscles.tight.slice(0, 5).forEach((m, i) => {
      const muscleCanvas = createTextCanvas(`• ${m}`, {
        fontSize: 9,
        width: 150,
      });
      doc.addImage(canvasToBase64(muscleCanvas), 'PNG', margin + 3, y + 12 + i * 7, 75, 6);
    });
    
    // 无力肌肉卡片
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, cardHeight, 2, 2);
    
    const weakLabelCanvas = createTextCanvas('无力肌肉', {
      fontSize: 11,
      bold: true,
      color: '#1e40af',
      width: 80,
    });
    doc.addImage(canvasToBase64(weakLabelCanvas), 'PNG', margin + contentWidth / 2 + 8, y + 3, 25, 8);
    
    data.muscles.weak.slice(0, 5).forEach((m, i) => {
      const muscleCanvas = createTextCanvas(`• ${m}`, {
        fontSize: 9,
        width: 150,
      });
      doc.addImage(canvasToBase64(muscleCanvas), 'PNG', margin + contentWidth / 2 + 8, y + 12 + i * 7, 75, 6);
    });
    
    y += cardHeight + 15;
  }
  
  // ==================== 健康风险 ====================
  if (data.risks && data.risks.length > 0) {
    if (y > pageHeight - 50) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '健康风险评估', y);
    y += 12;
    
    data.risks.slice(0, 5).forEach((risk) => {
      if (y > pageHeight - 25) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = margin;
      }
      
      const riskColor = risk.risk === 'high' ? COLORS.danger :
                       risk.risk === 'medium' ? COLORS.warning : COLORS.secondary;
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2);
      
      doc.setFillColor(riskColor);
      doc.roundedRect(margin, y, 3, 14, 2, 2);
      
      const riskTextCanvas = createTextCanvas(
        `${getCategoryText(risk.category)}: ${risk.condition}`,
        { fontSize: 9, width: 250 }
      );
      doc.addImage(canvasToBase64(riskTextCanvas), 'PNG', margin + 5, y + 3, 80, 7);
      
      const riskLevelCanvas = createTextCanvas(getRiskText(risk.risk), {
        fontSize: 9,
        bold: true,
        color: riskColor,
        width: 50,
      });
      doc.addImage(canvasToBase64(riskLevelCanvas), 'PNG', margin + contentWidth - 30, y + 3, 25, 7);
      
      y += 17;
    });
  }
  
  // ==================== 改善建议 ====================
  if (data.recommendations) {
    if (y > pageHeight - 80) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '改善建议', y);
    y += 12;
    
    // 立即建议
    if (data.recommendations.immediate && data.recommendations.immediate.length > 0) {
      const immediateLabelCanvas = createTextCanvas('立即行动:', {
        fontSize: 10,
        bold: true,
        color: COLORS.danger,
        width: 100,
      });
      doc.addImage(canvasToBase64(immediateLabelCanvas), 'PNG', margin, y, 25, 7);
      y += 8;
      
      data.recommendations.immediate.slice(0, 3).forEach((rec) => {
        const recCanvas = createTextCanvas(`• ${rec.substring(0, 50)}`, {
          fontSize: 9,
          width: 300,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', margin + 3, y, 150, 6);
        y += 7;
      });
      y += 5;
    }
    
    // 短期建议
    if (data.recommendations.shortTerm && data.recommendations.shortTerm.length > 0) {
      const shortLabelCanvas = createTextCanvas('短期计划 (1-4周):', {
        fontSize: 10,
        bold: true,
        color: COLORS.warning,
        width: 120,
      });
      doc.addImage(canvasToBase64(shortLabelCanvas), 'PNG', margin, y, 40, 7);
      y += 8;
      
      data.recommendations.shortTerm.slice(0, 3).forEach((rec) => {
        const recCanvas = createTextCanvas(`• ${rec.substring(0, 50)}`, {
          fontSize: 9,
          width: 300,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', margin + 3, y, 150, 6);
        y += 7;
      });
      y += 5;
    }
    
    // 长期建议
    if (data.recommendations.longTerm && data.recommendations.longTerm.length > 0) {
      const longLabelCanvas = createTextCanvas('长期策略 (1-3个月):', {
        fontSize: 10,
        bold: true,
        color: COLORS.secondary,
        width: 130,
      });
      doc.addImage(canvasToBase64(longLabelCanvas), 'PNG', margin, y, 50, 7);
      y += 8;
      
      data.recommendations.longTerm.slice(0, 3).forEach((rec) => {
        const recCanvas = createTextCanvas(`• ${rec.substring(0, 50)}`, {
          fontSize: 9,
          width: 300,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', margin + 3, y, 150, 6);
        y += 7;
      });
    }
  }
  
  // ==================== 页脚 ====================
  addPageFooter(doc, pageNum);
  
  // 生成Blob
  return doc.output('blob');
}

// 添加章节标题
function addSection(doc: jsPDF, title: string, y: number) {
  // 标题背景
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(15, y, 180, 8, 2, 2);
  
  // 标题文字
  const titleCanvas = createTextCanvas(title, {
    fontSize: 12,
    bold: true,
    color: '#ffffff',
    width: 300,
  });
  doc.addImage(canvasToBase64(titleCanvas), 'PNG', 18, y + 1, 80, 6);
}

// 添加页脚
function addPageFooter(doc: jsPDF, pageNum: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const footerCanvas = createTextCanvas(`AI 体态评估系统生成 | 第 ${pageNum} 页`, {
    fontSize: 8,
    color: '#9ca3af',
    width: 200,
    align: 'center',
  });
  doc.addImage(canvasToBase64(footerCanvas), 'PNG', 0, pageHeight - 12, pageWidth, 6);
}

// 辅助函数
function getGradeText(grade: string): string {
  const texts: Record<string, string> = {
    'A': '优秀',
    'B': '良好',
    'C': '一般',
    'D': '需改善',
    'E': '需重视',
  };
  return texts[grade] || '未知';
}

function getSeverityText(severity: string): string {
  const texts: Record<string, string> = {
    'mild': '轻度',
    'moderate': '中度',
    'severe': '重度',
  };
  return texts[severity] || '无';
}

function getRiskText(risk: string): string {
  const texts: Record<string, string> = {
    'high': '高风险',
    'medium': '中风险',
    'low': '低风险',
  };
  return texts[risk] || '未知';
}

function getCategoryText(category: string): string {
  const texts: Record<string, string> = {
    'skeletal': '骨骼系统',
    'neurological': '神经系统',
    'circulatory': '循环系统',
    'respiratory': '呼吸系统',
    'digestive': '消化系统',
    'muscular': '肌肉系统',
    'postural': '姿态系统',
  };
  return texts[category] || category;
}

// 下载PDF
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

// 生成报告文件名
export function generateReportFilename(score: number): string {
  const date = new Date().toISOString().split('T')[0];
  return `体态评估报告-${date}-评分${score}.pdf`;
}
