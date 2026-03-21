/**
 * PDF报告生成器 - 专业版 v3.0
 * 参照专业体检报告设计标准
 * 包含：封面、摘要、详细分析、肌肉评估、风险预测、改善方案、中医分析
 */

import { jsPDF } from 'jspdf';

// ==================== 类型定义 ====================

export interface ReportData {
  userName?: string;
  assessmentDate: string;
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
  }[];
  angles: Record<string, number>;
  muscles?: { tight: string[]; weak: string[] };
  risks?: { category: string; risk: string; condition: string; cause?: string; prevention?: string }[];
  recommendations?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    exercises?: { name: string; category: string; purpose: string; method: string }[];
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
  trainingPlan?: { phases: { name: string; duration: string; focus: string; exercises: string[] }[] };
  images?: { front?: string; left?: string; right?: string; back?: string };
  // 新增详细分析数据
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

// ==================== 专业配色方案 ====================

const THEME = {
  primary: '#1E40AF',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E3A8A',
  accent: '#059669',
  accentLight: '#D1FAE5',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  text: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  background: '#F9FAFB',
  white: '#FFFFFF',
  page: { width: 210, height: 297 },
  margin: 12,
  contentWidth: 186,
};

// ==================== 工具函数 ====================

function renderText(
  text: string,
  options: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    bgColor?: string;
    width?: number;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
    padding?: number;
  } = {}
): HTMLCanvasElement {
  const { fontSize = 10, fontWeight = 'normal', color = THEME.text, bgColor, width = 372, lineHeight = 1.5, align = 'left', padding = 0 } = options;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontFamily = '"Noto Sans SC", "Microsoft YaHei", "SimHei", sans-serif';
  
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const lines = wrapText(ctx, text, width - padding * 2, fontSize);
  const height = lines.length * fontSize * lineHeight + padding * 2;
  
  canvas.width = width * 2;
  canvas.height = Math.max(height * 2, 2);
  ctx.scale(2, 2);
  
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }
  
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'top';
  
  lines.forEach((line, i) => {
    const x = align === 'center' ? width / 2 : align === 'right' ? width - padding : padding;
    ctx.textAlign = align;
    ctx.fillText(line, x, padding + i * fontSize * lineHeight);
  });
  
  return canvas;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  text.split('\n').forEach(para => {
    if (!para) { lines.push(''); return; }
    let line = '';
    for (const char of para) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  });
  return lines;
}

function toBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

function getHeight(canvas: HTMLCanvasElement): number {
  return (canvas.height / 2) * 0.264583;
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number) {
  doc.roundedRect(x, y, w, h, r, r);
}

// ==================== 页面元素 ====================

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number, reportId: string): number {
  doc.setFillColor(THEME.primary);
  doc.rect(0, 0, THEME.page.width, 8, 'F');
  
  const headerText = renderText(`AI 体态评估报告  |  报告编号: ${reportId}  |  第 ${pageNum}/${totalPages} 页`, {
    fontSize: 8, color: THEME.textMuted, width: 372, align: 'center',
  });
  doc.addImage(toBase64(headerText), 'PNG', 0, 10, THEME.page.width, getHeight(headerText));
  
  doc.setDrawColor(THEME.border);
  doc.setLineWidth(0.3);
  doc.line(THEME.margin, 18, THEME.page.width - THEME.margin, 18);
  
  return 22;
}

function drawFooter(doc: jsPDF) {
  const y = THEME.page.height - 15;
  doc.setDrawColor(THEME.border);
  doc.setLineWidth(0.3);
  doc.line(THEME.margin, y, THEME.page.width - THEME.margin, y);
  
  const footerText = renderText('本报告由 AI 体态评估系统自动生成，仅供参考，不作为医疗诊断依据。如有疑问请咨询专业医师。', {
    fontSize: 7, color: THEME.textMuted, width: 372, align: 'center',
  });
  doc.addImage(toBase64(footerText), 'PNG', 0, y + 3, THEME.page.width, getHeight(footerText));
}

function drawSectionTitle(doc: jsPDF, title: string, y: number, icon?: string): number {
  doc.setFillColor(THEME.primary);
  doc.circle(THEME.margin + 6, y + 5, 5, 'F');
  
  const numText = renderText(icon || '●', { fontSize: 10, color: THEME.white, width: 12, align: 'center' });
  doc.addImage(toBase64(numText), 'PNG', THEME.margin, y + 1, 12, 8);
  
  const titleText = renderText(title, { fontSize: 13, fontWeight: 'bold', color: THEME.text, width: 340 });
  doc.addImage(toBase64(titleText), 'PNG', THEME.margin + 14, y + 2, 180, getHeight(titleText));
  
  doc.setDrawColor(THEME.primary);
  doc.setLineWidth(0.8);
  doc.line(THEME.margin, y + 12, THEME.margin + 50, y + 12);
  
  return y + 18;
}

function drawDataTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  y: number,
  options: { colWidths?: number[]; rowHeight?: number; headerBg?: string } = {}
): number {
  const { colWidths, rowHeight = 8, headerBg = THEME.primaryLight } = options;
  const widths = colWidths || Array(headers.length).fill(THEME.contentWidth / headers.length);
  const tableWidth = widths.reduce((a, b) => a + b, 0);
  const x = THEME.margin;
  
  doc.setFillColor(headerBg);
  doc.rect(x, y, tableWidth, rowHeight, 'F');
  
  let colX = x;
  headers.forEach((h, i) => {
    const hText = renderText(h, { fontSize: 9, fontWeight: 'bold', color: THEME.primaryDark, width: widths[i] * 3.78, align: 'center' });
    doc.addImage(toBase64(hText), 'PNG', colX, y + 1.5, widths[i], rowHeight - 3);
    colX += widths[i];
  });
  
  y += rowHeight;
  
  rows.forEach((row, rowIdx) => {
    if (rowIdx % 2 === 0) {
      doc.setFillColor(THEME.background);
      doc.rect(x, y, tableWidth, rowHeight, 'F');
    }
    
    colX = x;
    row.forEach((cell, i) => {
      const cellText = renderText(cell, { fontSize: 8, color: THEME.text, width: widths[i] * 3.78 - 4, align: 'center' });
      doc.addImage(toBase64(cellText), 'PNG', colX + 2, y + 1, widths[i] - 4, rowHeight - 2);
      colX += widths[i];
    });
    
    y += rowHeight;
  });
  
  doc.setDrawColor(THEME.border);
  doc.setLineWidth(0.3);
  doc.rect(x, y - rows.length * rowHeight - rowHeight, tableWidth, (rows.length + 1) * rowHeight);
  
  return y + 5;
}

function drawScoreCard(doc: jsPDF, score: number, grade: string, issueCount: number, y: number): number {
  const cardWidth = 55;
  const cardHeight = 35;
  const gap = 8;
  const startX = THEME.margin + (THEME.contentWidth - cardWidth * 3 - gap * 2) / 2;
  
  const scoreColor = score >= 80 ? THEME.success : score >= 60 ? THEME.warning : THEME.danger;
  
  // 评分卡
  doc.setFillColor(scoreColor);
  drawRoundedRect(doc, startX, y, cardWidth, cardHeight, 3);
  const scoreTitle = renderText('综合评分', { fontSize: 9, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(scoreTitle), 'PNG', startX, y + 4, cardWidth, 6);
  const scoreNum = renderText(`${score}`, { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(scoreNum), 'PNG', startX, y + 12, cardWidth, 14);
  const scoreUnit = renderText('分', { fontSize: 8, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(scoreUnit), 'PNG', startX, y + 26, cardWidth, 6);
  
  // 等级卡
  const gradeText = { A: '优秀', B: '良好', C: '一般', D: '较差', E: '需改善' }[grade] || '未知';
  doc.setFillColor(THEME.accent);
  drawRoundedRect(doc, startX + cardWidth + gap, y, cardWidth, cardHeight, 3);
  const gradeTitle = renderText('评估等级', { fontSize: 9, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(gradeTitle), 'PNG', startX + cardWidth + gap, y + 4, cardWidth, 6);
  const gradeNum = renderText(`${grade}级`, { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(gradeNum), 'PNG', startX + cardWidth + gap, y + 13, cardWidth, 12);
  const gradeDesc = renderText(gradeText, { fontSize: 9, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(gradeDesc), 'PNG', startX + cardWidth + gap, y + 25, cardWidth, 6);
  
  // 问题数卡
  doc.setFillColor(THEME.textSecondary);
  drawRoundedRect(doc, startX + (cardWidth + gap) * 2, y, cardWidth, cardHeight, 3);
  const issueTitle = renderText('异常项目', { fontSize: 9, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(issueTitle), 'PNG', startX + (cardWidth + gap) * 2, y + 4, cardWidth, 6);
  const issueNum = renderText(`${issueCount}`, { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(issueNum), 'PNG', startX + (cardWidth + gap) * 2, y + 12, cardWidth, 12);
  const issueUnit = renderText('项', { fontSize: 9, color: '#FFFFFF', width: cardWidth * 3.78, align: 'center' });
  doc.addImage(toBase64(issueUnit), 'PNG', startX + (cardWidth + gap) * 2, y + 24, cardWidth, 6);
  
  return y + cardHeight + 10;
}

function drawIssueCard(
  doc: jsPDF,
  issue: { name: string; severity: string; angle: number; description?: string; cause?: string; recommendation?: string },
  index: number,
  y: number
): number {
  const cardHeight = 38;
  const barWidth = 4;
  
  const colors: Record<string, { bar: string; bg: string }> = {
    severe: { bar: THEME.danger, bg: THEME.dangerLight },
    moderate: { bar: THEME.warning, bg: THEME.warningLight },
    mild: { bar: THEME.success, bg: THEME.successLight },
  };
  const color = colors[issue.severity] || colors.mild;
  
  doc.setFillColor(THEME.white);
  doc.setDrawColor(THEME.border);
  drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, cardHeight, 2);
  
  doc.setFillColor(color.bar);
  drawRoundedRect(doc, THEME.margin, y, barWidth, cardHeight, 2);
  
  doc.setFillColor(color.bg);
  doc.circle(THEME.margin + 12, y + 8, 5, 'F');
  const numText = renderText(`${index + 1}`, { fontSize: 10, fontWeight: 'bold', color: color.bar, width: 10, align: 'center' });
  doc.addImage(toBase64(numText), 'PNG', THEME.margin + 7, y + 4, 10, 8);
  
  const severityLabel = { severe: '重度', moderate: '中度', mild: '轻度' }[issue.severity] || '';
  const titleText = renderText(`${issue.name} (${severityLabel})`, { fontSize: 11, fontWeight: 'bold', color: THEME.text, width: 300 });
  doc.addImage(toBase64(titleText), 'PNG', THEME.margin + 20, y + 4, 150, 7);
  
  const angleText = renderText(`测量值: ${issue.angle.toFixed(1)}°`, { fontSize: 9, color: THEME.textSecondary, width: 80 });
  doc.addImage(toBase64(angleText), 'PNG', THEME.margin + 20, y + 12, 40, 6);
  
  const refText = renderText(`参考范围: 正常`, { fontSize: 9, color: THEME.textMuted, width: 80 });
  doc.addImage(toBase64(refText), 'PNG', THEME.margin + 65, y + 12, 40, 6);
  
  const statusColor = issue.severity === 'severe' ? THEME.danger : issue.severity === 'moderate' ? THEME.warning : THEME.success;
  doc.setFillColor(statusColor);
  drawRoundedRect(doc, THEME.page.width - THEME.margin - 25, y + 4, 22, 8, 2);
  const statusText = renderText(severityLabel, { fontSize: 8, fontWeight: 'bold', color: '#FFFFFF', width: 22 * 3.78, align: 'center' });
  doc.addImage(toBase64(statusText), 'PNG', THEME.page.width - THEME.margin - 25, y + 5, 22, 6);
  
  if (issue.description) {
    const descText = renderText(issue.description.substring(0, 50), { fontSize: 8, color: THEME.textSecondary, width: 340 });
    doc.addImage(toBase64(descText), 'PNG', THEME.margin + 8, y + 20, THEME.contentWidth - 16, 6);
  }
  
  if (issue.recommendation || issue.cause) {
    const recText = renderText(`建议: ${(issue.recommendation || issue.cause || '').substring(0, 40)}`, { fontSize: 8, color: THEME.accent, width: 340 });
    doc.addImage(toBase64(recText), 'PNG', THEME.margin + 8, y + 28, THEME.contentWidth - 16, 6);
  }
  
  return y + cardHeight + 5;
}

// ==================== 主函数 ====================

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = `PT${Date.now().toString(36).toUpperCase()}`;
  const totalPages = 8;
  let pageNum = 1;
  let y = THEME.margin;

  // ==================== 第1页：封面 ====================
  
  doc.setFillColor(THEME.primary);
  doc.rect(0, 0, THEME.page.width, 60, 'F');
  
  const logoText = renderText('AI 体态评估系统', { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', width: 400, align: 'center' });
  doc.addImage(toBase64(logoText), 'PNG', 0, 20, THEME.page.width, 20);
  
  const subText = renderText('专业体态分析与健康评估报告', { fontSize: 14, color: '#BFDBFE', width: 400, align: 'center' });
  doc.addImage(toBase64(subText), 'PNG', 0, 42, THEME.page.width, 10);
  
  const reportTitle = renderText('体态评估报告', { fontSize: 24, fontWeight: 'bold', color: THEME.primary, width: 400, align: 'center' });
  doc.addImage(toBase64(reportTitle), 'PNG', 0, 80, THEME.page.width, 18);
  
  const infoCardY = 110;
  doc.setFillColor(THEME.background);
  drawRoundedRect(doc, THEME.margin + 20, infoCardY, THEME.contentWidth - 40, 60, 4);
  
  const infoItems = [
    ['报告编号', reportId],
    ['评估日期', data.assessmentDate],
    ['姓名', data.userName || '未填写'],
    ['综合评分', `${data.overallScore} 分 (${data.grade}级)`],
  ];
  
  infoItems.forEach((item, i) => {
    const label = renderText(item[0], { fontSize: 10, color: THEME.textSecondary, width: 60 });
    doc.addImage(toBase64(label), 'PNG', THEME.margin + 30, infoCardY + 8 + i * 12, 30, 7);
    const value = renderText(item[1], { fontSize: 11, fontWeight: 'bold', color: THEME.text, width: 200 });
    doc.addImage(toBase64(value), 'PNG', THEME.margin + 70, infoCardY + 8 + i * 12, 100, 7);
  });
  
  const disclaimer = renderText('本报告由 AI 体态评估系统自动生成，仅供参考，不作为医疗诊断依据。', {
    fontSize: 9, color: THEME.textMuted, width: 400, align: 'center',
  });
  doc.addImage(toBase64(disclaimer), 'PNG', 0, THEME.page.height - 25, THEME.page.width, 8);
  
  const genDate = renderText(`生成时间: ${new Date().toLocaleString('zh-CN')}`, {
    fontSize: 8, color: THEME.textMuted, width: 400, align: 'center',
  });
  doc.addImage(toBase64(genDate), 'PNG', 0, THEME.page.height - 15, THEME.page.width, 6);

  // ==================== 第2页：评估摘要 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '评估摘要', y, '1');
  y = drawScoreCard(doc, data.overallScore, data.grade, data.issues.length, y);
  
  y += 5;
  y = drawSectionTitle(doc, '异常项目汇总', y, '2');
  
  if (data.issues.length > 0) {
    const issueRows = data.issues.map(i => [
      i.name,
      { severe: '重度↑', moderate: '中度↑', mild: '轻度↑' }[i.severity] || '正常',
      `${i.angle.toFixed(1)}°`,
      '详见分析',
    ]);
    y = drawDataTable(doc, ['检测项目', '状态', '测量值', '建议'], issueRows, y, { colWidths: [50, 30, 30, 76] });
  } else {
    const noIssue = renderText('恭喜！未检测到明显的体态异常问题。', { fontSize: 11, color: THEME.success, width: 340 });
    doc.addImage(toBase64(noIssue), 'PNG', THEME.margin, y, 170, 10);
    y += 15;
  }
  
  y += 5;
  y = drawSectionTitle(doc, '评估结论', y, '3');
  
  const severeCount = data.issues.filter(i => i.severity === 'severe').length;
  const moderateCount = data.issues.filter(i => i.severity === 'moderate').length;
  const mildCount = data.issues.filter(i => i.severity === 'mild').length;
  
  const conclusionText = `经 AI 体态评估系统分析，您的体态综合评分为 ${data.overallScore} 分，评估等级为 ${data.grade} 级。共检测到 ${data.issues.length} 个体态问题，其中重度 ${severeCount} 项，中度 ${moderateCount} 项，轻度 ${mildCount} 项。`;
  
  const conclusion = renderText(conclusionText, { fontSize: 10, color: THEME.text, width: 340, lineHeight: 1.6 });
  doc.addImage(toBase64(conclusion), 'PNG', THEME.margin, y, THEME.contentWidth, getHeight(conclusion));
  
  drawFooter(doc);

  // ==================== 第3页：详细部位分析 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '体态问题详细分析', y, '4');
  
  const sortedIssues = [...data.issues].sort((a, b) => {
    const order: Record<string, number> = { severe: 0, moderate: 1, mild: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });
  
  sortedIssues.slice(0, 5).forEach((issue, i) => {
    if (y > 240) {
      drawFooter(doc);
      doc.addPage();
      pageNum++;
      y = drawHeader(doc, pageNum, totalPages, reportId);
    }
    y = drawIssueCard(doc, issue, i, y);
  });
  
  // 部位详细分析
  if (data.detailedAnalysis) {
    y += 10;
    y = drawSectionTitle(doc, '各部位状态分析', y, '5');
    
    const parts = [
      { key: 'head', name: '头部', data: data.detailedAnalysis.head },
      { key: 'shoulders', name: '肩部', data: data.detailedAnalysis.shoulders },
      { key: 'spine', name: '脊柱', data: data.detailedAnalysis.spine },
      { key: 'pelvis', name: '骨盆', data: data.detailedAnalysis.pelvis },
      { key: 'knees', name: '膝关节', data: data.detailedAnalysis.knees },
    ];
    
    const partRows = parts.filter(p => p.data).map(p => {
      const d = p.data as Record<string, any>;
      return [
        p.name,
        d?.status || '正常',
        d?.angle || d?.tiltAngle || d?.leftRightDiff || '-',
        (d?.description || '').substring(0, 20),
      ];
    });
    
    if (partRows.length > 0) {
      y = drawDataTable(doc, ['部位', '状态', '数值', '描述'], partRows, y, { colWidths: [30, 40, 30, 86] });
    }
  }
  
  drawFooter(doc);

  // ==================== 第4页：肌肉与筋膜分析 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  if (data.muscles) {
    y = drawSectionTitle(doc, '肌肉功能评估', y, '6');
    
    const tightCount = data.muscles.tight.length;
    const weakCount = data.muscles.weak.length;
    
    doc.setFillColor(THEME.dangerLight);
    drawRoundedRect(doc, THEME.margin, y, 88, 20 + tightCount * 5, 3);
    const tightTitle = renderText(`紧张肌肉 (${tightCount})`, { fontSize: 10, fontWeight: 'bold', color: THEME.danger, width: 280 });
    doc.addImage(toBase64(tightTitle), 'PNG', THEME.margin + 3, y + 3, 45, 6);
    data.muscles.tight.slice(0, 6).forEach((m, i) => {
      const muscleText = renderText(`• ${m}`, { fontSize: 8, color: THEME.text, width: 280 });
      doc.addImage(toBase64(muscleText), 'PNG', THEME.margin + 3, y + 11 + i * 5, 42, 5);
    });
    
    doc.setFillColor(THEME.primaryLight);
    drawRoundedRect(doc, THEME.margin + 94, y, 88, 20 + weakCount * 5, 3);
    const weakTitle = renderText(`无力肌肉 (${weakCount})`, { fontSize: 10, fontWeight: 'bold', color: THEME.primary, width: 280 });
    doc.addImage(toBase64(weakTitle), 'PNG', THEME.margin + 97, y + 3, 45, 6);
    data.muscles.weak.slice(0, 6).forEach((m, i) => {
      const muscleText = renderText(`• ${m}`, { fontSize: 8, color: THEME.text, width: 280 });
      doc.addImage(toBase64(muscleText), 'PNG', THEME.margin + 97, y + 11 + i * 5, 42, 5);
    });
    
    y += Math.max(25 + tightCount * 5, 25 + weakCount * 5) + 10;
  }
  
  // 筋膜链分析
  if (data.fasciaChainAnalysis) {
    y = drawSectionTitle(doc, '筋膜链状态分析', y, '7');
    
    const fasciaRows = [
      ['前表链', data.fasciaChainAnalysis.frontLine?.status || '正常', data.fasciaChainAnalysis.frontLine?.tension || '-', (data.fasciaChainAnalysis.frontLine?.impact || '').substring(0, 25)],
      ['后表链', data.fasciaChainAnalysis.backLine?.status || '正常', data.fasciaChainAnalysis.backLine?.tension || '-', (data.fasciaChainAnalysis.backLine?.impact || '').substring(0, 25)],
      ['体侧链', data.fasciaChainAnalysis.lateralLine?.status || '正常', data.fasciaChainAnalysis.lateralLine?.tension || '-', (data.fasciaChainAnalysis.lateralLine?.impact || '').substring(0, 25)],
      ['螺旋链', data.fasciaChainAnalysis.spiralLine?.status || '正常', data.fasciaChainAnalysis.spiralLine?.tension || '-', (data.fasciaChainAnalysis.spiralLine?.impact || '').substring(0, 25)],
    ];
    
    y = drawDataTable(doc, ['筋膜链', '状态', '张力', '影响'], fasciaRows, y, { colWidths: [35, 35, 35, 81] });
  }
  
  // 呼吸评估
  if (data.breathingAssessment) {
    y += 5;
    y = drawSectionTitle(doc, '呼吸模式评估', y, '8');
    
    doc.setFillColor(THEME.warningLight);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 25, 3);
    
    const breathingInfo = [
      `呼吸模式: ${data.breathingAssessment.pattern || '需评估'}`,
      `膈肌功能: ${data.breathingAssessment.diaphragm || '需评估'}`,
      `胸廓活动度: ${data.breathingAssessment.ribcageMobility || '需评估'}`,
    ];
    
    breathingInfo.forEach((info, i) => {
      const infoText = renderText(info, { fontSize: 9, color: '#92400E', width: 340 });
      doc.addImage(toBase64(infoText), 'PNG', THEME.margin + 5, y + 5 + i * 6, 170, 5);
    });
    
    y += 30;
  }
  
  // 健康风险
  if (data.risks && data.risks.length > 0) {
    y = drawSectionTitle(doc, '健康风险评估', y, '9');
    
    const riskRows = data.risks.slice(0, 5).map(r => [
      { high: '高风险↑', medium: '中风险↑', low: '低风险' }[r.risk] || r.risk,
      r.condition,
      r.category,
    ]);
    y = drawDataTable(doc, ['风险等级', '潜在问题', '相关系统'], riskRows, y, { colWidths: [30, 80, 76] });
  }
  
  drawFooter(doc);

  // ==================== 第5页：健康预测 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '健康发展趋势预测', y, '10');
  
  if (data.healthPrediction) {
    // 短期预测
    doc.setFillColor(THEME.warningLight);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 20, 3);
    const shortTitle = renderText('短期预测 (1-3个月)', { fontSize: 10, fontWeight: 'bold', color: '#92400E', width: 340 });
    doc.addImage(toBase64(shortTitle), 'PNG', THEME.margin + 5, y + 3, 50, 6);
    const shortText = renderText(data.healthPrediction.shortTerm || '建议定期复查', { fontSize: 9, color: '#78350F', width: 340 });
    doc.addImage(toBase64(shortText), 'PNG', THEME.margin + 5, y + 10, 170, 8);
    y += 25;
    
    // 中期预测
    doc.setFillColor(THEME.dangerLight);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 20, 3);
    const midTitle = renderText('中期预测 (6-12个月)', { fontSize: 10, fontWeight: 'bold', color: '#991B1B', width: 340 });
    doc.addImage(toBase64(midTitle), 'PNG', THEME.margin + 5, y + 3, 55, 6);
    const midText = renderText(data.healthPrediction.midTerm || '持续关注体态变化', { fontSize: 9, color: '#7F1D1D', width: 340 });
    doc.addImage(toBase64(midText), 'PNG', THEME.margin + 5, y + 10, 170, 8);
    y += 25;
    
    // 长期预测
    doc.setFillColor(THEME.danger);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 20, 3);
    const longTitle = renderText('长期预测 (3年以上)', { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF', width: 340 });
    doc.addImage(toBase64(longTitle), 'PNG', THEME.margin + 5, y + 3, 55, 6);
    const longText = renderText(data.healthPrediction.longTerm || '预防慢性疼痛发生', { fontSize: 9, color: '#FFFFFF', width: 340 });
    doc.addImage(toBase64(longText), 'PNG', THEME.margin + 5, y + 10, 170, 8);
    y += 30;
    
    // 预防措施
    if (data.healthPrediction.preventiveMeasures?.length) {
      y = drawSectionTitle(doc, '预防措施建议', y, '11');
      
      data.healthPrediction.preventiveMeasures.slice(0, 5).forEach((measure, i) => {
        const measureText = renderText(`${i + 1}. ${measure}`, { fontSize: 9, color: THEME.text, width: 340 });
        doc.addImage(toBase64(measureText), 'PNG', THEME.margin, y, 170, 6);
        y += 7;
      });
    }
  }
  
  drawFooter(doc);

  // ==================== 第6页：改善方案 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '改善方案与建议', y, '12');
  
  if (data.recommendations) {
    // 立即行动
    if (data.recommendations.immediate?.length) {
      doc.setFillColor(THEME.dangerLight);
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15 + data.recommendations.immediate.length * 6, 3);
      const immTitle = renderText('▶ 立即行动（今天开始）', { fontSize: 10, fontWeight: 'bold', color: THEME.danger, width: 340 });
      doc.addImage(toBase64(immTitle), 'PNG', THEME.margin + 5, y + 3, 80, 6);
      data.recommendations.immediate.slice(0, 3).forEach((rec, i) => {
        const recText = renderText(`${i + 1}. ${rec}`, { fontSize: 9, color: THEME.text, width: 330 });
        doc.addImage(toBase64(recText), 'PNG', THEME.margin + 5, y + 10 + i * 6, 170, 5);
      });
      y += 20 + data.recommendations.immediate.length * 6;
    }
    
    // 短期计划
    if (data.recommendations.shortTerm?.length) {
      doc.setFillColor(THEME.warningLight);
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15 + data.recommendations.shortTerm.length * 6, 3);
      const shortTitle = renderText('▶ 短期计划（1-4周）', { fontSize: 10, fontWeight: 'bold', color: THEME.warning, width: 340 });
      doc.addImage(toBase64(shortTitle), 'PNG', THEME.margin + 5, y + 3, 80, 6);
      data.recommendations.shortTerm.slice(0, 3).forEach((rec, i) => {
        const recText = renderText(`${i + 1}. ${rec}`, { fontSize: 9, color: THEME.text, width: 330 });
        doc.addImage(toBase64(recText), 'PNG', THEME.margin + 5, y + 10 + i * 6, 170, 5);
      });
      y += 20 + data.recommendations.shortTerm.length * 6;
    }
    
    // 长期策略
    if (data.recommendations.longTerm?.length) {
      doc.setFillColor(THEME.successLight);
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15 + data.recommendations.longTerm.length * 6, 3);
      const longTitle = renderText('▶ 长期策略（1-3个月）', { fontSize: 10, fontWeight: 'bold', color: THEME.success, width: 340 });
      doc.addImage(toBase64(longTitle), 'PNG', THEME.margin + 5, y + 3, 85, 6);
      data.recommendations.longTerm.slice(0, 3).forEach((rec, i) => {
        const recText = renderText(`${i + 1}. ${rec}`, { fontSize: 9, color: THEME.text, width: 330 });
        doc.addImage(toBase64(recText), 'PNG', THEME.margin + 5, y + 10 + i * 6, 170, 5);
      });
      y += 20 + data.recommendations.longTerm.length * 6;
    }
  }
  
  // 训练计划
  if (data.trainingPlan?.phases?.length) {
    y += 5;
    y = drawSectionTitle(doc, '分阶段训练计划', y, '13');
    
    const phaseRows = data.trainingPlan.phases.slice(0, 4).map(p => [
      p.name,
      p.duration,
      p.focus.substring(0, 20),
      p.exercises.slice(0, 2).join('、').substring(0, 25) || '-',
    ]);
    
    y = drawDataTable(doc, ['阶段', '周期', '重点', '推荐动作'], phaseRows, y, { colWidths: [35, 30, 50, 71] });
  }
  
  drawFooter(doc);

  // ==================== 第7页：中医分析 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  if (data.tcmAnalysis) {
    y = drawSectionTitle(doc, '中医体质与经络分析', y, '14');
    
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor(THEME.warningLight);
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 25, 3);
      const constTitle = renderText('体质判断', { fontSize: 9, fontWeight: 'bold', color: '#92400E', width: 340 });
      doc.addImage(toBase64(constTitle), 'PNG', THEME.margin + 5, y + 3, 30, 5);
      const constText = renderText(data.tcmAnalysis.constitution, { fontSize: 14, fontWeight: 'bold', color: '#78350F', width: 340 });
      doc.addImage(toBase64(constText), 'PNG', THEME.margin + 5, y + 10, 170, 10);
      y += 30;
    }
    
    if (data.tcmAnalysis.meridians?.length) {
      const meridianTitle = renderText('相关经络状态', { fontSize: 10, fontWeight: 'bold', color: THEME.danger, width: 340 });
      doc.addImage(toBase64(meridianTitle), 'PNG', THEME.margin, y, 50, 6);
      y += 8;
      data.tcmAnalysis.meridians.slice(0, 4).forEach(m => {
        const mText = renderText(`• ${m.name}: ${m.status} - ${(m.reason || '').substring(0, 25)}`, { fontSize: 8, color: THEME.text, width: 340 });
        doc.addImage(toBase64(mText), 'PNG', THEME.margin, y, 170, 6);
        y += 7;
      });
      y += 5;
    }
    
    if (data.tcmAnalysis.acupoints?.length) {
      const acupointTitle = renderText('穴位调理建议', { fontSize: 10, fontWeight: 'bold', color: THEME.accent, width: 340 });
      doc.addImage(toBase64(acupointTitle), 'PNG', THEME.margin, y, 50, 6);
      y += 8;
      data.tcmAnalysis.acupoints.slice(0, 4).forEach(a => {
        const aText = renderText(`• ${a.name} (${a.location}): ${a.benefit.substring(0, 20)}`, { fontSize: 8, color: THEME.text, width: 340 });
        doc.addImage(toBase64(aText), 'PNG', THEME.margin, y, 170, 6);
        y += 7;
      });
      y += 5;
    }
    
    if (data.tcmAnalysis.daoyinSuggestions?.length) {
      const daoyinTitle = renderText('导引功法建议', { fontSize: 10, fontWeight: 'bold', color: THEME.primary, width: 340 });
      doc.addImage(toBase64(daoyinTitle), 'PNG', THEME.margin, y, 50, 6);
      y += 8;
      data.tcmAnalysis.daoyinSuggestions.slice(0, 4).forEach(d => {
        const dText = renderText(`• ${d}`, { fontSize: 8, color: THEME.text, width: 340 });
        doc.addImage(toBase64(dText), 'PNG', THEME.margin, y, 170, 6);
        y += 7;
      });
      y += 5;
    }
    
    if (data.tcmAnalysis.dietSuggestions?.length) {
      const dietTitle = renderText('食疗建议', { fontSize: 10, fontWeight: 'bold', color: THEME.warning, width: 340 });
      doc.addImage(toBase64(dietTitle), 'PNG', THEME.margin, y, 30, 6);
      y += 8;
      data.tcmAnalysis.dietSuggestions.slice(0, 4).forEach(s => {
        const sText = renderText(`• ${s}`, { fontSize: 8, color: THEME.text, width: 340 });
        doc.addImage(toBase64(sText), 'PNG', THEME.margin, y, 170, 6);
        y += 7;
      });
    }
  }
  
  drawFooter(doc);

  // ==================== 第8页：总结与附录 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId);
  
  y = drawSectionTitle(doc, '总结与注意事项', y, '15');
  
  doc.setFillColor(THEME.primaryLight);
  drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 35, 3);
  
  const summaryText = `您的体态评估综合得分为 ${data.overallScore} 分，评估等级为 ${data.grade} 级。共检测到 ${data.issues.length} 个体态问题。建议坚持进行体态矫正训练，保持良好的坐姿和站姿习惯。如有持续疼痛或不适，请及时就医检查。`;
  const summary = renderText(summaryText, { fontSize: 9, color: THEME.text, width: 340, lineHeight: 1.6 });
  doc.addImage(toBase64(summary), 'PNG', THEME.margin + 5, y + 5, THEME.contentWidth - 10, 25);
  
  y += 40;
  
  doc.setFillColor(THEME.warningLight);
  drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 35, 3);
  const noteTitle = renderText('⚠️ 重要提示', { fontSize: 10, fontWeight: 'bold', color: '#92400E', width: 340 });
  doc.addImage(toBase64(noteTitle), 'PNG', THEME.margin + 5, y + 3, 40, 6);
  const noteText = renderText('1. 本报告由AI系统自动生成，仅供参考，不作为医疗诊断依据。\n2. 建议每4周进行一次复查，跟踪改善效果。\n3. 如有疼痛或不适，请及时就医。', { fontSize: 8, color: '#78350F', width: 340 });
  doc.addImage(toBase64(noteText), 'PNG', THEME.margin + 5, y + 10, 170, 20);
  
  y += 40;
  
  y = drawSectionTitle(doc, '附录：参考标准', y, '16');
  
  const refRows = [
    ['头前伸角度', '< 15°', '正常范围'],
    ['肩部倾斜', '< 2°', '正常范围'],
    ['骨盆前倾', '5-15°', '正常范围'],
    ['膝关节角度', '170-180°', '正常范围'],
    ['脊柱对齐度', '> 90%', '正常范围'],
  ];
  
  y = drawDataTable(doc, ['测量项目', '正常范围', '说明'], refRows, y, { colWidths: [50, 50, 86] });
  
  y += 10;
  
  const contactTitle = renderText('联系我们', { fontSize: 10, fontWeight: 'bold', color: THEME.primary, width: 340 });
  doc.addImage(toBase64(contactTitle), 'PNG', THEME.margin, y, 30, 6);
  y += 8;
  const contactText = renderText('如有任何疑问或需要进一步咨询，请联系专业康复师或医师。', { fontSize: 9, color: THEME.textSecondary, width: 340 });
  doc.addImage(toBase64(contactText), 'PNG', THEME.margin, y, 170, 6);
  
  drawFooter(doc);
  
  return doc.output('blob');
}

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
