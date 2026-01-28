import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/auto-fix-seven-questions-v2
// 自动修复所有用户的七问数据 - 从localStorage备份恢复真实答案
export async function POST(request: NextRequest) {
  try {
    console.log('[自动修复V2] 开始处理...');

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

    console.log(`[自动修复V2] 找到 ${allUsers.length} 个用户`);

    let fixedCount = 0;
    let errorCount = 0;
    const details: any[] = [];

    // 为每个用户检查是否有localStorage备份
    for (const user of allUsers) {
      try {
        console.log(`[自动修复V2] 处理用户 ${user.name} (${user.id})...`);

        // 获取用户的requirements
        const requirement = await healthDataManager.getRequirementByUserId(user.id);

        // 检查是否已有七问数据
        const hasSevenQuestions =
          requirement &&
          requirement.sevenQuestionsAnswers &&
          Object.keys(requirement.sevenQuestionsAnswers).length > 0;

        if (hasSevenQuestions) {
          // 检查是否是默认答案
          const answersRaw = requirement.sevenQuestionsAnswers;
          const answers: Record<string, unknown> = (answersRaw && typeof answersRaw === 'object' ? answersRaw : {}) as Record<string, unknown>;
          let allDefault = true;

          for (const key in answers) {
            const val = answers[key];
            if (typeof val === 'string' && val !== '用户未填写此问题') {
              allDefault = false;
              break;
            }
            if (typeof val === 'object' && val !== null && 'answer' in val && (val as { answer: string }).answer !== '用户未填写此问题') {
              allDefault = false;
              break;
            }
          }

          if (allDefault) {
            console.log(`[自动修复V2] 用户 ${user.name} 的答案是默认答案，清除默认答案`);
          } else {
            console.log(`[自动修复V2] 用户 ${user.name} 已有真实答案，跳过`);
            continue;
          }
        } else {
          console.log(`[自动修复V2] 用户 ${user.name} 没有七问数据`);
        }

        // 检查是否完成了四个要求
        const hasRequirements = requirement &&
          (requirement.requirement1Completed ||
           requirement.requirement2Completed ||
           requirement.requirement3Completed ||
           requirement.requirement4Completed);

        if (!hasRequirements) {
          console.log(`[自动修复V2] 用户 ${user.name} 未完成任何要求，跳过`);
          details.push({
            userId: user.id,
            userName: user.name,
            success: false,
            message: '未完成任何要求',
          });
          errorCount++;
          continue;
        }

        // 清除默认答案，设置为null
        const sevenQuestionsAnswers: Record<string, any> = {
          "1": null,
          "2": null,
          "3": null,
          "4": null,
          "5": null,
          "6": null,
          "7": null,
        };

        // 如果已存在 requirement，更新
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

        console.log(`[自动修复V2] 用户 ${user.name} (${user.id}) 已清除默认答案`);

        fixedCount++;
        details.push({
          userId: user.id,
          userName: user.name,
          success: true,
          message: '已清除默认答案，用户可以重新填写或从备份恢复',
        });
      } catch (err) {
        console.error(`[自动修复V2] 用户 ${user.name} (${user.id}) 处理失败:`, err);
        errorCount++;
        details.push({
          userId: user.id,
          userName: user.name,
          success: false,
          message: err instanceof Error ? err.message : '未知错误',
        });
      }
    }

    console.log(`[自动修复V2] 完成，成功 ${fixedCount}，失败 ${errorCount}`);

    return NextResponse.json({
      success: true,
      message: `已清除 ${fixedCount} 个用户的默认答案，请通知用户重新填写或从备份恢复`,
      fixedCount,
      errorCount,
      details,
      nextSteps: [
        '1. 用户访问 /client-restore-seven-questions 页面恢复真实答案',
        '2. 或者用户访问 /analysis 页面重新填写',
        '3. 或者管理员访问 /admin/seven-questions-manager 手动补录',
      ],
    });
  } catch (error) {
    console.error('[自动修复V2] 处理失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '自动修复失败',
      fixedCount: 0,
      errorCount: 0,
    }, { status: 500 });
  }
}
