/**
 * 中医诊断报告PDF生成器
 * 用于舌诊和面诊报告
 */

import { jsPDF } from 'jspdf';

// ==================== 类型定义 ====================

export interface TCMReportData {
  // 基本信息
  userName?: string;
  diagnosisDate: string;
  diagnosisType: 'face' | 'tongue'; // 面诊 or 舌诊
  
  // 中医诊断结果
  constitution?: string; // 体质判断
  constitutionFeatures?: string[];
  
  // 面诊特有
  faceColor?: string; // 面色
  faceFeatures?: {
    feature: string;
    status: string;
    significance: string;
  }[];
  
  // 舌诊特有
  tongueColor?: string; // 舌色
  tongueCoating?: string; // 舌苔
  tongueShape?: string; // 舌形
  tongueFeatures?: {
    feature: string;
    status: string;
    significance: string;
  }[];
  
  // 健康提示
  healthHints?: {
    category: string;
    hint: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  
  // 建议
  recommendations?: {
    diet: string[];
    lifestyle: string[];
    acupoints?: { name: string; location: string; benefit: string }[];
  };
  
  // AI分析
  aiAnalysis?: string;
  
  // 图片
  imageThumbnail?: string;
}

// ==================== 配色方案 ====================

const THEME = {
  primary: '#7C3AED', // 紫色（中医风格）
  primaryLight: '#EDE9FE',
  primaryDark: '#5B21B6',
  accent: '#059669',
  accentLight: '#D1FAE5',
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

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number, reportId: string, diagnosisType: string): number {
  doc.setFillColor(THEME.primary);
  doc.rect(0, 0, THEME.page.width, 8, 'F');
  
  const title = diagnosisType === 'face' ? 'AI 面诊报告' : 'AI 舌诊报告';
  const headerText = renderText(`${title}  |  报告编号: ${reportId}  |  第 ${pageNum}/${totalPages} 页`, {
    fontSize: 8, color: THEME.textMuted, width: 372, align: 'center',
  });
  doc.addImage(toBase64(headerText), 'PNG', 0, 10, THEME.page.width, getHeight(headerText));
  
  doc.setDrawColor(THEME.border);
  doc.setLineWidth(0.3);
  doc.line(THEME.margin, 18, THEME.page.width - THEME.margin, 18);
  
  return 22;
}

function drawFooter(doc: jsPDF, diagnosisType: string) {
  const y = THEME.page.height - 15;
  doc.setDrawColor(THEME.border);
  doc.setLineWidth(0.3);
  doc.line(THEME.margin, y, THEME.page.width - THEME.margin, y);
  
  const disclaimer = diagnosisType === 'face' 
    ? '本报告由 AI 面诊系统自动生成，仅供参考，不作为医疗诊断依据。如有疑问请咨询专业中医师。'
    : '本报告由 AI 舌诊系统自动生成，仅供参考，不作为医疗诊断依据。如有疑问请咨询专业中医师。';
  
  const footerText = renderText(disclaimer, {
    fontSize: 7, color: THEME.textMuted, width: 372, align: 'center',
  });
  doc.addImage(toBase64(footerText), 'PNG', 0, y + 3, THEME.page.width, getHeight(footerText));
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(THEME.primary);
  doc.circle(THEME.margin + 6, y + 5, 5, 'F');
  
  const numText = renderText('●', { fontSize: 10, color: THEME.white, width: 12, align: 'center' });
  doc.addImage(toBase64(numText), 'PNG', THEME.margin, y + 1, 12, 8);
  
  const titleText = renderText(title, { fontSize: 13, fontWeight: 'bold', color: THEME.text, width: 340 });
  doc.addImage(toBase64(titleText), 'PNG', THEME.margin + 14, y + 2, 180, getHeight(titleText));
  
  doc.setDrawColor(THEME.primary);
  doc.setLineWidth(0.8);
  doc.line(THEME.margin, y + 12, THEME.margin + 50, y + 12);
  
  return y + 18;
}

// ==================== 主函数 ====================

export async function generateTCMPDFReport(data: TCMReportData): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const reportId = data.diagnosisType === 'face' ? `FD${Date.now().toString(36).toUpperCase()}` : `TD${Date.now().toString(36).toUpperCase()}`;
  const totalPages = 4;
  let pageNum = 1;
  let y = THEME.margin;
  
  const diagnosisTitle = data.diagnosisType === 'face' ? '面诊报告' : '舌诊报告';
  const diagnosisColor = data.diagnosisType === 'face' ? '#EC4899' : '#8B5CF6';

  // ==================== 第1页：封面 ====================
  
  doc.setFillColor(THEME.primary);
  doc.rect(0, 0, THEME.page.width, 60, 'F');
  
  const logoText = renderText(data.diagnosisType === 'face' ? 'AI 智能面诊系统' : 'AI 智能舌诊系统', { 
    fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', width: 400, align: 'center' 
  });
  doc.addImage(toBase64(logoText), 'PNG', 0, 20, THEME.page.width, 18);
  
  const subText = renderText('中医体质辨识与健康评估报告', { fontSize: 13, color: '#DDD6FE', width: 400, align: 'center' });
  doc.addImage(toBase64(subText), 'PNG', 0, 42, THEME.page.width, 9);
  
  const reportTitle = renderText(diagnosisTitle, { fontSize: 22, fontWeight: 'bold', color: THEME.primary, width: 400, align: 'center' });
  doc.addImage(toBase64(reportTitle), 'PNG', 0, 80, THEME.page.width, 16);
  
  const infoCardY = 110;
  doc.setFillColor(THEME.background);
  drawRoundedRect(doc, THEME.margin + 20, infoCardY, THEME.contentWidth - 40, 55, 4);
  
  const infoItems = [
    ['报告编号', reportId],
    ['诊断日期', data.diagnosisDate],
    ['姓名', data.userName || '未填写'],
    ['体质判断', data.constitution || '待分析'],
  ];
  
  infoItems.forEach((item, i) => {
    const label = renderText(item[0], { fontSize: 10, color: THEME.textSecondary, width: 60 });
    doc.addImage(toBase64(label), 'PNG', THEME.margin + 30, infoCardY + 6 + i * 11, 30, 6);
    const value = renderText(item[1], { fontSize: 10, fontWeight: 'bold', color: THEME.text, width: 200 });
    doc.addImage(toBase64(value), 'PNG', THEME.margin + 70, infoCardY + 6 + i * 11, 100, 6);
  });
  
  const disclaimer = renderText('本报告由 AI 诊断系统自动生成，仅供参考，不作为医疗诊断依据。', {
    fontSize: 9, color: THEME.textMuted, width: 400, align: 'center',
  });
  doc.addImage(toBase64(disclaimer), 'PNG', 0, THEME.page.height - 25, THEME.page.width, 8);

  // ==================== 第2页：诊断结果 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId, data.diagnosisType);
  
  y = drawSectionTitle(doc, '诊断结果', y);
  
  // 舌诊特有内容
  if (data.diagnosisType === 'tongue') {
    doc.setFillColor('#F3E8FF');
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 45, 4);
    
    const tongueTitle = renderText('舌象分析', { fontSize: 11, fontWeight: 'bold', color: '#7C3AED', width: 340 });
    doc.addImage(toBase64(tongueTitle), 'PNG', THEME.margin + 5, y + 4, 40, 7);
    
    // 舌色
    if (data.tongueColor) {
      const colorText = renderText(`舌色: ${data.tongueColor}`, { fontSize: 10, color: THEME.text, width: 170 });
      doc.addImage(toBase64(colorText), 'PNG', THEME.margin + 5, y + 14, 85, 7);
    }
    
    // 舌苔
    if (data.tongueCoating) {
      const coatingText = renderText(`舌苔: ${data.tongueCoating}`, { fontSize: 10, color: THEME.text, width: 170 });
      doc.addImage(toBase64(coatingText), 'PNG', THEME.margin + 95, y + 14, 85, 7);
    }
    
    // 舌形
    if (data.tongueShape) {
      const shapeText = renderText(`舌形: ${data.tongueShape}`, { fontSize: 10, color: THEME.text, width: 170 });
      doc.addImage(toBase64(shapeText), 'PNG', THEME.margin + 5, y + 24, 85, 7);
    }
    
    y += 50;
  }
  
  // 面诊特有内容
  if (data.diagnosisType === 'face') {
    doc.setFillColor('#FCE7F3');
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 35, 4);
    
    const faceTitle = renderText('面色分析', { fontSize: 11, fontWeight: 'bold', color: '#DB2777', width: 340 });
    doc.addImage(toBase64(faceTitle), 'PNG', THEME.margin + 5, y + 4, 40, 7);
    
    if (data.faceColor) {
      const colorText = renderText(`面色: ${data.faceColor}`, { fontSize: 10, color: THEME.text, width: 340 });
      doc.addImage(toBase64(colorText), 'PNG', THEME.margin + 5, y + 14, 170, 7);
    }
    
    y += 40;
  }
  
  // 体质分析
  if (data.constitution) {
    y = drawSectionTitle(doc, '体质分析', y);
    
    doc.setFillColor(THEME.primaryLight);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 25, 3);
    const constText = renderText(`您的体质判断为: ${data.constitution}`, { fontSize: 11, fontWeight: 'bold', color: THEME.primaryDark, width: 340 });
    doc.addImage(toBase64(constText), 'PNG', THEME.margin + 5, y + 8, 170, 10);
    
    y += 30;
    
    if (data.constitutionFeatures?.length) {
      const featureTitle = renderText('体质特征:', { fontSize: 10, fontWeight: 'bold', color: THEME.text, width: 340 });
      doc.addImage(toBase64(featureTitle), 'PNG', THEME.margin, y, 35, 7);
      y += 8;
      
      data.constitutionFeatures.slice(0, 4).forEach((f, i) => {
        const fText = renderText(`• ${f}`, { fontSize: 9, color: THEME.textSecondary, width: 340 });
        doc.addImage(toBase64(fText), 'PNG', THEME.margin + 5, y, 170, 6);
        y += 7;
      });
    }
    
    y += 5;
  }
  
  // 健康提示
  if (data.healthHints?.length) {
    y = drawSectionTitle(doc, '健康提示', y);
    
    data.healthHints.slice(0, 5).forEach((hint) => {
      const severityColor = hint.severity === 'high' ? THEME.dangerLight : 
                           hint.severity === 'medium' ? THEME.warningLight : 
                           THEME.accentLight;
      const severityBorderColor = hint.severity === 'high' ? THEME.danger : 
                                  hint.severity === 'medium' ? THEME.warning : 
                                  THEME.accent;
      
      doc.setFillColor(severityColor);
      doc.setDrawColor(severityBorderColor);
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15, 2);
      
      const hintTitle = renderText(hint.category, { fontSize: 9, fontWeight: 'bold', color: THEME.text, width: 50 });
      doc.addImage(toBase64(hintTitle), 'PNG', THEME.margin + 3, y + 3, 25, 6);
      
      const hintText = renderText(hint.hint.substring(0, 50), { fontSize: 8, color: THEME.textSecondary, width: 280 });
      doc.addImage(toBase64(hintText), 'PNG', THEME.margin + 30, y + 4, 150, 6);
      
      y += 18;
    });
  }
  
  drawFooter(doc, data.diagnosisType);

  // ==================== 第3页：建议方案 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId, data.diagnosisType);
  
  if (data.recommendations) {
    y = drawSectionTitle(doc, '调理建议', y);
    
    // 饮食建议
    if (data.recommendations.diet?.length) {
      doc.setFillColor('#FEF3C7');
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15 + data.recommendations.diet.length * 6, 3);
      const dietTitle = renderText('🥗 饮食建议', { fontSize: 10, fontWeight: 'bold', color: '#92400E', width: 340 });
      doc.addImage(toBase64(dietTitle), 'PNG', THEME.margin + 5, y + 3, 40, 6);
      
      data.recommendations.diet.slice(0, 4).forEach((d, i) => {
        const dText = renderText(`${i + 1}. ${d}`, { fontSize: 9, color: '#78350F', width: 330 });
        doc.addImage(toBase64(dText), 'PNG', THEME.margin + 5, y + 10 + i * 6, 170, 5);
      });
      
      y += 20 + data.recommendations.diet.length * 6;
    }
    
    // 生活建议
    if (data.recommendations.lifestyle?.length) {
      doc.setFillColor('#D1FAE5');
      drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 15 + data.recommendations.lifestyle.length * 6, 3);
      const lifeTitle = renderText('🏃 生活建议', { fontSize: 10, fontWeight: 'bold', color: '#065F46', width: 340 });
      doc.addImage(toBase64(lifeTitle), 'PNG', THEME.margin + 5, y + 3, 40, 6);
      
      data.recommendations.lifestyle.slice(0, 4).forEach((l, i) => {
        const lText = renderText(`${i + 1}. ${l}`, { fontSize: 9, color: '#064E3B', width: 330 });
        doc.addImage(toBase64(lText), 'PNG', THEME.margin + 5, y + 10 + i * 6, 170, 5);
      });
      
      y += 20 + data.recommendations.lifestyle.length * 6;
    }
    
    // 穴位按摩
    if (data.recommendations.acupoints?.length) {
      y += 5;
      y = drawSectionTitle(doc, '穴位按摩', y);
      
      data.recommendations.acupoints.slice(0, 4).forEach((a) => {
        doc.setFillColor(THEME.background);
        drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 20, 2);
        
        const aName = renderText(a.name, { fontSize: 10, fontWeight: 'bold', color: THEME.primary, width: 50 });
        doc.addImage(toBase64(aName), 'PNG', THEME.margin + 5, y + 3, 25, 6);
        
        const aLocation = renderText(`位置: ${a.location}`, { fontSize: 8, color: THEME.textSecondary, width: 280 });
        doc.addImage(toBase64(aLocation), 'PNG', THEME.margin + 5, y + 10, 80, 5);
        
        const aBenefit = renderText(a.benefit.substring(0, 30), { fontSize: 8, color: THEME.text, width: 280 });
        doc.addImage(toBase64(aBenefit), 'PNG', THEME.margin + 90, y + 10, 85, 5);
        
        y += 23;
      });
    }
  }
  
  drawFooter(doc, data.diagnosisType);

  // ==================== 第4页：AI分析与总结 ====================
  
  doc.addPage();
  pageNum++;
  y = drawHeader(doc, pageNum, totalPages, reportId, data.diagnosisType);
  
  if (data.aiAnalysis) {
    y = drawSectionTitle(doc, 'AI 深度分析', y);
    
    doc.setFillColor(THEME.background);
    drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 80, 3);
    
    // 分段显示AI分析内容
    const analysisLines = data.aiAnalysis.split('\n').slice(0, 12);
    analysisLines.forEach((line, i) => {
      const lineText = renderText(line.substring(0, 60), { fontSize: 9, color: THEME.text, width: 340 });
      doc.addImage(toBase64(lineText), 'PNG', THEME.margin + 5, y + 5 + i * 6, 170, 5);
    });
    
    y += 90;
  }
  
  // 总结
  y = drawSectionTitle(doc, '总结与注意事项', y);
  
  doc.setFillColor(THEME.warningLight);
  drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 30, 3);
  
  const summaryText = `根据${data.diagnosisType === 'face' ? '面诊' : '舌诊'}分析，您的体质为${data.constitution || '待定'}。建议结合饮食调理和生活方式改善，如有持续不适，请及时就医。`;
  const summary = renderText(summaryText, { fontSize: 9, color: '#78350F', width: 340, lineHeight: 1.5 });
  doc.addImage(toBase64(summary), 'PNG', THEME.margin + 5, y + 5, THEME.contentWidth - 10, 20);
  
  y += 35;
  
  // 注意事项
  doc.setFillColor(THEME.dangerLight);
  drawRoundedRect(doc, THEME.margin, y, THEME.contentWidth, 25, 3);
  const noteTitle = renderText('⚠️ 重要提示', { fontSize: 10, fontWeight: 'bold', color: '#991B1B', width: 340 });
  doc.addImage(toBase64(noteTitle), 'PNG', THEME.margin + 5, y + 3, 40, 6);
  const noteText = renderText('1. 本报告仅供参考，不作为医疗诊断依据\n2. 建议定期复查，关注身体变化', { fontSize: 8, color: '#7F1D1D', width: 340 });
  doc.addImage(toBase64(noteText), 'PNG', THEME.margin + 5, y + 10, 170, 12);
  
  drawFooter(doc, data.diagnosisType);
  
  return doc.output('blob');
}

export function downloadTCMPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateTCMReportFilename(diagnosisType: 'face' | 'tongue'): string {
  const date = new Date().toISOString().split('T')[0];
  const prefix = diagnosisType === 'face' ? '面诊报告' : '舌诊报告';
  return `${prefix}-${date}.pdf`;
}
