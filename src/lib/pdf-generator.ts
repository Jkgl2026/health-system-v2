/**
 * PDF报告生成器 - 中文版
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
  primary: [99, 102, 241] as [number, number, number], // indigo
  secondary: [34, 197, 94] as [number, number, number], // green
  warning: [234, 179, 8] as [number, number, number], // yellow
  danger: [239, 68, 68] as [number, number, number], // red
  text: [31, 41, 55] as [number, number, number], // gray-800
  lightText: [107, 114, 128] as [number, number, number], // gray-500
  background: [249, 250, 251] as [number, number, number], // gray-50
  tcm: [139, 69, 19] as [number, number, number], // saddlebrown
};

// 中文字体映射
const CHINESE_FONT = 'helvetica'; // jsPDF默认不支持中文，使用helvetica作为基础

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
  let pageNum = 1;
  
  // ==================== 封面 ====================
  // 标题背景
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 70, 'F');
  
  // 标题
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont(CHINESE_FONT, 'bold');
  doc.text('AI 体态评估报告', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont(CHINESE_FONT, 'normal');
  doc.text('专业体态分析与改善方案', pageWidth / 2, 42, { align: 'center' });
  
  // 日期和用户名
  doc.setFontSize(12);
  doc.text(`评估日期: ${data.assessmentDate}`, pageWidth / 2, 58, { align: 'center' });
  
  if (data.userName) {
    doc.text(`用户: ${data.userName}`, pageWidth / 2, 68, { align: 'center' });
  }
  
  y = 85;
  
  // ==================== 评分区域 ====================
  // 评分卡片
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, y, contentWidth / 2 - 5, 45, 3, 3);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont(CHINESE_FONT, 'bold');
  doc.text('综合评分', margin + 10, y + 12);
  
  // 评分数字
  const scoreColor = data.overallScore >= 80 ? COLORS.secondary : 
                     data.overallScore >= 60 ? COLORS.warning : COLORS.danger;
  doc.setTextColor(...scoreColor);
  doc.setFontSize(32);
  doc.text(`${data.overallScore}`, margin + 25, y + 36);
  
  doc.setTextColor(...COLORS.lightText);
  doc.setFontSize(12);
  doc.text('/ 100', margin + 50, y + 36);
  
  // 等级卡片
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, 45, 3, 3);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(12);
  doc.setFont(CHINESE_FONT, 'bold');
  doc.text('评估等级', margin + contentWidth / 2 + 15, y + 12);
  
  doc.setTextColor(...scoreColor);
  doc.setFontSize(26);
  doc.text(data.grade, margin + contentWidth / 2 + 20, y + 36);
  
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.text(`(${getGradeText(data.grade)})`, margin + contentWidth / 2 + 35, y + 36);
  
  y += 60;
  
  // ==================== 检测到的问题 ====================
  addSection(doc, '检测到的体态问题', y, COLORS.text);
  y += 10;
  
  if (data.issues.length > 0) {
    data.issues.forEach((issue, index) => {
      if (y > pageHeight - 40) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = margin;
      }
      
      // 问题卡片
      const severityColor = issue.severity === 'severe' ? COLORS.danger :
                           issue.severity === 'moderate' ? COLORS.warning : COLORS.secondary;
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2);
      
      // 严重程度指示条
      doc.setFillColor(...severityColor);
      doc.roundedRect(margin, y, 4, 15, 2, 2);
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text(`${index + 1}. ${issue.name}`, margin + 8, y + 6);
      
      doc.setTextColor(...COLORS.lightText);
      doc.setFont(CHINESE_FONT, 'normal');
      doc.text(`严重程度: ${getSeverityText(issue.severity)} | 角度: ${issue.angle.toFixed(1)}deg`, margin + 8, y + 12);
      
      if (issue.description) {
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.lightText);
        doc.text(issue.description.substring(0, 80), margin + 8, y + 16);
      }
      
      y += 18;
    });
  } else {
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(11);
    doc.text('未检测到明显的体态问题！', margin + 5, y + 5);
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
    
    addSection(doc, '关节角度测量数据', y, COLORS.text);
    y += 10;
    
    const angleEntries = Object.entries(data.angles).slice(0, 15);
    const colWidth = contentWidth / 2;
    
    angleEntries.forEach(([key, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * colWidth;
      const currentY = y + row * 8;
      
      if (currentY > pageHeight - 20) return;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.text(`${key}: ${value.toFixed(1)}deg`, x + 5, currentY);
    });
    
    y += Math.ceil(angleEntries.length / 2) * 8 + 10;
  }
  
  y += 10;
  
  // ==================== 肌肉分析 ====================
  if (data.muscles && (data.muscles.tight.length > 0 || data.muscles.weak.length > 0)) {
    if (y > pageHeight - 70) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '肌肉功能分析', y, COLORS.text);
    y += 10;
    
    const tightHeight = 10 + data.muscles.tight.length * 6;
    const weakHeight = 10 + data.muscles.weak.length * 6;
    const cardHeight = Math.max(tightHeight, weakHeight);
    
    // 紧张肌肉
    doc.setFillColor(254, 226, 226); // red-100
    doc.roundedRect(margin, y, contentWidth / 2 - 5, cardHeight, 2, 2);
    
    doc.setTextColor(185, 28, 28); // red-700
    doc.setFontSize(11);
    doc.setFont(CHINESE_FONT, 'bold');
    doc.text('紧张肌肉', margin + 5, y + 8);
    
    doc.setFontSize(9);
    doc.setFont(CHINESE_FONT, 'normal');
    data.muscles.tight.slice(0, 6).forEach((m, i) => {
      doc.text(`• ${m}`, margin + 5, y + 15 + i * 6);
    });
    
    // 无力肌肉
    doc.setFillColor(219, 234, 254); // blue-100
    doc.roundedRect(margin + contentWidth / 2 + 5, y, contentWidth / 2 - 5, cardHeight, 2, 2);
    
    doc.setTextColor(30, 64, 175); // blue-700
    doc.setFontSize(11);
    doc.setFont(CHINESE_FONT, 'bold');
    doc.text('无力肌肉', margin + contentWidth / 2 + 10, y + 8);
    
    doc.setFontSize(9);
    doc.setFont(CHINESE_FONT, 'normal');
    data.muscles.weak.slice(0, 6).forEach((m, i) => {
      doc.text(`• ${m}`, margin + contentWidth / 2 + 10, y + 15 + i * 6);
    });
    
    y += cardHeight + 15;
  }
  
  y += 10;
  
  // ==================== 健康风险 ====================
  if (data.risks && data.risks.length > 0) {
    if (y > pageHeight - 50) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    addSection(doc, '健康风险评估', y, COLORS.text);
    y += 10;
    
    data.risks.slice(0, 6).forEach((risk) => {
      if (y > pageHeight - 25) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = margin;
      }
      
      const riskColor = risk.risk === 'high' ? COLORS.danger :
                       risk.risk === 'medium' ? COLORS.warning : COLORS.secondary;
      
      const bgColor = riskColor.map(c => Math.round(c * 0.1 + 245)) as [number, number, number];
      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, y, contentWidth, 12, 2, 2);
      
      doc.setFillColor(...riskColor);
      doc.roundedRect(margin, y, 3, 12, 2, 2);
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.text(`${risk.category}: ${risk.condition}`, margin + 6, y + 7);
      
      doc.setTextColor(...riskColor);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text(getRiskText(risk.risk), margin + contentWidth - 25, y + 7);
      
      y += 15;
    });
  }
  
  y += 15;
  
  // ==================== 中医分析 ====================
  if (data.tcmAnalysis) {
    if (y > pageHeight - 100) {
      addPageFooter(doc, pageNum);
      doc.addPage();
      pageNum++;
      y = margin;
    }
    
    // 新页面专门用于中医分析
    addPageFooter(doc, pageNum);
    doc.addPage();
    pageNum++;
    y = margin;
    
    addSection(doc, '中医体质分析', y, COLORS.tcm);
    y += 10;
    
    // 体质类型
    if (data.tcmAnalysis.constitution) {
      doc.setFillColor(255, 248, 220); // cornsilk
      doc.roundedRect(margin, y, contentWidth, 20, 3, 3);
      
      doc.setTextColor(...COLORS.tcm);
      doc.setFontSize(11);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('体质类型:', margin + 5, y + 8);
      
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(10);
      doc.text(data.tcmAnalysis.constitution, margin + 35, y + 8);
      
      if (data.tcmAnalysis.constitutionType) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.lightText);
        doc.text(data.tcmAnalysis.constitutionType.substring(0, 100), margin + 5, y + 16);
      }
      
      y += 25;
    }
    
    // 经络症状
    if (data.tcmAnalysis.meridianSymptoms && data.tcmAnalysis.meridianSymptoms.length > 0) {
      doc.setTextColor(...COLORS.tcm);
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('经络症状表现:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.meridianSymptoms.slice(0, 4).forEach(symptom => {
        doc.text(`• ${symptom.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 穴位禁忌
    if (data.tcmAnalysis.acupointContraindications && data.tcmAnalysis.acupointContraindications.length > 0) {
      doc.setTextColor(...COLORS.danger);
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('穴位禁忌:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.acupointContraindications.slice(0, 3).forEach(contra => {
        doc.text(`• ${contra.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 导引建议
    if (data.tcmAnalysis.daoyinSuggestions && data.tcmAnalysis.daoyinSuggestions.length > 0) {
      doc.setTextColor(...COLORS.secondary);
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('导引养生建议:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.daoyinSuggestions.slice(0, 3).forEach(sug => {
        doc.text(`• ${sug.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 食疗建议
    if (data.tcmAnalysis.dietSuggestions && data.tcmAnalysis.dietSuggestions.length > 0) {
      doc.setTextColor(...COLORS.warning);
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('食疗调理建议:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.dietSuggestions.slice(0, 3).forEach(sug => {
        doc.text(`• ${sug.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 四季养生
    if (data.tcmAnalysis.seasonalAdvice && data.tcmAnalysis.seasonalAdvice.length > 0) {
      doc.setTextColor(0, 128, 128); // teal
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('四季养生要点:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.seasonalAdvice.slice(0, 2).forEach(advice => {
        doc.text(`• ${advice.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 日常时辰
    if (data.tcmAnalysis.dailySchedule && data.tcmAnalysis.dailySchedule.length > 0) {
      doc.setTextColor(128, 0, 128); // purple
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text('日常时辰养生:', margin, y);
      y += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.text);
      doc.setFont(CHINESE_FONT, 'normal');
      data.tcmAnalysis.dailySchedule.slice(0, 2).forEach(schedule => {
        doc.text(`• ${schedule.substring(0, 70)}`, margin + 5, y);
        y += 5;
      });
      y += 10;
    }
  }
  
  // ==================== 训练方案 ====================
  if (data.trainingPlan && data.trainingPlan.phases.length > 0) {
    addPageFooter(doc, pageNum);
    doc.addPage();
    pageNum++;
    y = margin;
    
    addSection(doc, '五阶段训练改善方案', y, COLORS.primary);
    y += 10;
    
    data.trainingPlan.phases.forEach((phase, phaseIndex) => {
      if (y > pageHeight - 60) {
        addPageFooter(doc, pageNum);
        doc.addPage();
        pageNum++;
        y = margin;
      }
      
      // 阶段标题
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.text(`阶段${phaseIndex + 1}: ${phase.name} (${phase.duration})`, margin + 5, y + 7);
      y += 12;
      
      // 重点
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.text(`训练重点: ${phase.focus}`, margin + 5, y);
      y += 8;
      
      // 周计划
      if (phase.weeklyPlan && phase.weeklyPlan.length > 0) {
        phase.weeklyPlan.slice(0, 1).forEach(week => {
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.lightText);
          doc.text(`第${week.week}周计划:`, margin + 5, y);
          y += 5;
          
          week.sessions.slice(0, 3).forEach(session => {
            doc.setTextColor(...COLORS.text);
            doc.text(`${session.day}: ${session.exercises.slice(0, 2).join(', ')}`, margin + 10, y);
            y += 5;
          });
        });
      }
      
      y += 10;
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
    
    addSection(doc, '改善建议', y, COLORS.text);
    y += 10;
    
    // 立即建议
    if (data.recommendations.immediate && data.recommendations.immediate.length > 0) {
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.setTextColor(...COLORS.danger);
      doc.text('立即行动:', margin, y);
      y += 6;
      
      doc.setFont(CHINESE_FONT, 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.immediate.slice(0, 4).forEach((rec) => {
        doc.text(`• ${rec.substring(0, 80)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 短期建议
    if (data.recommendations.shortTerm && data.recommendations.shortTerm.length > 0) {
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.setTextColor(...COLORS.warning);
      doc.text('短期计划 (1-4周):', margin, y);
      y += 6;
      
      doc.setFont(CHINESE_FONT, 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.shortTerm.slice(0, 4).forEach((rec) => {
        doc.text(`• ${rec.substring(0, 80)}`, margin + 5, y);
        y += 5;
      });
      y += 5;
    }
    
    // 长期建议
    if (data.recommendations.longTerm && data.recommendations.longTerm.length > 0) {
      doc.setFontSize(10);
      doc.setFont(CHINESE_FONT, 'bold');
      doc.setTextColor(...COLORS.secondary);
      doc.text('长期策略 (1-3个月):', margin, y);
      y += 6;
      
      doc.setFont(CHINESE_FONT, 'normal');
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      data.recommendations.longTerm.slice(0, 4).forEach((rec) => {
        doc.text(`• ${rec.substring(0, 80)}`, margin + 5, y);
        y += 5;
      });
    }
  }
  
  // ==================== 页脚 ====================
  addPageFooter(doc, pageNum);
  
  // 生成Blob
  return doc.output('blob');
}

// 添加章节标题
function addSection(doc: jsPDF, title: string, y: number, color: [number, number, number]) {
  doc.setTextColor(...color);
  doc.setFontSize(14);
  doc.setFont(CHINESE_FONT, 'bold');
  doc.text(title, 15, y);
  
  // 分隔线
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, y + 3, 195, y + 3);
}

// 添加页脚
function addPageFooter(doc: jsPDF, pageNum: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `AI 体态评估系统生成 | 第 ${pageNum} 页`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
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
