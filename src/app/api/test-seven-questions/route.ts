import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { healthDataManager } from '@/storage/database';

// 测试保存七问数据
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'test-user-123';

    // 创建测试数据
    const testData = {
      userId,
      requirement2Completed: true,
      sevenQuestionsAnswers: {
        '1': { answer: '测试答案1', date: new Date().toISOString() },
        '2': { answer: '测试答案2', date: new Date().toISOString() },
        '3': { answer: '测试答案3', date: new Date().toISOString() },
        '4': { answer: '测试答案4', date: new Date().toISOString() },
        '5': { answer: '测试答案5', date: new Date().toISOString() },
        '6': { answer: '测试答案6', date: new Date().toISOString() },
        '7': { answer: '测试答案7', date: new Date().toISOString() },
      },
    };

    console.log('[测试API] 开始保存七问数据:', testData);

    // 检查是否已存在
    const existing = await healthDataManager.getRequirementByUserId(userId);
    console.log('[测试API] 现有数据:', existing);

    let result;
    if (existing) {
      result = await healthDataManager.updateRequirement(userId, testData);
      console.log('[测试API] 更新成功:', result);
    } else {
      result = await healthDataManager.createRequirement(testData);
      console.log('[测试API] 创建成功:', result);
    }

    // 读取验证
    const verified = await healthDataManager.getRequirementByUserId(userId);
    console.log('[测试API] 验证数据:', verified);

    return NextResponse.json({
      success: true,
      saved: result,
      verified: verified,
    });
  } catch (error) {
    console.error('[测试API] 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
