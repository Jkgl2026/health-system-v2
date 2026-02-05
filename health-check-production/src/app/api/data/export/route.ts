import { NextRequest, NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * 导出所有用户数据
 * POST /api/data/export
 */
export async function POST(request: NextRequest) {
  try {
    // 连接数据库
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: process.env.PGDATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await client.connect();

    try {
      // 查询所有表数据
      const [users, healthAssessments, systemStoryAnswers, healthElementsAnswers, choicesAnswers, requirementsData] = await Promise.all([
        client.query('SELECT * FROM users ORDER BY created_at DESC'),
        client.query('SELECT * FROM health_assessments ORDER BY created_at DESC'),
        client.query('SELECT * FROM system_story_answers ORDER BY created_at DESC'),
        client.query('SELECT * FROM health_elements_answers ORDER BY created_at DESC'),
        client.query('SELECT * FROM choices_answers ORDER BY created_at DESC'),
        client.query('SELECT * FROM requirements_data ORDER BY created_at DESC')
      ]);

      // 构建导出数据
      const exportData = {
        timestamp: new Date().toISOString(),
        statistics: {
          totalUsers: users.rows.length,
          totalHealthAssessments: healthAssessments.rows.length,
          totalSystemStoryAnswers: systemStoryAnswers.rows.length,
          totalHealthElementsAnswers: healthElementsAnswers.rows.length,
          totalChoicesAnswers: choicesAnswers.rows.length,
          totalRequirementsData: requirementsData.rows.length
        },
        data: {
          users: users.rows,
          healthAssessments: healthAssessments.rows,
          systemStoryAnswers: systemStoryAnswers.rows,
          healthElementsAnswers: healthElementsAnswers.rows,
          choicesAnswers: choicesAnswers.rows,
          requirementsData: requirementsData.rows
        }
      };

      return NextResponse.json({
        success: true,
        message: '数据导出成功',
        data: exportData
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '导出数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * GET /api/data/export
 * 获取数据库统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 连接数据库
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      connectionString: process.env.PGDATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    });

    await client.connect();

    try {
      // 查询统计信息
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      const healthAssessmentCount = await client.query('SELECT COUNT(*) as count FROM health_assessments');
      const systemStoryAnswerCount = await client.query('SELECT COUNT(*) as count FROM system_story_answers');
      const healthElementAnswerCount = await client.query('SELECT COUNT(*) as count FROM health_elements_answers');
      const choiceAnswerCount = await client.query('SELECT COUNT(*) as count FROM choices_answers');
      const requirementDataCount = await client.query('SELECT COUNT(*) as count FROM requirements_data');

      return NextResponse.json({
        success: true,
        message: '统计信息获取成功',
        data: {
          userCount: parseInt(userCount.rows[0].count),
          healthAssessmentCount: parseInt(healthAssessmentCount.rows[0].count),
          systemStoryAnswerCount: parseInt(systemStoryAnswerCount.rows[0].count),
          healthElementAnswerCount: parseInt(healthElementAnswerCount.rows[0].count),
          choiceAnswerCount: parseInt(choiceAnswerCount.rows[0].count),
          requirementDataCount: parseInt(requirementDataCount.rows[0].count)
        }
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取统计信息失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
