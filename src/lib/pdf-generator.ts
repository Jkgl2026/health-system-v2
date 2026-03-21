/**
 * PDF报告生成器 - 完整版
 * 使用Canvas渲染中文内容为图片，解决jsPDF不支持中文的问题
 * 包含详细的体态分析、健康风险评估、改善方案等
 */

import { jsPDF } from 'jspdf';
import { ANGLE_NAMES_CN, ISSUE_NAMES_CN } from './pose-detection-enhanced';

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

// 颜色配置
const COLORS = {
  primary: '#4f46e5',
  secondary: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#1f2937',
  lightText: '#6b7280',
  background: '#f9fafb',
  white: '#ffffff',
};

// 页面配置
const PAGE_CONFIG = {
  width: 210,  // A4 宽度 mm
  height: 297, // A4 高度 mm
  margin: 15,
  contentWidth: 180, // 210 - 15*2
};

/**
 * 创建Canvas并渲染文本（支持中文）
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
    padding?: number;
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
    padding = 0,
  } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const fontWeight = bold ? 'bold' : 'normal';
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const lines = wrapText(ctx, text, width - padding * 2);
  const height = lines.length * fontSize * lineHeight + padding * 2;

  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);

  if (backgroundColor !== 'transparent') {
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
    if (currentLine) lines.push(currentLine);
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
 * 添加章节标题
 */
function addSection(doc: jsPDF, title: string, y: number, color: string = COLORS.primary): number {
  const titleCanvas = createTextCanvas(title, {
    fontSize: 14,
    bold: true,
    color: '#ffffff',
    backgroundColor: color,
    width: 360,
    padding: 6,
  });

  doc.addImage(canvasToBase64(titleCanvas), 'PNG', 15, y, 180, 10);
  return y + 15;
}

/**
 * 添加文本块
 */
function addTextBlock(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number;
    color?: string;
    bold?: boolean;
    width?: number;
  } = {}
): number {
  const { fontSize = 10, color = COLORS.text, bold = false, width = 360 } = options;

  const canvas = createTextCanvas(text, {
    fontSize,
    color,
    bold,
    width,
  });

  const height = (canvas.height / 2) * 0.264583; // px to mm
  doc.addImage(canvasToBase64(canvas), 'PNG', x, y, width * 0.264583, height);

  return y + height + 2;
}

/**
 * 添加卡片
 */
function addCard(
  doc: jsPDF,
  title: string,
  content: string,
  x: number,
  y: number,
  width: number,
  options: {
    titleColor?: string;
    bgColor?: string;
    borderColor?: string;
  } = {}
): number {
  const { titleColor = COLORS.primary, bgColor = '#ffffff', borderColor = '#e5e7eb' } = options;

  // 背景
  doc.setFillColor(bgColor);
  doc.setDrawColor(borderColor);
  doc.roundedRect(x, y, width, 40, 3, 3);

  // 标题
  const titleCanvas = createTextCanvas(title, {
    fontSize: 11,
    bold: true,
    color: titleColor,
    width: width * 3.78 - 10,
  });
  doc.addImage(canvasToBase64(titleCanvas), 'PNG', x + 3, y + 3, width - 6, 6);

  // 内容
  const contentCanvas = createTextCanvas(content, {
    fontSize: 9,
    color: COLORS.lightText,
    width: width * 3.78 - 10,
  });
  const contentHeight = (contentCanvas.height / 2) * 0.264583;
  doc.addImage(canvasToBase64(contentCanvas), 'PNG', x + 3, y + 12, width - 6, contentHeight);

  return y + 45;
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

  let y = 15;
  let pageNum = 1;

  // ==================== 封面 ====================
  // 标题背景
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, PAGE_CONFIG.width, 80, 'F');

  // 标题
  const titleCanvas = createTextCanvas('AI 体态评估报告', {
    fontSize: 28,
    bold: true,
    color: '#ffffff',
    width: 400,
    align: 'center',
  });
  doc.addImage(canvasToBase64(titleCanvas), 'PNG', 0, 20, PAGE_CONFIG.width, 18);

  // 副标题
  const subtitleCanvas = createTextCanvas('专业体态分析与改善方案', {
    fontSize: 14,
    color: '#e0e7ff',
    width: 400,
    align: 'center',
  });
  doc.addImage(canvasToBase64(subtitleCanvas), 'PNG', 0, 42, PAGE_CONFIG.width, 10);

  // 基本信息
  const infoText = `评估日期: ${data.assessmentDate}${data.userName ? '  |  姓名: ' + data.userName : ''}`;
  const infoCanvas = createTextCanvas(infoText, {
    fontSize: 12,
    color: '#c7d2fe',
    width: 400,
    align: 'center',
  });
  doc.addImage(canvasToBase64(infoCanvas), 'PNG', 0, 58, PAGE_CONFIG.width, 10);

  y = 95;

  // ==================== 综合评估结果 ====================
  y = addSection(doc, '【综合评估结果】', y);

  // 评分卡片组
  const cardWidth = 56;
  const cardGap = 6;

  // 综合评分
  const scoreColor = data.overallScore >= 80 ? COLORS.secondary :
                     data.overallScore >= 60 ? COLORS.warning : COLORS.danger;
  doc.setFillColor('#fef3c7');
  doc.roundedRect(15, y, cardWidth, 35, 3, 3);

  const scoreLabelCanvas = createTextCanvas('综合评分', { fontSize: 10, bold: true, width: 100 });
  doc.addImage(canvasToBase64(scoreLabelCanvas), 'PNG', 17, y + 3, 25, 6);

  const scoreCanvas = createTextCanvas(`${data.overallScore}`, {
    fontSize: 24,
    bold: true,
    color: scoreColor,
    width: 100,
    align: 'center',
  });
  doc.addImage(canvasToBase64(scoreCanvas), 'PNG', 15, y + 12, cardWidth, 15);

  // 评估等级
  doc.setFillColor('#dbeafe');
  doc.roundedRect(15 + cardWidth + cardGap, y, cardWidth, 35, 3, 3);

  const gradeLabelCanvas = createTextCanvas('评估等级', { fontSize: 10, bold: true, width: 100 });
  doc.addImage(canvasToBase64(gradeLabelCanvas), 'PNG', 17 + cardWidth + cardGap, y + 3, 25, 6);

  const gradeText = getGradeText(data.grade);
  const gradeCanvas = createTextCanvas(`${data.grade}级 (${gradeText})`, {
    fontSize: 14,
    bold: true,
    color: scoreColor,
    width: 200,
    align: 'center',
  });
  doc.addImage(canvasToBase64(gradeCanvas), 'PNG', 15 + cardWidth + cardGap, y + 14, cardWidth, 10);

  // 问题数量
  doc.setFillColor('#fee2e2');
  doc.roundedRect(15 + (cardWidth + cardGap) * 2, y, cardWidth, 35, 3, 3);

  const issueLabelCanvas = createTextCanvas('检测问题', { fontSize: 10, bold: true, width: 100 });
  doc.addImage(canvasToBase64(issueLabelCanvas), 'PNG', 17 + (cardWidth + cardGap) * 2, y + 3, 25, 6);

  const severeCount = data.issues.filter(i => i.severity === 'severe').length;
  const issueText = `${data.issues.length} 个问题`;
  const issueCanvas = createTextCanvas(issueText, {
    fontSize: 14,
    bold: true,
    color: COLORS.danger,
    width: 200,
    align: 'center',
  });
  doc.addImage(canvasToBase64(issueCanvas), 'PNG', 15 + (cardWidth + cardGap) * 2, y + 14, cardWidth, 10);

  y += 50;

  // ==================== 详细问题分析 ====================
  y = addSection(doc, '【详细问题分析】', y, COLORS.danger);

  if (data.issues.length > 0) {
    // 按严重程度排序
    const sortedIssues = [...data.issues].sort((a, b) => {
      const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
    });

    sortedIssues.slice(0, 6).forEach((issue, index) => {
      if (y > 260) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = 15;
      }

      const severityColor = issue.severity === 'severe' ? COLORS.danger :
                           issue.severity === 'moderate' ? COLORS.warning : COLORS.secondary;

      // 问题卡片背景
      doc.setFillColor('#ffffff');
      doc.setDrawColor('#e5e7eb');
      doc.roundedRect(15, y, 180, 45, 2, 2);

      // 严重程度指示条
      doc.setFillColor(severityColor);
      doc.roundedRect(15, y, 4, 45, 2, 2);

      // 问题标题
      const issueTitle = `${index + 1}. ${issue.name} (${getSeverityText(issue.severity)})`;
      const issueTitleCanvas = createTextCanvas(issueTitle, {
        fontSize: 11,
        bold: true,
        color: COLORS.text,
        width: 350,
      });
      doc.addImage(canvasToBase64(issueTitleCanvas), 'PNG', 22, y + 3, 90, 7);

      // 测量角度
      const angleText = `测量角度: ${issue.angle.toFixed(1)}°`;
      const angleCanvas = createTextCanvas(angleText, {
        fontSize: 9,
        color: COLORS.lightText,
        width: 350,
      });
      doc.addImage(canvasToBase64(angleCanvas), 'PNG', 22, y + 12, 50, 6);

      // 形成原因
      if (issue.cause || issue.description) {
        const causeText = `原因: ${issue.cause || issue.description || ''}`;
        const causeCanvas = createTextCanvas(causeText.substring(0, 60), {
          fontSize: 8,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(causeCanvas), 'PNG', 22, y + 20, 170, 6);
      }

      // 健康影响
      if (issue.impact) {
        const impactText = `影响: ${issue.impact.substring(0, 50)}`;
        const impactCanvas = createTextCanvas(impactText, {
          fontSize: 8,
          color: COLORS.danger,
          width: 350,
        });
        doc.addImage(canvasToBase64(impactCanvas), 'PNG', 22, y + 28, 170, 6);
      }

      // 改善建议
      if (issue.recommendation) {
        const recText = `建议: ${issue.recommendation.substring(0, 50)}`;
        const recCanvas = createTextCanvas(recText, {
          fontSize: 8,
          color: COLORS.secondary,
          width: 350,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', 22, y + 36, 170, 6);
      }

      y += 50;
    });
  } else {
    const noIssueCanvas = createTextCanvas('未检测到明显的体态问题！', {
      fontSize: 12,
      color: COLORS.secondary,
      width: 300,
    });
    doc.addImage(canvasToBase64(noIssueCanvas), 'PNG', 15, y, 100, 8);
    y += 15;
  }

  // ==================== 肌肉功能评估 ====================
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    if (y > 220) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = 15;
    }

    y = addSection(doc, '【肌肉功能评估】', y, COLORS.primary);

    const tightCount = data.muscles.tight.length;
    const weakCount = data.muscles.weak.length;
    const colWidth = 87;
    const cardHeight = 15 + Math.max(tightCount, weakCount) * 6;

    // 紧张肌肉卡片
    doc.setFillColor('#fee2e2');
    doc.roundedRect(15, y, colWidth, cardHeight, 3, 3);

    const tightLabelCanvas = createTextCanvas(`紧张肌肉 (${tightCount})`, {
      fontSize: 11,
      bold: true,
      color: '#b91c1c',
      width: 200,
    });
    doc.addImage(canvasToBase64(tightLabelCanvas), 'PNG', 18, y + 3, 40, 7);

    data.muscles.tight.slice(0, 8).forEach((m, i) => {
      const muscleCanvas = createTextCanvas(`• ${m}`, { fontSize: 9, width: 300 });
      doc.addImage(canvasToBase64(muscleCanvas), 'PNG', 18, y + 12 + i * 6, 80, 5);
    });

    // 无力肌肉卡片
    doc.setFillColor('#dbeafe');
    doc.roundedRect(15 + colWidth + 6, y, colWidth, cardHeight, 3, 3);

    const weakLabelCanvas = createTextCanvas(`无力肌肉 (${weakCount})`, {
      fontSize: 11,
      bold: true,
      color: '#1e40af',
      width: 200,
    });
    doc.addImage(canvasToBase64(weakLabelCanvas), 'PNG', 18 + colWidth + 6, y + 3, 40, 7);

    data.muscles.weak.slice(0, 8).forEach((m, i) => {
      const muscleCanvas = createTextCanvas(`• ${m}`, { fontSize: 9, width: 300 });
      doc.addImage(canvasToBase64(muscleCanvas), 'PNG', 18 + colWidth + 6, y + 12 + i * 6, 80, 5);
    });

    y += cardHeight + 10;
  }

  // ==================== 健康风险评估 ====================
  if (data.risks && data.risks.length > 0) {
    if (y > 200) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = 15;
    }

    y = addSection(doc, '【健康风险评估】', y, COLORS.warning);

    // 按风险等级分组
    const highRisks = data.risks.filter(r => r.risk === 'high');
    const mediumRisks = data.risks.filter(r => r.risk === 'medium');
    const lowRisks = data.risks.filter(r => r.risk === 'low');

    // 高风险
    if (highRisks.length > 0) {
      const highLabelCanvas = createTextCanvas('⚠️ 高风险预警', {
        fontSize: 11,
        bold: true,
        color: COLORS.danger,
        width: 200,
      });
      doc.addImage(canvasToBase64(highLabelCanvas), 'PNG', 15, y, 40, 7);
      y += 10;

      highRisks.slice(0, 3).forEach((risk) => {
        if (y > 260) {
          addPageFooter(doc, pageNum);
          doc.addPage();
          pageNum++;
          y = 15;
        }

        doc.setFillColor('#fef2f2');
        doc.roundedRect(15, y, 180, 20, 2, 2);

        const riskText = `${getCategoryText(risk.category)}: ${risk.condition}`;
        const riskCanvas = createTextCanvas(riskText, { fontSize: 9, color: COLORS.text, width: 350 });
        doc.addImage(canvasToBase64(riskCanvas), 'PNG', 18, y + 3, 120, 6);

        if (risk.cause) {
          const causeCanvas = createTextCanvas(`原因: ${risk.cause.substring(0, 40)}`, {
            fontSize: 8,
            color: COLORS.lightText,
            width: 350,
          });
          doc.addImage(canvasToBase64(causeCanvas), 'PNG', 18, y + 10, 150, 5);
        }

        y += 23;
      });
    }

    // 中风险
    if (mediumRisks.length > 0) {
      const medLabelCanvas = createTextCanvas('⚡ 中风险提示', {
        fontSize: 11,
        bold: true,
        color: COLORS.warning,
        width: 200,
      });
      doc.addImage(canvasToBase64(medLabelCanvas), 'PNG', 15, y, 40, 7);
      y += 10;

      mediumRisks.slice(0, 2).forEach((risk) => {
        const riskText = `${getCategoryText(risk.category)}: ${risk.condition}`;
        const riskCanvas = createTextCanvas(riskText, { fontSize: 9, color: COLORS.text, width: 350 });
        doc.addImage(canvasToBase64(riskCanvas), 'PNG', 18, y, 150, 6);
        y += 10;
      });
    }

    y += 5;
  }

  // ==================== 改善方案 ====================
  if (data.recommendations) {
    if (y > 180) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = 15;
    }

    y = addSection(doc, '【改善方案】', y, COLORS.secondary);

    // 立即行动
    if (data.recommendations.immediate && data.recommendations.immediate.length > 0) {
      const immLabelCanvas = createTextCanvas('▶ 立即行动（今天开始）', {
        fontSize: 11,
        bold: true,
        color: COLORS.danger,
        width: 300,
      });
      doc.addImage(canvasToBase64(immLabelCanvas), 'PNG', 15, y, 60, 7);
      y += 10;

      data.recommendations.immediate.slice(0, 3).forEach((rec, i) => {
        const recCanvas = createTextCanvas(`${i + 1}. ${rec.substring(0, 50)}`, {
          fontSize: 9,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', 18, y, 165, 6);
        y += 8;
      });
      y += 5;
    }

    // 短期计划
    if (data.recommendations.shortTerm && data.recommendations.shortTerm.length > 0) {
      const shortLabelCanvas = createTextCanvas('▶ 短期计划（1-4周）', {
        fontSize: 11,
        bold: true,
        color: COLORS.warning,
        width: 300,
      });
      doc.addImage(canvasToBase64(shortLabelCanvas), 'PNG', 15, y, 60, 7);
      y += 10;

      data.recommendations.shortTerm.slice(0, 3).forEach((rec, i) => {
        const recCanvas = createTextCanvas(`${i + 1}. ${rec.substring(0, 50)}`, {
          fontSize: 9,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', 18, y, 165, 6);
        y += 8;
      });
      y += 5;
    }

    // 长期策略
    if (data.recommendations.longTerm && data.recommendations.longTerm.length > 0) {
      const longLabelCanvas = createTextCanvas('▶ 长期策略（1-3个月）', {
        fontSize: 11,
        bold: true,
        color: COLORS.secondary,
        width: 300,
      });
      doc.addImage(canvasToBase64(longLabelCanvas), 'PNG', 15, y, 65, 7);
      y += 10;

      data.recommendations.longTerm.slice(0, 3).forEach((rec, i) => {
        const recCanvas = createTextCanvas(`${i + 1}. ${rec.substring(0, 50)}`, {
          fontSize: 9,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(recCanvas), 'PNG', 18, y, 165, 6);
        y += 8;
      });
      y += 5;
    }

    // 推荐动作
    if (data.recommendations.exercises && data.recommendations.exercises.length > 0) {
      const exLabelCanvas = createTextCanvas('推荐训练动作', {
        fontSize: 11,
        bold: true,
        color: COLORS.primary,
        width: 200,
      });
      doc.addImage(canvasToBase64(exLabelCanvas), 'PNG', 15, y, 45, 7);
      y += 10;

      data.recommendations.exercises.slice(0, 4).forEach((ex, i) => {
        if (y > 260) {
          addPageFooter(doc, pageNum);
          doc.addPage();
          pageNum++;
          y = 15;
        }

        doc.setFillColor('#f0fdf4');
        doc.roundedRect(15, y, 180, 18, 2, 2);

        const exNameCanvas = createTextCanvas(ex.name, {
          fontSize: 10,
          bold: true,
          color: COLORS.text,
          width: 300,
        });
        doc.addImage(canvasToBase64(exNameCanvas), 'PNG', 18, y + 2, 50, 6);

        const exPurposeCanvas = createTextCanvas(ex.purpose.substring(0, 35), {
          fontSize: 8,
          color: COLORS.lightText,
          width: 300,
        });
        doc.addImage(canvasToBase64(exPurposeCanvas), 'PNG', 18, y + 10, 100, 5);

        y += 22;
      });
    }
  }

  // ==================== 中医体质分析 ====================
  if (data.tcmAnalysis) {
    if (y > 180) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = 15;
    }

    y = addSection(doc, '【中医体质分析】', y, '#8b4513');

    // 体质类型
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor('#fffbeb');
      doc.roundedRect(15, y, 180, 25, 3, 3);

      const constLabelCanvas = createTextCanvas('体质类型', {
        fontSize: 10,
        bold: true,
        color: '#92400e',
        width: 100,
      });
      doc.addImage(canvasToBase64(constLabelCanvas), 'PNG', 18, y + 3, 25, 6);

      const constCanvas = createTextCanvas(data.tcmAnalysis.constitution, {
        fontSize: 12,
        bold: true,
        color: '#78350f',
        width: 200,
      });
      doc.addImage(canvasToBase64(constCanvas), 'PNG', 50, y + 3, 40, 8);

      if (data.tcmAnalysis.constitutionType) {
        const typeCanvas = createTextCanvas(data.tcmAnalysis.constitutionType.substring(0, 50), {
          fontSize: 8,
          color: COLORS.lightText,
          width: 350,
        });
        doc.addImage(canvasToBase64(typeCanvas), 'PNG', 18, y + 13, 170, 5);
      }

      y += 30;
    }

    // 经络分析
    if (data.tcmAnalysis.meridians && data.tcmAnalysis.meridians.length > 0) {
      const merLabelCanvas = createTextCanvas('相关经络', {
        fontSize: 10,
        bold: true,
        color: '#b91c1c',
        width: 100,
      });
      doc.addImage(canvasToBase64(merLabelCanvas), 'PNG', 15, y, 25, 6);
      y += 10;

      data.tcmAnalysis.meridians.slice(0, 3).forEach((m) => {
        const mCanvas = createTextCanvas(`• ${m.name}: ${m.status} - ${m.reason.substring(0, 30)}`, {
          fontSize: 8,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(mCanvas), 'PNG', 18, y, 170, 5);
        y += 8;
      });
      y += 5;
    }

    // 穴位建议
    if (data.tcmAnalysis.acupoints && data.tcmAnalysis.acupoints.length > 0) {
      const acuLabelCanvas = createTextCanvas('推荐穴位按摩', {
        fontSize: 10,
        bold: true,
        color: '#166534',
        width: 150,
      });
      doc.addImage(canvasToBase64(acuLabelCanvas), 'PNG', 15, y, 45, 6);
      y += 10;

      data.tcmAnalysis.acupoints.slice(0, 4).forEach((a) => {
        const aCanvas = createTextCanvas(`• ${a.name} (${a.location}): ${a.benefit.substring(0, 25)}`, {
          fontSize: 8,
          color: COLORS.text,
          width: 350,
        });
        doc.addImage(canvasToBase64(aCanvas), 'PNG', 18, y, 170, 5);
        y += 8;
      });
      y += 5;
    }

    // 食疗建议
    if (data.tcmAnalysis.dietSuggestions && data.tcmAnalysis.dietSuggestions.length > 0) {
      const dietLabelCanvas = createTextCanvas('食疗建议', {
        fontSize: 10,
        bold: true,
        color: '#d97706',
        width: 100,
      });
      doc.addImage(canvasToBase64(dietLabelCanvas), 'PNG', 15, y, 25, 6);
      y += 10;

      data.tcmAnalysis.dietSuggestions.slice(0, 3).forEach((d) => {
        const dCanvas = createTextCanvas(`• ${d}`, { fontSize: 8, color: COLORS.text, width: 350 });
        doc.addImage(canvasToBase64(dCanvas), 'PNG', 18, y, 170, 5);
        y += 7;
      });
    }
  }

  // ==================== 总结与建议 ====================
  if (y > 180) {
    addPageFooter(doc, pageNum);
    doc.addPage();
    pageNum++;
    y = 15;
  }

  y = addSection(doc, '【总结与建议】', y, COLORS.primary);

  // 评估总结
  const summaryText = `您的体态评估得分为 ${data.overallScore} 分，属于 ${data.grade} 级（${getGradeText(data.grade)}）。`;
  const summaryCanvas = createTextCanvas(summaryText, { fontSize: 10, color: COLORS.text, width: 350 });
  doc.addImage(canvasToBase64(summaryCanvas), 'PNG', 15, y, 170, 8);
  y += 12;

  // 主要问题
  if (data.issues.length > 0) {
    const issueSummary = `检测到 ${data.issues.length} 个体态问题，其中重度 ${data.issues.filter(i => i.severity === 'severe').length} 个，中度 ${data.issues.filter(i => i.severity === 'moderate').length} 个。`;
    const issueSumCanvas = createTextCanvas(issueSummary, { fontSize: 9, color: COLORS.text, width: 350 });
    doc.addImage(canvasToBase64(issueSumCanvas), 'PNG', 15, y, 170, 6);
    y += 10;
  }

  // 改善建议
  const adviceText = '建议尽快开始体态矫正训练，调整工作站和生活习惯，如症状持续或加重，建议就医检查。';
  const adviceCanvas = createTextCanvas(adviceText, { fontSize: 9, color: COLORS.secondary, width: 350 });
  doc.addImage(canvasToBase64(adviceCanvas), 'PNG', 15, y, 170, 10);
  y += 15;

  // 注意事项
  doc.setFillColor('#fef3c7');
  doc.roundedRect(15, y, 180, 25, 3, 3);

  const noteLabelCanvas = createTextCanvas('⚠️ 注意事项', {
    fontSize: 10,
    bold: true,
    color: '#92400e',
    width: 150,
  });
  doc.addImage(canvasToBase64(noteLabelCanvas), 'PNG', 18, y + 3, 35, 6);

  const noteText = '训练过程中如出现疼痛加重，请立即停止并咨询专业人士。本报告仅供参考，不作为医疗诊断依据。';
  const noteCanvas = createTextCanvas(noteText, { fontSize: 8, color: '#78350f', width: 340 });
  doc.addImage(canvasToBase64(noteCanvas), 'PNG', 18, y + 10, 170, 12);

  y += 35;

  // 复查建议
  const reviewText = '建议 4 周后进行复查，评估改善效果。';
  const reviewCanvas = createTextCanvas(reviewText, { fontSize: 9, color: COLORS.primary, width: 300 });
  doc.addImage(canvasToBase64(reviewCanvas), 'PNG', 15, y, 100, 6);

  // 页脚
  addPageFooter(doc, pageNum);

  return doc.output('blob');
}

/**
 * 添加页脚
 */
function addPageFooter(doc: jsPDF, pageNum: number) {
  const footerCanvas = createTextCanvas(`AI 体态评估系统  |  第 ${pageNum} 页`, {
    fontSize: 8,
    color: '#9ca3af',
    width: 300,
    align: 'center',
  });
  doc.addImage(canvasToBase64(footerCanvas), 'PNG', 0, 285, PAGE_CONFIG.width, 6);
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
