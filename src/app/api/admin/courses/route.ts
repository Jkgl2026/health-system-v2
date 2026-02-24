import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { courses } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';

/**
 * 获取所有课程（包括隐藏的课程）
 * GET /api/admin/courses
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const module = searchParams.get('module');
    const isHidden = searchParams.get('isHidden');

    const db = await getDb();
    let query = db.select().from(courses).orderBy(desc(courses.priority), desc(courses.createdAt));

    // 过滤条件
    // 注意：这里需要根据实际的需求来添加过滤逻辑
    // 目前返回所有课程

    const allCourses = await query;

    return NextResponse.json({
      success: true,
      courses: allCourses,
      total: allCourses.length,
    });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return NextResponse.json(
      {
        error: '获取课程列表失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 添加新课程
 * POST /api/admin/courses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const db = await getDb();
    const [newCourse] = await db.insert(courses).values({
      title: body.title,
      content: body.content,
      duration: body.duration,
      module: body.module,
      relatedElements: body.relatedElements || [],
      relatedSymptoms: body.relatedSymptoms || [],
      relatedDiseases: body.relatedDiseases || [],
      priority: body.priority || 0,
      isHidden: body.isHidden ?? true,
      courseNumber: body.courseNumber,
      season: body.season,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      course: newCourse,
    });
  } catch (error) {
    console.error('添加课程失败:', error);
    return NextResponse.json(
      {
        error: '添加课程失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
