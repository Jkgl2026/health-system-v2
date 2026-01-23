import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// POST /api/test-soft-delete - 测试软删除和审计日志功能
export async function POST(request: NextRequest) {
  try {
    console.log('=== 开始测试软删除和审计日志功能 ===');

    // 1. 创建测试用户
    console.log('\n[1/4] 创建测试用户...');
    const testUser = await healthDataManager.createUser({
      name: '软删除测试用户',
      phone: '13900001111',
      age: 30,
      gender: '男',
    }, {
      operatorType: 'SYSTEM',
      operatorName: 'Test Script',
      description: '测试软删除功能：创建用户',
    });
    console.log('✓ 用户创建成功:', testUser.id);

    // 2. 更新用户信息（触发审计日志）
    console.log('\n[2/4] 更新用户信息...');
    const updatedUser = await healthDataManager.updateUser(
      testUser.id,
      { age: 31, occupation: '测试工程师' },
      {
        operatorType: 'SYSTEM',
        operatorName: 'Test Script',
        description: '测试软删除功能：更新用户',
      }
    );
    console.log('✓ 用户更新成功:', updatedUser?.id);

    // 3. 软删除用户
    console.log('\n[3/4] 软删除用户...');
    const softDeleted = await healthDataManager.softDeleteUser(testUser.id, {
      operatorType: 'SYSTEM',
      operatorName: 'Test Script',
      description: '测试软删除功能：软删除用户',
    });
    console.log('✓ 用户软删除成功:', softDeleted);

    // 4. 尝试获取已删除的用户（应该返回null）
    console.log('\n[4/4] 验证软删除效果...');
    const deletedUser = await healthDataManager.getUserById(testUser.id);
    console.log('✓ 软删除验证:', deletedUser ? '失败（仍可获取）' : '成功（无法获取）');

    // 5. 获取所有用户（包括已删除的）
    const allUsers = await healthDataManager.getAllUsers({ includeDeleted: true });
    console.log('✓ 总用户数（含已删除）:', allUsers.length);

    // 6. 获取审计日志
    const auditLogs = await healthDataManager.getAuditLogs({
      recordId: testUser.id,
      limit: 10,
    });
    console.log('✓ 审计日志数量:', auditLogs.length);

    return NextResponse.json({
      success: true,
      message: '软删除和审计日志功能测试完成',
      results: {
        userCreated: testUser,
        userUpdated: updatedUser,
        userSoftDeleted: softDeleted,
        userAfterDelete: deletedUser,
        totalUsers: allUsers.length,
        auditLogsCount: auditLogs.length,
        auditLogs: auditLogs.map(log => ({
          action: log.action,
          description: log.description,
          createdAt: log.createdAt,
          oldData: log.oldData,
          newData: log.newData,
        })),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error testing soft delete:', error);
    return NextResponse.json(
      { error: '软删除测试失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
