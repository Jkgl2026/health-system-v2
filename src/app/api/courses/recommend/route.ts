import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { courseMatcher } from '@/lib/courseMatcher';

/**
 * 根据症状获取推荐课程
 * GET /api/courses/recommend?symptoms=1,2,3
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symptomsParam = searchParams.get('symptoms');

    if (!symptomsParam) {
      return NextResponse.json(
        { error: '缺少症状参数' },
        { status: 400 }
      );
    }

    // 解析症状ID
    const symptomIds = symptomsParam
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(id => !isNaN(id));

    if (symptomIds.length === 0) {
      return NextResponse.json(
        { error: '无效的症状参数' },
        { status: 400 }
      );
    }

    // 获取推荐课程（只返回高相关性和中等相关性的课程）
    const allCourses = await courseMatcher.getRecommendedCoursesBySymptoms(symptomIds);

    // 过滤：只返回高相关性和中等相关性的课程
    const recommendedCourses = allCourses.filter(
      course => course.relevance === 'high' || course.relevance === 'medium'
    );

    // 最多返回12门课程
    const limitedCourses = recommendedCourses.slice(0, 12);

    return NextResponse.json({
      success: true,
      courses: limitedCourses,
      total: limitedCourses.length,
    });
  } catch (error) {
    console.error('获取推荐课程失败:', error);
    return NextResponse.json(
      {
        error: '获取推荐课程失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
