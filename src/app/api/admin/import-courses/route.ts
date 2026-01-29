import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { courses } from '@/storage/database/shared/schema';
import { sql } from 'drizzle-orm';
import { ADDITIONAL_COURSES, DISEASE_SYMPTOM_MAP } from '@/lib/course-data';

/**
 * 导入额外课程到数据库
 * POST /api/admin/import-courses
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // 检查是否已存在课程数据
    const existingCoursesResult = await db.select().from(courses).limit(1);
    if (existingCoursesResult.length > 0) {
      return NextResponse.json({
        success: true,
        message: '课程数据已存在，无需重复导入',
        existingCount: existingCoursesResult.length
      });
    }

    // 导入课程数据
    let importedCount = 0;
    for (const course of ADDITIONAL_COURSES) {
      // 根据疾病查找相关症状
      const relatedSymptoms: number[] = [];
      if (course.relatedDiseases && Array.isArray(course.relatedDiseases)) {
        for (const disease of course.relatedDiseases) {
          const symptoms = DISEASE_SYMPTOM_MAP[disease] || [];
          relatedSymptoms.push(...symptoms);
        }
      }

      // 去重
      const uniqueSymptoms = [...new Set(relatedSymptoms)];

      await db.insert(courses).values({
        id: course.id,
        title: course.title,
        content: course.content,
        duration: course.duration,
        module: course.module,
        relatedElements: course.relatedElements || [],
        relatedSymptoms: uniqueSymptoms,
        relatedDiseases: course.relatedDiseases || [],
        priority: course.priority || 0,
        isHidden: course.isHidden ?? true,
        courseNumber: course.courseNumber,
        season: course.season,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${importedCount} 门课程`,
      importedCount
    });
  } catch (error) {
    console.error('导入课程失败:', error);
    return NextResponse.json(
      { error: '导入课程失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
