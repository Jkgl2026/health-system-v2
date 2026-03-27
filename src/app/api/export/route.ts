import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';

interface ExportRequest {
  exportType: 'single' | 'multiple' | 'comparison' | 'comprehensive';
  recordIds?: string[];
  userId?: string;
  userName?: string;
  records?: any[];
  comparisonResult?: any;
  comprehensiveData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { exportType, recordIds, userId, userName, records, comparisonResult, comprehensiveData } = body;

    if (!exportType) {
      return NextResponse.json(
        { error: '请指定导出类型' },
        { status: 400 }
      );
    }

    console.log('[Export] 开始导出Word:', { exportType });

    let doc: Document | null = null;
    let fileName = '';

    switch (exportType) {
      case 'multiple':
        if (!records || records.length === 0) {
          return NextResponse.json({ error: '请提供要导出的记录' }, { status: 400 });
        }
        doc = await generateMultipleRecordsWord(records, userName || '用户');
        fileName = `${userName || '用户'}_多次检测记录_${new Date().toISOString().split('T')[0]}.docx`;
        break;
      case 'comparison':
        if (!comparisonResult) {
          return NextResponse.json({ error: '请提供对比结果' }, { status: 400 });
        }
        doc = await generateComparisonWord(comparisonResult, userName || '用户');
        fileName = `${userName || '用户'}_历史对比报告_${new Date().toISOString().split('T')[0]}.docx`;
        break;
      case 'comprehensive':
        if (!comprehensiveData) {
          return NextResponse.json({ error: '请提供综合数据' }, { status: 400 });
        }
        doc = await generateComprehensiveWord(comprehensiveData, userName || '用户');
        fileName = `${userName || '用户'}_综合健康报告_${new Date().toISOString().split('T')[0]}.docx`;
        break;
      default:
        return NextResponse.json({ error: '不支持的导出类型' }, { status: 400 });
    }

    if (!doc) {
      return NextResponse.json({ error: '文档生成失败' }, { status: 500 });
    }

    // 生成Word文档
    const buffer = await Packer.toBuffer(doc);

    // 返回文件
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    console.error('[Export] 导出失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '导出失败', details: errorMessage },
      { status: 500 }
    );
  }
}





// 生成多次记录Word文档
async function generateMultipleRecordsWord(records: any[], userName: string): Promise<Document> {
  const children: any[] = [];

  // 标题
  children.push(
    new Paragraph({
      text: '多次检测记录报告',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 用户信息
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '用户姓名：', bold: true }),
        new TextRun(userName || '未填写'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '生成时间：', bold: true }),
        new TextRun(new Date().toLocaleString('zh-CN')),
      ],
      spacing: { after: 400 },
    })
  );

  // 检测记录列表
  children.push(
    new Paragraph({
      text: '检测记录列表',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 300 },
    })
  );

  // 创建表格
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('序号')], width: { size: 10, type: WidthType.PERCENTAGE as any } }),
        new TableCell({ children: [new Paragraph('检测类型')], width: { size: 20, type: WidthType.PERCENTAGE as any } }),
        new TableCell({ children: [new Paragraph('检测时间')], width: { size: 20, type: WidthType.PERCENTAGE as any } }),
        new TableCell({ children: [new Paragraph('评分')], width: { size: 15, type: WidthType.PERCENTAGE as any } }),
        new TableCell({ children: [new Paragraph('状态')], width: { size: 20, type: WidthType.PERCENTAGE as any } }),
        new TableCell({ children: [new Paragraph('摘要')], width: { size: 15, type: WidthType.PERCENTAGE as any } }),
      ],
      tableHeader: true,
    }),
  ];

  records.forEach((record, index) => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(index + 1))] }),
          new TableCell({ children: [new Paragraph(getTypeName(record.type))] }),
          new TableCell({ children: [new Paragraph(new Date(record.created_at).toLocaleString('zh-CN'))] }),
          new TableCell({ children: [new Paragraph(String(record.score || '-'))] }),
          new TableCell({ children: [new Paragraph(record.healthStatus || '-')] }),
          new TableCell({ children: [new Paragraph(record.summary || '-')] }),
        ],
      })
    );
  });

  children.push(
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 100, bottom: 100 },
    })
  );

  // 详细记录
  children.push(
    new Paragraph({
      text: '详细记录',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 300 },
    })
  );

  records.forEach((record, index) => {
    children.push(
      new Paragraph({
        text: `记录 ${index + 1}：${getTypeName(record.type)}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '检测时间：', bold: true }),
          new TextRun(new Date(record.created_at).toLocaleString('zh-CN')),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '健康评分：', bold: true }),
          new TextRun(String(record.score || '-')),
        ],
        spacing: { after: 100 },
      })
    );

    if (record.fullReport) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '检测详情：',
              bold: true,
            })
          ],
          spacing: { before: 200, after: 100 },
        }),
        ...record.fullReport.split('\n').map((line: any) =>
          new Paragraph({ children: [new TextRun(line || '')], spacing: { after: 100 } })
        )
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun('─'.repeat(80))],
        spacing: { before: 300, after: 300 },
      })
    );
  });

  return new Document({
    sections: [{ children }],
  });
}

// 生成对比报告Word文档
async function generateComparisonWord(comparisonResult: any, userName: string): Promise<Document> {
  const children: any[] = [];

  // 标题
  children.push(
    new Paragraph({
      text: '历史对比分析报告',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 用户信息
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '用户姓名：', bold: true }),
        new TextRun(userName || '未填写'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '生成时间：', bold: true }),
        new TextRun(new Date().toLocaleString('zh-CN')),
      ],
      spacing: { after: 400 },
    })
  );

  // 对比分析
  if (comparisonResult.comparison) {
    children.push(
      new Paragraph({
        text: '对比分析',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 300 },
      })
    );

    const comp = comparisonResult.comparison;
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '评分变化：', bold: true }),
          new TextRun(String(comp.scoreChange > 0 ? '+' : '') + comp.scoreChange + '分'),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '变化趋势：', bold: true }),
          new TextRun(comp.scoreTrend === 'improving' ? '改善' : comp.scoreTrend === 'declining' ? '下降' : '稳定'),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // 关键变化
  if (comparisonResult.comparison?.keyChanges && comparisonResult.comparison.keyChanges.length > 0) {
    children.push(
      new Paragraph({
        text: '关键变化',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 300 },
      })
    );

    comparisonResult.comparison.keyChanges.forEach((change: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: '• ', bold: true }),
            new TextRun(change.category),
            new TextRun('：'),
            new TextRun(String(change.before)),
            new TextRun(' → '),
            new TextRun(String(change.after)),
            new TextRun('（'),
            new TextRun(change.change),
            new TextRun('）'),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // 趋势分析
  if (comparisonResult.trendAnalysis) {
    children.push(
      new Paragraph({
        text: '趋势分析',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      })
    );

    const trend = comparisonResult.trendAnalysis;
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '时间跨度：', bold: true }),
          new TextRun(trend.period),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '整体趋势：', bold: true }),
          new TextRun(trend.trend),
        ],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '详细分析：', bold: true }),
          new TextRun(trend.analysis),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // 建议
  if (comparisonResult.trendAnalysis?.recommendations && comparisonResult.trendAnalysis.recommendations.length > 0) {
    children.push(
      new Paragraph({
        text: '建议',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 300 },
      })
    );

    comparisonResult.trendAnalysis.recommendations.forEach((rec: string, index: number) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true }),
            new TextRun(rec),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // 总结
  if (comparisonResult.summary) {
    children.push(
      new Paragraph({
        text: '总结',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      }),
      new Paragraph(comparisonResult.summary)
    );
  }

  return new Document({
    sections: [{ children }],
  });
}

// 生成综合报告Word文档
async function generateComprehensiveWord(data: any, userName: string): Promise<Document> {
  const children: any[] = [];

  // 标题
  children.push(
    new Paragraph({
      text: '综合健康评估报告',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // 用户信息
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '用户姓名：', bold: true }),
        new TextRun(userName || '未填写'),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '生成时间：', bold: true }),
        new TextRun(new Date().toLocaleString('zh-CN')),
      ],
      spacing: { after: 400 },
    })
  );

  // 综合评分
  children.push(
    new Paragraph({
      text: '综合健康评分',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 300 },
    })
  );

  if (data.overallScore !== undefined) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '综合得分：', bold: true }),
          new TextRun(String(data.overallScore) + '分'),
        ],
        spacing: { after: 200 },
      })
    );
  }

  if (data.healthStatus) {
    const statusMap: Record<string, string> = {
      'excellent': '优秀',
      'good': '良好',
      'fair': '一般',
      'poor': '需关注',
    };
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '健康状态：', bold: true }),
          new TextRun(statusMap[data.healthStatus] || data.healthStatus),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // 各项检测
  if (data.records) {
    children.push(
      new Paragraph({
        text: '各项健康检测',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 300 },
      })
    );

    const recordNames: Record<string, string> = {
      'face': '面诊检测',
      'tongue': '舌诊检测',
      'posture': '体态评估',
      'biologicalAge': '生理年龄评估',
      'voiceHealth': '声音健康评估',
    };

    Object.entries(data.records).forEach(([key, value]: [string, any]) => {
      const recordName = recordNames[key] || key;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${recordName}：`, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun('   检测次数：'),
            new TextRun(String(value.count)),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun('   平均评分：'),
            new TextRun(String(value.avgScore) + '分'),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun('   最新评分：'),
            new TextRun(String(value.latestScore) + '分'),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // 完整报告
  if (data.fullReport) {
    children.push(
      new Paragraph({
        text: '完整报告',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 300 },
      }),
      ...data.fullReport.split('\n').map((line: any) =>
        new Paragraph({ children: [new TextRun(line || '')], spacing: { after: 100 } })
      )
    );
  }

  return new Document({
    sections: [{ children }],
  });
}

// 获取类型名称
function getTypeName(type: string): string {
  const nameMap: Record<string, string> = {
    'face': '面诊',
    'tongue': '舌诊',
    'posture': '体态评估',
    'biological-age': '生理年龄评估',
    'voice-health': '声音健康评估',
    'palmistry-health': '手相检测',
    'breathing-analysis': '呼吸分析',
    'eye-health': '眼部健康检测',
  };
  return nameMap[type] || type;
}
