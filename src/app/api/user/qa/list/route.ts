import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';
import { SEVEN_QUESTIONS_V2 } from '@/lib/seven-questions-v2';

export async function GET() {
  try {
    // 创建七问表（如果不存在）
    await exec_sql(`
      CREATE TABLE IF NOT EXISTS health_questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        category TEXT,
        "order" INTEGER DEFAULT 1,
        description TEXT,
        importance TEXT DEFAULT '中',
        tips JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 从数据库获取自定义问题
    const dbQuestions = await exec_sql(
      `SELECT * FROM health_questions ORDER BY "order" ASC`
    );

    // 如果数据库中没有数据，使用默认的七问
    if (!dbQuestions || dbQuestions.length === 0) {
      return NextResponse.json({
        code: 200,
        message: '获取成功',
        data: SEVEN_QUESTIONS_V2.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category,
          order: q.id,
          description: q.description,
          importance: q.importance,
          tips: q.tips,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      });
    }

    // 返回数据库中的问题
    return NextResponse.json({
      code: 200,
      message: '获取成功',
      data: dbQuestions,
    });
  } catch (error) {
    console.error('获取七问列表失败:', error);
    return NextResponse.json(
      { code: 500, message: '获取七问列表失败', error: String(error) },
      { status: 500 }
    );
  }
}
