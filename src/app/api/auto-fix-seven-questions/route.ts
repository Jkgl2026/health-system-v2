import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/auto-fix-seven-questions
// 自动修复所有用户的七问数据
export async function POST(request: NextRequest) {
  try {
    console.log('[自动修复] 开始处理...');

    // 获取所有用户
    const allUsers = await healthDataManager.getAllUsers();

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到任何用户',
        fixedCount: 0,
        errorCount: 0,
        details: [],
      });
    }

    console.log(`[自动修复] 找到 ${allUsers.length} 个用户`);

    let fixedCount = 0;
    let errorCount = 0;
    const details: any[] = [];

    // 检查每个用户的七问数据
    for (const user of allUsers) {
      try {
        const requirement = await healthDataManager.getRequirementByUserId(user.id);

        // 检查是否有七问答案
        const hasSevenQuestions =
          requirement &&
          requirement.sevenQuestionsAnswers &&
          Object.keys(requirement.sevenQuestionsAnswers).length > 0;

        if (hasSevenQuestions) {
          // 已有七问数据，跳过
          console.log(`[自动修复] 用户 ${user.name} (${user.id}) 已有七问数据，跳过`);
          continue;
        }

        // 没有七问数据，需要修复
        console.log(`[自动修复] 用户 ${user.name} (${user.id}) 缺少七问数据，开始修复...`);

        // 检查是否完成了四个要求
        const hasRequirements = requirement &&
          (requirement.requirement1Completed ||
           requirement.requirement2Completed ||
           requirement.requirement3Completed ||
           requirement.requirement4Completed);

        if (!hasRequirements) {
          // 没有完成任何要求，跳过
          console.log(`[自动修复] 用户 ${user.name} 未完成任何要求，跳过`);
          details.push({
            userId: user.id,
            userName: user.name,
            success: false,
            message: '未完成任何要求',
          });
          errorCount++;
          continue;
        }

        // 创建默认的七问答案
        const sevenQuestionsAnswers: Record<string, any> = {};
        const defaultAnswers = [
          '用户未填写此问题',
          '用户未填写此问题',
          '用户未填写此问题',
          '用户未填写此问题',
          '用户未填写此问题',
          '用户未填写此问题',
          '用户未填写此问题',
        ];

        for (let i = 1; i <= 7; i++) {
          sevenQuestionsAnswers[i.toString()] = {
            answer: defaultAnswers[i - 1],
            date: new Date().toISOString(),
          };
        }

        // 如果已存在 requirement，更新；否则创建新的
        if (requirement) {
          await healthDataManager.updateRequirement(user.id, {
            sevenQuestionsAnswers,
          });
        } else {
          await healthDataManager.createRequirement({
            userId: user.id,
            requirement1Completed: false,
            requirement2Completed: false,
            requirement3Completed: false,
            requirement4Completed: false,
            sevenQuestionsAnswers,
          });
        }

        console.log(`[自动修复] 用户 ${user.name} (${user.id}) 修复成功`);

        fixedCount++;
        details.push({
          userId: user.id,
          userName: user.name,
          success: true,
          message: '已自动填充默认答案',
        });
      } catch (err) {
        console.error(`[自动修复] 用户 ${user.name} (${user.id}) 修复失败:`, err);
        errorCount++;
        details.push({
          userId: user.id,
          userName: user.name,
          success: false,
          message: err instanceof Error ? err.message : '未知错误',
        });
      }
    }

    console.log(`[自动修复] 完成，成功 ${fixedCount}，失败 ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `成功修复 ${fixedCount} 个用户，失败 ${errorCount} 个`,
      fixedCount,
      errorCount,
      details,
    });
  } catch (error) {
    console.error('[自动修复] 处理失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '自动修复失败',
      fixedCount: 0,
      errorCount: 0,
    }, { status: 500 });
  }
}
