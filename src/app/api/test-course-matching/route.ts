import { NextRequest, NextResponse } from 'next/server';
import { courseMatcher, CourseMatchInput } from '@/lib/courseMatcher';

/**
 * 测试课程匹配API
 * GET /api/test-course-matching
 */
export async function GET(request: NextRequest) {
  try {
    // 测试用例1：高血压症状
    const testInput1: CourseMatchInput = {
      selectedSymptoms: [72, 48, 49, 55, 75], // 高血压相关症状
      healthAnalysis: {
        circulation: 5,
        bloodLipids: 6,
        coldness: 4,
      },
      selectedChoice: 'choice3',
      badHabitsChecklist: [1, 8, 12, 13, 27, 58], // 不良生活习惯
    };

    const matchedCourses1 = await courseMatcher.matchCourses(testInput1);

    // 测试用例2：气血不足症状
    const testInput2: CourseMatchInput = {
      selectedSymptoms: [1, 2, 3, 4, 5, 10, 14, 15], // 气血不足相关症状
      healthAnalysis: {
        qiAndBlood: 8,
        circulation: 3,
      },
      selectedChoice: 'choice2',
    };

    const matchedCourses2 = await courseMatcher.matchCourses(testInput2);

    return NextResponse.json({
      success: true,
      testCase1: {
        description: '高血压症状测试',
        input: testInput1,
        matchedCourses: matchedCourses1.slice(0, 5), // 只返回前5个
      },
      testCase2: {
        description: '气血不足症状测试',
        input: testInput2,
        matchedCourses: matchedCourses2.slice(0, 5), // 只返回前5个
      },
    });
  } catch (error) {
    console.error('测试课程匹配失败:', error);
    return NextResponse.json(
      {
        error: '测试课程匹配失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
