import { NextRequest, NextResponse } from 'next/server';
import { courseMatcher, CourseMatchInput } from '@/lib/courseMatcher';

/**
 * 匹配课程API
 * POST /api/courses/match
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入
    const matchInput: CourseMatchInput = {
      selectedSymptoms: body.selectedSymptoms || [],
      healthAnalysis: body.healthAnalysis,
      selectedChoice: body.selectedChoice,
      selectedHabits: body.selectedHabits,
      badHabitsChecklist: body.badHabitsChecklist,
    };

    // 匹配课程
    const matchedCourses = await courseMatcher.matchCourses(matchInput);

    return NextResponse.json({
      success: true,
      courses: matchedCourses,
    });
  } catch (error) {
    console.error('课程匹配失败:', error);
    return NextResponse.json(
      {
        error: '课程匹配失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
