/**
 * 统一报告生成器 - 支持面诊、舌诊、体态评估报告
 * 使用 docx 库生成专业格式的 Word 文档
 */

import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';

// ==================== 类型定义 ====================

export interface UserInfo {
  name: string;
  gender?: string;
  age?: string;
  phone?: string;
}

export interface FaceDiagnosisData {
  score?: number;
  faceColor?: {
    color?: string;
    meaning?: string;
    severity?: string;
  };
  faceLuster?: {
    status?: string;
    meaning?: string;
  };
  facialFeatures?: {
    eyes?: { status?: string; issues?: string[]; organRef?: string };
    nose?: { status?: string; issues?: string[]; organRef?: string };
    lips?: { status?: string; issues?: string[]; organRef?: string };
    ears?: { status?: string; issues?: string[]; organRef?: string };
    forehead?: { status?: string; issues?: string[]; organRef?: string };
  };
  facialCharacteristics?: {
    spots?: string;
    acne?: string;
    wrinkles?: string;
    puffiness?: string;
    darkCircles?: string;
  };
  constitution?: {
    type?: string;
    confidence?: number;
    secondary?: string;
  };
  organStatus?: {
    heart?: number;
    liver?: number;
    spleen?: number;
    lung?: number;
    kidney?: number;
  };
  suggestions?: Array<{ type: string; content: string }>;
  summary?: string;
  fullReport?: string;
  timestamp?: string;
  // 三高风险评估（新增）
  tripleHighRisk?: any;
}

export interface TongueDiagnosisData {
  score?: number;
  tongueBody?: {
    color?: string;
    shape?: string;
    texture?: string;
    meaning?: string;
  };
  tongueCoating?: {
    color?: string;
    thickness?: string;
    moisture?: string;
    meaning?: string;
  };
  constitution?: {
    type?: string;
    confidence?: number;
    secondary?: string;
  };
  organStatus?: {
    heart?: number;
    liver?: number;
    spleen?: number;
    lung?: number;
    kidney?: number;
  };
  suggestions?: Array<{ type: string; content: string }>;
  summary?: string;
  fullReport?: string;
  timestamp?: string;
  // 三高风险评估（新增）
  tripleHighRisk?: any;
}

export interface PostureDiagnosisData {
  overallScore?: number;
  grade?: string;
  issues?: Array<{
    type: string;
    name: string;
    nameEn: string;
    severity: string;
    angle: number;
    description: string;
    anatomicalInfo?: {
      affectedStructures?: string[];
      relatedMuscles?: {
        tight?: string[];
        weak?: string[];
      };
      potentialSymptoms?: string[];
    };
    healthImpact?: {
      shortTerm?: string[];
      midTerm?: string[];
      longTerm?: string[];
    };
  }>;
  muscles?: Array<{
    name: string;
    status: string;
    severity: string;
    reason: string;
  }>;
  trainingPlan?: {
    phases?: Array<{
      name: string;
      duration: string;
      goals: string[];
      exercises: string[];
    }>;
  };
  semanticAnalysis?: {
    summary?: string;
    recommendations?: string[];
    tcmPerspective?: string;
  };
  timestamp?: string;
}

export type ReportType = 'face' | 'tongue' | 'posture';

// ==================== 辅助函数 ====================

/**
 * 生成报告编号
 */
function generateReportId(type: ReportType): string {
  const prefix = type === 'face' ? 'FD' : type === 'tongue' ? 'TD' : 'PD';
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${dateStr}${random}`;
}

/**
 * 格式化日期时间
 */
function formatDateTime(date?: string): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 获取评估等级
 */
function getGrade(score: number): { grade: string; description: string } {
  if (score >= 90) return { grade: 'A级', description: '健康状态良好' };
  if (score >= 80) return { grade: 'B级', description: '基本健康，略有不足' };
  if (score >= 70) return { grade: 'C级', description: '轻度异常，建议调理' };
  if (score >= 60) return { grade: 'D级', description: '中度异常，建议就医' };
  return { grade: 'E级', description: '明显异常，需及时就医' };
}

// ==================== 文档构建辅助函数 ====================

/**
 * 创建标题段落
 */
function createTitle(text: string, size: number = 36): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({
        text,
        bold: true,
        size,
        font: 'Microsoft YaHei',
      }),
    ],
  });
}

/**
 * 创建副标题
 */
function createSubtitle(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text,
        size: 28,
        font: 'Microsoft YaHei',
      }),
    ],
  });
}

/**
 * 创建分隔线
 */
function createDivider(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 100 },
    children: [
      new TextRun({
        text: '─'.repeat(60),
        font: 'Microsoft YaHei',
        color: '666666',
      }),
    ],
  });
}

/**
 * 创建章节标题
 */
function createSectionTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: `【${text}】`,
        bold: true,
        size: 24,
        font: 'Microsoft YaHei',
        color: '2B579A',
      }),
    ],
  });
}

/**
 * 创建普通段落
 */
function createParagraph(text: string, indent: number = 0): Paragraph {
  return new Paragraph({
    indent: indent ? { left: indent * 200 } : undefined,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        size: 21,
        font: 'Microsoft YaHei',
      }),
    ],
  });
}

/**
 * 创建带标签的段落
 */
function createLabeledParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: label,
        bold: true,
        size: 21,
        font: 'Microsoft YaHei',
      }),
      new TextRun({
        text: value,
        size: 21,
        font: 'Microsoft YaHei',
      }),
    ],
  });
}

/**
 * 创建简单表格
 */
function createSimpleTable(
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): Table {
  const tableRows = [
    // 表头
    new TableRow({
      tableHeader: true,
      children: headers.map((header, index) =>
        new TableCell({
          width: columnWidths ? { size: columnWidths[index], type: WidthType.DXA } : undefined,
          shading: { fill: '2B579A', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  size: 20,
                  font: 'Microsoft YaHei',
                  color: 'FFFFFF',
                }),
              ],
            }),
          ],
        })
      ),
    }),
    // 数据行
    ...rows.map((row) =>
      new TableRow({
        children: row.map((cell, index) =>
          new TableCell({
            width: columnWidths ? { size: columnWidths[index], type: WidthType.DXA } : undefined,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cell,
                    size: 20,
                    font: 'Microsoft YaHei',
                  }),
                ],
              }),
            ],
          })
        ),
      })
    ),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

/**
 * 创建信息框
 */
function createInfoBox(title: string, items: string[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  paragraphs.push(
    new Paragraph({
      spacing: { before: 100, after: 50 },
      shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
      children: [
        new TextRun({
          text: `┌${'─'.repeat(58)}┐`,
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );
  
  paragraphs.push(
    new Paragraph({
      shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
      children: [
        new TextRun({
          text: `│ ${title}`,
          bold: true,
          size: 21,
          font: 'Microsoft YaHei',
        }),
        new TextRun({
          text: ' '.repeat(Math.max(0, 55 - title.length)) + '│',
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );

  items.forEach((item) => {
    paragraphs.push(
      new Paragraph({
        shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
        children: [
          new TextRun({
            text: `│ - ${item}`,
            size: 20,
            font: 'Microsoft YaHei',
          }),
          new TextRun({
            text: ' '.repeat(Math.max(0, 55 - item.length)) + '│',
            font: 'Microsoft YaHei',
            color: '999999',
          }),
        ],
      })
    );
  });

  paragraphs.push(
    new Paragraph({
      shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
      children: [
        new TextRun({
          text: `└${'─'.repeat(58)}┘`,
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );

  return paragraphs;
}

// ==================== 报告头部 ====================

function createReportHeader(
  reportType: ReportType,
  reportId: string,
  userInfo: UserInfo,
  timestamp: string
): Paragraph[] {
  const titleMap = {
    face: '面诊评估报告',
    tongue: '舌诊评估报告',
    posture: '体态评估报告',
  };

  const paragraphs: Paragraph[] = [];

  // 系统标题
  paragraphs.push(createTitle('AI 中医健康管理系统', 40));
  paragraphs.push(createSubtitle(titleMap[reportType]));
  paragraphs.push(createDivider());

  // 报告信息
  paragraphs.push(createSectionTitle('报告信息'));
  paragraphs.push(createLabeledParagraph('  报告编号：', reportId));
  paragraphs.push(createLabeledParagraph('  生成时间：', timestamp));
  paragraphs.push(
    createLabeledParagraph(
      '  报告类型：',
      titleMap[reportType]
    )
  );
  paragraphs.push(createDivider());

  // 受检者信息
  paragraphs.push(createSectionTitle('受检者信息'));
  paragraphs.push(createLabeledParagraph('  姓名：', userInfo.name || '未填写'));
  paragraphs.push(createLabeledParagraph('  性别：', userInfo.gender || '未填写'));
  paragraphs.push(createLabeledParagraph('  年龄：', userInfo.age || '未填写'));
  paragraphs.push(createLabeledParagraph('  联系电话：', userInfo.phone || '未填写'));
  paragraphs.push(createLabeledParagraph('  评估日期：', timestamp.split(' ')[0]));
  paragraphs.push(createDivider());

  return paragraphs;
}

// ==================== 评估摘要 ====================

function createAssessmentSummary(
  score: number,
  grade: { grade: string; description: string },
  issues: string[]
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  elements.push(createSectionTitle('评估结果摘要'));

  // 创建评分表格
  elements.push(
    createSimpleTable(
      ['综合评分', '评估等级', '异常项目'],
      [[score.toString(), grade.grade, issues.length + '项']],
      [3000, 3000, 3000]
    )
  );

  if (issues.length > 0) {
    elements.push(new Paragraph({ spacing: { before: 150 } }));
    elements.push(createParagraph('主要问题：'));
    issues.slice(0, 5).forEach((issue) => {
      elements.push(createParagraph(`  - ${issue}`, 1));
    });
  }

  elements.push(createDivider());

  return elements;
}

// ==================== 面诊报告内容 ====================

function createFaceDiagnosisContent(data: FaceDiagnosisData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const score = data.score || 0;
  const grade = getGrade(score);

  // 面色分析
  if (data.faceColor) {
    elements.push(createSectionTitle('一、面色分析'));
    elements.push(createParagraph('1.1 面色特征'));

    const colorData = data.faceColor;
    elements.push(
      createSimpleTable(
        ['检测项目', '检测结果', '参考标准', '状态'],
        [
          ['面色', colorData.color || '未判断', '红润', colorData.severity === '无' ? '正常' : colorData.severity || '正常'],
        ],
        [2000, 2500, 2500, 2000]
      )
    );

    if (colorData.meaning) {
      elements.push(new Paragraph({ spacing: { before: 150 } }));
      elements.push(createParagraph('1.2 面色诊断'));
      elements.push(createParagraph(colorData.meaning));
    }
    elements.push(createDivider());
  }

  // 光泽分析
  if (data.faceLuster) {
    elements.push(createSectionTitle('二、面色光泽分析'));
    elements.push(createLabeledParagraph('  光泽状态：', data.faceLuster.status || '未判断'));
    if (data.faceLuster.meaning) {
      elements.push(createLabeledParagraph('  气血状态：', data.faceLuster.meaning));
    }
    elements.push(createDivider());
  }

  // 五官分析
  if (data.facialFeatures) {
    elements.push(createSectionTitle('三、五官分析'));

    const features = data.facialFeatures;
    const featureItems: string[][] = [];

    if (features.eyes) {
      featureItems.push(['眼睛（肝）', features.eyes.status || '正常', features.eyes.issues?.join('、') || '无异常']);
    }
    if (features.nose) {
      featureItems.push(['鼻子（脾/肺）', features.nose.status || '正常', features.nose.issues?.join('、') || '无异常']);
    }
    if (features.lips) {
      featureItems.push(['嘴唇（脾）', features.lips.status || '正常', features.lips.issues?.join('、') || '无异常']);
    }
    if (features.ears) {
      featureItems.push(['耳朵（肾）', features.ears.status || '正常', features.ears.issues?.join('、') || '无异常']);
    }
    if (features.forehead) {
      featureItems.push(['额头', features.forehead.status || '正常', features.forehead.issues?.join('、') || '无异常']);
    }

    if (featureItems.length > 0) {
      elements.push(
        createSimpleTable(
          ['部位', '状态', '问题'],
          featureItems,
          [2000, 2500, 4500]
        )
      );
    }
    elements.push(createDivider());
  }

  // 面部特征
  if (data.facialCharacteristics) {
    elements.push(createSectionTitle('四、面部特征'));

    const chars = data.facialCharacteristics;
    const charItems: string[][] = [];

    if (chars.spots) charItems.push(['斑点', chars.spots]);
    if (chars.acne) charItems.push(['痤疮', chars.acne]);
    if (chars.wrinkles) charItems.push(['皱纹', chars.wrinkles]);
    if (chars.puffiness) charItems.push(['浮肿', chars.puffiness]);
    if (chars.darkCircles) charItems.push(['黑眼圈', chars.darkCircles]);

    if (charItems.length > 0) {
      elements.push(
        createSimpleTable(
          ['特征', '描述'],
          charItems,
          [2000, 7000]
        )
      );
    }
    elements.push(createDivider());
  }

  // 五脏状态
  if (data.organStatus) {
    elements.push(createSectionTitle('五、五脏健康状态评估'));

    const organs = data.organStatus;
    elements.push(
      createSimpleTable(
        ['脏腑', '健康值', '状态说明'],
        [
          ['心', (organs.heart || 0) + '分', organs.heart && organs.heart >= 80 ? '心气充沛，功能正常' : organs.heart && organs.heart >= 60 ? '心气稍弱，需注意' : '心气不足，建议调理'],
          ['肝', (organs.liver || 0) + '分', organs.liver && organs.liver >= 80 ? '肝血充足，功能良好' : organs.liver && organs.liver >= 60 ? '肝血稍亏，需注意休息' : '肝血不足，建议调理'],
          ['脾', (organs.spleen || 0) + '分', organs.spleen && organs.spleen >= 80 ? '脾胃健运，功能正常' : organs.spleen && organs.spleen >= 60 ? '脾虚湿盛，建议调理' : '脾胃虚弱，需要调理'],
          ['肺', (organs.lung || 0) + '分', organs.lung && organs.lung >= 80 ? '肺气充足，功能良好' : organs.lung && organs.lung >= 60 ? '肺气稍弱，注意保养' : '肺气不足，建议调理'],
          ['肾', (organs.kidney || 0) + '分', organs.kidney && organs.kidney >= 80 ? '肾气充足，功能良好' : organs.kidney && organs.kidney >= 60 ? '肾气尚可，注意保养' : '肾气不足，建议调理'],
        ],
        [2000, 2000, 5000]
      )
    );
    elements.push(createDivider());
  }

  // 体质判断
  if (data.constitution) {
    elements.push(createSectionTitle('六、体质判断'));

    elements.push(createLabeledParagraph('  主要体质：', data.constitution.type || '未判断'));
    if (data.constitution.confidence) {
      elements.push(createLabeledParagraph('  判断置信度：', data.constitution.confidence + '%'));
    }
    if (data.constitution.secondary) {
      elements.push(createLabeledParagraph('  次要体质：', data.constitution.secondary));
    }
    elements.push(createDivider());
  }

  // 健康建议
  if (data.suggestions && data.suggestions.length > 0) {
    elements.push(createSectionTitle('七、健康建议'));

    data.suggestions.forEach((suggestion, index) => {
      elements.push(createParagraph(`${index + 1}. 【${suggestion.type}】`));
      elements.push(createParagraph(`   ${suggestion.content}`));
    });
    elements.push(createDivider());
  }

  // 三高风险评估（新增）
  if (data.tripleHighRisk) {
    elements.push(createSectionTitle('八、三高风险综合评估（面诊）\n'));

    const thr = data.tripleHighRisk;

    // 总体风险
    if (thr.overallRisk) {
      elements.push(createParagraph('8.1 总体风险评估'));
      elements.push(
        createSimpleTable(
          ['评估项目', '结果'],
          [
            ['风险等级', thr.overallRisk.level || '未评估'],
            ['风险评分', (thr.overallRisk.score || 0) + '分/100'],
            ['置信度', (thr.overallRisk.confidence || 0) + '%'],
            ['主要风险', thr.overallRisk.primaryRisk || '未识别'],
          ],
          [3000, 5000]
        )
      );
      elements.push(new Paragraph({ spacing: { before: 150 } }));
    }

    // 高血压风险
    if (thr.hypertension) {
      elements.push(createSectionTitle('8.2 高血压风险评估'));

      const htn = thr.hypertension;
      elements.push(
        createLabeledParagraph('  风险等级：', htn.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (htn.riskScore || 0) + '分/100')
      );

      // 检测指标
      if (htn.indicators && htn.indicators.length > 0) {
        const indData: string[][] = [];
        htn.indicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('检测指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度'],
              indData,
              [3000, 3000, 2000]
            )
          );
        }
      }

      // 医疗建议
      if (htn.medicalRecommendations && htn.medicalRecommendations.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('医疗建议：'));
        htn.medicalRecommendations.forEach((rec: string) => {
          elements.push(createParagraph(`  • ${rec}`));
        });
      }

      elements.push(createDivider());
    }

    // 高血糖风险
    if (thr.hyperglycemia) {
      elements.push(createSectionTitle('8.3 高血糖风险评估'));

      const hgly = thr.hyperglycemia;
      elements.push(
        createLabeledParagraph('  风险等级：', hgly.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (hgly.riskScore || 0) + '分/100')
      );

      // 检测指标
      if (hgly.indicators && hgly.indicators.length > 0) {
        const indData: string[][] = [];
        hgly.indicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('检测指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度'],
              indData,
              [3000, 3000, 2000]
            )
          );
        }
      }

      // 医疗建议
      if (hgly.medicalRecommendations && hgly.medicalRecommendations.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('医疗建议：'));
        hgly.medicalRecommendations.forEach((rec: string) => {
          elements.push(createParagraph(`  • ${rec}`));
        });
      }

      elements.push(createDivider());
    }

    // 高血脂风险
    if (thr.hyperlipidemia) {
      elements.push(createSectionTitle('8.4 高血脂风险评估'));

      const hlip = thr.hyperlipidemia;
      elements.push(
        createLabeledParagraph('  风险等级：', hlip.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (hlip.riskScore || 0) + '分/100')
      );

      // 检测指标
      if (hlip.indicators && hlip.indicators.length > 0) {
        const indData: string[][] = [];
        hlip.indicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('检测指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度'],
              indData,
              [3000, 3000, 2000]
            )
          );
        }
      }

      // 医疗建议
      if (hlip.medicalRecommendations && hlip.medicalRecommendations.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('医疗建议：'));
        hlip.medicalRecommendations.forEach((rec: string) => {
          elements.push(createParagraph(`  • ${rec}`));
        });
      }

      elements.push(createDivider());
    }

    // 综合建议
    if (thr.comprehensiveRecommendations) {
      elements.push(createSectionTitle('8.5 综合建议'));

      if (thr.comprehensiveRecommendations.immediate) {
        elements.push(createParagraph('立即行动：'));
        thr.comprehensiveRecommendations.immediate.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      if (thr.comprehensiveRecommendations.shortTerm) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('短期目标（1-3个月）：'));
        thr.comprehensiveRecommendations.shortTerm.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      if (thr.comprehensiveRecommendations.longTerm) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('长期规划（3年以上）：'));
        thr.comprehensiveRecommendations.longTerm.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      elements.push(createDivider());
    }

    // 生活方式因素
    if (thr.lifestyleFactors) {
      elements.push(createSectionTitle('8.6 生活方式因素分析'));

      if (thr.lifestyleFactors.diet) {
        elements.push(createParagraph('饮食因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.diet.status || '未评估'));
        if (thr.lifestyleFactors.diet.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.diet.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.exercise) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('运动因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.exercise.status || '未评估'));
        if (thr.lifestyleFactors.exercise.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.exercise.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.sleep) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('睡眠因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.sleep.status || '未评估'));
        if (thr.lifestyleFactors.sleep.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.sleep.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.stress) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('压力因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.stress.status || '未评估'));
        if (thr.lifestyleFactors.stress.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.stress.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      elements.push(createDivider());
    }
  }

  return elements;
}

// ==================== 舌诊报告内容 ====================

function createTongueDiagnosisContent(data: TongueDiagnosisData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const score = data.score || 0;
  const grade = getGrade(score);

  // 舌象综合分析
  elements.push(createSectionTitle('一、舌象综合分析'));

  const tongueData: string[][] = [];
  if (data.tongueBody) {
    tongueData.push(['舌色', data.tongueBody.color || '未判断', '淡红', data.tongueBody.color === '淡红' ? '正常' : '需关注']);
    tongueData.push(['舌形', data.tongueBody.shape || '未判断', '适中', data.tongueBody.shape === '正常' ? '正常' : '需关注']);
  }
  if (data.tongueCoating) {
    tongueData.push(['苔色', data.tongueCoating.color || '未判断', '薄白', data.tongueCoating.color === '白苔' && data.tongueCoating.thickness === '薄苔' ? '正常' : '需关注']);
    tongueData.push(['苔质', data.tongueCoating.thickness || '未判断', '薄苔', data.tongueCoating.thickness === '薄苔' ? '正常' : '需关注']);
    tongueData.push(['润燥', data.tongueCoating.moisture || '未判断', '润苔', data.tongueCoating.moisture === '润苔' ? '正常' : '需关注']);
  }

  if (tongueData.length > 0) {
    elements.push(
      createSimpleTable(
        ['检测项目', '检测结果', '参考标准', '状态'],
        tongueData,
        [2000, 2500, 2500, 2000]
      )
    );
  }
  elements.push(createDivider());

  // 舌质分析
  if (data.tongueBody) {
    elements.push(createSectionTitle('二、舌质分析'));

    elements.push(createLabeledParagraph('  舌色：', data.tongueBody.color || '未判断'));
    elements.push(createLabeledParagraph('  舌形：', data.tongueBody.shape || '未判断'));
    elements.push(createLabeledParagraph('  舌态：', data.tongueBody.texture || '未判断'));

    if (data.tongueBody.meaning) {
      elements.push(new Paragraph({ spacing: { before: 150 } }));
      elements.push(createParagraph('舌质分析结论：'));
      elements.push(createParagraph(data.tongueBody.meaning));
    }
    elements.push(createDivider());
  }

  // 舌苔分析
  if (data.tongueCoating) {
    elements.push(createSectionTitle('三、舌苔分析'));

    elements.push(createLabeledParagraph('  苔色：', data.tongueCoating.color || '未判断'));
    elements.push(createLabeledParagraph('  苔质：', data.tongueCoating.thickness || '未判断'));
    elements.push(createLabeledParagraph('  润燥：', data.tongueCoating.moisture || '未判断'));

    if (data.tongueCoating.meaning) {
      elements.push(new Paragraph({ spacing: { before: 150 } }));
      elements.push(createParagraph('舌苔分析结论：'));
      elements.push(createParagraph(data.tongueCoating.meaning));
    }
    elements.push(createDivider());
  }

  // 五脏状态
  if (data.organStatus) {
    elements.push(createSectionTitle('四、脏腑功能评估'));

    const organs = data.organStatus;
    elements.push(
      createSimpleTable(
        ['脏腑', '健康值', '状态说明'],
        [
          ['心', (organs.heart || 0) + '分', organs.heart && organs.heart >= 80 ? '心气充沛' : '需注意'],
          ['肝', (organs.liver || 0) + '分', organs.liver && organs.liver >= 80 ? '肝血充足' : '需注意'],
          ['脾', (organs.spleen || 0) + '分', organs.spleen && organs.spleen >= 80 ? '脾胃健运' : '需调理'],
          ['肺', (organs.lung || 0) + '分', organs.lung && organs.lung >= 80 ? '肺气充足' : '需注意'],
          ['肾', (organs.kidney || 0) + '分', organs.kidney && organs.kidney >= 80 ? '肾气充足' : '需保养'],
        ],
        [2000, 2000, 5000]
      )
    );
    elements.push(createDivider());
  }

  // 体质判断
  if (data.constitution) {
    elements.push(createSectionTitle('五、体质判断'));

    elements.push(createLabeledParagraph('  主要体质：', data.constitution.type || '未判断'));
    if (data.constitution.confidence) {
      elements.push(createLabeledParagraph('  判断置信度：', data.constitution.confidence + '%'));
    }
    if (data.constitution.secondary) {
      elements.push(createLabeledParagraph('  次要体质：', data.constitution.secondary));
    }
    elements.push(createDivider());
  }

  // 健康建议
  if (data.suggestions && data.suggestions.length > 0) {
    elements.push(createSectionTitle('六、健康建议'));

    data.suggestions.forEach((suggestion, index) => {
      elements.push(createParagraph(`${index + 1}. 【${suggestion.type}】`));
      elements.push(createParagraph(`   ${suggestion.content}`));
    });
    elements.push(createDivider());
  }

  // 三高风险评估（新增 - 舌诊专用，包含中医深度分析）
  if (data.tripleHighRisk) {
    elements.push(createSectionTitle('七、三高风险综合评估（舌诊）\n'));

    const thr = data.tripleHighRisk;

    // 总体风险
    if (thr.overallRisk) {
      elements.push(createParagraph('7.1 总体风险评估'));
      elements.push(
        createSimpleTable(
          ['评估项目', '结果'],
          [
            ['风险等级', thr.overallRisk.level || '未评估'],
            ['风险评分', (thr.overallRisk.score || 0) + '分/100'],
            ['中医证型', thr.overallRisk.tcmPattern || '未识别'],
            ['置信度', (thr.overallRisk.confidence || 0) + '%'],
          ],
          [3000, 5000]
        )
      );
      elements.push(new Paragraph({ spacing: { before: 150 } }));
    }

    // 高血压风险（舌诊版本，包含中医深度分析）
    if (thr.hypertension) {
      elements.push(createSectionTitle('7.2 高血压风险评估'));

      const htn = thr.hypertension;
      elements.push(
        createLabeledParagraph('  风险等级：', htn.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (htn.riskScore || 0) + '分/100')
      );

      // 舌象指标
      if (htn.tongueIndicators && htn.tongueIndicators.length > 0) {
        const indData: string[][] = [];
        htn.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%', ind.tcmMeaning || '-']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('舌象指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度', '中医含义'],
              indData,
              [2500, 2000, 1500, 4000]
            )
          );
        }
      }

      // 中医证型分析
      if (htn.tcmPatterns && htn.tcmPatterns.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('中医证型分析：'));
        htn.tcmPatterns.forEach((pattern: any) => {
          elements.push(createParagraph(`  • ${pattern.pattern}（匹配度${pattern.matchScore}%）`));
          elements.push(createParagraph(`    病机：${pattern.pathology}`));
          elements.push(createParagraph(`    治则：${pattern.treatmentPrinciple}`));
        });
      }

      // 脏腑关系
      if (htn.organInvolvement && htn.organInvolvement.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('脏腑关系：'));
        elements.push(
          createSimpleTable(
            ['脏腑', '状态', '描述'],
            htn.organInvolvement.map((org: any) => [org.organ, org.status, org.description]),
            [2000, 2000, 5000]
          )
        );
      }

      // 中医治疗方案
      if (htn.treatmentPlan) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('中医治疗方案：'));
        const tp = htn.treatmentPlan;
        if (tp.dietaryTherapy) {
          elements.push(createParagraph('  食疗：' + tp.dietaryTherapy.join('、')));
        }
        if (tp.acupuncturePoints) {
          elements.push(createParagraph('  穴位：' + tp.acupuncturePoints.join('、')));
        }
        if (tp.herbalFormulas) {
          elements.push(createParagraph('  方剂：' + tp.herbalFormulas.join('、')));
        }
        if (tp.lifestyle) {
          elements.push(createParagraph('  调摄：' + tp.lifestyle.join('、')));
        }
      }

      elements.push(createDivider());
    }

    // 高血糖风险（舌诊版本，包含中医深度分析）
    if (thr.hyperglycemia) {
      elements.push(createSectionTitle('7.3 高血糖风险评估'));

      const hgly = thr.hyperglycemia;
      elements.push(
        createLabeledParagraph('  风险等级：', hgly.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (hgly.riskScore || 0) + '分/100')
      );

      // 舌象指标
      if (hgly.tongueIndicators && hgly.tongueIndicators.length > 0) {
        const indData: string[][] = [];
        hgly.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%', ind.tcmMeaning || '-']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('舌象指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度', '中医含义'],
              indData,
              [2500, 2000, 1500, 4000]
            )
          );
        }
      }

      // 中医证型分析
      if (hgly.tcmPatterns && hgly.tcmPatterns.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('中医证型分析：'));
        hgly.tcmPatterns.forEach((pattern: any) => {
          elements.push(createParagraph(`  • ${pattern.pattern}（匹配度${pattern.matchScore}%）`));
          elements.push(createParagraph(`    病机：${pattern.pathology}`));
          elements.push(createParagraph(`    治则：${pattern.treatmentPrinciple}`));
        });
      }

      elements.push(createDivider());
    }

    // 高血脂风险（舌诊版本，包含中医深度分析）
    if (thr.hyperlipidemia) {
      elements.push(createSectionTitle('7.4 高血脂风险评估'));

      const hlip = thr.hyperlipidemia;
      elements.push(
        createLabeledParagraph('  风险等级：', hlip.riskLevel || '未评估')
      );
      elements.push(
        createLabeledParagraph('  风险评分：', (hlip.riskScore || 0) + '分/100')
      );

      // 舌象指标
      if (hlip.tongueIndicators && hlip.tongueIndicators.length > 0) {
        const indData: string[][] = [];
        hlip.tongueIndicators.forEach((ind: any) => {
          if (ind.detected) {
            indData.push([ind.name, ind.severity, ind.confidence + '%', ind.tcmMeaning || '-']);
          }
        });
        if (indData.length > 0) {
          elements.push(new Paragraph({ spacing: { before: 150 } }));
          elements.push(createParagraph('舌象指标：'));
          elements.push(
            createSimpleTable(
              ['指标名称', '严重程度', '置信度', '中医含义'],
              indData,
              [2500, 2000, 1500, 4000]
            )
          );
        }
      }

      // 中医证型分析
      if (hlip.tcmPatterns && hlip.tcmPatterns.length > 0) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(createParagraph('中医证型分析：'));
        hlip.tcmPatterns.forEach((pattern: any) => {
          elements.push(createParagraph(`  • ${pattern.pattern}（匹配度${pattern.matchScore}%）`));
          elements.push(createParagraph(`    病机：${pattern.pathology}`));
          elements.push(createParagraph(`    治则：${pattern.treatmentPrinciple}`));
        });
      }

      elements.push(createDivider());
    }

    // 综合中医分析
    if (thr.comprehensiveTCMAnalysis) {
      elements.push(createSectionTitle('7.5 综合中医分析'));

      const tcm = thr.comprehensiveTCMAnalysis;

      if (tcm.constitution) {
        elements.push(
          createLabeledParagraph('  体质：', tcm.constitution.primary || '未识别')
        );
        if (tcm.constitution.secondary) {
          elements.push(
            createLabeledParagraph('  次要体质：', tcm.constitution.secondary)
          );
        }
        if (tcm.constitution.trend) {
          elements.push(
            createLabeledParagraph('  体质趋势：', tcm.constitution.trend)
          );
        }
      }

      if (tcm.qiBloodStatus) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(
          createLabeledParagraph('  气血：', `${tcm.qiBloodStatus.qi}、${tcm.qiBloodStatus.blood}（${tcm.qiBloodStatus.balance}）`)
        );
      }

      if (tcm.yinYangStatus) {
        elements.push(new Paragraph({ spacing: { before: 150 } }));
        elements.push(
          createLabeledParagraph('  阴阳：', `${tcm.yinYangStatus.yin}、${tcm.yinYangStatus.yang}（${tcm.yinYangStatus.balance}）`)
        );
      }

      elements.push(createDivider());
    }

    // 综合建议
    if (thr.comprehensiveRecommendations) {
      elements.push(createSectionTitle('7.6 综合建议'));

      if (thr.comprehensiveRecommendations.immediate) {
        elements.push(createParagraph('立即行动：'));
        thr.comprehensiveRecommendations.immediate.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      if (thr.comprehensiveRecommendations.shortTerm) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('短期目标（1-3个月）：'));
        thr.comprehensiveRecommendations.shortTerm.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      if (thr.comprehensiveRecommendations.longTerm) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('长期规划（3年以上）：'));
        thr.comprehensiveRecommendations.longTerm.forEach((rec: string, idx: number) => {
          elements.push(createParagraph(`  ${idx + 1}. ${rec}`));
        });
      }

      elements.push(createDivider());
    }

    // 生活方式因素
    if (thr.lifestyleFactors) {
      elements.push(createSectionTitle('7.7 生活方式因素分析'));

      if (thr.lifestyleFactors.diet) {
        elements.push(createParagraph('饮食因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.diet.status || '未评估'));
        if (thr.lifestyleFactors.diet.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.diet.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.exercise) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('运动因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.exercise.status || '未评估'));
        if (thr.lifestyleFactors.exercise.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.exercise.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.sleep) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('睡眠因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.sleep.status || '未评估'));
        if (thr.lifestyleFactors.sleep.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.sleep.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      if (thr.lifestyleFactors.stress) {
        elements.push(new Paragraph({ spacing: { before: 100 } }));
        elements.push(createParagraph('压力因素：'));
        elements.push(createLabeledParagraph('  状态：', thr.lifestyleFactors.stress.status || '未评估'));
        if (thr.lifestyleFactors.stress.recommendations) {
          elements.push(createParagraph('  建议：'));
          thr.lifestyleFactors.stress.recommendations.forEach((rec: string) => {
            elements.push(createParagraph(`    • ${rec}`));
          });
        }
      }

      elements.push(createDivider());
    }
  }

  return elements;
}

// ==================== 体态评估报告内容 ====================

function createPostureDiagnosisContent(data: PostureDiagnosisData): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const score = data.overallScore || 0;
  const grade = getGrade(score);

  // 体态角度测量
  elements.push(createSectionTitle('一、体态角度测量结果'));

  if (data.issues && data.issues.length > 0) {
    const angleData: string[][] = data.issues.map((issue) => [
      issue.name,
      issue.angle.toFixed(1) + '°',
      issue.severity === 'mild' ? '轻度' : issue.severity === 'moderate' ? '中度' : issue.severity === 'severe' ? '重度' : '正常',
    ]);

    elements.push(
      createSimpleTable(
        ['检测项目', '测量值', '状态'],
        angleData.slice(0, 10),
        [4000, 3000, 3000]
      )
    );
  }
  elements.push(createDivider());

  // 异常项目详细分析
  if (data.issues && data.issues.length > 0) {
    elements.push(createSectionTitle('二、异常项目详细分析'));

    data.issues.forEach((issue, index) => {
      elements.push(createParagraph(`${index + 1}. ${issue.name}`));
      elements.push(createParagraph(`   严重程度：${issue.severity === 'mild' ? '轻度' : issue.severity === 'moderate' ? '中度' : issue.severity === 'severe' ? '重度' : '正常'}`));
      elements.push(createParagraph(`   测量角度：${issue.angle.toFixed(1)}°`));
      
      if (issue.description) {
        elements.push(createParagraph(`   描述：${issue.description}`));
      }

      // 受影响结构
      if (issue.anatomicalInfo?.affectedStructures && issue.anatomicalInfo.affectedStructures.length > 0) {
        elements.push(createParagraph(`   受影响结构：${issue.anatomicalInfo.affectedStructures.join('、')}`));
      }

      // 相关肌肉
      if (issue.anatomicalInfo?.relatedMuscles) {
        if (issue.anatomicalInfo.relatedMuscles.tight && issue.anatomicalInfo.relatedMuscles.tight.length > 0) {
          elements.push(createParagraph(`   紧张肌肉：${issue.anatomicalInfo.relatedMuscles.tight.join('、')}`));
        }
        if (issue.anatomicalInfo.relatedMuscles.weak && issue.anatomicalInfo.relatedMuscles.weak.length > 0) {
          elements.push(createParagraph(`   无力肌肉：${issue.anatomicalInfo.relatedMuscles.weak.join('、')}`));
        }
      }

      // 潜在症状
      if (issue.anatomicalInfo?.potentialSymptoms && issue.anatomicalInfo.potentialSymptoms.length > 0) {
        elements.push(createParagraph(`   潜在症状：${issue.anatomicalInfo.potentialSymptoms.join('、')}`));
      }

      // 健康影响
      if (issue.healthImpact) {
        if (issue.healthImpact.shortTerm && issue.healthImpact.shortTerm.length > 0) {
          elements.push(createParagraph(`   短期影响：${issue.healthImpact.shortTerm.join('、')}`));
        }
        if (issue.healthImpact.longTerm && issue.healthImpact.longTerm.length > 0) {
          elements.push(createParagraph(`   长期影响：${issue.healthImpact.longTerm.join('、')}`));
        }
      }

      elements.push(new Paragraph({ spacing: { before: 100 } }));
    });
    elements.push(createDivider());
  }

  // 肌肉状态评估
  if (data.muscles && data.muscles.length > 0) {
    elements.push(createSectionTitle('三、肌肉状态评估'));

    const tightMuscles = data.muscles.filter(m => m.status === 'tight' || m.status === 'overactive');
    const weakMuscles = data.muscles.filter(m => m.status === 'weak' || m.status === 'inhibited');

    if (tightMuscles.length > 0) {
      elements.push(createParagraph('紧张/缩短的肌肉：'));
      tightMuscles.forEach((muscle) => {
        elements.push(createParagraph(`  - ${muscle.name}：${muscle.reason || ''}`));
      });
    }

    if (weakMuscles.length > 0) {
      elements.push(createParagraph('无力/被拉长的肌肉：'));
      weakMuscles.forEach((muscle) => {
        elements.push(createParagraph(`  - ${muscle.name}：${muscle.reason || ''}`));
      });
    }
    elements.push(createDivider());
  }

  // 训练建议
  if (data.trainingPlan?.phases && data.trainingPlan.phases.length > 0) {
    elements.push(createSectionTitle('四、矫正训练建议'));

    data.trainingPlan.phases.forEach((phase, index) => {
      elements.push(createParagraph(`阶段${index + 1}：${phase.name}（${phase.duration}）`));
      
      if (phase.goals && phase.goals.length > 0) {
        elements.push(createParagraph('  目标：'));
        phase.goals.forEach((goal) => {
          elements.push(createParagraph(`    - ${goal}`));
        });
      }

      if (phase.exercises && phase.exercises.length > 0) {
        elements.push(createParagraph('  训练动作：'));
        phase.exercises.slice(0, 5).forEach((exercise) => {
          elements.push(createParagraph(`    - ${exercise}`));
        });
      }

      elements.push(new Paragraph({ spacing: { before: 100 } }));
    });
    elements.push(createDivider());
  }

  // AI深度分析
  if (data.semanticAnalysis) {
    elements.push(createSectionTitle('五、AI深度分析'));

    if (data.semanticAnalysis.summary) {
      elements.push(createParagraph('综合分析：'));
      elements.push(createParagraph(data.semanticAnalysis.summary));
    }

    if (data.semanticAnalysis.recommendations && data.semanticAnalysis.recommendations.length > 0) {
      elements.push(createParagraph('专业建议：'));
      data.semanticAnalysis.recommendations.forEach((rec) => {
        elements.push(createParagraph(`  - ${rec}`));
      });
    }

    if (data.semanticAnalysis.tcmPerspective) {
      elements.push(createParagraph('中医视角：'));
      elements.push(createParagraph(data.semanticAnalysis.tcmPerspective));
    }
    elements.push(createDivider());
  }

  return elements;
}

// ==================== 报告尾部 ====================

// 面诊报告参考标准
function createFaceDiagnosisReference(): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(createSectionTitle('参考标准说明'));
  paragraphs.push(
    createParagraph('本面诊报告评估标准依据以下专业教材及临床指南制定：')
  );
  paragraphs.push(new Paragraph({ spacing: { before: 100 } }));
  paragraphs.push(createParagraph('  1. 《中医诊断学》（新世纪第四版）- 面部五色诊法与脏腑对应关系'));
  paragraphs.push(createParagraph('  2. 《中医面诊学》- 面部望诊的理论与方法'));
  paragraphs.push(createParagraph('  3. 《黄帝内经·素问》- 面部望诊理论基础'));
  paragraphs.push(createParagraph('  4. 《中医诊断学实验教程》- 面部特征辨识标准'));
  paragraphs.push(createParagraph('  5. 《中医体质学》- 体质辨识与面部特征关联'));
  
  paragraphs.push(new Paragraph({ spacing: { before: 150 } }));
  paragraphs.push(createParagraph('评分等级说明：'));
  paragraphs.push(createParagraph('  - A级（90-100分）：面色红润有光泽，五官端正，面部无明显异常'));
  paragraphs.push(createParagraph('  - B级（80-89分）：面色基本正常，偶有轻微异常表现'));
  paragraphs.push(createParagraph('  - C级（70-79分）：面色略有异常，建议调理'));
  paragraphs.push(createParagraph('  - D级（60-69分）：面色明显异常，建议就医检查'));
  paragraphs.push(createParagraph('  - E级（60分以下）：面色严重异常，需及时就医'));
  
  return paragraphs;
}

// 舌诊报告参考标准
function createTongueDiagnosisReference(): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(createSectionTitle('参考标准说明'));
  paragraphs.push(
    createParagraph('本舌诊报告评估标准依据以下专业教材及临床指南制定：')
  );
  paragraphs.push(new Paragraph({ spacing: { before: 100 } }));
  paragraphs.push(createParagraph('  1. 《中医诊断学》（新世纪第四版）- 舌诊理论与方法'));
  paragraphs.push(createParagraph('  2. 《中医舌诊学》- 舌质舌苔辨识标准'));
  paragraphs.push(createParagraph('  3. 《舌诊研究与临床应用》- 现代舌诊技术'));
  paragraphs.push(createParagraph('  4. 《中医诊断学图谱》- 舌象标准化参考'));
  paragraphs.push(createParagraph('  5. 《中医舌诊临床图谱》- 舌诊临床应用指南'));
  
  paragraphs.push(new Paragraph({ spacing: { before: 150 } }));
  paragraphs.push(createParagraph('评分等级说明：'));
  paragraphs.push(createParagraph('  - A级（90-100分）：淡红舌薄白苔，舌体柔软灵活'));
  paragraphs.push(createParagraph('  - B级（80-89分）：舌质舌苔基本正常，偶有轻微变化'));
  paragraphs.push(createParagraph('  - C级（70-79分）：舌质或舌苔略有异常，建议调理'));
  paragraphs.push(createParagraph('  - D级（60-69分）：舌象明显异常，建议就医检查'));
  paragraphs.push(createParagraph('  - E级（60分以下）：舌象严重异常，需及时就医'));
  
  return paragraphs;
}

// 体态评估报告参考标准
function createPostureDiagnosisReference(): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(createSectionTitle('参考标准说明'));
  paragraphs.push(
    createParagraph('本体态评估报告依据以下专业教材及临床指南制定：')
  );
  paragraphs.push(new Paragraph({ spacing: { before: 100 } }));
  paragraphs.push(createParagraph('  1. 《运动解剖学》（第三版）- 骨骼肌肉运动原理'));
  paragraphs.push(createParagraph('  2. 《体态评估与矫正》- 体态评估标准与矫正方法'));
  paragraphs.push(createParagraph('  3. 《临床运动学》- 关节活动度评估标准'));
  paragraphs.push(createParagraph('  4. 《筋膜链理论与应用》- 肌筋膜链评估与治疗'));
  paragraphs.push(createParagraph('  5. 《肌肉功能与测试》- 肌肉功能评估指南'));
  paragraphs.push(createParagraph('  6. 《姿势异常与肌肉骨骼疼痛》- 体态异常临床评估'));
  
  paragraphs.push(new Paragraph({ spacing: { before: 150 } }));
  paragraphs.push(createParagraph('评分等级说明：'));
  paragraphs.push(createParagraph('  - A级（90-100分）：体态端正，各部位力线正常'));
  paragraphs.push(createParagraph('  - B级（80-89分）：体态基本正常，轻微不对称或偏移'));
  paragraphs.push(createParagraph('  - C级（70-79分）：轻度体态异常，建议进行矫正训练'));
  paragraphs.push(createParagraph('  - D级（60-69分）：中度体态异常，建议专业康复指导'));
  paragraphs.push(createParagraph('  - E级（60分以下）：严重体态异常，需及时就医'));
  
  return paragraphs;
}

// 重要声明
function createDisclaimer(): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(createDivider());
  paragraphs.push(createSectionTitle('重要声明'));
  paragraphs.push(createParagraph('1. 本报告由AI中医健康管理系统自动生成，仅供参考。'));
  paragraphs.push(createParagraph('2. 本报告不作为临床诊断依据，如有不适请及时就医。'));
  paragraphs.push(createParagraph('3. 建议定期复查，跟踪健康状况变化。'));
  paragraphs.push(createParagraph('4. 本报告有效期为生成之日起3个月内。'));
  
  return paragraphs;
}

// 报告结束信息
function createReportEnd(): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  paragraphs.push(createDivider());
  paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
  paragraphs.push(createLabeledParagraph('报告生成：', 'AI 中医健康管理系统'));
  paragraphs.push(createLabeledParagraph('技术支持：', 'AI健康科技'));
  paragraphs.push(createLabeledParagraph('生成日期：', new Date().toLocaleDateString('zh-CN')));
  
  paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '══════════════════════════════════════════════════════════════',
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '报告结束',
          size: 24,
          font: 'Microsoft YaHei',
          color: '666666',
        }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '══════════════════════════════════════════════════════════════',
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );

  return paragraphs;
}

function createReportFooter(): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // 参考标准说明
  paragraphs.push(createSectionTitle('参考标准说明'));
  paragraphs.push(
    createParagraph('本报告评估标准依据《中医诊断学》《中医面诊学》《中医舌诊学》《运动解剖学》《体态评估与矫正》等专业教材及临床指南制定。')
  );
  
  paragraphs.push(new Paragraph({ spacing: { before: 150 } }));
  paragraphs.push(createParagraph('评分等级说明：'));
  paragraphs.push(createParagraph('  - A级（90-100分）：健康状态良好'));
  paragraphs.push(createParagraph('  - B级（80-89分）：基本健康，略有不足'));
  paragraphs.push(createParagraph('  - C级（70-79分）：轻度异常，建议调理'));
  paragraphs.push(createParagraph('  - D级（60-69分）：中度异常，建议就医'));
  paragraphs.push(createParagraph('  - E级（60分以下）：明显异常，需及时就医'));
  paragraphs.push(createDivider());

  // 重要声明
  paragraphs.push(createSectionTitle('重要声明'));
  paragraphs.push(createParagraph('1. 本报告由AI中医健康管理系统自动生成，仅供参考。'));
  paragraphs.push(createParagraph('2. 本报告不作为临床诊断依据，如有不适请及时就医。'));
  paragraphs.push(createParagraph('3. 建议定期复查，跟踪健康状况变化。'));
  paragraphs.push(createParagraph('4. 本报告有效期为生成之日起3个月内。'));
  paragraphs.push(createDivider());

  // 报告生成信息
  paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
  paragraphs.push(createLabeledParagraph('报告生成：', 'AI 中医健康管理系统'));
  paragraphs.push(createLabeledParagraph('技术支持：', 'AI健康科技'));
  paragraphs.push(createLabeledParagraph('生成日期：', new Date().toLocaleDateString('zh-CN')));
  
  paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '══════════════════════════════════════════════════════════════',
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '报告结束',
          size: 24,
          font: 'Microsoft YaHei',
          color: '666666',
        }),
      ],
    })
  );
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '══════════════════════════════════════════════════════════════',
          font: 'Microsoft YaHei',
          color: '999999',
        }),
      ],
    })
  );

  return paragraphs;
}

// ==================== 主生成函数 ====================

/**
 * 生成面诊报告
 */
export async function generateFaceDiagnosisReport(
  data: FaceDiagnosisData,
  userInfo: UserInfo
): Promise<void> {
  const reportId = generateReportId('face');
  const timestamp = formatDateTime(data.timestamp);
  const score = data.score || 0;
  const grade = getGrade(score);

  // 收集异常项目
  const issues: string[] = [];
  if (data.faceColor?.severity && data.faceColor.severity !== '无') {
    issues.push(`面色${data.faceColor.color || '异常'}`);
  }
  if (data.facialCharacteristics?.spots) issues.push('面部斑点');
  if (data.facialCharacteristics?.acne) issues.push('痤疮');
  if (data.facialCharacteristics?.darkCircles) issues.push('黑眼圈');
  if (data.facialCharacteristics?.puffiness) issues.push('面部浮肿');

  // 构建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...createReportHeader('face', reportId, userInfo, timestamp),
          ...createAssessmentSummary(score, grade, issues),
          ...createFaceDiagnosisContent(data),
          ...createFaceDiagnosisReference(),
          ...createDisclaimer(),
          ...createReportEnd(),
        ],
      },
    ],
  });

  // 导出文档
  const blob = await Packer.toBlob(doc);
  const filename = `面诊评估报告_${userInfo.name}_${reportId}.docx`;
  saveAs(blob, filename);
}

/**
 * 生成舌诊报告
 */
export async function generateTongueDiagnosisReport(
  data: TongueDiagnosisData,
  userInfo: UserInfo
): Promise<void> {
  const reportId = generateReportId('tongue');
  const timestamp = formatDateTime(data.timestamp);
  const score = data.score || 0;
  const grade = getGrade(score);

  // 收集异常项目
  const issues: string[] = [];
  if (data.tongueBody?.shape && data.tongueBody.shape !== '正常') {
    issues.push(`${data.tongueBody.shape}舌`);
  }
  if (data.tongueCoating?.thickness && data.tongueCoating.thickness !== '薄苔') {
    issues.push(`舌苔${data.tongueCoating.thickness}`);
  }

  // 构建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...createReportHeader('tongue', reportId, userInfo, timestamp),
          ...createAssessmentSummary(score, grade, issues),
          ...createTongueDiagnosisContent(data),
          ...createTongueDiagnosisReference(),
          ...createDisclaimer(),
          ...createReportEnd(),
        ],
      },
    ],
  });

  // 导出文档
  const blob = await Packer.toBlob(doc);
  const filename = `舌诊评估报告_${userInfo.name}_${reportId}.docx`;
  saveAs(blob, filename);
}

/**
 * 生成体态评估报告
 */
export async function generatePostureDiagnosisReport(
  data: PostureDiagnosisData,
  userInfo: UserInfo
): Promise<void> {
  const reportId = generateReportId('posture');
  const timestamp = formatDateTime(data.timestamp);
  const score = data.overallScore || 0;
  const grade = getGrade(score);

  // 收集异常项目
  const issues: string[] = (data.issues || []).map((issue) => issue.name);

  // 构建文档
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...createReportHeader('posture', reportId, userInfo, timestamp),
          ...createAssessmentSummary(score, grade, issues),
          ...createPostureDiagnosisContent(data),
          ...createPostureDiagnosisReference(),
          ...createDisclaimer(),
          ...createReportEnd(),
        ],
      },
    ],
  });

  // 导出文档
  const blob = await Packer.toBlob(doc);
  const filename = `体态评估报告_${userInfo.name}_${reportId}.docx`;
  saveAs(blob, filename);
}

/**
 * 通用报告生成函数
 */
export async function generateReport(
  type: ReportType,
  data: FaceDiagnosisData | TongueDiagnosisData | PostureDiagnosisData,
  userInfo: UserInfo
): Promise<void> {
  switch (type) {
    case 'face':
      await generateFaceDiagnosisReport(data as FaceDiagnosisData, userInfo);
      break;
    case 'tongue':
      await generateTongueDiagnosisReport(data as TongueDiagnosisData, userInfo);
      break;
    case 'posture':
      await generatePostureDiagnosisReport(data as PostureDiagnosisData, userInfo);
      break;
  }
}
