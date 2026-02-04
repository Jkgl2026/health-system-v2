import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';
import type { User } from '@/storage/database/shared/schema';

// GET /api/admin/users/history - 获取用户的历史记录（用于数据对比）
export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone') || '';
    const name = searchParams.get('name') || '';

    console.log('[数据对比API] 查询历史记录:', { phone, name });

    if (!phone && !name) {
      return NextResponse.json(
        { error: '请提供手机号或姓名' },
        { status: 400 }
      );
    }

    let users: User[] = [];

    // 通过手机号查询
    if (phone) {
      console.log('[数据对比API] 通过手机号查询:', phone);
      // 先通过手机号找到用户
      const userByPhone = await healthDataManager.getUsersByPhone(phone);
      if (userByPhone && userByPhone.length > 0) {
        // 获取该手机号的所有历史记录（通过phoneGroupId）
        const phoneGroupId = userByPhone[0].phoneGroupId || userByPhone[0].id;
        users = await healthDataManager.getUsersByPhoneGroupId(phoneGroupId, {
          includeDeleted: false
        });
      }
    }

    // 通过姓名查询
    if (name && users.length === 0) {
      console.log('[数据对比API] 通过姓名查询:', name);
      users = await healthDataManager.getUsersByName(name, {
        includeDeleted: false
      });
    }

    console.log('[数据对比API] 查询结果:', {
      total: users.length,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        createdAt: u.createdAt,
        isLatestVersion: u.isLatestVersion
      }))
    });

    // 按创建时间倒序排列
    users.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.error('[数据对比API] 错误:', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}
