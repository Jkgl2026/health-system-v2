import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, category, order } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { code: 400, message: '问题内容不能为空' },
        { status: 400 }
      );
    }

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

    // 插入新问题
    const result = await exec_sql(
      `INSERT INTO health_questions (question, category, "order", description, importance, tips)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        question.trim(),
        category || null,
        order || 1,
        body.description || null,
        body.importance || '中',
        body.tips ? JSON.stringify(body.tips) : '[]',
      ]
    );

    return NextResponse.json({
      code: 200,
      message: '创建成功',
      data: result[0],
    });
  } catch (error) {
    console.error('新增七问失败:', error);
    return NextResponse.json(
      { code: 500, message: '新增七问失败', error: String(error) },
      { status: 500 }
    );
  }
}
