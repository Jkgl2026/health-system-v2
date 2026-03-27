import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';

export async function GET() {
  try {
    const db = await getDb();
    
    // 定义所有需要检查的检测工具
    const detectionTools = [
      {
        name: '面诊检测',
        api: '/api/face-diagnosis',
        table: 'face_diagnosis_records'
      },
      {
        name: '舌诊检测',
        api: '/api/tongue-diagnosis',
        table: 'tongue_diagnosis_records'
      },
      {
        name: '体态评估',
        api: '/api/posture-diagnosis',
        table: 'posture_assessments'
      },
      {
        name: '生理年龄检测',
        api: '/api/biological-age',
        table: 'biological_age_records'
      },
      {
        name: '声音健康检测',
        api: '/api/voice-health',
        table: 'voice_health_records'
      },
      {
        name: '手相检测',
        api: '/api/palmistry-health',
        table: 'palmistry_records'
      },
      {
        name: '呼吸分析',
        api: '/api/breathing-analysis',
        table: 'breathing_analysis_records'
      },
      {
        name: '眼部健康检测',
        api: '/api/eye-health',
        table: 'eye_health_records'
      },
      {
        name: '综合报告',
        api: '/api/comprehensive-report',
        table: null // 不依赖单一表
      }
    ];
    
    const results: any = [];
    
    for (const tool of detectionTools) {
      const result: any = {
        name: tool.name,
        api: tool.api,
        table: tool.table
      };
      
      // 检查数据库表是否存在
      if (tool.table) {
        try {
          const tableResult = await db.execute(`
            SELECT COUNT(*) as count FROM ${tool.table}
          `);
          result.tableExists = true;
          result.recordCount = tableResult.rows?.[0]?.count || 0;
        } catch (e: any) {
          result.tableExists = false;
          result.error = e.message;
        }
      } else {
        result.tableExists = null; // 综合报告不依赖单一表
        result.note = '查询多个表';
      }
      
      results.push(result);
    }
    
    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    return NextResponse.json(
      { error: '检查失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
