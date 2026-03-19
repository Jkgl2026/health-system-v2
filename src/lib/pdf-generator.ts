/**
 * PDF报告生成器
 */

import { jsPDF } from 'jspdf';

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
    meridians: string[];
    acupoints: string[];
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
  primary: [99, 102, 241] as [number, number, number], // indigo
  secondary: [34, 197, 94] as [number, number, number], // green
  warning: [234, 179, 8] as [number, number, number], // yellow
  danger: [239, 68, 68] as [number, number, number], // red
  text: [31, 41, 55] as [number, number, number], // gray-800
  lightText: [107, 114, 128] as [number, number, number], // gray-500
  background: [249, 250, 251] as [number, number, number], // gray-50
};

// 生成PDF报告
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
  
  // ==================== 封面 ====================
  // 标题背景
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // 标题
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Body Posture Assessment Report', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Posture Analysis & Improvement Plan', pageWidth / 2, 38, { align: 'center' });
  
  // 日期和评分
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Assessment Date: ${data.assessmentDate}`, pageWidth / 2, 50, { align: 'center' });
  
  y = 75;
  
  // ==================== 评分区域 ====================
  // 评分卡片
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 40, 3, 3);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Score', margin + 10, y + 12);
  
  // 评分数字
  const scoreColor = data.overallScore >= 80 ? COLORS.secondary : 
                     data.overallScore >= 60 ? COLORS.warning : COLORS.danger;
  doc.setTextColor(...scoreColor);
  doc.setFontSize(28);
  doc.text(`${data.overallScore}`, margin + 25, y + 32);
  
  doc.setTextColor(...COLORS.lightText);
  doc.setFontSize(10);
  doc.text(`/ 100`, margin + 45, y + 32);
  
  // 等级卡片
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 40, 3, 3);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grade', margin + contentWidth / 2 + 15, y + 12);
  
  doc.setTextColor(...scoreColor);
  doc.setFontSize(24);
  doc.text(`${data.grade} (${getGradeText(data.grade)})`, margin + contentWidth / 2 + 15, y + 32);
  
  y += 55;
  
  // ==================== 检测到的问题 ====================
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detected Issues', margin, y);
  
  y += 8;
  
  // 问题列表
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (data.issues.length > 0) {
    data.issues.forEach((issue, index) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
      }
      
      // 问题卡片
      const severityColor = issue.severity === 'severe' ? COLORS.danger :
                           issue.severity === 'moderate' ? COLORS.warning : COLORS.secondary;
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2);
      
      // 严重程度指示条
      doc.setFillColor(...severityColor);
      doc.roundedRect(margin, y, 4, 12, 2, 2);
      
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${issue.name}`, margin + 8, y + 8);
      
      doc.setTextColor(...COLORS.lightText);
      doc.setFont('helvetica', 'normal');
      doc.text(`${getSeverityText(issue.severity)} | Angle: ${issue.angle.toFixed(1)}deg`, margin + contentWidth - 50, y + 8);
      
      y += 15;
    });
  } else {
    doc.setTextColor(...COLORS.secondary);
    doc.text('No significant posture issues detected!', margin + 5, y + 5);
    y += 15;
  }
  
  y += 10;
  
  // ==================== 肌肉分析 ====================
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Muscle Analysis', margin, y);
    
    y += 8;
    
    // 紧张肌肉
    doc.setFillColor(254, 226, 226); // red-100
    doc.roundedRect(margin, y, contentWidth / 2 - 5, 8 + data.muscles.tight.length * 5, 2, 2);
    
    doc.setTextColor(185, 28, 28); // red-700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Tight Muscles', margin + 5, y + 6);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.muscles.tight.slice(0, 6).forEach((m, i) => {
      doc.text(`• ${m}`, margin + 5, y + 12 + i * 5);
    });
    
    // 无力肌肉
    doc.setFillColor(219, 234, 254); // blue-100
    doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 8 + data.muscles.weak.length * 5, 2, 2);
    
    doc.setTextColor(30, 64, 175); // blue-700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Weak Muscles', margin + contentWidth / 2 + 10, y + 6);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data.muscles.weak.slice(0, 6).forEach((m, i) => {
      doc.text(`• ${m}`, margin + contentWidth / 2 + 10, y + 12 + i * 5);
    });
    
    y += 15 + Math.max(data.muscles.tight.length, data.muscles.weak.length) * 5;
  }
  
  y += 10;
  
  // ==================== 健康风险 ====================
  if (data.risks && data.risks.length > 0) {
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }
    
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Health Risk Assessment', margin, y);
    
    y += 8;
    
    data.risks.slice(0, 5).forEach((risk) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      
      const riskColor = risk.risk === 'high' ? COLORS.danger :
                       risk.risk === 'medium' ? COLORS.warning : COLORS.secondary;
      
      const bgColor = riskColor.map(c => Math.round(c * 0.1 + 245)) as [number, number, number];
      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2);
      
      doc.setFillColor(...riskColor);
      doc.roundedRect(margin, y, 3, 10, 2, 2);
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.text(`${risk.category}: ${risk.condition}`, margin + 6, y + 6);
      
      doc.setTextColor(...riskColor);
      doc.text(`${risk.risk.toUpperCase()} RISK`, margin + contentWidth - 25, y + 6);
      
      y += 13;
    });
  }
  
  y += 10;
  
  // ==================== 改善建议 ====================
  if (data.recommendations) {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Improvement Recommendations', margin, y);
    
    y += 8;
    
    // 立即建议
    if (data.recommendations.immediate.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.danger);
      doc.text('Immediate Actions:', margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.immediate.slice(0, 3).forEach((rec) => {
        doc.text(`• ${rec}`, margin + 5, y);
        y += 5;
      });
      y += 3;
    }
    
    // 短期建议
    if (data.recommendations.shortTerm.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.warning);
      doc.text('Short-term Plan:', margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.shortTerm.slice(0, 3).forEach((rec) => {
        doc.text(`• ${rec}`, margin + 5, y);
        y += 5;
      });
      y += 3;
    }
    
    // 长期建议
    if (data.recommendations.longTerm.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text('Long-term Strategy:', margin, y);
      y += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.longTerm.slice(0, 3).forEach((rec) => {
        doc.text(`• ${rec}`, margin + 5, y);
        y += 5;
      });
    }
  }
  
  // ==================== 页脚 ====================
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.lightText);
  doc.text(
    'This report is generated by AI Posture Assessment System. For reference only.',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  // 生成Blob
  return doc.output('blob');
}

// 辅助函数
function getGradeText(grade: string): string {
  const texts: Record<string, string> = {
    'A': 'Excellent',
    'B': 'Good',
    'C': 'Fair',
    'D': 'Needs Work',
    'E': 'Requires Attention',
  };
  return texts[grade] || 'Unknown';
}

function getSeverityText(severity: string): string {
  const texts: Record<string, string> = {
    'mild': 'Mild',
    'moderate': 'Moderate',
    'severe': 'Severe',
  };
  return texts[severity] || 'None';
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
  return `posture-assessment-${date}-score${score}.pdf`;
}
