import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/user/history?phone=xxx - 获取同一手机号的所有历史记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');
    const phoneGroupId = searchParams.get('phoneGroupId');

    if (!phone && !phoneGroupId) {
      return NextResponse.json(
        { error: '必须提供 phone 或 phoneGroupId 参数' },
        { status: 400 }
      );
    }

    console.log('GET /api/user/history - phone:', phone, 'phoneGroupId:', phoneGroupId);

    let users;

    if (phone) {
      users = await healthDataManager.getUsersByPhone(phone);
    } else if (phoneGroupId) {
      users = await healthDataManager.getUsersByPhoneGroupId(phoneGroupId);
    } else {
      return NextResponse.json(
        { error: '无法确定查询条件' },
        { status: 400 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: '未找到历史记录' },
        { status: 404 }
      );
    }

    console.log('获取历史记录成功:', users.length, '条记录');
    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '获取历史记录失败', details: errorMessage },
      { status: 500 }
    );
  }
}
